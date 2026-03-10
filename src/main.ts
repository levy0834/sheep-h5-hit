import Phaser from "phaser";
import "./style.css";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/constants";
import { GameScene } from "./game/scenes/GameScene";
import { ResultScene } from "./game/scenes/ResultScene";
import { StartScene } from "./game/scenes/StartScene";
import { MetaOverlayScene } from "./scenes/MetaOverlayScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#020617",
  scene: [StartScene, GameScene, MetaOverlayScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  }
};

new Phaser.Game(config);
