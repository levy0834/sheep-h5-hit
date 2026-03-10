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
