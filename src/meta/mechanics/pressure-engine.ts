import type {
  MetaConfig,
  PlayerActionSnapshot,
  PressureState,
  PressureTier,
} from "../types";

const TRAY_STRESS_THRESHOLD = 0.68;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export interface PressureTickResult {
  state: PressureState;
  reachedCritical: boolean;
  tierChanged: boolean;
}

export class PressureEngine {
  private value = 0;
  private tier: PressureTier = "calm";
  private lastSpikeAtMs = 0;
  private lastTwistAtMs = Number.NEGATIVE_INFINITY;

  constructor(private readonly config: MetaConfig["pressure"]) {}

  public reset(): PressureState {
    this.value = 0;
    this.tier = "calm";
    this.lastSpikeAtMs = 0;
    this.lastTwistAtMs = Number.NEGATIVE_INFINITY;
    return this.snapshot();
  }

  public snapshot(): PressureState {
    return {
      value: this.value,
      max: this.config.max,
      tier: this.tier,
      lastSpikeAtMs: this.lastSpikeAtMs,
    };
  }

  public tick(deltaMs: number): PressureState {
    if (deltaMs > 0) {
      const decay = (deltaMs / 1000) * this.config.passiveDecayPerSecond;
      this.value = clamp(this.value - decay, 0, this.config.max);
      this.tier = this.resolveTier(this.value);
    }
    return this.snapshot();
  }

  public applyAction(action: PlayerActionSnapshot): PressureTickResult {
    const previousValue = this.value;
    const previousTier = this.tier;
    let delta = 0;

    if (action.matched) {
      delta -= this.config.clearRelief;
      if (action.combo > 0) {
        delta -= Math.floor(action.combo / this.config.comboReliefStep);
      }
    } else {
      delta += this.config.missSpike;
      this.lastSpikeAtMs = action.timestampMs;
    }

    if (action.trayFillRatio >= TRAY_STRESS_THRESHOLD) {
      const ratio =
        (action.trayFillRatio - TRAY_STRESS_THRESHOLD) /
        (1 - TRAY_STRESS_THRESHOLD);
      delta += this.config.highTraySpike * clamp(ratio, 0, 1);
      this.lastSpikeAtMs = action.timestampMs;
    }

    this.value = clamp(this.value + delta, 0, this.config.max);
    this.tier = this.resolveTier(this.value);

    return {
      state: this.snapshot(),
      reachedCritical: previousValue < this.config.max && this.value >= this.config.max,
      tierChanged: previousTier !== this.tier,
    };
  }

  public applyNearFail(timestampMs: number): PressureTickResult {
    const previousValue = this.value;
    const previousTier = this.tier;
    this.value = clamp(this.value + this.config.nearFailSpike, 0, this.config.max);
    this.tier = this.resolveTier(this.value);
    this.lastSpikeAtMs = timestampMs;
    return {
      state: this.snapshot(),
      reachedCritical: previousValue < this.config.max && this.value >= this.config.max,
      tierChanged: previousTier !== this.tier,
    };
  }

  public canTriggerTwist(nowMs: number): boolean {
    if (this.value < this.config.max) {
      return false;
    }
    return nowMs - this.lastTwistAtMs >= this.config.twistCooldownMs;
  }

  public markTwistTriggered(nowMs: number): PressureState {
    this.lastTwistAtMs = nowMs;
    this.value = clamp(
      Math.max(this.value * 0.45, this.config.heatedAt * 0.8),
      0,
      this.config.max,
    );
    this.tier = this.resolveTier(this.value);
    return this.snapshot();
  }

  private resolveTier(value: number): PressureTier {
    if (value >= this.config.criticalAt) {
      return "critical";
    }
    if (value >= this.config.heatedAt) {
      return "heated";
    }
    return "calm";
  }
}
