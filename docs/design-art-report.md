# sheep-h5-hit Design Art Report

## 1. Art Direction
- 关键词: 魔法感、梗感、轻量可扩展、竖屏微信可读性优先。
- 目标情绪: “失败会笑、胜利想晒、下一局马上点”。
- 视觉策略: 用渐变、玻璃感面板、夸张按钮压感和高对比标签做识别点，不依赖重贴图。
- 资源策略: 优先 CSS + Phaser Graphics 动态纹理，后续只需要替换少量图标即可升级质感。

## 2. UX Tone
- 首页: 10 秒内读懂玩法，强 CTA（主按钮）+ 一句梗化机制说明。
- 游戏中: HUD 保持高可读，信息块固定位置避免视线跳动。
- 结果页: 胜利强调“炫耀欲”，失败强调“差一点翻盘”，让复玩动机高于挫败感。

## 3. Visual System (轻量版)

### 3.1 Color Tokens
| Token | Value | 用途 |
| --- | --- | --- |
| `--magic-bg-top` | `#0d2142` | 背景深色起点 |
| `--magic-bg-mid` | `#15527c` | 中段过渡 |
| `--magic-bg-bottom` | `#1ea3a0` | 魔法氛围落点 |
| `--magic-primary` | `#30e6b4` | 主按钮/高光 |
| `--magic-accent` | `#ffd36b` | 梗贴纸/奖励强调 |
| `--magic-pop` | `#ff6a88` | 失败提示/情绪色 |
| `--panel-bg` | `rgba(244,252,255,0.82)` | 卡片底 |
| `--ink-main` | `#112040` | 深色正文 |
| `--ink-light` | `#eefcff` | 浅色正文 |

### 3.2 Typography Suggestions
- 标题字体建议: `Hannotate SC` / `Chalkboard SE` / `PingFang SC`（自动回退）。
- 正文字体建议: `PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei`。
- 排版策略: 大标题夸张，正文 14px 左右，HUD 数值比标签大一级（16-24px）。

### 3.3 Component Shape Language
- Panel: 22px 圆角 + 轻玻璃背景 + 白色描边。
- Button: 胶囊形 + 厚阴影 + 按压位移（`translateY`）。
- Tile: 浅色立体块 + 高光圆斑 + 稀有/锁定两种变体。
- HUD: 半透明深色 pill，白字高对比。
- Result Mood: 胜利卡偏薄荷黄绿色，失败卡偏粉红，统一乐子感。

## 4. Delivered Files
- `design-art/design-system.css`: 视觉变量与 UI 组件样式。
- `design-art/preview.html`: 手机竖屏 H5 风格预览页。
- `design-art/phaser-style-placeholders.js`: Phaser 动态纹理与 HUD 占位组件。

## 5. Merge Guide (to main game)

### 5.1 DOM Overlay 接入
1. 将 `design-art/design-system.css` 合并进项目主样式（或直接在入口引入）。
2. 首页、HUD、结果页 DOM 使用以下类名组合:
   - `glass-panel`
   - `btn-magic` / `btn-ghost`
   - `hud-bar` + `hud-pill`
   - `result-card result-card--win|--fail`
3. 保持移动端宽度约束: 主容器 `max-width: 480px`，竖屏优先。

### 5.2 Phaser Scene 接入
1. 在 UI Scene 或主场景中引入占位工具:

```js
import {
  registerMagicTextures,
  paintMagicBackdrop,
  createHudBadge
} from "../design-art/phaser-style-placeholders.js";
```

2. 在 `create()` 阶段调用:

```js
registerMagicTextures(this);
paintMagicBackdrop(this, this.scale.width, this.scale.height);
createHudBadge(this, 74, 44, "连击", "x3");
```

3. 牌面精灵优先使用以下 key 占位:
   - `magic-tile-base`
   - `magic-tile-rare`
   - `magic-tile-locked`

4. 后续替换美术时只替换纹理 key 对应资源，逻辑层无需改动。

## 6. Validation
- 本次交付为纯前端静态层，无重资产依赖。
- 已完成文件结构校验与 JS 语法检查（`node --check`）。
- 可直接打开 `design-art/preview.html` 做观感巡检。

## 7. Risks & Next Steps
- 风险: 仅占位纹理状态下，品牌记忆点主要来自色彩与文案，角色 IP 感还不够强。
- 风险: 若后续玩法节奏更快，按钮和 HUD 动效可能需要再收敛以减少干扰。
- 建议下一步:
  1. 与 `frontend-core` 对齐 tile 状态枚举，建立统一 key 命名。
  2. 与 `frontend-meta` 对齐结果页文案模板，统一“失败也好玩”的梗语气。
  3. 实机微信 WebView 验证字体回退与透明度表现。
