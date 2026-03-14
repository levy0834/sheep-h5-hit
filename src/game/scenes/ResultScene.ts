import Phaser from "phaser";
import { PRODUCT_COPY } from "../../meta/content/product-copy";
import { paintMagicBackdrop, MAGIC_TOKENS } from "../../ui/magicStyle";
import { MOTION, addFloatMotion, addPulseMotion, applyPressBounce } from "../../ui/motion";
import { setShadow } from "../../ui/shadow";
import { ensureSfxOnGame } from "../../ui/sfx";
import type { RoundResultData } from "../types";
import { LEVELS } from "../levels";

const BEST_SCORE_KEY = "sheep_best_scores_v1";

const defaultResult: RoundResultData = {
  win: false,
  reason: "本局结束。",
  levelId: LEVELS[0]?.id ?? "level-1",
  levelName: LEVELS[0]?.name ?? "Meadow Stack",
  levelNumber: 1,
  totalLevels: LEVELS.length,
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
  private transitionLocked = false;

  public constructor() {
    super("ResultScene");
  }

  public init(data: RoundResultData): void {
    this.transitionLocked = false;
    this.result = {
      ...defaultResult,
      ...data
    };
  }

  public create(): void {
    const { width, height } = this.scale;
    const hasNextLevel = this.result.win && Boolean(this.result.nextLevelId);
    const replayLabel = this.result.win ? "重玩本关" : "再试一次";
    const replayY = hasNextLevel ? 694 : 724;
    const nextLevelY = 756;
    const homeY = hasNextLevel ? 812 : 792;
    const accentColor = this.result.win ? 0x22c55e : 0xfb7185;
    const efficiency = this.result.taps > 0 ? (this.result.matchedTiles / this.result.taps).toFixed(2) : "0.00";
    const flavorLine = this.pickResultFlavor();
    const performanceTag = this.resolvePerformanceTag();
    const nextStep = this.resolveNextStep(hasNextLevel);
    const score = this.computeRoundScore();
    const { bestScore, isNewRecord } = this.updateBestScore(score);
    const scoreHint = isNewRecord ? "  新纪录!" : "";

    // Use magic-style backdrop with themed accents
    paintMagicBackdrop(this, width, height);

    this.add
      .text(width / 2, 114, this.result.win ? "🎉 过关成功" : "😅 再来一局", {
        fontFamily: "Trebuchet MS",
        fontSize: "48px",
        fontStyle: "bold",
        color: this.result.win ? "#30e6b4" : "#ffd36b"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 180, this.result.reason, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#eefcff"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 230, flavorLine, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#d9f7ff",
        align: "center",
        wordWrap: { width: Math.min(360, Math.floor(width * 0.86)) }
      })
      .setWordWrapWidth(336)
      .setOrigin(0.5);

    const perfBadge = this.add
      .rectangle(width / 2, 286, 332, 44, accentColor, 0.18)
      .setStrokeStyle(2, accentColor, 0.8);
    this.add
      .text(width / 2, 286, `评价 · ${performanceTag}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: this.result.win ? "#30e6b4" : "#ffd36b",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    addPulseMotion(this, perfBadge, {
      scaleFrom: 0.98,
      scaleTo: 1.03,
      alphaFrom: 0.7,
      alphaTo: 0.95,
      duration: 2800
    });

    const statsPanel = this.add
      .rectangle(width / 2, 386, 322, 156, 0xf8fafc, 0.12)
      .setStrokeStyle(2, accentColor, 0.75);
    setShadow(statsPanel, 0, 6, "rgba(0,0,0,0.12)", 10, false, true);
    this.add
      .text(
        width / 2,
        320,
        `关卡：${this.result.levelName}\n进度：${this.result.levelNumber}/${this.result.totalLevels}\n用时：${this.formatElapsed(this.result.elapsedMs)}\n点击：${this.result.taps}  消除：${this.result.matchedTiles}`,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "16px",
          color: "#0f172a",
          align: "center",
          lineSpacing: 6
        }
      )
      .setOrigin(0.5, 0);

    this.add
      .text(
        width / 2,
        408,
        `最高连击：${this.result.maxCombo}  效率：${efficiency}\n分数：${score}  本关纪录：${bestScore}${scoreHint}`,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "15px",
          color: "#0f172a",
          align: "center",
          lineSpacing: 5
        }
      )
      .setOrigin(0.5, 0);

    this.add
      .rectangle(width / 2, 530, 336, 120, 0xf8fafc, 0.12)
      .setStrokeStyle(2, accentColor, 0.7);
    this.add
      .text(
        width / 2,
        510,
        `抉择：${this.result.twistCount}  翻盘连段：${this.result.comebackChain}\n卡牌：${this.result.rescueCardsUsed}/${this.result.rescueCardsGranted}  濒死：${this.result.nearFailCount}  护盾：${this.result.overflowShieldSaves}`,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "15px",
          color: "#0f172a",
          align: "center",
          lineSpacing: 7
        }
      )
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 606, `💡 ${nextStep}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "15px",
        color: this.result.win ? "#1e40af" : "#9d174d",
        align: "center",
        fontStyle: "bold"
      })
      .setWordWrapWidth(336)
      .setOrigin(0.5);

    this.createButton(width / 2, replayY, 288, 56, replayLabel, 0xfacc15, () => {
      const sfx = ensureSfxOnGame(this.game);
      sfx.play(this, "ui_tap", { volume: 0.5, cooldownMs: 60 });
      this.scene.start("GameScene", { levelId: this.result.levelId });
    });

    if (hasNextLevel && this.result.nextLevelId) {
      this.createButton(width / 2, nextLevelY, 288, 56, "下一关", 0x4ade80, () => {
        const sfx = ensureSfxOnGame(this.game);
        sfx.play(this, "ui_tap", { volume: 0.5, cooldownMs: 60 });
        this.scene.start("GameScene", { levelId: this.result.nextLevelId });
      });
    }

    this.createButton(width / 2, homeY, 288, 56, "返回首页", 0x60a5fa, () => {
      const sfx = ensureSfxOnGame(this.game);
      sfx.play(this, "ui_tap", { volume: 0.5, cooldownMs: 60 });
      this.scene.start("StartScene");
    });
  }

  private resolvePerformanceTag(): string {
    if (this.result.win && this.result.comebackChain >= 2) {
      return "极限翻盘";
    }
    if (this.result.win && this.result.rescueCardsUsed === 0 && this.result.nearFailCount === 0) {
      return "稳稳拿下";
    }
    if (this.result.win && this.result.maxCombo >= 2) {
      return "连消顺手";
    }
    if (!this.result.win && this.result.rescueCardsGranted > this.result.rescueCardsUsed) {
      return "卡牌时机差一点";
    }
    if (!this.result.win && this.result.nearFailCount >= 2) {
      return "就差一步";
    }
    return this.result.win ? "稳定过关" : "再试就能过";
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

  private computeRoundScore(): number {
    const seconds = Math.max(1, Math.round(this.result.elapsedMs / 1000));
    const efficiency = this.result.taps > 0 ? this.result.matchedTiles / this.result.taps : 0;
    const base = this.result.matchedTiles * 18;
    const comboBonus = this.result.maxCombo * 120;
    const speedBonus = Math.max(0, 180 - seconds) * 5;
    const efficiencyBonus = Math.round(efficiency * 240);
    const clearBonus = this.result.win ? 900 : 0;
    const penalty = this.result.rescueCardsUsed * 80 + this.result.nearFailCount * 50 + this.result.twistCount * 30;
    return Math.max(0, Math.round(base + comboBonus + speedBonus + efficiencyBonus + clearBonus - penalty));
  }

  private updateBestScore(score: number): { bestScore: number; isNewRecord: boolean } {
    const bestScores = this.loadBestScores();
    const previousBest = bestScores[this.result.levelId] ?? 0;
    if (score > previousBest) {
      bestScores[this.result.levelId] = score;
      this.saveBestScores(bestScores);
      return { bestScore: score, isNewRecord: true };
    }
    return { bestScore: previousBest, isNewRecord: false };
  }

  private loadBestScores(): Record<string, number> {
    try {
      const raw = localStorage.getItem(BEST_SCORE_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const safeScores: Record<string, number> = {};
      for (const [levelId, value] of Object.entries(parsed)) {
        if (levelId.length > 0 && typeof value === "number" && Number.isFinite(value) && value >= 0) {
          safeScores[levelId] = value;
        }
      }
      return safeScores;
    } catch {
      return {};
    }
  }

  private saveBestScores(scores: Record<string, number>): void {
    try {
      localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(scores));
    } catch {
      // ignore write failures
    }
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
    const shadow = this.add.rectangle(x, y + 6, w, h, 0x0b1225, 0.25).setOrigin(0.5);
    const body = this.add
      .rectangle(x, y, w, h, 0xf8fafc, 0.12)
      .setStrokeStyle(2, fillColor, 0.7)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: "Trebuchet MS",
        fontSize: "24px",
        color: `#${fillColor.toString(16).padStart(6, "0")}`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    let locked = false;

    const releaseLock = () => {
      locked = false;
      body.setScale(1);
      text.setScale(1);
      shadow.setScale(1);
    };

    body.on("pointerover", () => body.setFillStyle(0xf8fafc, 0.18));
    body.on("pointerout", () => body.setFillStyle(0xf8fafc, 0.12));
    body.on("pointerdown", () => {
      if (locked || this.transitionLocked) {
        return;
      }

      locked = true;
      this.transitionLocked = true;
      applyPressBounce(this, [body, text, shadow], () => {
        releaseLock();
        if (!this.sys.isActive()) {
          return;
        }
        try {
          onClick();
        } catch (error) {
          this.transitionLocked = false;
          console.error(`Result button "${label}" action failed:`, error);
        }
      }, 0.93);
    });
  }
}
