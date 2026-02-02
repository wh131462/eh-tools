# 样式与暗黑模式规范

## 目录

1. [页面布局模板](#页面布局模板)
2. [暗黑模式适配](#暗黑模式适配)
3. [CSS 变量速查](#css-变量速查)
4. [SCSS 变量速查](#scss-变量速查)
5. [组件样式规范](#组件样式规范)

## 页面布局模板

每个工具页面必须包含以下结构:

```vue
<template>
  <view class="page {tool-id}-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 页面内容 -->
    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

onShow(() => {
  uni.setNavigationBarTitle({ title: t('{camelCaseId}.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.{tool-id}-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}
.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}
</style>
```

## 暗黑模式适配

### 原则

1. **所有颜色使用 CSS 变量** — 不硬编码颜色值
2. **通过 `page.dark` 自动切换** — CSS 变量在 `src/styles/index.scss` 中按主题赋值
3. **页面根元素绑定 `theme-dark` 类** — `:class="{ 'theme-dark': settingsStore.isDark }"`

### 必须用 CSS 变量的属性

| 属性 | 变量 |
|------|------|
| 背景色 | `var(--bg-page)`, `var(--bg-card)`, `var(--bg-elevated)`, `var(--bg-sunken)` |
| 文字色 | `var(--text-primary)`, `var(--text-regular)`, `var(--text-secondary)`, `var(--text-placeholder)` |
| 边框 | `var(--border-color)`, `var(--border-light)` |
| 阴影 | `var(--shadow-neumorphic)`, `var(--shadow-neumorphic-sm)`, `var(--shadow-neumorphic-inset)` |
| 主题色 | `var(--primary)`, `var(--success)`, `var(--warning)`, `var(--error)` |

### 可以硬编码的颜色

- 渐变背景上的白色文字: `#FFFFFF`
- SCSS 渐变变量: `$gradient-xxx` (暗黑模式下渐变色不变)
- 透明遮罩: 使用 `var(--mask-bg)`

## CSS 变量速查

```
背景:  --bg-page | --bg-card | --bg-elevated | --bg-sunken | --bg-hover
文字:  --text-primary | --text-regular | --text-secondary | --text-placeholder | --text-inverse
边框:  --border-color | --border-light
阴影:  --shadow-neumorphic | --shadow-neumorphic-sm | --shadow-neumorphic-inset | --shadow-neumorphic-pressed
主色:  --primary | --primary-light | --primary-dark
功能:  --success | --warning | --error | --info
渐变:  --gradient-primary | --gradient-success | --gradient-warning | --gradient-danger | --gradient-info | --gradient-gold
分类:  --gradient-time | --gradient-calc | --gradient-text | --gradient-image | --gradient-life
遮罩:  --mask-bg
```

## SCSS 变量速查

```scss
// 间距 (8rpx 倍数)
$spacing-xs: 8rpx    $spacing-sm: 16rpx   $spacing-md: 32rpx
$spacing-lg: 48rpx   $spacing-xl: 64rpx   $spacing-2xl: 96rpx

// 圆角
$radius-sm: 16rpx    $radius-md: 32rpx    $radius-lg: 48rpx
$radius-xl: 64rpx    $radius-round: 9999rpx

// 字号
$font-size-xs: 20rpx   $font-size-sm: 24rpx   $font-size-md: 28rpx
$font-size-lg: 32rpx   $font-size-xl: 36rpx   $font-size-xxl: 48rpx

// 布局
$nav-height: 112rpx   $tabbar-height: 140rpx   $safe-bottom: 68rpx

// 动画
$transition-fast: 0.2s ease-out
$transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
$transition-slow: 0.5s ease-out
```

## 组件样式规范

### 卡片
```scss
background-color: var(--bg-card);
border-radius: $radius-lg;
box-shadow: var(--shadow-neumorphic);
padding: $spacing-lg;
```

### 按钮
- 主按钮: `class="btn-primary btn-block btn-round"` (渐变色全宽)
- 次要: `class="btn-default"` | 文字: `class="btn-text"`
- 高度固定 88rpx

### 输入框
```scss
background-color: var(--bg-card);
border-radius: $radius-md;
box-shadow: var(--shadow-neumorphic-inset);
padding: 28rpx 36rpx;
```

### 列表
```scss
.list {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  overflow: hidden;
}
.list-item {
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
  &:last-child { border-bottom: none; }
}
```

### 大数值展示
```scss
font-size: $font-size-xxl;
color: var(--primary);
font-weight: bold;
```

### 网格
```scss
display: grid;
grid-template-columns: repeat(4, 1fr);  // 或 3, 2
gap: $spacing-md;
```
