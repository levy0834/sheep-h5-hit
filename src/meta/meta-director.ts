import { DEFAULT_META_CONFIG, TWIST_TIMEOUT_MS } from "./config/meta-config";
import { PressureEngine } from "./mechanics/pressure-engine";
import { RescueDeck } from "./mechanics/rescue-deck";
import type {
  MetaCommand,
  MetaConfig,
  MetaStateSnapshot,
  NearFailSnapshot,
  PlayerActionSnapshot,
  PressureTier,
  RoundResult,
  TwistPrompt,
} from "./types";
import { SeededRng } from "./utils/seeded-rng";

const TIER_COPY: Record<PressureTier, string> = {
  calm: "Calm zone.",
  heated: "Heat up: clears now charge rescue energy.",
  critical: "Critical: comeback chain is now active.",
};

export class MetaDirector {
  private readonly pressureEngine: PressureEngine;
  private readonly rescueDeck: RescueDeck;
  private rng: SeededRng;
  private nowMs = 0;
  private chaosLevel = 0;
  private comebackChain = 0;
  private pendingTwist: TwistPrompt | null = null;
  private pendingTwistOpenedAtMs = 0;

  constructor(private readonly config: MetaConfig = DEFAULT_META_CONFIG, seed = Date.now()) {
    this.pressureEngine = new PressureEngine(this.config.pressure);
    this.rescueDeck = new RescueDeck(this.config.rescue);
    this.rng = new SeededRng(seed);
  }

  public startRound(seed = Date.now()): MetaCommand[] {
    this.nowMs = 0;
    this.chaosLevel = 0;
    this.comebackChain = 0;
    this.pendingTwist = null;
    this.pendingTwistOpenedAtMs = 0;
    this.rng = new SeededRng(seed);
    this.pressureEngine.reset();
    this.rescueDeck.reset();
    return [{ type: "meta/show-toast", message: "Round start: keep pressure in the sweet spot." }];
  }

  public tick(deltaMs: number): MetaCommand[] {
    if (deltaMs <= 0) {
      return [];
    }
    this.nowMs += deltaMs;
    this.pressureEngine.tick(deltaMs);

    if (this.pendingTwist && this.getPendingTwistRemainingMs() <= 0) {
      this.pendingTwist = null;
      const commands: MetaCommand[] = [
        { type: "meta/show-toast", message: "Twist timeout: system grants one emergency card." },
      ];
      const card = this.rescueDeck.grantBonusCard(this.chaosLevel, this.rng);
      if (card) {
        commands.push({
          type: "meta/grant-card",
          card,
          source: "twist",
        });
      }
      return commands;
    }
    return [];
  }

  public onPlayerAction(action: PlayerActionSnapshot): MetaCommand[] {
    this.nowMs = Math.max(this.nowMs, action.timestampMs);
    const output = this.pressureEngine.applyAction(action);
    const commands: MetaCommand[] = [];
    this.pushTierShiftCopy(commands, output.tierChanged, output.state.tier);

    if (action.matched && output.state.tier !== "calm") {
      this.rescueDeck.gainCharge(this.config.rescue.gainOnHighPressureClear);
    }

    if (
      action.matched &&
      action.combo > 0 &&
      action.combo % this.config.rescue.comboThreshold === 0
    ) {
      this.rescueDeck.gainCharge(this.config.rescue.gainOnComboThreshold);
      commands.push({
        type: "meta/show-toast",
        message: `Combo ${action.combo}! Rescue charge boosted.`,
      });
    }

    if (action.matched && output.state.tier === "critical") {
      this.comebackChain += 1;
      commands.push({
        type: "meta/comeback-chain",
        value: this.comebackChain,
      });
    }

    if (this.pressureEngine.canTriggerTwist(this.nowMs)) {
      this.queueTwist(commands);
    }

    return commands;
  }

  public onNearFail(snapshot: NearFailSnapshot): MetaCommand[] {
    this.nowMs = Math.max(this.nowMs, snapshot.timestampMs);
    const output = this.pressureEngine.applyNearFail(snapshot.timestampMs);
    const commands: MetaCommand[] = [];
    this.pushTierShiftCopy(commands, output.tierChanged, output.state.tier);

    const card = this.rescueDeck.tryGrantFromNearFail(
      snapshot.freeSlots,
      this.chaosLevel,
      this.rng,
    );
    if (card) {
      commands.push({
        type: "meta/grant-card",
        card,
        source: "charge",
      });
      commands.push({
        type: "meta/show-toast",
        message: `${card.name} dropped for clutch defense.`,
      });
    }

    if (this.pressureEngine.canTriggerTwist(this.nowMs)) {
      this.queueTwist(commands);
    }

    return commands;
  }

