import Phaser from "phaser";
import { PRODUCT_COPY } from "../../meta/content/product-copy";
import type { RoundResultData } from "../types";

const defaultResult: RoundResultData = {
  win: false,
  reason: "Round ended.",
  levelId: "level-1",
  levelName: "Meadow Stack",
  levelNumber: 1,
  totalLevels: 1,
  taps: 0,
  matchedTiles: 0,
  maxCombo: 0,
  elapsedMs: 0,
  nearFailCount: 0,
  rescueCardsUsed: 0,
  rescueCardsGranted: 0,
  twistCount: 0,
  comebackChain: 0,
  overflowShieldSaves: 0
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
    const hasNextLevel = this.result.win && Boolean(this.result.nextLevelId);
    const replayLabel = this.result.win ? "Replay Level" : "Retry Level";
    const replayY = hasNextLevel ? 694 : 724;
    const nextLevelY = 756;
    const homeY = hasNextLevel ? 812 : 792;
    const baseColor = this.result.win ? 0x14532d : 0x7f1d1d;
    const accentColor = this.result.win ? 0x22c55e : 0xfb7185;
    const efficiency = this.result.taps > 0 ? (this.result.matchedTiles / this.result.taps).toFixed(2) : "0.00";
    const flavorLine = this.pickResultFlavor();
    const performanceTag = this.resolvePerformanceTag();
    const nextStep = this.resolveNextStep(hasNextLevel);

    const bg = this.add.graphics();
    bg.fillGradientStyle(baseColor, baseColor, 0x020617, 0x020617, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 114, this.result.win ? "YOU WIN" : "TRY AGAIN", {
        fontFamily: "Trebuchet MS",
        fontSize: "58px",
        fontStyle: "bold",
        color: "#f8fafc"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 184, this.result.reason, {
        fontFamily: "Trebuchet MS",
        fontSize: "26px",
        color: "#e2e8f0"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 236, flavorLine, {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        color: "#e2e8f0",
        align: "center"
      })
      .setWordWrapWidth(336)
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, 286, 332, 44, accentColor, 0.2)
      .setStrokeStyle(2, accentColor, 0.9);
    this.add
      .text(width / 2, 286, `ROUND GRADE · ${performanceTag}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "24px",
        color: "#f8fafc",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width / 2, 412, 336, 184, 0x0b1225, 0.74)
      .setStrokeStyle(2, accentColor, 0.95);
    this.add
      .text(
        width / 2,
        328,
        `Level: ${this.result.levelName}\nProgress: ${this.result.levelNumber}/${this.result.totalLevels}\nTime: ${this.formatElapsed(this.result.elapsedMs)}\nTaps: ${this.result.taps}  Matched: ${this.result.matchedTiles}\nMax Combo: ${this.result.maxCombo}  Eff: ${efficiency}`,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "21px",
          color: "#e2e8f0",
          align: "center",
          lineSpacing: 6
        }
      )
      .setOrigin(0.5, 0);

    this.add
      .rectangle(width / 2, 570, 336, 124, 0x0b1225, 0.74)
      .setStrokeStyle(2, accentColor, 0.8);
    this.add
      .text(
        width / 2,
        520,
        `Twists Seen: ${this.result.twistCount}  Comeback Chain: ${this.result.comebackChain}\nCards Used/Gained: ${this.result.rescueCardsUsed}/${this.result.rescueCardsGranted}\nNear Fail Alerts: ${this.result.nearFailCount}  Overflow Saves: ${this.result.overflowShieldSaves}`,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "20px",
          color: "#e2e8f0",
          align: "center",
          lineSpacing: 8
        }
      )
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 650, `Next: ${nextStep}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "21px",
        color: "#bfdbfe",
        align: "center",
        fontStyle: "bold"
      })
      .setWordWrapWidth(336)
      .setOrigin(0.5);

    this.createButton(width / 2, replayY, 288, 56, replayLabel, 0xfacc15, () =>
      this.scene.start("GameScene", { levelId: this.result.levelId })
    );

    if (hasNextLevel && this.result.nextLevelId) {
      this.createButton(width / 2, nextLevelY, 288, 56, "Next Level", 0x4ade80, () =>
        this.scene.start("GameScene", { levelId: this.result.nextLevelId })
      );
    }

    this.createButton(width / 2, homeY, 288, 56, "Back To Home", 0x60a5fa, () =>
      this.scene.start("StartScene")
    );
  }

  private resolvePerformanceTag(): string {
    if (this.result.win && this.result.comebackChain >= 2) {
      return "CLUTCH COMEBACK";
    }
    if (this.result.win && this.result.rescueCardsUsed === 0 && this.result.nearFailCount === 0) {
      return "CLEAN CONTROL";
    }
    if (this.result.win && this.result.maxCombo >= 2) {
      return "COMBO FLOW";
    }
    if (!this.result.win && this.result.rescueCardsGranted > this.result.rescueCardsUsed) {
      return "CARD TIMING GAP";
    }
    if (!this.result.win && this.result.nearFailCount >= 2) {
      return "ONE MOVE SHORT";
    }
    return this.result.win ? "STABLE WIN" : "RETRY READY";
  }

  private pickResultFlavor(): string {
    const resultCopy = PRODUCT_COPY.result;
    const pool =
      this.result.win && this.result.comebackChain >= 2
        ? resultCopy.comeback
        : this.result.win
          ? resultCopy.win
          : resultCopy.lose;
    const seed =
      this.result.levelNumber +
      this.result.taps +
      this.result.twistCount +
      this.result.rescueCardsUsed +
      this.result.comebackChain;
    return pool[seed % pool.length];
  }

  private resolveNextStep(hasNextLevel: boolean): string {
    if (!this.result.win) {
      return PRODUCT_COPY.result.nextSteps.lose;
    }
    if (hasNextLevel) {
      return PRODUCT_COPY.result.nextSteps.winHasNext;
    }
    return PRODUCT_COPY.result.nextSteps.winNoNext;
  }

  private formatElapsed(elapsedMs: number): string {
    const seconds = Math.max(0, Math.round(elapsedMs / 1000));
    const minutePart = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secondPart = (seconds % 60).toString().padStart(2, "0");
    return `${minutePart}:${secondPart}`;
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
        fontSize: "27px",
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
