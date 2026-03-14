import "./style.css";


type BootMetric = { name: string; at: number; deltaMs?: number };
function metric(name: string): void {
  const at = typeof performance !== "undefined" ? performance.now() : Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = ((window as any).__BOOT_METRICS__ ??= []) as BootMetric[];
  const prev = store.length ? store[store.length - 1].at : at;
  store.push({ name, at, deltaMs: store.length ? at - prev : 0 });
}

function flushMetrics(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = ((window as any).__BOOT_METRICS__ ??= []) as BootMetric[];
  if (!store.length) return;
  // keep it lightweight: one console line
  const parts = store.map((m) => `${m.name}:${Math.round(m.deltaMs ?? 0)}ms`);
  // eslint-disable-next-line no-console
  console.log(`[boot] ${parts.join(" | ")}`);
}

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
  metric("start");
  if (retryButton) {
    retryButton.disabled = true;
    retryButton.style.display = "none";
  }
  if (errorHint) {
    errorHint.style.display = "none";
  }

  metric("before-import");
  setBootStage("阶段：加载引擎");

  metric("imports-begin");

  const [{ default: Phaser }, { GAME_HEIGHT, GAME_WIDTH }, { StartScene }, { ensureSfxOnGame }] =
    await Promise.all([
      import("phaser"),
      import("./game/constants"),
      import("./game/scenes/StartScene"),
      import("./ui/sfx")
    ]);

  metric("imports-done");
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

  metric("before-new-game");

  const game = new Phaser.Game(config);
  ensureSfxOnGame(game);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__SHEEP_GAME__ = game;
  if (typeof performance !== "undefined") {
    performance.mark("game-created");
  }

  metric("after-new-game");
  setBootStage("阶段：启动完成");
  if (loader) loader.style.display = "none";
  metric("done");
  flushMetrics();
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
