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
    spark: "magic-spark"
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

export function registerMagicTextures(scene: Phaser.Scene): MagicTokens {
  const tokens = BASE_TOKENS;
  const { ids, tile, palette } = tokens;
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

  if (!scene.textures.exists(ids.tileBase)) {
    drawTileTexture(graphics, tile, {
      top: palette.tileTop,
      bottom: palette.tileBottom,
      rim: "#ffffff",
      sparkle: palette.mist
    });
    graphics.generateTexture(ids.tileBase, tile.width, tile.height);
  }

  if (!scene.textures.exists(ids.tileRare)) {
    graphics.clear();
    drawTileTexture(graphics, tile, {
      top: palette.tileRareTop,
      bottom: palette.tileRareBottom,
      rim: "#fff3cb",
      sparkle: "#fffce7"
    });
    graphics.generateTexture(ids.tileRare, tile.width, tile.height);
  }

  if (!scene.textures.exists(ids.tileLocked)) {
    graphics.clear();
    drawTileTexture(graphics, tile, {
      top: palette.tileLockedTop,
      bottom: palette.tileLockedBottom,
      rim: "#edf2ff",
      sparkle: "#f4f7ff"
    });
    graphics.generateTexture(ids.tileLocked, tile.width, tile.height);
  }

  if (!scene.textures.exists(ids.panel)) {
    graphics.clear();
    drawRoundedGradientRect(graphics, 0, 0, 380, 180, 24, palette.panelTop, palette.panelBottom);
    graphics.lineStyle(2, colorToInt(palette.lineSoft), 0.78);
    graphics.strokeRoundedRect(1, 1, 378, 178, 24);
    graphics.generateTexture(ids.panel, 380, 180);
  }

  if (!scene.textures.exists(ids.hudBadge)) {
    graphics.clear();
    drawRoundedGradientRect(graphics, 0, 0, 142, 56, 16, palette.hudTop, palette.hudBottom);
    graphics.lineStyle(2, colorToInt(palette.lineSoft), 0.5);
    graphics.strokeRoundedRect(1, 1, 140, 54, 16);
    graphics.generateTexture(ids.hudBadge, 142, 56);
  }

  if (!scene.textures.exists(ids.spark)) {
    graphics.clear();
    drawSparkTexture(graphics, palette.accent);
    graphics.generateTexture(ids.spark, 40, 40);
  }

  graphics.destroy();
  return tokens;
}

export function paintMagicBackdrop(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Graphics {
  const tokens = BASE_TOKENS;
  const graphics = scene.add.graphics();

  graphics.fillGradientStyle(
    colorToInt(tokens.palette.bgTop),
    colorToInt(tokens.palette.bgTop),
    colorToInt(tokens.palette.bgBottom),
    colorToInt(tokens.palette.bgBottom),
    1
  );
  graphics.fillRect(0, 0, width, height);

  graphics.fillStyle(colorToInt(tokens.palette.mist), 0.2);
  graphics.fillCircle(width * 0.16, height * 0.18, Math.max(54, width * 0.13));
  graphics.fillCircle(width * 0.88, height * 0.08, Math.max(42, width * 0.1));

  graphics.fillStyle(colorToInt(tokens.palette.accent), 0.16);
  graphics.fillCircle(width * 0.9, height * 0.7, Math.max(64, width * 0.18));
  graphics.fillCircle(width * 0.02, height * 0.54, Math.max(56, width * 0.14));

  return graphics;
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
