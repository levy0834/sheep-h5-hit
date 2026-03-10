export type RoundResult = "win" | "lose";

export type PressureTier = "calm" | "heated" | "critical";

export interface PlayerActionSnapshot {
  trayFillRatio: number;
  matched: boolean;
  combo: number;
  timestampMs: number;
}

export interface NearFailSnapshot {
  freeSlots: number;
  trayFillRatio: number;
  timestampMs: number;
}

export type RescueCardId = "rewind-step" | "wild-pair" | "overflow-shield";

export interface RescueCard {
  id: RescueCardId;
  name: string;
  description: string;
}

export interface PressureState {
  value: number;
  max: number;
  tier: PressureTier;
  lastSpikeAtMs: number;
}

export interface TwistChoice {
  id: string;
  label: string;
  description: string;
  tag?: "fake-safe";
}

export interface TwistPrompt {
  id: string;
  title: string;
  summary: string;
  expiresMs: number;
  choices: [TwistChoice, TwistChoice];
}

export interface MetaStateSnapshot {
  pressure: PressureState;
  rescueCharge: number;
  heldCard: RescueCard | null;
  chaosLevel: number;
  comebackChain: number;
  pendingTwist: TwistPrompt | null;
}

export type CoreModifierKey =
  | "comboWindowMs"
  | "overflowSlots"
  | "guaranteedMatchDraws";

export type MetaCommand =
  | { type: "meta/show-toast"; message: string }
  | { type: "meta/show-twist"; prompt: TwistPrompt }
  | { type: "meta/grant-card"; card: RescueCard; source: "charge" | "twist" }
  | { type: "meta/use-card"; cardId: RescueCardId }
  | {
      type: "meta/modify-core";
      key: CoreModifierKey;
      amount: number;
      durationMs?: number;
    }
  | { type: "meta/clear-tray"; count: number }
  | { type: "meta/ignore-next-miss"; durationMs: number }
  | { type: "meta/comeback-chain"; value: number };

export interface MetaConfig {
  pressure: {
    max: number;
    passiveDecayPerSecond: number;
    nearFailSpike: number;
    missSpike: number;
    highTraySpike: number;
    clearRelief: number;
    comboReliefStep: number;
    heatedAt: number;
    criticalAt: number;
    twistCooldownMs: number;
  };
  rescue: {
    maxCharge: number;
    gainOnHighPressureClear: number;
    gainOnComboThreshold: number;
    comboThreshold: number;
    autoGrantAtFreeSlots: number;
  };
}
