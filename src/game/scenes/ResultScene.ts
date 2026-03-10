import Phaser from "phaser";
import type { RoundResultData } from "../types";

const defaultResult: RoundResultData = {
  win: false,
  reason: "Round ended.",
  levelId: "level-1",
  levelName: "Meadow Stack",
  levelNumber: 1,
  totalLevels: 1,
  taps: 0,
  matchedTiles: 0
};

export class ResultScene extends Phaser.Scene {
  private result: RoundResultData = defaultResult;

  public constructor() {
    super("ResultScene");
  }

  public init(data: RoundResultData): void {
    this.result = {
      ...defaultResult,
      ...data
    };
  }

  public create(): void {
    const { width, height } = this.scale;
    const baseColor = this.result.win ? 0x14532d : 0x7f1d1d;
    const accentColor = this.result.win ? 0x22c55e : 0xfb7185;

    const bg = this.add.graphics();
    bg.fillGradientStyle(baseColor, baseColor, 0x020617, 0x020617, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 168, this.result.win ? "YOU WIN" : "TRY AGAIN", {
        fontFamily: "Trebuchet MS",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#f8fafc"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 266, this.result.reason, {
        fontFamily: "Trebuchet MS",
        fontSize: "28px",
        color: "#e2e8f0"
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, 418, 320, 188, 0x0b1225, 0.75)
      .setStrokeStyle(2, accentColor, 0.95);

    this.add
      .text(
        width / 2,
        374,
        `Level: ${this.result.levelName}\nProgress: ${this.result.levelNumber}/${this.result.totalLevels}\nTaps: ${this.result.taps}\nMatched: ${this.result.matchedTiles}`,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "26px",
          color: "#e2e8f0",
          align: "center",
          lineSpacing: 8
        }
      )
      .setOrigin(0.5, 0);

    const hasNextLevel = this.result.win && Boolean(this.result.nextLevelId);
    const replayY = hasNextLevel ? 556 : 602;
    const nextLevelY = 648;
    const homeY = hasNextLevel ? 740 : 700;

    this.createButton(width / 2, replayY, 260, 72, "Replay Level", 0xfacc15, () =>
      this.scene.start("GameScene", { levelId: this.result.levelId })
    );

    if (hasNextLevel && this.result.nextLevelId) {
      this.createButton(width / 2, nextLevelY, 260, 72, "Next Level", 0x4ade80, () =>
        this.scene.start("GameScene", { levelId: this.result.nextLevelId })
      );
    }

    this.createButton(width / 2, homeY, 260, 72, "Back To Home", 0x60a5fa, () =>
      this.scene.start("StartScene")
    );
  }

  private createButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    fillColor: number,
    onClick: () => void
  ): void {
    const body = this.add
      .rectangle(x, y, w, h, fillColor, 0.98)
      .setStrokeStyle(2, 0x0f172a, 0.7)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Trebuchet MS",
        fontSize: "30px",
        color: "#0f172a",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    body.on("pointerover", () => body.setAlpha(1));
    body.on("pointerout", () => body.setAlpha(0.98));
    body.on("pointerdown", () => {
      body.disableInteractive();
      this.tweens.add({
        targets: [body, text],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick
      });
    });
  }
}
