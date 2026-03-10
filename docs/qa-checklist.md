# QA Checklist (Lightweight)

用于发布前的快速回归，目标是确认移动端可玩与 GitHub Pages 可访问。

## 1) Build & Artifacts
- [ ] `npm install` 成功
- [ ] `npm run build` 成功且无报错
- [ ] 产物目录 `dist/` 存在并包含 `index.html`
- [ ] 关键静态资源可以从 Pages 子路径正确加载（无 404）
- [ ] 首页首次进入的 gameplay 懒加载可完成，预热后再次点击 `START` 不出现白屏或重复场景注册报错

## 2) Core Gameplay Smoke
- [ ] 可从首页进入游戏
- [ ] 至少完整打完 1 局流程（胜利或失败）
- [ ] 结算页可达且可再次开局
- [ ] 关键交互（点击/触控）在移动端响应正常

## 3) Mobile / WeChat Compatibility
- [ ] iOS Safari 可正常进入并操作
- [ ] Android Chrome 可正常进入并操作
- [ ] 微信内置浏览器可进入并操作（触控、滚动、音频策略按预期）
- [ ] 竖屏布局无明显裁切，安全区内容可见

## 4) Deployment Verification
- [ ] `Deploy to GitHub Pages` workflow 通过
- [ ] Pages 链接可在手机直接打开
- [ ] 首屏加载正常，核心流程可玩
- [ ] 将最终试玩链接与验证结果写入 `docs/qa-release-report.md`
