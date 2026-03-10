import type { LevelDefinition, TileKind, TilePlacement } from "./types";

export const TILE_KINDS: TileKind[] = [
  { id: "A", label: "A", color: 0xf87171 },
  { id: "B", label: "B", color: 0xfb923c },
  { id: "C", label: "C", color: 0xfacc15 },
  { id: "D", label: "D", color: 0xa3e635 },
  { id: "E", label: "E", color: 0x34d399 },
  { id: "F", label: "F", color: 0x2dd4bf },
  { id: "G", label: "G", color: 0x38bdf8 },
  { id: "H", label: "H", color: 0x818cf8 },
  { id: "I", label: "I", color: 0xc084fc },
  { id: "J", label: "J", color: 0xf472b6 },
  { id: "K", label: "K", color: 0xf43f5e },
  { id: "L", label: "L", color: 0x60a5fa }
];

const seedShuffle = <T>(items: T[], seed: number): T[] => {
  const output = [...items];
  let state = seed >>> 0;
  const rand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }

  return output;
};

const makeGridPlacements = (
  cols: number,
  rows: number,
  layer: number,
  startCol: number,
  startRow: number,
  kinds: string[]
): TilePlacement[] => {
  if (kinds.length !== cols * rows) {
    throw new Error("kind count does not match tile count");
  }

  const placements: TilePlacement[] = [];
  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      placements.push({
        layer,
        col: startCol + col,
        row: startRow + row,
        kindId: kinds[index]
      });
      index += 1;
    }
  }
  return placements;
};

const topKinds = seedShuffle(
  ["A", "A", "A", "B", "B", "B", "C", "C", "C", "D", "D", "D"],
  33
);
const bottomKinds = seedShuffle(
  [
    "E",
    "E",
    "E",
    "F",
    "F",
    "F",
    "G",
    "G",
    "G",
    "H",
    "H",
    "H",
    "I",
    "I",
    "I",
    "J",
    "J",
    "J",
    "K",
    "K",
    "K",
    "L",
    "L",
    "L"
  ],
  20260309
);
const levelTwoKinds = seedShuffle(
  TILE_KINDS.flatMap((kind) => [kind.id, kind.id, kind.id]),
  20260310
);

export const LEVEL_ONE: LevelDefinition = {
  id: "level-1",
  name: "Meadow Stack",
  placements: [
    ...makeGridPlacements(6, 4, 0, 0, 0, bottomKinds),
    ...makeGridPlacements(4, 3, 1, 0.5, 0.5, topKinds)
  ]
};

export const LEVEL_TWO: LevelDefinition = {
  id: "level-2",
  name: "Fog Ridge",
  placements: [
    ...makeGridPlacements(6, 3, 0, 0, 0.2, levelTwoKinds.slice(0, 18)),
    ...makeGridPlacements(5, 3, 1, 0.5, 0.7, levelTwoKinds.slice(18, 33)),
    ...makeGridPlacements(3, 1, 2, 1.5, 1.6, levelTwoKinds.slice(33, 36))
  ]
};

export const LEVELS: LevelDefinition[] = [LEVEL_ONE, LEVEL_TWO];

export const getLevelById = (levelId?: string): LevelDefinition =>
  LEVELS.find((item) => item.id === levelId) ?? LEVELS[0];

export const getLevelIndexById = (levelId: string): number => {
  const index = LEVELS.findIndex((item) => item.id === levelId);
  return index >= 0 ? index : 0;
};

export const getNextLevelId = (levelId: string): string | null => {
  const index = LEVELS.findIndex((item) => item.id === levelId);
  if (index < 0 || index >= LEVELS.length - 1) {
    return null;
  }
  return LEVELS[index + 1].id;
};
