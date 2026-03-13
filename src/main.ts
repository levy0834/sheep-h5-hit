import Phaser from "phaser";
import "./style.css";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/constants";
import { StartScene } from "./game/scenes/StartScene";
import { GameScene } from "./game/scenes/GameScene";
import { ResultScene } from "./game/scenes/ResultScene";
import { MetaOverlayScene } from "./scenes/MetaOverlayScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#020617",
  scene: [StartScene, GameScene, ResultScene, MetaOverlayScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  }
};

new Phaser.Game(config);
// Perf marks for mobile diagnosis
if (typeof performance !== "undefined") {
  performance.mark("game-created");
}
// Hide HTML boot loader once Phaser is created
const loader = document.getElementById("boot-loading");
const bootStage = document.getElementById("boot-stage");
if (bootStage) bootStage.textContent = "阶段：启动引擎";
if (loader) loader.style.display = "none";

