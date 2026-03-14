import "./style.css";

const bootStage = document.getElementById("boot-stage");
const loader = document.getElementById("boot-loading");
const gameRoot = document.getElementById("game-root");
const retryButton = document.getElementById("boot-retry") as HTMLButtonElement | null;
const errorHint = document.getElementById("boot-error");

function setBootStage(text: string): void {
  if (bootStage) bootStage.textContent = text;
}

function setBootFailed(message: string): void {
  setBootStage("阶段：启动失败");
  if (errorHint) {
    errorHint.textContent = message;
    errorHint.style.display = "block";
  }
  if (retryButton) {
    retryButton.style.display = "inline-flex";
    retryButton.disabled = false;
  }
}

async function bootstrap(): Promise<void> {
  if (retryButton) {
    retryButton.disabled = true;
    retryButton.style.display = "none";
  }
  if (errorHint) {
    errorHint.style.display = "none";
  }

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

if (retryButton) {
  retryButton.addEventListener("click", () => {
    void bootstrap().catch((error) => {
      console.error("Retry bootstrap failed:", error);
      setBootFailed("再次加载失败，请刷新页面后重试");
    });
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to bootstrap game:", error);
  if (loader) loader.style.display = "flex";
  setBootFailed("加载失败，请点重试；如果还不行再刷新页面");
});
