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

interface LayerCoord {
  col: number;
  row: number;
  rare?: boolean;
  locked?: boolean;
}

const makeLayerPlacements = (
  layer: number,
  coords: LayerCoord[],
  kinds: string[]
): TilePlacement[] => {
  if (coords.length !== kinds.length) {
    throw new Error("kind count does not match tile count");
  }

  return coords.map((coord, index) => ({
    layer,
    col: coord.col,
    row: coord.row,
    kindId: kinds[index],
    rare: coord.rare,
    locked: coord.locked
  }));
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
const levelThreeKinds = seedShuffle(
  TILE_KINDS.flatMap((kind) => [kind.id, kind.id, kind.id]),
  20260311
);

const levelThreeLayer0: LayerCoord[] = [
  { col: 0, row: 0.2, locked: true },
  { col: 1, row: 0 },
  { col: 2, row: 0.2 },
  { col: 3, row: 0 },
  { col: 4, row: 0.2, locked: true },
  { col: 0.5, row: 1 },
  { col: 1.5, row: 1.2 },
  { col: 2.5, row: 1 },
  { col: 3.5, row: 1.2 },
  { col: 4.5, row: 1, rare: true },
  { col: 1, row: 2.1 },
  { col: 2, row: 2.3 },
  { col: 3, row: 2.1 },
  { col: 1.5, row: 3.1 },
  { col: 2.5, row: 3.1, rare: true }
];

const levelThreeLayer1: LayerCoord[] = [
  { col: 1, row: 0.6 },
  { col: 2, row: 0.8, rare: true },
  { col: 3, row: 0.6 },
  { col: 0.8, row: 1.6 },
  { col: 1.8, row: 1.8, locked: true },
  { col: 2.8, row: 1.8 },
  { col: 3.8, row: 1.6 },
  { col: 1.4, row: 2.6 },
  { col: 2.4, row: 2.8, rare: true },
  { col: 3.4, row: 2.6, locked: true },
  { col: 2.4, row: 3.4 }
];

const levelThreeLayer2: LayerCoord[] = [
  { col: 2.2, row: 0.8 },
  { col: 1.4, row: 1.4, rare: true },
  { col: 2, row: 1.4 },
  { col: 3, row: 1.4, locked: true },
  { col: 3, row: 2.2 },
  { col: 2.2, row: 2.2, rare: true },
  { col: 1.4, row: 2.2 }
];

const levelThreeLayer3: LayerCoord[] = [
  { col: 2.3, row: 1.6, rare: true },
  { col: 2.8, row: 1.9, locked: true },
  { col: 2.3, row: 2.2, rare: true }
];

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

export const LEVEL_THREE: LevelDefinition = {
  id: "level-3",
  name: "Storm Spiral",
  placements: [
    ...makeLayerPlacements(0, levelThreeLayer0, levelThreeKinds.slice(0, 15)),
    ...makeLayerPlacements(1, levelThreeLayer1, levelThreeKinds.slice(15, 26)),
    ...makeLayerPlacements(2, levelThreeLayer2, levelThreeKinds.slice(26, 33)),
    ...makeLayerPlacements(3, levelThreeLayer3, levelThreeKinds.slice(33, 36))
  ]
};

export const LEVELS: LevelDefinition[] = [LEVEL_ONE, LEVEL_TWO, LEVEL_THREE];

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
