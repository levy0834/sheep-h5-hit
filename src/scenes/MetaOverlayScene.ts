import Phaser from "phaser";
import { CORE_EVENTS, META_EVENTS, type EventBusLike } from "../meta/contracts/events";
import { MetaDirector } from "../meta/meta-director";
import type {
  MetaCommand,
  NearFailSnapshot,
  PlayerActionSnapshot,
  RoundResult,
  TwistPrompt,
} from "../meta/types";
import { MetaHudPanel } from "../meta/ui/MetaHudPanel";
import { TwistChoicePanel } from "../meta/ui/TwistChoicePanel";

export class MetaOverlayScene extends Phaser.Scene {
  private readonly director = new MetaDirector();
  private hud!: MetaHudPanel;
  private twistPanel!: TwistChoicePanel;
  private bus!: EventBusLike;

  constructor() {
    super("MetaOverlayScene");
  }

  public create(): void {
    this.bus = this.game.events as unknown as EventBusLike;
    this.hud = new MetaHudPanel(this, 12, 12, this.scale.width - 24);
    this.twistPanel = new TwistChoicePanel(
      this,
      this.scale.width / 2,
      this.scale.height * 0.64,
      this.scale.width - 24,
    );
    this.hud.setUseCardHandler(() => {
      this.applyCommands(this.director.useHeldCard());
    });

    this.bindCoreEvents();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.unbindCoreEvents, this);

    this.syncHud();
  }

  public update(_time: number, delta: number): void {
    const commands = this.director.tick(delta);
    if (commands.length > 0) {
      this.applyCommands(commands);
    }
    const remainingMs = this.director.getPendingTwistRemainingMs();
    if (remainingMs > 0) {
      this.twistPanel.renderRemainingMs(remainingMs);
    }
    this.syncHud();
  }

  private bindCoreEvents(): void {
    this.bus.on(CORE_EVENTS.ROUND_START, this.handleRoundStart, this);
    this.bus.on(CORE_EVENTS.PLAYER_ACTION, this.handlePlayerAction, this);
    this.bus.on(CORE_EVENTS.NEAR_FAIL, this.handleNearFail, this);
    this.bus.on(CORE_EVENTS.ROUND_END, this.handleRoundEnd, this);
  }

  private unbindCoreEvents(): void {
    this.bus.off(CORE_EVENTS.ROUND_START, this.handleRoundStart, this);
    this.bus.off(CORE_EVENTS.PLAYER_ACTION, this.handlePlayerAction, this);
    this.bus.off(CORE_EVENTS.NEAR_FAIL, this.handleNearFail, this);
    this.bus.off(CORE_EVENTS.ROUND_END, this.handleRoundEnd, this);
  }

  private readonly handleRoundStart = (payload?: { seed?: number }): void => {
    this.applyCommands(this.director.startRound(payload?.seed ?? Date.now()));
  };

  private readonly handlePlayerAction = (payload?: PlayerActionSnapshot): void => {
    if (!payload) {
      return;
    }
    this.applyCommands(this.director.onPlayerAction(payload));
  };

  private readonly handleNearFail = (payload?: NearFailSnapshot): void => {
    if (!payload) {
      return;
    }
    this.applyCommands(this.director.onNearFail(payload));
  };

  private readonly handleRoundEnd = (payload?: { result: RoundResult }): void => {
    if (!payload) {
      return;
    }
    this.applyCommands(this.director.onRoundEnd(payload.result));
  };

  private applyCommands(commands: MetaCommand[]): void {
    for (const command of commands) {
      switch (command.type) {
        case "meta/show-toast":
          this.hud.pushToast(command.message);
          break;
        case "meta/show-twist":
          this.openTwist(command.prompt);
          break;
        case "meta/grant-card":
          this.hud.pushToast(`Card ready: ${command.card.name}`);
          break;
        default:
          break;
      }

      this.bus.emit(META_EVENTS.COMMAND, command);
    }
    this.syncHud();
  }

  private openTwist(prompt: TwistPrompt): void {
    this.twistPanel.open(prompt, (choiceId) => {
      this.twistPanel.close();
      this.applyCommands(this.director.resolveTwistChoice(choiceId));
    });
  }

  private syncHud(): void {
    const snapshot = this.director.getStateSnapshot();
    if (!snapshot.pendingTwist) {
      this.twistPanel.close();
    }
    this.hud.render({
      pressureValue: snapshot.pressure.value,
      pressureMax: snapshot.pressure.max,
      pressureTier: snapshot.pressure.tier,
      rescueCharge: snapshot.rescueCharge,
      heldCardName: snapshot.heldCard?.name,
      comebackChain: snapshot.comebackChain,
      chaosLevel: snapshot.chaosLevel,
    });
  }
}
