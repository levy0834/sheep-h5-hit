import Phaser from "phaser";
import type { TwistPrompt } from "../types";

type ChoiceCallback = (choiceId: string) => void;

interface ChoiceWidgets {
  box: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  desc: Phaser.GameObjects.Text;
}

export class TwistChoicePanel extends Phaser.GameObjects.Container {
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly summaryText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly choiceA: ChoiceWidgets;
  private readonly choiceB: ChoiceWidgets;
  private activePrompt: TwistPrompt | null = null;
  private choiceCallback: ChoiceCallback | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const height = 230;
    const bg = scene.add.rectangle(0, 0, width, height, 0x0f1218, 0.92).setOrigin(0.5, 0.5);
    const frame = scene.add.rectangle(0, 0, width, height, 0xffffff, 0.08).setOrigin(0.5, 0.5);

    this.titleText = scene.add.text(0, -88, "Chaos Twist", {
      fontFamily: "Verdana",
      fontSize: "19px",
      color: "#ffffff",
    });
    this.titleText.setOrigin(0.5, 0.5);

    this.summaryText = scene.add.text(0, -58, "", {
      fontFamily: "Verdana",
      fontSize: "12px",
      color: "#d9e6ff",
      align: "center",
      wordWrap: { width: width - 28 },
    });
    this.summaryText.setOrigin(0.5, 0.5);

    this.timerText = scene.add.text(0, -30, "", {
      fontFamily: "Verdana",
      fontSize: "12px",
      color: "#ffc04d",
    });
    this.timerText.setOrigin(0.5, 0.5);

    this.choiceA = this.createChoiceRow(scene, -8, width - 30);
    this.choiceB = this.createChoiceRow(scene, 80, width - 30);

    this.add([
      bg,
      frame,
      this.titleText,
      this.summaryText,
      this.timerText,
      this.choiceA.box,
      this.choiceA.title,
      this.choiceA.desc,
      this.choiceB.box,
      this.choiceB.title,
      this.choiceB.desc,
    ]);

    this.setScrollFactor(0);
    this.setDepth(1500);
    this.setVisible(false);
    this.setActive(false);
  }

  public open(prompt: TwistPrompt, onChoice: ChoiceCallback): void {
    this.activePrompt = prompt;
    this.choiceCallback = onChoice;
    this.titleText.setText(prompt.title);
    this.summaryText.setText(prompt.summary);
    this.setChoice(this.choiceA, prompt.choices[0].id, prompt.choices[0].label, prompt.choices[0].description);
    this.setChoice(this.choiceB, prompt.choices[1].id, prompt.choices[1].label, prompt.choices[1].description);
    this.setVisible(true);
    this.setActive(true);
  }

  public close(): void {
    this.activePrompt = null;
    this.choiceCallback = null;
    this.setVisible(false);
    this.setActive(false);
  }

  public renderRemainingMs(remainingMs: number): void {
    if (!this.activePrompt) {
      return;
    }
    const seconds = (remainingMs / 1000).toFixed(1);
    this.timerText.setText(`Decision lock in ${seconds}s`);
  }

  private createChoiceRow(
    scene: Phaser.Scene,
    offsetY: number,
    width: number,
  ): ChoiceWidgets {
    const box = scene.add.rectangle(0, offsetY, width, 74, 0x1b2331, 1);
    box.setOrigin(0.5, 0.5);
    box.setInteractive({ useHandCursor: true });
    const title = scene.add.text(-width / 2 + 10, offsetY - 20, "", {
      fontFamily: "Verdana",
      fontSize: "13px",
      color: "#ffffff",
    });
    const desc = scene.add.text(-width / 2 + 10, offsetY - 1, "", {
      fontFamily: "Verdana",
      fontSize: "11px",
      color: "#c7d7ef",
      wordWrap: { width: width - 20 },
    });
    return { box, title, desc };
  }

  private setChoice(
    widgets: ChoiceWidgets,
    choiceId: string,
    label: string,
    description: string,
  ): void {
    widgets.title.setText(label);
    widgets.desc.setText(description);
    widgets.box.removeAllListeners("pointerdown");
    widgets.box.on("pointerdown", () => {
      this.choiceCallback?.(choiceId);
    });
  }
}
