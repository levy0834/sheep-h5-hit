import Phaser from "phaser";

export interface MagicTokens {
  palette: {
    bgTop: string;
    bgBottom: string;
    panelTop: string;
    panelBottom: string;
    lineSoft: string;
    tileTop: string;
    tileBottom: string;
    tileRareTop: string;
    tileRareBottom: string;
    tileLockedTop: string;
    tileLockedBottom: string;
    hudTop: string;
    hudBottom: string;
    accent: string;
    warning: string;
    mist: string;
  };
  tile: {
    width: number;
    height: number;
    radius: number;
  };
  ids: {
    tileBase: string;
    tileRare: string;
    tileLocked: string;
    panel: string;
    hudBadge: string;
    spark: string;
    glow: string;
    grain: string;
    tileIconA: string;
    tileIconB: string;
    tileIconC: string;
    tileIconD: string;
    tileIconE: string;
    tileIconF: string;
    tileIconG: string;
    tileIconH: string;
    tileIconI: string;
    tileIconJ: string;
    tileIconK: string;
    tileIconL: string;
  };
  text: {
    fontFamily: string;
    labelSize: string;
    valueSize: string;
    labelColor: string;
    valueColor: string;
  };
}

const BASE_TOKENS: MagicTokens = {
  palette: {
    bgTop: "#0d2142",
    bgBottom: "#1ea3a0",
    panelTop: "#f9ffff",
    panelBottom: "#d6f4ff",
    lineSoft: "#ffffff",
    tileTop: "#ffffff",
    tileBottom: "#dff8ff",
    tileRareTop: "#fff7dc",
    tileRareBottom: "#ffe08b",
    tileLockedTop: "#dce6ff",
    tileLockedBottom: "#bcc9ee",
    hudTop: "#19426a",
    hudBottom: "#0e2d4d",
    accent: "#30e6b4",
    warning: "#ff6a88",
    mist: "#d8f8ff"
  },
  tile: {
    width: 96,
    height: 112,
    radius: 18
  },
  ids: {
    tileBase: "magic-tile-base",
    tileRare: "magic-tile-rare",
    tileLocked: "magic-tile-locked",
    panel: "magic-panel",
    hudBadge: "magic-hud-badge",
    spark: "magic-spark",
    glow: "magic-glow",
    grain: "magic-grain",
    tileIconA: "magic-icon-A",
    tileIconB: "magic-icon-B",
    tileIconC: "magic-icon-C",
    tileIconD: "magic-icon-D",
    tileIconE: "magic-icon-E",
    tileIconF: "magic-icon-F",
    tileIconG: "magic-icon-G",
    tileIconH: "magic-icon-H",
    tileIconI: "magic-icon-I",
    tileIconJ: "magic-icon-J",
    tileIconK: "magic-icon-K",
    tileIconL: "magic-icon-L"
  },
  text: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    labelSize: "18px",
    valueSize: "24px",
    labelColor: "#d9f7ff",
    valueColor: "#f6ffff"
  }
};

export const MAGIC_TOKENS = BASE_TOKENS;

const colorToInt = (color: string): number => Number(`0x${color.replace("#", "")}`);

function drawRoundedGradientRect(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  topHex: string,
  bottomHex: string
): void {
  graphics.fillGradientStyle(
    colorToInt(topHex),
    colorToInt(topHex),
    colorToInt(bottomHex),
    colorToInt(bottomHex),
    1
  );
  graphics.fillRoundedRect(x, y, width, height, radius);
}

function drawTileTexture(
  graphics: Phaser.GameObjects.Graphics,
  tile: { width: number; height: number; radius: number },
  colors: { top: string; bottom: string; rim: string; sparkle: string }
): void {
  drawRoundedGradientRect(
    graphics,
    0,
    0,
    tile.width,
    tile.height,
    tile.radius,
    colors.top,
    colors.bottom
  );

  graphics.lineStyle(2, colorToInt(colors.rim), 0.84);
  graphics.strokeRoundedRect(1, 1, tile.width - 2, tile.height - 2, tile.radius);

  graphics.fillStyle(colorToInt(colors.sparkle), 0.45);
  graphics.fillCircle(tile.width * 0.24, tile.height * 0.2, 14);

  graphics.fillStyle(0x000000, 0.08);
  graphics.fillRoundedRect(6, tile.height - 16, tile.width - 12, 8, 6);
}

