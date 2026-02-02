# SVG 图标规范

## 目录

1. [基本规范](#基本规范)
2. [颜色规则](#颜色规则)
3. [文件命名](#文件命名)
4. [现有图标示例](#现有图标示例)
5. [暗黑模式适配](#暗黑模式适配)

## 基本规范

- viewBox: `0 0 24 24` (固定 24x24)
- fill: `none` (根元素默认不填充)
- xmlns: `http://www.w3.org/2000/svg`
- stroke-width: 线条宽度 `1.5` 或 `2` (主体框架用 2，细节用 1.5)
- 图标内容居中，四周留 2-3px 安全边距

```xml
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 图标内容 -->
</svg>
```

## 颜色规则

所有图标统一使用主题色 `#667eea`:

- 线条: `stroke="#667eea"`
- 填充点/小面积: `fill="#667eea"`
- 不使用其他颜色

图标在 ToolCard 中通过 CSS `filter: brightness(0) invert(1)` 变为白色，叠加在渐变色背景上显示。因此图标本身的颜色不影响最终展示效果，但统一为 `#667eea` 保持代码一致性。

## 文件命名

- 位置: `src/static/icons/`
- 格式: kebab-case (如: `color-card.svg`, `arrow-right.svg`)
- 不含前缀/后缀 (如不要 `icon-xxx.svg`)

## 现有图标示例

**calculator.svg** (计算器 — 线条 + 填充点混合):

```xml
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="2" width="16" height="20" rx="2" stroke="#667eea" stroke-width="2"/>
  <rect x="6" y="4" width="12" height="5" rx="1" stroke="#667eea" stroke-width="1.5"/>
  <circle cx="8" cy="13" r="1" fill="#667eea"/>
  <circle cx="12" cy="13" r="1" fill="#667eea"/>
  <circle cx="16" cy="13" r="1" fill="#667eea"/>
  <circle cx="8" cy="17" r="1" fill="#667eea"/>
  <circle cx="12" cy="17" r="1" fill="#667eea"/>
  <rect x="15" y="16" width="2" height="4" rx="0.5" fill="#667eea"/>
</svg>
```

**设计要点:**
- 主体轮廓用 `stroke` + `stroke-width="2"`
- 内部细节用 `stroke-width="1.5"` 或小面积 `fill`
- 圆角 `rx` 保持柔和感 (rx=1~2)
- 小圆点/小图形用 `fill` 而非 `stroke`

## 暗黑模式适配

图标本身不需要暗黑模式适配。适配通过使用位置的 CSS 实现:

**ToolCard 中 (渐变背景上):**
```css
.tool-card-icon .svg-icon {
  filter: brightness(0) invert(1);  /* 变白色 */
}
```

**其他位置 (如设置页列表):**
- 若图标直接显示在页面上，颜色 `#667eea` 在亮暗两种背景下对比度都足够
- 如需动态变色，在容器上添加:

```css
.icon-container .svg-icon {
  filter: none; /* 亮色默认 #667eea */
}
.theme-dark .icon-container .svg-icon {
  filter: brightness(1.3); /* 暗色稍微提亮 */
}
```
