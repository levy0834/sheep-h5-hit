import Phaser from "phaser";

export type SfxKey =
  | "ui_tap"
  | "tile_pick"
  | "tile_blocked"
  | "match"
  | "near_fail"
  | "win"
  | "lose";

interface SfxState {
  enabled: boolean;
  lastPlayAt: Record<string, number>;
}

const STATE_KEY = "sheep_sfx_state_v1";

function loadState(): SfxState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SfxState>;
      return {
        enabled: parsed.enabled ?? true,
        lastPlayAt: parsed.lastPlayAt ?? {}
      };
    }
  } catch {
    // ignore
  }
  return { enabled: true, lastPlayAt: {} };
}

function saveState(state: SfxState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function nowMs(scene: Phaser.Scene): number {
  return scene.time?.now ?? Date.now();
}

export class Sfx {
  private state: SfxState;

  public constructor() {
    this.state = loadState();
  }

  public isEnabled(): boolean {
    return this.state.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    saveState(this.state);
  }

  public toggle(): boolean {
    this.setEnabled(!this.state.enabled);
    return this.state.enabled;
  }

  public play(scene: Phaser.Scene, key: SfxKey, opts?: { volume?: number; cooldownMs?: number }): void {
    if (!this.state.enabled) return;
    if (!scene.sound) return;

    const t = nowMs(scene);
    const cooldownMs = opts?.cooldownMs ?? 80;
    const last = this.state.lastPlayAt[key] ?? 0;
    if (t - last < cooldownMs) return;
    this.state.lastPlayAt[key] = t;

    const volume = opts?.volume ?? 0.55;
    // If the audio key isn't loaded, fail silently.
    if (!scene.cache.audio.exists(key)) return;

    scene.sound.play(key, { volume });
  }
}

export function ensureSfxOnGame(game: Phaser.Game): Sfx {
  const anyGame = game as any;
  if (!anyGame.__sheepSfx) {
    anyGame.__sheepSfx = new Sfx();
  }
  return anyGame.__sheepSfx as Sfx;
}