function drawSparkTexture(graphics: Phaser.GameObjects.Graphics, colorHex: string): void {
  const color = colorToInt(colorHex);
  graphics.fillStyle(color, 0.94);
  graphics.beginPath();
  graphics.moveTo(20, 2);
  graphics.lineTo(25, 14);
  graphics.lineTo(38, 20);
  graphics.lineTo(25, 26);
  graphics.lineTo(20, 38);
  graphics.lineTo(15, 26);
  graphics.lineTo(2, 20);
  graphics.lineTo(15, 14);
  graphics.closePath();
  graphics.fillPath();

  graphics.fillStyle(0xffffff, 0.8);
  graphics.fillCircle(20, 20, 3);
}

function drawGlowTexture(graphics: Phaser.GameObjects.Graphics, colorHex: string): void {
  const color = colorToInt(colorHex);
  graphics.clear();
  // Soft center glow
  graphics.fillStyle(color, 0.18);
  graphics.fillCircle(64, 64, 56);
  graphics.fillStyle(color, 0.22);
  graphics.fillCircle(64, 64, 40);
  graphics.fillStyle(color, 0.28);
  graphics.fillCircle(64, 64, 26);
  graphics.fillStyle(0xffffff, 0.12);
  graphics.fillCircle(64, 64, 18);
}


function drawIconBase(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffffff, 0.92);
  graphics.fillCircle(32, 32, 28);
  graphics.lineStyle(2, 0x0f172a, 0.08);
  graphics.strokeCircle(32, 32, 28);
}

function drawIconShape(
  graphics: Phaser.GameObjects.Graphics,
  kind: string,
  colorHex: string
): void {
  const color = colorToInt(colorHex);
  drawIconBase(graphics);
  graphics.fillStyle(color, 0.92);
  graphics.lineStyle(2, 0x0f172a, 0.12);

  // Simple, bold shapes for fast recognition on mobile.
  switch (kind) {
    case "A": // sheep-ish: fluffy cloud
      graphics.fillCircle(26, 32, 10);
      graphics.fillCircle(38, 32, 10);
      graphics.fillCircle(32, 26, 10);
      graphics.fillCircle(32, 40, 10);
      break;
    case "B": // leaf (fallback polygon; avoids quadraticCurveTo typing differences)
      graphics.beginPath();
      graphics.moveTo(20, 34);
      graphics.lineTo(28, 18);
      graphics.lineTo(44, 34);
      graphics.lineTo(32, 50);
      graphics.closePath();
      graphics.fillPath();
      break;
    case "C": // wand/star
      graphics.fillCircle(32, 22, 6);
      graphics.fillRect(30, 26, 4, 22);
      break;
    case "D": // moon
      graphics.fillCircle(30, 32, 14);
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(36, 30, 12);
      break;
    case "E": // clover
      graphics.fillCircle(26, 28, 8);
      graphics.fillCircle(38, 28, 8);
      graphics.fillCircle(26, 40, 8);
      graphics.fillCircle(38, 40, 8);
      graphics.fillRect(30, 40, 4, 10);
      break;
    case "F": // sparkle
      graphics.beginPath();
      graphics.moveTo(32, 14);
      graphics.lineTo(36, 28);
      graphics.lineTo(50, 32);
      graphics.lineTo(36, 36);
      graphics.lineTo(32, 50);
      graphics.lineTo(28, 36);
      graphics.lineTo(14, 32);
      graphics.lineTo(28, 28);
      graphics.closePath();
      graphics.fillPath();
      break;
    case "G": // lock
      graphics.fillRoundedRect(22, 30, 20, 18, 4);
      graphics.fillStyle(color, 0.92);
      graphics.lineStyle(6, color, 0.92);
      graphics.strokeCircle(32, 28, 10);
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(32, 40, 3);
      break;
    case "H": // star
      graphics.beginPath();
      graphics.moveTo(32, 14);
      graphics.lineTo(36, 26);
      graphics.lineTo(50, 26);
      graphics.lineTo(38, 34);
      graphics.lineTo(42, 48);
      graphics.lineTo(32, 40);
      graphics.lineTo(22, 48);
      graphics.lineTo(26, 34);
      graphics.lineTo(14, 26);
      graphics.lineTo(28, 26);
      graphics.closePath();
      graphics.fillPath();
      break;
    case "I": // bubble
      graphics.fillCircle(32, 32, 14);
      graphics.fillStyle(0xffffff, 0.45);
      graphics.fillCircle(26, 26, 6);
      break;
    case "J": // burst
      for (let i = 0; i < 8; i += 1) {
        const ang = (Math.PI * 2 * i) / 8;
        const x1 = 32 + Math.cos(ang) * 6;
        const y1 = 32 + Math.sin(ang) * 6;
        const x2 = 32 + Math.cos(ang) * 18;
        const y2 = 32 + Math.sin(ang) * 18;
        graphics.lineStyle(4, color, 0.92);
        graphics.beginPath();
        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
        graphics.strokePath();
      }
      break;
    case "K": // rainbow arc
      graphics.lineStyle(6, color, 0.92);
      graphics.beginPath();
      graphics.arc(32, 38, 16, Math.PI, 0, false);
      graphics.strokePath();
      break;
    case "L": // sparkle small
    default:
      graphics.fillCircle(32, 32, 10);
      graphics.fillCircle(44, 28, 4);
      graphics.fillCircle(22, 40, 4);
      break;
  }
}
function drawGrainTexture(graphics: Phaser.GameObjects.Graphics): void {
  // Lightweight film grain (generated once) for subtle premium feel.
  const g = graphics;
  g.clear();
  g.fillStyle(0xffffff, 0.06);
  for (let i = 0; i < 260; i += 1) {
    const x = Math.floor(Math.random() * 128);
    const y = Math.floor(Math.random() * 128);
    const r = 1 + Math.random() * 1.3;
    g.fillCircle(x, y, r);
  }
}

