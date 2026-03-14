import "./style.css";

const bootStage = document.getElementById("boot-stage");
const loader = document.getElementById("boot-loading");
const gameRoot = document.getElementById("game-root");

function setBootStage(text: string): void {
  if (bootStage) bootStage.textContent = text;
}

async function bootstrap(): Promise<void> {
  setBootStage("阶段：加载引擎");

  const [{ default: Phaser }, { GAME_HEIGHT, GAME_WIDTH }, { StartScene }, { ensureSfxOnGame }] =
    await Promise.all([
      import("phaser"),
      import("./game/constants"),
      import("./game/scenes/StartScene"),
      import("./ui/sfx")
    ]);

  setBootStage("阶段：创建游戏");

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-root",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#020617",
    scene: [StartScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    }
  };

  const game = new Phaser.Game(config);
  ensureSfxOnGame(game);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__SHEEP_GAME__ = game;
  if (typeof performance !== "undefined") {
    performance.mark("game-created");
  }

  setBootStage("阶段：启动完成");
  if (loader) loader.style.display = "none";
  if (gameRoot) gameRoot.dataset.booted = "true";
}

void bootstrap().catch((error) => {
  console.error("Failed to bootstrap game:", error);
  setBootStage("阶段：加载失败，请刷新重试");
  if (loader) loader.style.display = "flex";
});
