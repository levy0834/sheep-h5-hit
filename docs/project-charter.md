# sheep-h5-hit — Project Charter

## Objective
打造一款受《羊了个羊》启发、但具有明显创新点的微信竖屏 H5 小游戏，重点追求“上头、反转、可传播”的爆款感。最终交付 GitHub 仓库与可直接试玩链接。

## Scope In
- 完整可玩核心玩法
- 竖屏移动端微信 H5 适配
- 轻量但有记忆点的魔性视觉风格
- 创新机制（不做简单换皮）
- 失败/翻盘/爽点节奏设计
- 首页、主游戏、结果页、分享引导
- 可部署到 GitHub Pages 的静态版本

## Scope Out
- 微信小程序原生版本
- 重后端排行榜/登录体系
- 广告/支付/商业化后台
- 复杂账号系统
- 正式投放素材体系

## Users
- 微信泛用户
- 上班摸鱼休闲玩家
- 喜欢短时高刺激闯关的轻度玩家

## Platform & Stack
- Platform: 微信内 H5 / mobile web
- Rendering: Phaser 优先
- Language: TypeScript
- Build: Vite
- Deploy: GitHub Pages
- Orientation: 竖屏优先

## Quality Bar
- Delivery tier: 高保真可玩原型，接近可传播 MVP
- Testing: 关键流程可玩、基础回归、移动端适配检查
- Visual: 魔性、轻梗感、强记忆点
- Performance: 主流手机微信内可流畅运行

## Product Direction
- 推荐路线：中创新
- 爆点优先级：上头难度曲线、社交传播感、反转翻盘机制
- 创新方向：玩法机制创新、社交传播创新、美术包装创新

## Worker Plan
- frontend-core：核心消除与关卡循环
- frontend-meta：反转机制、结果页、分享驱动与 meta 体验
- design-art：视觉包装、动效风格、UI 统一
- qa-release：验收、构建、GitHub Pages 发布收口

## Risks
- 过度贴近原作导致创新不足
- H5 体验若反馈不够“脆”，上头感会下降
- 纯前端条件下社交传播只能先做轻量模拟/文案引导
- GitHub Pages 部署路径与静态资源路径需提前处理

## Acceptance Bar
项目达到以下条件视为完成：
- 在手机浏览器 / 微信环境中可直接进入并完整游玩
- 核心机制具备明确创新点
- 页面完整，有首页、游戏页、结算页
- 构建成功并已发布到 GitHub Pages
- 提供公开可玩链接
