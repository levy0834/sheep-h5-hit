import Phaser from "phaser";
import type { PressureTier } from "../types";

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
  private useCardHandler: (() => void) | null = null;
  private readonly panelWidth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y);
    this.panelWidth = width;
    scene.add.existing(this);

    const bg = scene.add.rectangle(0, 0, width, 120, 0x101418, 0.75).setOrigin(0, 0);
    const pressureBg = scene
      .add
      .rectangle(14, 36, width - 28, 14, 0x2a3038, 1)
      .setOrigin(0, 0);
    this.pressureFill = scene
      .add
      .rectangle(14, 36, width - 28, 14, 0x37d67a, 1)
      .setOrigin(0, 0);
    this.pressureText = scene.add.text(14, 14, "Pressure 0%", {
      fontFamily: "Verdana",
      fontSize: "15px",
      color: "#ffffff",
    });
    this.chargeText = scene.add.text(14, 58, "Rescue Charge: 0", {
      fontFamily: "Verdana",
      fontSize: "14px",
      color: "#d1e8ff",
    });
    this.cardText = scene.add.text(14, 80, "Card: none", {
      fontFamily: "Verdana",
      fontSize: "13px",
      color: "#ffe8b6",
    });
    this.chainText = scene.add.text(width - 14, 80, "Comeback x0", {
      fontFamily: "Verdana",
      fontSize: "13px",
      color: "#ffb347",
    });
    this.chainText.setOrigin(1, 0);

    this.cardButton = scene.add
      .rectangle(width - 86, 58, 72, 22, 0x1f8fdd, 1)
      .setOrigin(0, 0);
    this.cardButton.setInteractive({ useHandCursor: true });
    const buttonText = scene.add.text(width - 50, 69, "Use Card", {
      fontFamily: "Verdana",
      fontSize: "11px",
      color: "#ffffff",
    });
    buttonText.setOrigin(0.5, 0.5);

    this.toastText = scene.add.text(width / 2, 110, "", {
      fontFamily: "Verdana",
      fontSize: "12px",
      color: "#ffffff",
      align: "center",
    });
    this.toastText.setOrigin(0.5, 1);
    this.toastText.setAlpha(0);

    this.cardButton.on("pointerdown", () => {
      this.useCardHandler?.();
    });

    this.add([
      bg,
      pressureBg,
      this.pressureFill,
      this.pressureText,
      this.chargeText,
      this.cardText,
      this.chainText,
      this.cardButton,
      buttonText,
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
    this.pressureText.setText(
      `Pressure ${Math.round(ratio * 100)}% | Chaos Lv.${model.chaosLevel}`,
    );
    this.chargeText.setText(`Rescue Charge: ${model.rescueCharge}`);
    this.cardText.setText(`Card: ${model.heldCardName ?? "none"}`);
    this.chainText.setText(`Comeback x${model.comebackChain}`);
    this.cardButton.setAlpha(model.heldCardName ? 1 : 0.45);
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
      return 0xf24d4d;
    }
    if (tier === "heated") {
      return 0xffa53d;
    }
    return 0x37d67a;
  }
}
