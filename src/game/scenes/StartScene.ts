import Phaser from "phaser";
import { LEVELS } from "../levels";
import { PRODUCT_COPY } from "../../meta/content/product-copy";

export class StartScene extends Phaser.Scene {
  public constructor() {
    super("StartScene");
  }

  public create(): void {
    const { width, height } = this.scale;
    const startCopy = PRODUCT_COPY.start;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x1d4ed8, 0x1d4ed8, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 78, "SHEEP HIT", {
        fontFamily: "Trebuchet MS",
        fontSize: "48px",
        color: "#f8fafc",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 136, startCopy.title, {
        fontFamily: "Trebuchet MS",
        fontSize: "32px",
        color: "#f8fafc",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 204, `${startCopy.subtitle}\n${LEVELS.length} playable levels in prototype.`, {
        fontFamily: "Trebuchet MS",
        fontSize: "20px",
        color: "#cbd5e1"
      })
      .setAlign("center")
      .setWordWrapWidth(332)
      .setOrigin(0.5);

    this.createGuidePanel(width / 2, 372, 340, 176, "CORE RULES", startCopy.coreRules);
    this.createGuidePanel(width / 2, 574, 340, 176, "META LOOP TIPS", startCopy.metaHints);

    this.add
      .text(width / 2, 684, startCopy.secondaryCta, {
        fontFamily: "Trebuchet MS",
        fontSize: "20px",
        color: "#bfdbfe",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.createButton(width / 2, 752, 286, 76, startCopy.primaryCta.toUpperCase(), () => {
      this.scene.start("GameScene", { levelId: LEVELS[0].id });
    });
  }

  private createGuidePanel(
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    items: readonly string[]
  ): void {
    this.add
      .rectangle(x, y, w, h, 0x0b1225, 0.72)
      .setStrokeStyle(2, 0x60a5fa, 0.55);

    this.add
      .text(x - w / 2 + 14, y - h / 2 + 14, title, {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        color: "#f8fafc",
        fontStyle: "bold"
      })
      .setOrigin(0, 0);

    const lines = items.map((item, index) => `${index + 1}. ${item}`).join("\n");
    this.add
      .text(x - w / 2 + 14, y - h / 2 + 50, lines, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#e2e8f0",
        lineSpacing: 5
      })
      .setWordWrapWidth(w - 28)
      .setOrigin(0, 0);
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
