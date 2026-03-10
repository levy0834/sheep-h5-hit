import Phaser from "phaser";
import { LEVELS } from "../levels";

export class StartScene extends Phaser.Scene {
  public constructor() {
    super("StartScene");
  }

  public create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x1d4ed8, 0x1d4ed8, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 130, "SHEEP HIT", {
        fontFamily: "Trebuchet MS",
        fontSize: "52px",
        color: "#f8fafc",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 206, `Prototype Core Loop · ${LEVELS.length} Levels`, {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        color: "#cbd5e1"
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        322,
        "Tap free tiles. Match 3 same tiles.\nUse Undo to recover one bad pick.\nClear all tiles before slot reaches 7.",
        {
          fontFamily: "Trebuchet MS",
          fontSize: "24px",
          color: "#e2e8f0",
          align: "center",
          lineSpacing: 12
        }
      )
      .setOrigin(0.5);

    this.createButton(width / 2, 520, 248, 76, "START", () => {
      this.scene.start("GameScene", { levelId: LEVELS[0].id });
    });
  }

  private createButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void
  ): void {
    const shadow = this.add.rectangle(x, y + 8, w, h, 0x0b1225, 0.4).setOrigin(0.5);
    const body = this.add
      .rectangle(x, y, w, h, 0xfacc15, 1)
      .setStrokeStyle(3, 0x0f172a, 0.5)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: "Trebuchet MS",
        fontSize: "34px",
        color: "#1e293b",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    body.on("pointerover", () => body.setFillStyle(0xfde047, 1));
    body.on("pointerout", () => body.setFillStyle(0xfacc15, 1));
    body.on("pointerdown", () => {
      body.disableInteractive();
      this.tweens.add({
        targets: [body, text],
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 90,
        yoyo: true,
        onComplete: onClick
      });
    });
    shadow.setDepth(1);
    body.setDepth(2);
    text.setDepth(3);
  }
}
