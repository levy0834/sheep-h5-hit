# sheep-h5-hit

基于《羊了个羊》灵感的竖屏 H5 消除原型，技术栈为 Vite + TypeScript + Phaser。

## 当前状态（真实进度）

项目已经是可运行、可完成一局的玩法原型，不再是“只有文档基建”：

- 已有 3 个核心场景：`StartScene` / `GameScene` / `ResultScene`
- 已有 2 个可游玩关卡（`Meadow Stack`, `Fog Ridge`）
- 已实现核心规则：遮挡判定、点击入槽、3 消、槽位上限失败、清空胜利
- 已支持关卡进阶：通关后可进入下一关，失败可重开或返回首页
- 已新增可玩性增强：`Undo`（撤销上一步合法点击）
- 已接入一条可落地元玩法闭环：`MetaOverlay` 压力条 + 救援卡指令已连到 `GameScene`（可触发、可见、可影响胜负）

## 仍未完成（交付阻塞）

- 元玩法已接主循环，但仍缺参数平衡与结果页/新手引导中的反馈文案整合
- 美术与动效仍偏原型风格，缺少统一视觉打磨
- 仍需完整真机回归与分享链路验证（GitHub Pages 最终冒烟）
- 目前无自动化测试，主要依赖 build + 手玩验证

## 本地开发

```bash
npm install
npm run dev -- --host
```

## 构建与预览

```bash
npm run build
npm run preview -- --host
```

## GitHub Pages 部署

1. 仓库 Settings -> Pages 中将 Source 设置为 `GitHub Actions`
2. 推送到 `main`（或手动触发 `.github/workflows/deploy-pages.yml`）
3. CI 构建 `dist/` 后发布到 Pages

`vite.config.ts` 中 `base` 解析顺序：

1. `VITE_BASE_PATH`（显式覆盖）
2. GitHub Actions（build/preview）自动回退到 `/<repo-name>/`
3. 本地 build/preview 默认 `./`（相对路径，便于子路径与静态预览）
4. 本地 dev 默认 `/`

## 文档

- 任务看板：`docs/task-board.md`
- QA 清单：`docs/qa-checklist.md`
- 发布记录：`docs/qa-release-report.md`