  public onRoundEnd(result: RoundResult): MetaCommand[] {
    if (result === "win" && this.comebackChain >= 2) {
      return [
        {
          type: "meta/show-toast",
          message: `Win confirmed with ${this.comebackChain} comeback hits.`,
        },
      ];
    }
    if (result === "lose" && this.rescueDeck.getHeldCard()) {
      return [
        {
          type: "meta/show-toast",
          message: "You still had a rescue card. Replay to use it earlier.",
        },
      ];
    }
    return [];
  }

  public useHeldCard(): MetaCommand[] {
    const card = this.rescueDeck.consumeHeldCard();
    if (!card) {
      return [{ type: "meta/show-toast", message: "No rescue card in hand." }];
    }

    this.comebackChain += 1;
    return [
      { type: "meta/use-card", cardId: card.id },
      { type: "meta/comeback-chain", value: this.comebackChain },
      { type: "meta/show-toast", message: `${card.name} activated.` },
    ];
  }

  public resolveTwistChoice(choiceId: string): MetaCommand[] {
    if (!this.pendingTwist) {
      return [{ type: "meta/show-toast", message: "Twist already resolved." }];
    }

    this.pendingTwist = null;
    if (choiceId === "quick-patch") {
      this.chaosLevel += 1;
      return [
        { type: "meta/clear-tray", count: 2 },
        {
          type: "meta/modify-core",
          key: "overflowSlots",
          amount: -1,
          durationMs: 8000,
        },
        {
          type: "meta/modify-core",
          key: "guaranteedMatchDraws",
          amount: 1,
          durationMs: 3500,
        },
        {
          type: "meta/show-toast",
          message: "Quick Patch used. It helps now, but one slot will be locked soon.",
        },
      ];
    }

    const commands: MetaCommand[] = [
      { type: "meta/ignore-next-miss", durationMs: 10000 },
      {
        type: "meta/modify-core",
        key: "comboWindowMs",
        amount: 250,
        durationMs: 10000,
      },
      {
        type: "meta/show-toast",
        message: "All-in mode: one mistake is forgiven for 10s.",
      },
    ];
    const card = this.rescueDeck.grantBonusCard(this.chaosLevel, this.rng);
    if (card) {
      commands.push({
        type: "meta/grant-card",
        card,
        source: "twist",
      });
    }
    return commands;
  }

  public getPendingTwistRemainingMs(): number {
    if (!this.pendingTwist) {
      return 0;
    }
    const elapsed = this.nowMs - this.pendingTwistOpenedAtMs;
    return Math.max(0, this.pendingTwist.expiresMs - elapsed);
  }

  public getStateSnapshot(): MetaStateSnapshot {
    return {
      pressure: this.pressureEngine.snapshot(),
      rescueCharge: this.rescueDeck.getCharge(),
      heldCard: this.rescueDeck.getHeldCard(),
      chaosLevel: this.chaosLevel,
      comebackChain: this.comebackChain,
      pendingTwist: this.pendingTwist,
    };
  }

  private queueTwist(commands: MetaCommand[]): void {
    if (this.pendingTwist) {
      return;
    }

    this.chaosLevel += 1;
    this.pendingTwist = {
      id: `twist-${this.nowMs}`,
      title: "Chaos Twist",
      summary: "Choose in 7 seconds. One option is fake-safe.",
      expiresMs: TWIST_TIMEOUT_MS,
      choices: [
        {
          id: "quick-patch",
          label: "Quick Patch",
          description: "Clear 2 tray slots now. Hidden cost follows.",
          tag: "fake-safe",
        },
        {
          id: "all-in",
          label: "All In",
          description: "No fail on next miss for 10s + one rescue card.",
        },
      ],
    };
    this.pendingTwistOpenedAtMs = this.nowMs;
    this.pressureEngine.markTwistTriggered(this.nowMs);
    commands.push({
      type: "meta/show-twist",
      prompt: this.pendingTwist,
    });
    commands.push({
      type: "meta/show-toast",
      message: "Pressure maxed: Chaos Twist unlocked.",
    });
  }

  private pushTierShiftCopy(
    commands: MetaCommand[],
    tierChanged: boolean,
    tier: PressureTier,
  ): void {
    if (!tierChanged) {
      return;
    }
    commands.push({
      type: "meta/show-toast",
      message: TIER_COPY[tier],
    });
  }
}
