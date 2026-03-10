import type { MetaConfig, RescueCard, RescueCardId } from "../types";

export const DEFAULT_META_CONFIG: MetaConfig = {
  pressure: {
    max: 100,
    passiveDecayPerSecond: 2.5,
    nearFailSpike: 24,
    missSpike: 11,
    highTraySpike: 7,
    clearRelief: 9,
    comboReliefStep: 3,
    heatedAt: 45,
    criticalAt: 75,
    twistCooldownMs: 9000,
  },
  rescue: {
    maxCharge: 3,
    gainOnHighPressureClear: 1,
    gainOnComboThreshold: 1,
    comboThreshold: 5,
    autoGrantAtFreeSlots: 1,
  },
};

export const RESCUE_CARD_LIBRARY: Record<RescueCardId, RescueCard> = {
  "rewind-step": {
    id: "rewind-step",
    name: "Step Rewind",
    description: "Undo one bad pick and pull it out of the tray.",
  },
  "wild-pair": {
    id: "wild-pair",
    name: "Wild Pair",
    description: "Convert your next pick into a guaranteed pair.",
  },
  "overflow-shield": {
    id: "overflow-shield",
    name: "Overflow Shield",
    description: "Add one temporary slot for 10 seconds.",
  },
};

export const TWIST_TIMEOUT_MS = 7000;
