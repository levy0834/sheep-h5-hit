import Phaser from "phaser";
import { LEVELS } from "../levels";
import { PRODUCT_COPY } from "../../meta/content/product-copy";
import { MAGIC_TOKENS, paintMagicBackdrop, registerMagicTextures } from "../../ui/magicStyle";
import { MOTION, addFloatMotion, addPulseMotion, applyPressBounce } from "../../ui/motion";

export class StartScene extends Phaser.Scene {
  private isBootstrapping = false;
  private gameplayScenesRegistered = false;
  private gameplayScenesLoadPromise: Promise<void> | null = null;
  private loadingHintText?: Phaser.GameObjects.Text;
  private startButton?: Phaser.GameObjects.Rectangle;
  private startButtonLabel?: Phaser.GameObjects.Text;

  public constructor() {
    super("StartScene");
  }

  public create(): void {
    const { width, height } = this.scale;
    const startCopy = PRODUCT_COPY.start;
    this.isBootstrapping = false;
    this.syncGameplaySceneRegistrationState();

    registerMagicTextures(this);
    paintMagicBackdrop(this, width, height);

    // Sticker tag
    const sticker = this.add
      .text(26, 22, "3 秒上头", {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#0f172a",
        fontStyle: "bold",
        backgroundColor: MAGIC_TOKENS.palette.tileRareBottom
      })
      .setPadding(10, 6, 10, 6)
      .setOrigin(0, 0);
    // rounded feel via shadow
    sticker.setShadow(0, 6, "rgba(0,0,0,0.22)", 10, false, true);
    addFloatMotion(this, sticker, 5, MOTION.float);

    this.add
      .text(width / 2, 84, "羊了个羊·翻盘版", {
        fontFamily: "Trebuchet MS",
        fontSize: "46px",
        color: "#eefcff",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 140, startCopy.title, {
        fontFamily: "Trebuchet MS",
        fontSize: "30px",
        color: "#eefcff",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 204, `${startCopy.subtitle}\n当前原型共 ${LEVELS.length} 关可玩。`, {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#d9f7ff",
        align: "center"
      })
      .setWordWrapWidth(332)
      .setOrigin(0.5);

    this.createGuidePanel(width / 2, 372, 340, 176, "基础规则", startCopy.coreRules);
    this.createGuidePanel(width / 2, 574, 340, 176, "翻盘提示", startCopy.metaHints);

    this.loadingHintText = this.add
      .text(
        width / 2,
        684,
        this.gameplayScenesRegistered ? startCopy.readyCta : startCopy.secondaryCta,
        {
          fontFamily: "Trebuchet MS",
          fontSize: "20px",
          color: "#bfdbfe",
          fontStyle: "bold"
        }
      )
      .setOrigin(0.5);
    addPulseMotion(this, this.loadingHintText, {
      scaleFrom: 0.99,
      scaleTo: 1.02,
      alphaFrom: 0.72,
      alphaTo: 1,
      duration: MOTION.glow
    });

    const { body, label } = this.createButton(
      width / 2,
      752,
      286,
      76,
      startCopy.primaryCta.toUpperCase(),
      () => this.handleStartPressed()
    );
    this.startButton = body;
    this.startButtonLabel = label;
    this.applyIdleStartButtonStyles(false);

    if (!this.gameplayScenesRegistered) {
      this.time.delayedCall(120, () => {
        void this.warmupGameplayRuntime();
      });
    }
  }

  private async handleStartPressed(): Promise<void> {
    if (this.isBootstrapping) {
      return;
    }

    this.isBootstrapping = true;
    this.loadingHintText?.setText(PRODUCT_COPY.start.loadingCta);
    this.updateStartButtonLoadingState(true);

    try {
      await this.ensureGameplayScenesRegistered();
      if (!this.sys.isActive()) {
        this.isBootstrapping = false;
        return;
      }
      this.scene.start("GameScene", { levelId: LEVELS[0].id });
    } catch (error) {
      console.error("Failed to load gameplay scenes:", error);
      this.isBootstrapping = false;
      if (!this.sys.isActive()) {
        return;
      }
      this.loadingHintText?.setText(PRODUCT_COPY.start.retryCta);
      this.updateStartButtonLoadingState(false);
    }
  }

  private async warmupGameplayRuntime(): Promise<void> {
    if (this.gameplayScenesRegistered || this.isBootstrapping) {
      return;
    }

    try {
      await this.ensureGameplayScenesRegistered();
      if (!this.sys.isActive() || this.isBootstrapping) {
        return;
      }
      this.loadingHintText?.setText(PRODUCT_COPY.start.readyCta);
      this.applyIdleStartButtonStyles(false);
    } catch (error) {
      console.warn("Gameplay runtime warmup failed. Will retry on tap.", error);
      if (!this.sys.isActive() || this.isBootstrapping) {
        return;
      }
      this.loadingHintText?.setText(PRODUCT_COPY.start.retryCta);
    }
  }

  private syncGameplaySceneRegistrationState(): void {
    this.gameplayScenesRegistered = Boolean(
      this.scene.get("GameScene") &&
        this.scene.get("ResultScene") &&
        this.scene.get("MetaOverlayScene")
    );
  }

  private async ensureGameplayScenesRegistered(): Promise<void> {
    this.syncGameplaySceneRegistrationState();
    if (this.gameplayScenesRegistered) {
      return;
    }

    if (!this.gameplayScenesLoadPromise) {
      this.gameplayScenesLoadPromise = Promise.all([
        import("./GameScene"),
        import("./ResultScene"),
        import("../../scenes/MetaOverlayScene")
      ])
        .then(([gameSceneModule, resultSceneModule, metaOverlayModule]) => {
          this.registerGameplayScene("GameScene", gameSceneModule.GameScene);
          this.registerGameplayScene("ResultScene", resultSceneModule.ResultScene);
          this.registerGameplayScene("MetaOverlayScene", metaOverlayModule.MetaOverlayScene);
          this.gameplayScenesRegistered = true;
        })
        .catch((error) => {
          this.gameplayScenesLoadPromise = null;
          throw error;
        });
    }

    await this.gameplayScenesLoadPromise;
  }

  private registerGameplayScene(
    key: string,
    sceneConfig: typeof import("./GameScene").GameScene
      | typeof import("./ResultScene").ResultScene
      | typeof import("../../scenes/MetaOverlayScene").MetaOverlayScene
  ): void {
    if (this.scene.get(key)) {
      return;
    }

    this.scene.add(key, sceneConfig, false);
  }

  private applyIdleStartButtonStyles(isHover: boolean): void {
    if (!this.startButton) {
      return;
    }

    const fillColor = this.gameplayScenesRegistered
      ? isHover
        ? 0x86efac
        : 0x4ade80
      : isHover
        ? 0xfde047
        : 0xfacc15;
    const strokeAlpha = this.gameplayScenesRegistered ? 0.7 : 0.5;
    const labelColor = this.gameplayScenesRegistered ? "#052e16" : "#1e293b";

    this.startButton.setFillStyle(fillColor, 1);
    this.startButton.setStrokeStyle(3, 0x0f172a, strokeAlpha);
    this.startButtonLabel?.setText(PRODUCT_COPY.start.primaryCta.toUpperCase());
    this.startButtonLabel?.setColor(labelColor);
  }

  private updateStartButtonLoadingState(isLoading: boolean): void {
    if (!this.startButton) {
      return;
    }

    if (isLoading) {
      this.startButton.disableInteractive();
      this.startButton.setFillStyle(0x94a3b8, 1);
      this.startButton.setStrokeStyle(3, 0x0f172a, 0.35);
      this.startButtonLabel?.setText("加载中…");
      this.startButtonLabel?.setColor("#334155");
      return;
    }

    if (this.startButton.input) {
      this.startButton.input.enabled = true;
    } else {
      this.startButton.setInteractive({ useHandCursor: true });
    }
    this.applyIdleStartButtonStyles(false);
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
      .rectangle(x, y, w, h, 0xf8fafc, 0.14)
      .setStrokeStyle(2, 0xffffff, 0.48)
      .setShadow(0, 14, "rgba(10, 30, 60, 0.28)", 24, false, true);

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
    onClick: () => void | Promise<void>
  ): { body: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text } {
    const shadow = this.add.rectangle(x, y + 10, w, h, 0x0b1225, 0.28).setOrigin(0.5);
    const body = this.add
      .rectangle(x, y, w, h, 0x30e6b4, 1)
      .setStrokeStyle(3, 0xffffff, 0.55)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: "Trebuchet MS",
        fontSize: "34px",
        color: "#052e16",
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    let locked = false;

    const setEnabled = (enabled: boolean) => {
      if (!body.active) {
        return;
      }

      if (enabled) {
        if (body.input) {
          body.input.enabled = true;
        } else {
          body.setInteractive({ useHandCursor: true });
        }
        return;
      }

      body.disableInteractive();
    };
    const releaseLock = () => {
      locked = false;
      body.setScale(1);
      text.setScale(1);
    };

    body.on("pointerover", () => {
      if (this.isBootstrapping) {
        return;
      }
      this.applyIdleStartButtonStyles(true);
    });
    body.on("pointerout", () => {
      if (this.isBootstrapping) {
        return;
      }
      this.applyIdleStartButtonStyles(false);
    });
    body.on("pointerdown", () => {
      if (locked || this.isBootstrapping) {
        return;
      }

      locked = true;
      setEnabled(false);
      applyPressBounce(this, [body, text], () => {
        Promise.resolve()
          .then(() => onClick())
          .catch((error) => {
            console.error("Start button action failed:", error);
          })
          .finally(() => {
            releaseLock();
            if (!this.sys.isActive() || this.isBootstrapping) {
              return;
            }
            setEnabled(true);
          });
      }, 0.925);
    });

    shadow.setDepth(1);
    body.setDepth(2);
    text.setDepth(3);

    return { body, label: text };
  }
}
