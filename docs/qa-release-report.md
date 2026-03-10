# QA Release Report

## Snapshot
- Date: 2026-03-09
- Workstream: WS-4 (QA, Build, Deploy)
- Worker: qa-release
- Branch: `feat/sheep-h5-hit-qa-release-`
- Goal: 提前搭建可发布到 GitHub Pages 的交付基线，供后续游戏 scaffold 合入后直接部署。

## What changed
- 新增 `.gitignore`，覆盖 Node/Vite/TypeScript 常见无关产物。
- 新增 `.github/workflows/deploy-pages.yml`，提供 GitHub Pages 自动部署流程。
- 新增 `vite.config.ts`，为 Pages 子路径部署提供 `base` 兼容策略。
- 更新 `README.md`，补充本地运行、构建、部署与交接说明。
- 新增 `docs/qa-checklist.md`，提供轻量上线前验证清单。

## Deployment note
- Deploy target: GitHub Pages (`github-pages` environment)
- Build output: `dist/`
- Workflow trigger: push to `main` or `workflow_dispatch`
- CI build env: `VITE_BASE_PATH=/<repo-name>/`
- 设计说明：当 `package.json` 尚未存在时，workflow 会自动跳过 build/deploy，避免空仓库或前置阶段误报失败。

## Build path considerations for Pages
- GitHub Pages 项目页通常部署在 `/<repo-name>/` 子路径下。
- `vite.config.ts` 支持以下优先级：
  1. 显式 `VITE_BASE_PATH`
  2. GitHub Actions 内按仓库名推导 `/<repo-name>/`
  3. 本地默认 `/`
- 目的：避免 `dist` 内静态资源引用根路径导致线上 404。

## Validation evidence (this branch)
- `git rev-parse --abbrev-ref HEAD` -> `feat/sheep-h5-hit-qa-release-`
- `test -f package.json && echo present || echo missing` -> `missing`（app scaffold 未合入）
- `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/deploy-pages.yml')"` -> YAML 语法可解析
- `git diff --check` -> 无空白与 patch 格式问题
- 本次改动为配置与文档层；受限于 scaffold 缺失，无法执行 `npm run build` 与运行时冒烟测试

## Risks
- 若后续合入分支已存在 `vite.config.ts`，需要按同一 `base` 策略做一次合并对齐。
- GitHub Pages 需在仓库 Settings 中手动启用 `GitHub Actions` 作为发布源。
- 移动端兼容与游戏流程可玩性仍需在源码合入后按清单执行实测。

## Next steps
1. 合入 Vite + TypeScript + Phaser 应用 scaffold（含 `package.json` scripts）。
2. 执行 `docs/qa-checklist.md` 全量检查并记录结果。
3. 触发 `Deploy to GitHub Pages`，拿到可分享试玩链接。
4. 回填最终线上地址和真机验证结果到本报告。

## 2026-03-10 Update

### What changed
- 启用了首页到 gameplay scene 的按需加载，只在点击 `START` 或首页预热时加载 `GameScene`、`ResultScene`、`MetaOverlayScene`。
- 强化了场景注册逻辑：若预热/重试过程中已存在 scene，不再重复注册，避免 duplicate key 崩溃。
- 首页新增轻量预热，降低首局首次点击后的等待感。
- 修复按钮交互锁死问题：`GameScene` 的 `Undo` 按钮和首页/结果页按钮点击后会在当前 scene 仍存活时恢复交互，不再变成一次性按钮。
- 更新 `docs/qa-checklist.md`，补充懒加载启动路径的专项检查项。

### Validation evidence
- `npm run build` 成功。
- 产物包含：
  - `dist/index.html`
  - `dist/assets/GameScene-*.js`
  - `dist/assets/ResultScene-*.js`
  - `dist/assets/MetaOverlayScene-*.js`
- 构建结果确认首页入口已通过动态 `import()` 引用 gameplay chunks，而非把 gameplay 逻辑全部并入首页逻辑包。
- 当前构建体积（minified）：
  - `dist/assets/index-*.js` ≈ `1,216.60 kB`
  - `dist/assets/GameScene-*.js` ≈ `14.59 kB`
  - `dist/assets/MetaOverlayScene-*.js` ≈ `14.86 kB`
  - `dist/assets/ResultScene-*.js` ≈ `4.41 kB`
- 当前仍无法在本环境内完成真实触控/手机浏览器人工回归，因此移动端与微信实机项仍未闭环。

### Current release risks
- Phaser runtime 仍然使首页主入口 chunk 偏大；虽然 gameplay 已拆分，但首屏 JS 体积仍是主要性能风险。
- GitHub Pages 线上链路、子路径资源加载、以及真机首屏耗时尚未做最终烟测。
- iOS Safari / Android Chrome / 微信内置浏览器的触控与安全区表现仍缺实机验证。

### Recommended next steps
1. 在本机浏览器做一轮首页预热 + `START` 进入 + `Undo` 连续点击的手玩回归。
2. 触发 GitHub Pages 部署并验证子路径加载与移动端首屏。
3. 若首屏加载仍偏慢，再单独处理 Phaser vendor 体积优化。
