import Phaser from "phaser";
import {
  BOARD_COL_GAP,
  BOARD_ORIGIN_X,
  BOARD_ORIGIN_Y,
  BOARD_ROW_GAP,
  SLOT_CAPACITY,
  SLOT_Y,
  TILE_HEIGHT,
  TILE_WIDTH
} from "../constants";
import {
  LEVELS,
  TILE_KINDS,
  getLevelById,
  getLevelIndexById,
  getNextLevelId
} from "../levels";
import { CORE_EVENTS, META_EVENTS, type EventBusLike } from "../../meta/contracts/events";
import type { MetaCommand, RescueCardId } from "../../meta/types";
import type { LevelDefinition, RoundResultData, TileKind, TilePlacement, TileState } from "../types";

interface GameSceneData {
  levelId?: string;
}

interface TileEntity {
  id: number;
  kind: TileKind;
  placement: TilePlacement;
  state: TileState;
  card: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface RoundSnapshot {
  taps: number;
  matchedTiles: number;
  combo: number;
  maxCombo: number;
  statusMessage: string;
  tileStates: Array<{
    id: number;
    state: TileState;
  }>;
  slotOrder: number[];
}

const MAX_UNDO_STACK = 20;
const MIN_SLOT_CAPACITY = 3;
const MAX_OVERFLOW_SLOTS_DELTA = 2;
const MIN_OVERFLOW_SLOTS_DELTA = -2;
const SLOT_MAX_SPAN = 312;
const SLOT_MARKER_RADIUS = 14;
const RESCUE_OVERFLOW_DURATION_MS = 10_000;
const CONTROL_BUTTON_DEPTH = 920;

export class GameScene extends Phaser.Scene {
  private level: LevelDefinition = LEVELS[0];
  private levelNumber = 1;
  private topControlTransitionLocked = false;
  private tiles: TileEntity[] = [];
  private slotTiles: TileEntity[] = [];
  private undoStack: RoundSnapshot[] = [];
  private roundOver = false;
  private taps = 0;
  private matchedTiles = 0;
  private combo = 0;
  private maxCombo = 0;
  private nearFailCount = 0;
  private rescueCardsUsed = 0;
  private rescueCardsGranted = 0;
  private twistCount = 0;
  private comebackChain = 0;
  private overflowShieldSaves = 0;
  private nearFailLatched = false;
  private roundStartAtMs = 0;
  private overflowSlotsDelta = 0;
  private overflowSlotsExpiresAtMs = 0;
  private ignoreOverflowArmed = false;
  private ignoreOverflowExpiresAtMs = 0;
  private bus!: EventBusLike;

  private remainingText!: Phaser.GameObjects.Text;
  private slotText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private slotMarkerGraphics: any = null;

  public constructor() {
    super("GameScene");
  }

  public init(data: GameSceneData): void {
    this.topControlTransitionLocked = false;
    this.tiles = [];
    this.slotTiles = [];
    this.undoStack = [];
    this.roundOver = false;
    this.taps = 0;
    this.matchedTiles = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.nearFailCount = 0;
    this.rescueCardsUsed = 0;
    this.rescueCardsGranted = 0;
    this.twistCount = 0;
    this.comebackChain = 0;
    this.overflowShieldSaves = 0;
    this.nearFailLatched = false;
    this.roundStartAtMs = 0;
    this.overflowSlotsDelta = 0;
    this.overflowSlotsExpiresAtMs = 0;
    this.ignoreOverflowArmed = false;
    this.ignoreOverflowExpiresAtMs = 0;

    this.level = getLevelById(data.levelId);
    this.levelNumber = getLevelIndexById(this.level.id) + 1;
  }

