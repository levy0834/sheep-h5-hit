# Task Board

## Project
- Name: sheep-h5-hit
- Branching strategy: one worktree per workstream
- Integration branch: main

## Workstreams

### WS-1
- Name: Core Loop & Tile System
- Role owner: frontend-core
- Goal: 实现核心玩法、牌堆/槽位/消除机制、失败与胜利判定
- In scope: 基础 Phaser 场景、交互、状态流转、核心数值骨架
- Out of scope: 视觉精修、分享页文案
- Depends on: none
- Deliverables: 可玩的核心 loop
- Validation: 本地运行、关键路径手玩
- Definition of done: 可以完成一局并触发胜负

### WS-2
- Name: Twist Mechanics & Viral Meta
- Role owner: frontend-meta
- Goal: 设计并实现创新玩法与翻盘机制，强化“再来一局”冲动
- In scope: 道具/反转/事件机制、结算反馈、分享导向
- Out of scope: 基础渲染框架
- Depends on: WS-1
- Deliverables: 至少 1-2 个明确创新点
- Validation: 手玩验证爽点与可理解性
- Definition of done: 创新机制已接入主 loop 且可触发

### WS-3
- Name: Visual Identity & UX Polish
- Role owner: design-art
- Goal: 做出有记忆点的魔性视觉包装与轻动效
- In scope: 首页、按钮、卡片样式、结果页视觉、轻量资源与风格统一
- Out of scope: 核心玩法逻辑重写
- Depends on: WS-1
- Deliverables: 统一 UI 风格与高辨识度体验
- Validation: 视觉巡检 + 实机观感
- Definition of done: 主要界面完成统一包装

### WS-4
- Name: QA, Build, Deploy
- Role owner: qa-release
- Goal: 完成验收、修缺陷、发布到 GitHub Pages
- In scope: 构建配置、静态资源路径、部署、回归测试
- Out of scope: 大规模玩法新设计
- Depends on: WS-1, WS-2, WS-3
- Deliverables: 可访问的线上试玩链接
- Validation: build + pages deployment + smoke test
- Definition of done: GitHub 仓库可访问且页面可玩

## Integration checklist
- [ ] Interfaces aligned
- [ ] Shared contracts updated
- [ ] Repo-wide validation passed
- [ ] Risks documented
- [ ] Delivery summary prepared

## Iteration updates

### Iteration 2 (A = 更爽) - Completed
- Scope:
  - 新增第三关 `Storm Spiral`（4 层错位+中心压顶结构，含少量 rare/locked 视觉标记）
  - 关卡流程扩展为 3 关，结果页正确展示关卡名与总关数
  - 近失败可读性增强（槽位危险提示、轻微镜头震动）
  - 额外爽感反馈：胜利时触发轻量纸屑动画
- Validation:
  - `npm run build` 通过
  - 手玩验证路径：`level-1 -> level-2 -> level-3` 可达，胜负结算与进阶按钮正确