export function registerMagicTextures(scene: Phaser.Scene): MagicTokens {
  const tokens = BASE_TOKENS;
  const { ids, tile, palette } = tokens;
  const gameTextures = scene.game.textures;

  function ensureTexture(key: string, w: number, h: number, draw: (g: any) => void): void {
    if (gameTextures.exists(key)) {
      return;
    }
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.setSize(w, h);
    draw(g);
    gameTextures.addCanvas(key, g.canvas);
    g.destroy();
  }

  // Tiles
  ensureTexture(ids.tileBase, tile.width, tile.height, (g) => {
    drawTileTexture(g, tile, { top: palette.tileTop, bottom: palette.tileBottom, rim: "#ffffff", sparkle: palette.mist });
  });
  ensureTexture(ids.tileRare, tile.width, tile.height, (g) => {
    drawTileTexture(g, tile, { top: palette.tileRareTop, bottom: palette.tileRareBottom, rim: "#fff3cb", sparkle: "#fffce7" });
  });
  ensureTexture(ids.tileLocked, tile.width, tile.height, (g) => {
    drawTileTexture(g, tile, { top: palette.tileLockedTop, bottom: palette.tileLockedBottom, rim: "#edf2ff", sparkle: "#f4f7ff" });
  });

  // UI elements
  ensureTexture(ids.panel, 380, 180, (g) => {
    drawRoundedGradientRect(g, 0, 0, 380, 180, 24, palette.panelTop, palette.panelBottom);
    g.lineStyle(2, colorToInt(palette.lineSoft), 0.78);
    g.strokeRoundedRect(1, 1, 378, 178, 24);
  });

  ensureTexture(ids.hudBadge, 142, 56, (g) => {
    drawRoundedGradientRect(g, 0, 0, 142, 56, 16, palette.hudTop, palette.hudBottom);
    g.lineStyle(2, colorToInt(palette.lineSoft), 0.5);
    g.strokeRoundedRect(1, 1, 140, 54, 16);
  });

  ensureTexture(ids.spark, 40, 40, (g) => {
    drawSparkTexture(g, palette.accent);
  });

  ensureTexture(ids.glow, 128, 128, (g) => {
    drawGlowTexture(g, palette.accent);
  });

  ensureTexture(ids.grain, 128, 128, (g) => {
    drawGrainTexture(g);
  });

  // Icons (64x64)
  const iconDefs: Array<{ kind: string; id: string; color: string }> = [
    { kind: "A", id: ids.tileIconA, color: "#f87171" },
    { kind: "B", id: ids.tileIconB, color: "#fb923c" },
    { kind: "C", id: ids.tileIconC, color: "#facc15" },
    { kind: "D", id: ids.tileIconD, color: "#a3e635" },
    { kind: "E", id: ids.tileIconE, color: "#34d399" },
    { kind: "F", id: ids.tileIconF, color: "#2dd4bf" },
    { kind: "G", id: ids.tileIconG, color: "#38bdf8" },
    { kind: "H", id: ids.tileIconH, color: "#818cf8" },
    { kind: "I", id: ids.tileIconI, color: "#c084fc" },
    { kind: "J", id: ids.tileIconJ, color: "#f472b6" },
    { kind: "K", id: ids.tileIconK, color: "#f43f5e" },
    { kind: "L", id: ids.tileIconL, color: "#60a5fa" }
  ];
  for (const def of iconDefs) {
    if (gameTextures.exists(def.id)) continue;
    const g2 = scene.make.graphics({ x: 0, y: 0, add: false });
    g2.setSize(64, 64);
    drawIconShape(g2, def.kind, def.color);
    gameTextures.addCanvas(def.id, g2.canvas);
    g2.destroy();
  }

  return tokens;
}