  public create(): void {
    const { width, height } = this.scale;
    this.bus = this.game.events as unknown as EventBusLike;
    this.roundStartAtMs = this.time.now;

    this.drawBackground(width, height);
    this.drawHud(width);
    this.drawBoardFrame(width);
    this.drawSlotFrame(width);
    this.drawTopControls();
    this.spawnTiles();
    this.bindMetaEvents();
    this.launchMetaOverlay();
    this.refreshBoardState();
    this.time.delayedCall(0, () => {
      this.bus.emit(CORE_EVENTS.ROUND_START, { seed: Date.now() });
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  public update(): void {
    this.tickTimedModifiers();
  }

  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x020617, 0x020617, 0x0f172a, 0x111827, 1);
    bg.fillRect(0, 0, width, height);
  }

  private drawHud(width: number): void {
    this.add
      .text(width / 2, 46, `${this.level.name}  ${this.levelNumber}/${LEVELS.length}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#e2e8f0"
      })
      .setOrigin(0.5);

    this.remainingText = this.add
      .text(24, 92, "", {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        color: "#cbd5e1"
      })
      .setOrigin(0, 0.5);

    this.slotText = this.add
      .text(24, 124, "", {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        color: "#cbd5e1"
      })
      .setOrigin(0, 0.5);

    this.statusText = this.add
      .text(
        width / 2,
        690,
        this.getDefaultStatusMessage(),
        {
        fontFamily: "Trebuchet MS",
        fontSize: "24px",
        color: "#f1f5f9"
        }
      )
      .setOrigin(0.5);
  }

  private drawBoardFrame(width: number): void {
    this.add
      .rectangle(width / 2, 360, 352, 420, 0x0b1225, 0.45)
      .setStrokeStyle(2, 0x334155, 0.9);
  }

  private drawSlotFrame(width: number): void {
    this.add
      .rectangle(width / 2, SLOT_Y, 352, 128, 0x0b1225, 0.7)
      .setStrokeStyle(2, 0x64748b, 0.8);

    this.slotMarkerGraphics = this.add.graphics();
    this.renderSlotMarkers();
  }

  private drawTopControls(): void {
    this.createMiniButton(56, 158, 84, 42, "首页", () => this.scene.start("StartScene"), true);
    this.createMiniButton(194, 158, 92, 42, "撤销", () => this.undoLastMove());
    this.createMiniButton(
      332,
      158,
      104,
      42,
      "重开",
      () => this.scene.restart({ levelId: this.level.id }),
      true
    );
  }

  private createMiniButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
    locksSceneTransition = false
  ): void {
    const button = this.add
      .rectangle(x, y, w, h, 0x1e293b, 0.95)
      .setStrokeStyle(2, 0x94a3b8, 0.85)
      .setInteractive({ useHandCursor: true })
      .setDepth(CONTROL_BUTTON_DEPTH);

    const text = this.add
      .text(x, y, label, {
        fontFamily: "Trebuchet MS",
        fontSize: "20px",
        color: "#e2e8f0",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(CONTROL_BUTTON_DEPTH + 1);
    let locked = false;

    const releaseLock = () => {
      locked = false;
      button.setScale(1);
      text.setScale(1);
    };

    button.on("pointerover", () => button.setFillStyle(0x334155, 1));
    button.on("pointerout", () => button.setFillStyle(0x1e293b, 0.95));
    button.on("pointerdown", () => {
      if (locked || this.topControlTransitionLocked) {
        return;
      }

      locked = true;
      if (locksSceneTransition) {
        this.topControlTransitionLocked = true;
      }
      this.tweens.add({
        targets: [button, text],
        scaleX: 0.94,
        scaleY: 0.94,
        duration: 75,
        yoyo: true,
        onComplete: () => {
          releaseLock();
          if (!this.sys.isActive()) {
            return;
          }
          try {
            onClick();
          } catch (error) {
            if (locksSceneTransition) {
              this.topControlTransitionLocked = false;
            }
            console.error(`Top control action "${label}" failed:`, error);
          }
        },
        onStop: () => {
          releaseLock();
          if (locksSceneTransition && this.sys.isActive()) {
            this.topControlTransitionLocked = false;
          }
        }
      });
    });
  }

  private spawnTiles(): void {
    const kindById = new Map(TILE_KINDS.map((kind) => [kind.id, kind]));
    for (let i = 0; i < this.level.placements.length; i += 1) {
      const placement = this.level.placements[i];
      const kind = kindById.get(placement.kindId);
      if (!kind) {
        throw new Error(`Unknown tile kind ${placement.kindId}`);
      }

      const x = BOARD_ORIGIN_X + placement.col * BOARD_COL_GAP;
      const y = BOARD_ORIGIN_Y + placement.row * BOARD_ROW_GAP;
      const body = this.add
        .rectangle(0, 0, TILE_WIDTH, TILE_HEIGHT, kind.color, 0.96)
        .setStrokeStyle(2, 0x0f172a, 0.45);
      const label = this.add
        .text(0, 1, kind.label, {
          fontFamily: "Trebuchet MS",
          fontSize: "29px",
          fontStyle: "bold",
          color: "#0f172a"
        })
        .setOrigin(0.5);

      const card = this.add.container(x, y, [body, label]).setSize(TILE_WIDTH, TILE_HEIGHT);
      card.setDepth(80 + placement.layer * 16 + placement.row);
      card.setInteractive({ useHandCursor: true });

      const tile: TileEntity = {
        id: i,
        kind,
        placement,
        state: "board",
        card,
        body,
        label
      };

      card.on("pointerdown", () => this.onTileTapped(tile));
      this.tiles.push(tile);
    }
  }

  private onTileTapped(tile: TileEntity): void {
    if (this.roundOver || tile.state !== "board") {
      return;
    }

    if (this.isTileBlocked(tile)) {
      this.bounceBlocked(tile);
      this.statusText.setText("这张牌被压住了，先清掉上面的牌。");
      this.combo = 0;
      this.emitPlayerAction(false);
      return;
    }

    this.pushUndoSnapshot();
    this.taps += 1;
    tile.state = "slot";
    tile.card.disableInteractive();
    this.slotTiles.push(tile);

    this.layoutSlotTiles();
    const removedCount = this.resolveMatches();
    if (removedCount > 0) {
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
    } else {
      this.combo = 0;
    }
    this.refreshBoardState();
    this.emitPlayerAction(removedCount > 0);
    this.emitNearFailIfNeeded();
    this.checkRoundEnd();
  }

  private bounceBlocked(tile: TileEntity): void {
    this.tweens.add({
      targets: tile.card,
      y: tile.card.y - 8,
      duration: 70,
      yoyo: true,
      ease: "Sine.easeInOut"
    });
  }

  private layoutSlotTiles(duration = 140): void {
    const slotCapacity = this.getSlotCapacity();
    const spacing = this.getSlotSpacing(slotCapacity);
    const slotScale = this.getSlotTileScale(spacing);
    const startX = this.scale.width / 2 - ((slotCapacity - 1) * spacing) / 2;
    this.slotTiles.forEach((tile, index) => {
      const x = startX + index * spacing;
      this.tweens.add({
        targets: tile.card,
        x,
        y: SLOT_Y,
        scaleX: slotScale,
        scaleY: slotScale,
        duration,
        ease: "Cubic.Out"
      });
      tile.card.setDepth(300 + index);
      tile.body.setStrokeStyle(2, 0x0f172a, 0.8);
      tile.label.setColor("#111827");
      tile.label.setAlpha(1);
    });
  }

  private resolveMatches(): number {
    let removedAny = false;
    let removedCount = 0;
    while (true) {
      const counts = new Map<string, number>();
      for (const tile of this.slotTiles) {
        counts.set(tile.kind.id, (counts.get(tile.kind.id) ?? 0) + 1);
      }

      const matchKind = [...counts.entries()].find((entry) => entry[1] >= 3)?.[0];
      if (!matchKind) {
        break;
      }

      let removed = 0;
      for (let i = 0; i < this.slotTiles.length && removed < 3; ) {
        if (this.slotTiles[i].kind.id !== matchKind) {
          i += 1;
          continue;
        }

        const [matchedTile] = this.slotTiles.splice(i, 1);
        matchedTile.state = "removed";
        this.matchedTiles += 1;
        removed += 1;
        removedCount += 1;
        removedAny = true;

        this.tweens.add({
          targets: matchedTile.card,
          scaleX: 0.2,
          scaleY: 0.2,
          alpha: 0,
          duration: 160,
          ease: "Back.easeIn",
          onComplete: () => {
            matchedTile.card.setVisible(false);
            matchedTile.card.setActive(false);
            matchedTile.card.disableInteractive();
          }
        });
      }
    }

    if (removedAny) {
      this.statusText.setText("三连消除，继续连起来！");
      this.layoutSlotTiles(110);
    } else {
      this.statusText.setText(this.getDefaultStatusMessage());
    }
    return removedCount;
  }

  private refreshBoardState(): void {
    for (const tile of this.tiles) {
      if (tile.state !== "board") {
        continue;
      }

      const blocked = this.isTileBlocked(tile);
      if (blocked) {
        tile.body.setFillStyle(0x64748b, 0.75);
        tile.body.setStrokeStyle(2, 0x334155, 0.85);
        tile.label.setAlpha(0.45);
        tile.card.disableInteractive();
      } else {
        tile.body.setFillStyle(tile.kind.color, 0.97);
        tile.body.setStrokeStyle(2, 0x0f172a, 0.6);
        tile.label.setAlpha(1);
        if (tile.card.input) {
          tile.card.input.enabled = true;
        } else {
          tile.card.setInteractive({ useHandCursor: true });
        }
      }
    }

    const remainingOnBoard = this.tiles.filter((tile) => tile.state === "board").length;
    const slotCapacity = this.getSlotCapacity();
    const slotDelta = slotCapacity - SLOT_CAPACITY;
    const slotDeltaLabel = slotDelta === 0 ? "" : ` (${slotDelta > 0 ? `+${slotDelta}` : slotDelta})`;
    this.remainingText.setText(`场上剩余：${remainingOnBoard}`);
    this.slotText.setText(`槽位：${this.slotTiles.length}/${slotCapacity}${slotDeltaLabel}`);
    this.renderSlotMarkers(slotCapacity);
  }

  private pushUndoSnapshot(): void {
    const snapshot: RoundSnapshot = {
      taps: this.taps,
      matchedTiles: this.matchedTiles,
      combo: this.combo,
      maxCombo: this.maxCombo,
      statusMessage: this.statusText.text,
      tileStates: this.tiles.map((tile) => ({
        id: tile.id,
        state: tile.state
      })),
      slotOrder: this.slotTiles.map((tile) => tile.id)
    };

    this.undoStack.push(snapshot);
    if (this.undoStack.length > MAX_UNDO_STACK) {
      this.undoStack.shift();
    }
  }

  private undoLastMove(): void {
    if (this.roundOver) {
      return;
    }

    const snapshot = this.undoStack.pop();
    if (!snapshot) {
      this.statusText.setText("没有可撤销的步骤");
      return;
    }

    for (const tile of this.tiles) {
      this.tweens.killTweensOf(tile.card);
    }

    this.taps = snapshot.taps;
    this.matchedTiles = snapshot.matchedTiles;
    this.combo = snapshot.combo;
    this.maxCombo = snapshot.maxCombo;

    const stateById = new Map(snapshot.tileStates.map((item) => [item.id, item.state]));
    for (const tile of this.tiles) {
      const state = stateById.get(tile.id) ?? tile.state;
      this.applyTileState(tile, state);
    }

    const tileById = new Map(this.tiles.map((tile) => [tile.id, tile]));
    this.slotTiles = snapshot.slotOrder
      .map((tileId) => tileById.get(tileId))
      .filter((tile): tile is TileEntity => {
        if (!tile) {
          return false;
        }
        return tile.state === "slot";
      });

    this.layoutSlotTiles(0);
    this.refreshBoardState();
    this.statusText.setText(snapshot.statusMessage || this.getDefaultStatusMessage());
    this.syncNearFailLatch();
  }

  private getDefaultStatusMessage(): string {
    return this.levelNumber === 1
      ? "提示：亮牌可点，灰牌表示被挡住。"
      : "凑齐三张同牌即可消除";
  }

  private applyTileState(tile: TileEntity, state: TileState): void {
    tile.state = state;

    if (state === "board") {
      tile.card.setVisible(true);
      tile.card.setActive(true);
      tile.card.setAlpha(1);
      tile.card.setScale(1);
      tile.card.setPosition(
        BOARD_ORIGIN_X + tile.placement.col * BOARD_COL_GAP,
        BOARD_ORIGIN_Y + tile.placement.row * BOARD_ROW_GAP
      );
      tile.card.setDepth(80 + tile.placement.layer * 16 + tile.placement.row);
      if (tile.card.input) {
        tile.card.input.enabled = true;
      } else {
        tile.card.setInteractive({ useHandCursor: true });
      }
      tile.body.setFillStyle(tile.kind.color, 0.97);
      tile.body.setStrokeStyle(2, 0x0f172a, 0.6);
      tile.label.setColor("#0f172a");
      tile.label.setAlpha(1);
      return;
    }

    if (state === "slot") {
      tile.card.setVisible(true);
      tile.card.setActive(true);
      tile.card.setAlpha(1);
      tile.card.setScale(this.getSlotTileScale(this.getSlotSpacing(this.getSlotCapacity())));
      tile.card.disableInteractive();
      tile.body.setFillStyle(tile.kind.color, 0.96);
      tile.body.setStrokeStyle(2, 0x0f172a, 0.8);
      tile.label.setColor("#111827");
      tile.label.setAlpha(1);
      return;
    }

    tile.card.setVisible(false);
    tile.card.setActive(false);
    tile.card.setScale(0.2);
    tile.card.setAlpha(0);
    tile.card.disableInteractive();
  }

  private isTileBlocked(tile: TileEntity): boolean {
    if (tile.state !== "board") {
      return false;
    }

    for (const other of this.tiles) {
      if (other.state !== "board" || other.placement.layer <= tile.placement.layer) {
        continue;
      }

      const overlapX = Math.abs(other.placement.col - tile.placement.col) < 1;
      const overlapY = Math.abs(other.placement.row - tile.placement.row) < 1;
      if (overlapX && overlapY) {
        return true;
      }
    }
    return false;
  }

  private checkRoundEnd(): void {
    if (this.roundOver) {
      return;
    }

    if (this.matchedTiles >= this.tiles.length) {
      this.finishRound(true, "所有牌都清光了！");
      return;
    }

    if (this.slotTiles.length >= this.getSlotCapacity()) {
      if (this.consumeIgnoreOverflowShield()) {
        return;
      }
      this.finishRound(false, "槽位已经满了。");
    }
  }

  private finishRound(win: boolean, reason: string): void {
    this.roundOver = true;
    this.bus.emit(CORE_EVENTS.ROUND_END, {
      result: win ? "win" : "lose",
      maxCombo: this.maxCombo,
      elapsedMs: this.getRoundElapsedMs()
    });
    for (const tile of this.tiles) {
      if (tile.state === "board") {
        tile.card.disableInteractive();
      }
    }

    this.statusText.setText(win ? "本关完成" : "槽位不够了");
    const nextLevelId = win ? getNextLevelId(this.level.id) : null;
    const payload: RoundResultData = {
      win,
      reason,
      levelId: this.level.id,
      levelName: this.level.name,
      levelNumber: this.levelNumber,
      totalLevels: LEVELS.length,
      nextLevelId: nextLevelId ?? undefined,
      taps: this.taps,
      matchedTiles: this.matchedTiles,
      maxCombo: this.maxCombo,
      elapsedMs: this.getRoundElapsedMs(),
      nearFailCount: this.nearFailCount,
      rescueCardsUsed: this.rescueCardsUsed,
      rescueCardsGranted: this.rescueCardsGranted,
      twistCount: this.twistCount,
      comebackChain: this.comebackChain,
      overflowShieldSaves: this.overflowShieldSaves
    };

    this.time.delayedCall(500, () => {
      this.scene.start("ResultScene", payload);
    });
  }

  private bindMetaEvents(): void {
    this.bus.on(META_EVENTS.COMMAND, this.handleMetaCommand, this);
  }

  private unbindMetaEvents(): void {
    this.bus.off(META_EVENTS.COMMAND, this.handleMetaCommand, this);
  }

  private launchMetaOverlay(): void {
    if (this.scene.isActive("MetaOverlayScene")) {
      this.scene.stop("MetaOverlayScene");
    }
    this.scene.launch("MetaOverlayScene");
    this.scene.bringToTop("MetaOverlayScene");
  }

  private handleShutdown(): void {
    this.unbindMetaEvents();
    if (this.scene.isActive("MetaOverlayScene")) {
      this.scene.stop("MetaOverlayScene");
    }
  }

  private readonly handleMetaCommand = (command?: MetaCommand): void => {
    if (!command || this.roundOver) {
      return;
    }

    switch (command.type) {
      case "meta/show-twist":
        this.twistCount += 1;
        this.statusText.setText("混沌抉择已触发，赶紧选！");
        break;
      case "meta/grant-card":
        this.rescueCardsGranted += 1;
        break;
      case "meta/use-card":
        this.rescueCardsUsed += 1;
        this.applyRescueCard(command.cardId);
        this.bus.emit(CORE_EVENTS.CARD_USED, { cardId: command.cardId });
        break;
      case "meta/clear-tray":
        this.clearSlotTiles(command.count, "混沌效果：已清掉部分槽位。");
        break;
      case "meta/modify-core":
        if (command.key === "overflowSlots") {
          this.applyOverflowSlotModifier(command.amount, command.durationMs);
        }
        break;
      case "meta/ignore-next-miss":
        this.ignoreOverflowArmed = true;
        this.ignoreOverflowExpiresAtMs = this.getRoundElapsedMs() + command.durationMs;
        this.statusText.setText("混沌效果生效：下一次爆槽会被免除。");
        break;
      case "meta/comeback-chain":
        this.comebackChain = Math.max(this.comebackChain, command.value);
        break;
      default:
        break;
    }

    this.refreshBoardState();
    this.emitNearFailIfNeeded();
    this.checkRoundEnd();
  };

  private applyRescueCard(cardId: RescueCardId): void {
    if (cardId === "rewind-step") {
      this.undoLastMove();
      this.statusText.setText("救援触发：回退一步。");
      return;
    }

    if (cardId === "wild-pair") {
      const removed = this.clearSlotTiles(1, "救援触发：万能对子清掉了 1 张槽位牌。");
      if (removed === 0) {
        this.statusText.setText("救援触发：当前没有可清除的槽位牌。");
      }
      return;
    }

    this.applyOverflowSlotModifier(1, RESCUE_OVERFLOW_DURATION_MS);
    this.statusText.setText("救援触发：10 秒内槽位 +1。");
  }

  private applyOverflowSlotModifier(amount: number, durationMs?: number): void {
    if (amount === 0) {
      return;
    }

    const previousCapacity = this.getSlotCapacity();
    this.overflowSlotsDelta = Phaser.Math.Clamp(
      this.overflowSlotsDelta + amount,
      MIN_OVERFLOW_SLOTS_DELTA,
      MAX_OVERFLOW_SLOTS_DELTA
    );
    if (durationMs && durationMs > 0) {
      this.overflowSlotsExpiresAtMs = this.getRoundElapsedMs() + durationMs;
    } else {
      this.overflowSlotsExpiresAtMs = 0;
    }
    if (this.getSlotCapacity() !== previousCapacity && this.slotTiles.length > 0) {
      this.layoutSlotTiles(100);
    }
  }

  private clearSlotTiles(count: number, reason: string): number {
    if (count <= 0 || this.slotTiles.length === 0) {
      return 0;
    }

    const removeCount = Math.min(count, this.slotTiles.length);
    const removedTiles = this.slotTiles.splice(this.slotTiles.length - removeCount, removeCount);
    for (const tile of removedTiles) {
      tile.state = "removed";
      this.matchedTiles += 1;
      tile.card.disableInteractive();
      this.tweens.add({
        targets: tile.card,
        scaleX: 0.2,
        scaleY: 0.2,
        alpha: 0,
        duration: 150,
        ease: "Back.easeIn",
        onComplete: () => {
          tile.card.setVisible(false);
          tile.card.setActive(false);
        }
      });
    }

    this.layoutSlotTiles(100);
    this.statusText.setText(reason);
    return removeCount;
  }

  private emitPlayerAction(matched: boolean): void {
    this.bus.emit(CORE_EVENTS.PLAYER_ACTION, {
      trayFillRatio: this.getTrayFillRatio(),
      matched,
      combo: this.combo,
      timestampMs: this.getRoundElapsedMs()
    });
  }

  private emitNearFailIfNeeded(): void {
    const freeSlots = this.getSlotCapacity() - this.slotTiles.length;
    if (freeSlots > 1) {
      this.nearFailLatched = false;
      return;
    }

    if (this.nearFailLatched) {
      return;
    }

    this.nearFailLatched = true;
    this.nearFailCount += 1;
    this.bus.emit(CORE_EVENTS.NEAR_FAIL, {
      freeSlots,
      trayFillRatio: this.getTrayFillRatio(),
      timestampMs: this.getRoundElapsedMs()
    });
  }

  private syncNearFailLatch(): void {
    this.nearFailLatched = this.getSlotCapacity() - this.slotTiles.length <= 1;
  }

  private getTrayFillRatio(): number {
    return Phaser.Math.Clamp(this.slotTiles.length / this.getSlotCapacity(), 0, 1);
  }

  private getSlotCapacity(): number {
    return Math.max(MIN_SLOT_CAPACITY, SLOT_CAPACITY + this.getActiveOverflowDelta());
  }

  private getActiveOverflowDelta(): number {
    return this.overflowSlotsDelta;
  }

  private getSlotSpacing(slotCapacity: number): number {
    if (slotCapacity <= 1) {
      return 0;
    }
    return Math.min(46, SLOT_MAX_SPAN / (slotCapacity - 1));
  }

  private getSlotTileScale(spacing: number): number {
    return Phaser.Math.Clamp(spacing / TILE_WIDTH, 0.72, 0.86);
  }

  private renderSlotMarkers(slotCapacity = this.getSlotCapacity()): void {
    if (!this.slotMarkerGraphics) {
      return;
    }

    const spacing = this.getSlotSpacing(slotCapacity);
    const startX = this.scale.width / 2 - ((slotCapacity - 1) * spacing) / 2;
    this.slotMarkerGraphics.clear();
    for (let i = 0; i < slotCapacity; i += 1) {
      const x = startX + i * spacing;
      const isOverflowSlot = i >= SLOT_CAPACITY;
      const filled = i < this.slotTiles.length;
      const fillColor = filled ? (isOverflowSlot ? 0x38bdf8 : 0xfacc15) : 0x1e293b;
      const strokeColor = isOverflowSlot ? 0x38bdf8 : 0x64748b;
      this.slotMarkerGraphics.fillStyle(fillColor, filled ? 0.95 : 0.8);
      this.slotMarkerGraphics.fillCircle(x, SLOT_Y, SLOT_MARKER_RADIUS);
      this.slotMarkerGraphics.lineStyle(2, strokeColor, isOverflowSlot ? 0.95 : 0.8);
      this.slotMarkerGraphics.strokeCircle(x, SLOT_Y, SLOT_MARKER_RADIUS);
    }
  }

  private tickTimedModifiers(): void {
    if (this.roundOver) {
      return;
    }

    const elapsedMs = this.getRoundElapsedMs();
    const previousCapacity = this.getSlotCapacity();
    let capacityChanged = false;
    let shouldCheckRoundEnd = false;

    if (
      this.overflowSlotsDelta !== 0 &&
      this.overflowSlotsExpiresAtMs > 0 &&
      elapsedMs >= this.overflowSlotsExpiresAtMs
    ) {
      const expiredDelta = this.overflowSlotsDelta;
      this.overflowSlotsDelta = 0;
      this.overflowSlotsExpiresAtMs = 0;
      capacityChanged = true;
      shouldCheckRoundEnd = true;
      this.statusText.setText(expiredDelta > 0 ? "额外槽位已失效。" : "槽位惩罚已结束。");
    }

    if (
      this.ignoreOverflowArmed &&
      this.ignoreOverflowExpiresAtMs > 0 &&
      elapsedMs >= this.ignoreOverflowExpiresAtMs
    ) {
      this.ignoreOverflowArmed = false;
      this.ignoreOverflowExpiresAtMs = 0;
    }

    if (!capacityChanged) {
      return;
    }

    if (this.getSlotCapacity() !== previousCapacity && this.slotTiles.length > 0) {
      this.layoutSlotTiles(100);
    }
    this.refreshBoardState();
    this.emitNearFailIfNeeded();
    if (shouldCheckRoundEnd) {
      this.checkRoundEnd();
    }
  }

  private consumeIgnoreOverflowShield(): boolean {
    if (!this.ignoreOverflowArmed) {
      return false;
    }
    if (
      this.ignoreOverflowExpiresAtMs > 0 &&
      this.getRoundElapsedMs() >= this.ignoreOverflowExpiresAtMs
    ) {
      this.ignoreOverflowArmed = false;
      this.ignoreOverflowExpiresAtMs = 0;
      return false;
    }

    this.ignoreOverflowArmed = false;
    this.ignoreOverflowExpiresAtMs = 0;
    this.overflowShieldSaves += 1;
    this.statusText.setText("护盾生效：这次爆槽已被抵消。");
    return true;
  }

  private getRoundElapsedMs(): number {
    return Math.max(0, this.time.now - this.roundStartAtMs);
  }
}
