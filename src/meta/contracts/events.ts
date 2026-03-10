import type {
  MetaCommand,
  NearFailSnapshot,
  PlayerActionSnapshot,
  RescueCardId,
  RoundResult,
} from "../types";

export const CORE_EVENTS = {
  ROUND_START: "core:round-start",
  PLAYER_ACTION: "core:player-action",
  NEAR_FAIL: "core:near-fail",
  ROUND_END: "core:round-end",
  CARD_USED: "core:card-used",
} as const;

export const META_EVENTS = {
  COMMAND: "meta:command",
} as const;

export interface RoundStartPayload {
  seed?: number;
}

export interface RoundEndPayload {
  result: RoundResult;
  maxCombo: number;
  elapsedMs: number;
}

export interface CardUsedPayload {
  cardId: RescueCardId;
}

export interface CoreEventPayloadMap {
  [CORE_EVENTS.ROUND_START]: RoundStartPayload;
  [CORE_EVENTS.PLAYER_ACTION]: PlayerActionSnapshot;
  [CORE_EVENTS.NEAR_FAIL]: NearFailSnapshot;
  [CORE_EVENTS.ROUND_END]: RoundEndPayload;
  [CORE_EVENTS.CARD_USED]: CardUsedPayload;
}

export interface MetaEventPayloadMap {
  [META_EVENTS.COMMAND]: MetaCommand;
}

export type CoreEventName = keyof CoreEventPayloadMap;
export type MetaEventName = keyof MetaEventPayloadMap;

export interface EventBusLike {
  on(event: string, fn: (...args: any[]) => void, context?: unknown): void;
  off(event: string, fn: (...args: any[]) => void, context?: unknown): void;
  emit(event: string, payload?: unknown): boolean;
}
