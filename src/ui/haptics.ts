export type HapticPattern = number | ReadonlyArray<number>;

export function canVibrate(): boolean {
  try {
    return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  } catch {
    return false;
  }
}

export function haptic(pattern: HapticPattern, enabled = true): void {
  if (!enabled) return;
  if (!canVibrate()) return;
  try {
    if (typeof pattern === "number") {
      navigator.vibrate(pattern);
    } else {
      navigator.vibrate(Array.from(pattern));
    }
  } catch {
    // ignore
  }
}

export const HAPTIC = {
  tap: [8],
  success: [10, 20, 16],
  warning: [16, 40, 16],
  fail: [30, 40, 30]
} as const;
