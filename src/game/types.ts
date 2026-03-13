export type TileState = "board" | "slot" | "removed";

export interface TileKind {
  id: string;
  label: string;
  color: number;
}

export interface TilePlacement {
  layer: number;
  col: number;
  row: number;
  kindId: string;
  /** Optional visual modifiers (do not affect gameplay) */
  rare?: boolean;
  locked?: boolean;
}

export interface LevelDefinition {
  id: string;
  name: string;
  placements: TilePlacement[];
}

export interface RoundResultData {
  win: boolean;
  reason: string;
  levelId: string;
  levelName: string;
  levelNumber: number;
  totalLevels: number;
  nextLevelId?: string;
  taps: number;
  matchedTiles: number;
  maxCombo: number;
  elapsedMs: number;
  nearFailCount: number;
  rescueCardsUsed: number;
  rescueCardsGranted: number;
  twistCount: number;
  comebackChain: number;
  overflowShieldSaves: number;
}
