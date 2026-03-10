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
    name: "回退一步",
    description: "撤回一次错误点击，并把那张牌从槽位里拿出来。",
  },
  "wild-pair": {
    id: "wild-pair",
    name: "万能对子",
    description: "让你下一次处理更容易凑成一对。",
  },
  "overflow-shield": {
    id: "overflow-shield",
    name: "爆槽护盾",
    description: "临时增加 1 个槽位，持续 10 秒。",
  },
};

export const TWIST_TIMEOUT_MS = 7000;