export function paintMagicBackdrop(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Container {
  const tokens = BASE_TOKENS;
  const container = scene.add.container(0, 0);

  // Base gradient
  const graphics = scene.add.graphics();
  graphics.fillGradientStyle(
    colorToInt(tokens.palette.bgTop),
    colorToInt(tokens.palette.bgTop),
    colorToInt(tokens.palette.bgBottom),
    colorToInt(tokens.palette.bgBottom),
    1
  );
  graphics.fillRect(0, 0, width, height);
  container.add(graphics);

  // Soft spotlights
  graphics.fillStyle(colorToInt(tokens.palette.mist), 0.2);
  graphics.fillCircle(width * 0.16, height * 0.18, Math.max(54, width * 0.13));
  graphics.fillCircle(width * 0.88, height * 0.08, Math.max(42, width * 0.1));

  graphics.fillStyle(colorToInt(tokens.palette.accent), 0.16);
  graphics.fillCircle(width * 0.9, height * 0.7, Math.max(64, width * 0.18));
  graphics.fillCircle(width * 0.02, height * 0.54, Math.max(56, width * 0.14));

  // A subtle animated glow layer for "premium" movement
  if (!scene.textures.exists(tokens.ids.glow) || !scene.textures.exists(tokens.ids.grain)) {
    registerMagicTextures(scene);
  }

  const glowA = scene.add
    .image(width * 0.2, height * 0.28, tokens.ids.glow)
    .setAlpha(0.28)
    .setBlendMode("SCREEN")
    .setScale(2.4);

  const glowB = scene.add
    .image(width * 0.82, height * 0.78, tokens.ids.glow)
    .setAlpha(0.22)
    .setBlendMode("SCREEN")
    .setScale(2.8);

  const grain = scene.add
    .tileSprite(0, 0, width, height, tokens.ids.grain)
    .setOrigin(0, 0)
    .setAlpha(0.08)
    .setBlendMode("OVERLAY");

  container.add([glowA, glowB, grain]);

  scene.tweens.add({
    targets: glowA,
    alpha: { from: 0.22, to: 0.36 },
    duration: 2600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });

  scene.tweens.add({
    targets: glowB,
    alpha: { from: 0.18, to: 0.3 },
    duration: 3200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
    delay: 260
  });

  scene.tweens.add({
    targets: grain,
    tilePositionX: "+=128",
    tilePositionY: "+=64",
    duration: 8200,
    repeat: -1,
    ease: "Linear"
  });

  return container;
}

export function createHudBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  value: string
): Phaser.GameObjects.Container {
  const tokens = BASE_TOKENS;
  if (!scene.textures.exists(tokens.ids.hudBadge)) {
    registerMagicTextures(scene);
  }

  const container = scene.add.container(x, y);
  const bg = scene.add.image(0, 0, tokens.ids.hudBadge).setOrigin(0.5);
  const labelText = scene.add
    .text(0, -10, label, {
      fontFamily: tokens.text.fontFamily,
      fontSize: tokens.text.labelSize,
      color: tokens.text.labelColor
    })
    .setOrigin(0.5);
  const valueText = scene.add
    .text(0, 12, value, {
      fontFamily: tokens.text.fontFamily,
      fontSize: tokens.text.valueSize,
      color: tokens.text.valueColor,
      fontStyle: "700"
    })
    .setOrigin(0.5);

  container.add([bg, labelText, valueText]);
  return container;
}
