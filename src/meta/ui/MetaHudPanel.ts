import Phaser from "phaser";
import type { PressureTier } from "../types";
import { MAGIC_TOKENS, registerMagicTextures } from "../../ui/magicStyle";
import { setShadow } from "../../ui/shadow";
import { ensureSfxOnGame } from "../../ui/sfx";

export interface MetaHudViewModel {
  pressureValue: number;
  pressureMax: number;
  pressureTier: PressureTier;
  rescueCharge: number;
  heldCardName?: string;
  comebackChain: number;
  chaosLevel: number;
}

export class MetaHudPanel extends Phaser.GameObjects.Container {
  private readonly pressureFill: Phaser.GameObjects.Rectangle;
  private readonly pressureText: Phaser.GameObjects.Text;
  private readonly chargeText: Phaser.GameObjects.Text;
  private readonly cardText: Phaser.GameObjects.Text;
  private readonly chainText: Phaser.GameObjects.Text;
  private readonly toastText: Phaser.GameObjects.Text;
  private readonly cardButton: Phaser.GameObjects.Rectangle;
  private readonly cardButtonText: Phaser.GameObjects.Text;
  private readonly muteButton: Phaser.GameObjects.Rectangle;
  private readonly muteButtonText: Phaser.GameObjects.Text;
  private useCardHandler: (() => void) | null = null;
  private readonly panelWidth: number;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly panelStroke: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y);
    this.panelWidth = width;
    scene.add.existing(this);

    registerMagicTextures(scene);

    // Glass-ish panel background
    this.bg = scene.add.rectangle(0, 0, width, 120, 0xf8fafc, 0.14).setOrigin(0, 0);
    this.bg.setStrokeStyle(2, 0xffffff, 0.22);
    setShadow(this.bg, 0, 10, "rgba(8, 35, 60, 0.28)", 22, false, true);

    // Soft stroke highlight
    this.panelStroke = scene.add.rectangle(0, 0, width, 120, 0x000000, 0).setOrigin(0, 0);
    this.panelStroke.setStrokeStyle(2, 0xffffff, 0.28);

    const pressureBg = scene
      .add
      .rectangle(14, 40, width - 28, 14, 0x0b1225, 0.35)
      .setOrigin(0, 0);
    pressureBg.setStrokeStyle(1, 0xffffff, 0.16);

    this.pressureFill = scene
      .add
      .rectangle(14, 40, width - 28, 14, 0x30e6b4, 0.92)
      .setOrigin(0, 0);

    this.pressureText = scene.add.text(14, 14, "压力 0%", {
      fontFamily: "Trebuchet MS",
      fontSize: "15px",
      color: "#eefcff",
      fontStyle: "bold"
    });

    this.chargeText = scene.add.text(14, 62, "救援能量：0", {
      fontFamily: "Trebuchet MS",
      fontSize: "14px",
      color: "#d9f7ff"
    });

    this.cardText = scene.add.text(14, 82, "卡牌：无", {
      fontFamily: "Trebuchet MS",
      fontSize: "13px",
      color: MAGIC_TOKENS.palette.tileRareBottom
    });

    this.chainText = scene.add.text(width - 14, 82, "翻盘 x0", {
      fontFamily: "Trebuchet MS",
      fontSize: "13px",
      color: MAGIC_TOKENS.palette.tileRareBottom
    });
    this.chainText.setOrigin(1, 0);

    this.cardButton = scene.add
      .rectangle(width - 92, 58, 78, 26, 0x30e6b4, 0.95)
      .setOrigin(0, 0);
    this.cardButton.setStrokeStyle(2, 0xffffff, 0.45);
    setShadow(this.cardButton, 0, 6, "rgba(0,0,0,0.18)", 14, false, true);
    this.cardButton.setInteractive({ useHandCursor: true });

    this.cardButtonText = scene.add.text(width - 53, 71, "用卡", {
      fontFamily: "Trebuchet MS",
      fontSize: "12px",
      color: "#052e16",
      fontStyle: "bold"
    });
    this.cardButtonText.setOrigin(0.5, 0.5);

    // Mute toggle button (top-right)
    const sfx = ensureSfxOnGame(scene.game);
    const muted = !sfx.isEnabled();
    this.muteButton = scene.add.rectangle(width - 38, 12, 26, 26, 0x0b1225, 0.28).setOrigin(0, 0);
    this.muteButton.setStrokeStyle(2, 0xffffff, 0.26);
    setShadow(this.muteButton, 0, 6, "rgba(0,0,0,0.16)", 12, false, true);
    this.muteButton.setInteractive({ useHandCursor: true });

    this.muteButtonText = scene.add.text(width - 25, 25, muted ? "🔇" : "🔊", {
      fontFamily: "Trebuchet MS",
      fontSize: "14px",
      color: "#e2e8f0",
      fontStyle: "bold"
    });
    this.muteButtonText.setOrigin(0.5, 0.5);

    this.toastText = scene.add.text(width / 2, 112, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "12px",
      color: "#eefcff",
      align: "center"
    });
    this.toastText.setOrigin(0.5, 1);
    this.toastText.setAlpha(0);

    this.cardButton.on("pointerdown", () => {
      // press feedback
      this.scene.tweens.add({
        targets: [this.cardButton, this.cardButtonText],
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 70,
        yoyo: true
      });
      const tapSfx = ensureSfxOnGame(this.scene.game);
      tapSfx.play(this.scene, "ui_tap", { volume: 0.45, cooldownMs: 60 });
      this.useCardHandler?.();
    });

    this.muteButton.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: [this.muteButton, this.muteButtonText],
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 70,
        yoyo: true
      });
      const toggleSfx = ensureSfxOnGame(this.scene.game);
      const enabled = toggleSfx.toggle();
      this.muteButtonText.setText(enabled ? "🔊" : "🔇");
      // If just enabled, give a tiny confirmation sound.
      if (enabled) {
        toggleSfx.play(this.scene, "ui_tap", { volume: 0.45, cooldownMs: 60 });
      }
      this.pushToast(enabled ? "音效已开启" : "音效已关闭");
    });

    this.add([
      this.bg,
      this.panelStroke,
      pressureBg,
      this.pressureFill,
      this.pressureText,
      this.chargeText,
      this.cardText,
      this.chainText,
      this.cardButton,
      this.cardButtonText,
      this.muteButton,
      this.muteButtonText,
      this.toastText,
    ]);

    this.setScrollFactor(0);
    this.setDepth(1000);
  }

  public setUseCardHandler(handler: () => void): void {
    this.useCardHandler = handler;
  }

  public render(model: MetaHudViewModel): void {
    const ratio = Phaser.Math.Clamp(model.pressureValue / model.pressureMax, 0, 1);
    this.pressureFill.width = (this.panelWidth - 28) * ratio;
    this.pressureFill.setFillStyle(this.resolvePressureColor(model.pressureTier));

    this.pressureText.setText(`压力 ${Math.round(ratio * 100)}% · 混沌 Lv.${model.chaosLevel}`);
    this.chargeText.setText(`救援能量：${model.rescueCharge}`);
    this.cardText.setText(`卡牌：${model.heldCardName ?? "无"}`);
    this.chainText.setText(`翻盘 x${model.comebackChain}`);

    const enabled = Boolean(model.heldCardName);
    this.cardButton.setAlpha(enabled ? 1 : 0.4);
    this.cardButtonText.setAlpha(enabled ? 1 : 0.5);
  }

  public pushToast(message: string): void {
    this.toastText.setText(message);
    this.toastText.setAlpha(1);
    this.scene.tweens.killTweensOf(this.toastText);
    this.scene.tweens.add({
      targets: this.toastText,
      alpha: 0,
      duration: 1700,
      ease: "Cubic.Out",
    });
  }

  private resolvePressureColor(tier: PressureTier): number {
    if (tier === "critical") {
      return 0xff6a88;
    }
    if (tier === "heated") {
      return 0xffd36b;
    }
    return 0x30e6b4;
  }
}
