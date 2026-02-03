<template>
  <view class="page led-marquee-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('ledMarquee.title')" :visible="!isFullscreen" />

    <!-- 全屏预览（CSS 模拟横屏） -->
    <view
      v-if="isFullscreen"
      class="fullscreen-preview landscape-mode"
      :style="{ backgroundColor: bgColor }"
      @click="exitFullscreen"
    >
      <view class="marquee-container">
        <view
          class="marquee-text"
          :class="{ 'scroll-left': direction === 'rtl', 'scroll-right': direction === 'ltr', 'paused': !isScrolling }"
          :style="marqueeStyle"
        >
          {{ displayText }}
        </view>
      </view>
      <view v-show="showTip" class="fullscreen-tip">{{ t('ledMarquee.tapToExit') }}</view>
    </view>

    <!-- 主内容 -->
    <view v-show="!isFullscreen" class="main-content">
      <!-- 预览区域 -->
      <view class="preview-card">
        <view class="preview-area" :style="{ backgroundColor: bgColor }">
          <view
            class="marquee-text preview-marquee"
            :class="{ 'scroll-left': direction === 'rtl', 'scroll-right': direction === 'ltr', 'paused': !isScrolling }"
            :style="previewMarqueeStyle"
          >
            {{ displayText }}
          </view>
        </view>
        <view class="preview-actions">
          <view class="action-btn" :class="{ active: isScrolling }" @click="toggleScroll">
            <text>{{ isScrolling ? t('ledMarquee.stopScroll') : t('ledMarquee.startScroll') }}</text>
          </view>
          <view class="action-btn primary" @click="enterFullscreen">
            <text>{{ t('ledMarquee.fullscreen') }}</text>
          </view>
        </view>
      </view>

      <!-- 文字输入 -->
      <view class="setting-card">
        <view class="setting-header">
          <text class="setting-title">{{ t('ledMarquee.inputPlaceholder') }}</text>
        </view>
        <textarea
          v-model="inputText"
          class="text-input"
          :placeholder="t('ledMarquee.inputPlaceholder')"
          :maxlength="200"
        />
      </view>

      <!-- 颜色设置 -->
      <view class="setting-card">
        <view class="setting-header">
          <text class="setting-title">{{ t('ledMarquee.textColor') }}</text>
        </view>
        <view class="color-presets">
          <view
            v-for="color in textColorPresets"
            :key="color"
            class="color-item"
            :class="{ active: textColor === color }"
            :style="{ backgroundColor: color }"
            @click="textColor = color"
          />
        </view>
      </view>

      <view class="setting-card">
        <view class="setting-header">
          <text class="setting-title">{{ t('ledMarquee.bgColor') }}</text>
        </view>
        <view class="color-presets">
          <view
            v-for="color in bgColorPresets"
            :key="color"
            class="color-item"
            :class="{ active: bgColor === color }"
            :style="{ backgroundColor: color }"
            @click="bgColor = color"
          />
        </view>
      </view>

      <!-- 滚动方向 -->
      <view class="setting-card">
        <view class="setting-header">
          <text class="setting-title">{{ t('ledMarquee.direction') }}</text>
        </view>
        <view class="direction-btns">
          <view
            class="direction-btn"
            :class="{ active: direction === 'ltr' }"
            @click="direction = 'ltr'"
          >
            <text>{{ t('ledMarquee.leftToRight') }}</text>
          </view>
          <view
            class="direction-btn"
            :class="{ active: direction === 'rtl' }"
            @click="direction = 'rtl'"
          >
            <text>{{ t('ledMarquee.rightToLeft') }}</text>
          </view>
        </view>
      </view>

      <!-- 速度控制 -->
      <view class="setting-card">
        <view class="setting-header">
          <text class="setting-title">{{ t('ledMarquee.speed') }}</text>
          <text class="setting-value">{{ speed }}s</text>
        </view>
        <view class="slider-row">
          <text class="slider-label">{{ t('ledMarquee.fast') }}</text>
          <slider
            :value="speed"
            :min="3"
            :max="20"
            :step="1"
            activeColor="#ff4757"
            backgroundColor="var(--bg-sunken)"
            block-size="24"
            @change="onSpeedChange"
          />
          <text class="slider-label">{{ t('ledMarquee.slow') }}</text>
        </view>
      </view>

      <!-- 字体大小 -->
      <view class="setting-card">
        <view class="setting-header">
          <text class="setting-title">{{ t('ledMarquee.fontSize') }}</text>
          <text class="setting-value">{{ fontSize }}px</text>
        </view>
        <view class="slider-row">
          <text class="slider-label">{{ t('ledMarquee.small') }}</text>
          <slider
            :value="fontSize"
            :min="24"
            :max="120"
            :step="4"
            activeColor="#ff4757"
            backgroundColor="var(--bg-sunken)"
            block-size="24"
            @change="onFontSizeChange"
          />
          <text class="slider-label">{{ t('ledMarquee.large') }}</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="ledMarqueeShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 状态 ===
const inputText = ref('EH Tools')
const textColor = ref('#ff4757')
const bgColor = ref('#000000')
const speed = ref(10)
const fontSize = ref(48)
const direction = ref<'ltr' | 'rtl'>('rtl')
const isScrolling = ref(true)
const isFullscreen = ref(false)
const showTip = ref(false)

// 预设颜色
const textColorPresets = [
  '#ff4757', '#ff6b81', '#ffa502', '#ffdd59',
  '#2ed573', '#1e90ff', '#5352ed', '#ffffff'
]

const bgColorPresets = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460',
  '#2d3436', '#2f3640', '#353b48', '#ffffff'
]

// 分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图配置
const toolShareConfig = {
  toolName: t('ledMarquee.title'),
  category: 'text' as const,
  subtitle: 'LED滚动字幕'
}

// 显示文字
const displayText = computed(() => {
  return inputText.value.trim() || 'EH Tools'
})

// 全屏样式
const marqueeStyle = computed(() => ({
  color: textColor.value,
  fontSize: `${fontSize.value}px`,
  animationDuration: `${speed.value}s`
}))

// 预览区样式
const previewMarqueeStyle = computed(() => ({
  color: textColor.value,
  fontSize: '24px',
  animationDuration: `${speed.value}s`
}))

// === 方法 ===
function onSpeedChange(e: any) {
  speed.value = e.detail.value
}

function onFontSizeChange(e: any) {
  fontSize.value = e.detail.value
}

function toggleScroll() {
  isScrolling.value = !isScrolling.value
}

function enterFullscreen() {
  if (!inputText.value.trim()) {
    showToast(t('ledMarquee.textEmpty'))
    return
  }
  isFullscreen.value = true
  // 显示提示，1秒后隐藏
  showTip.value = true
  setTimeout(() => {
    showTip.value = false
  }, 1000)
  // 使用 CSS transform 模拟横屏，无需调用平台 API
  uni.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: bgColor.value
  })
}

function exitFullscreen() {
  isFullscreen.value = false
  settingsStore.initTheme()
}

function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
})

onShareAppMessage(() => ({
  title: `EH Tools - ${t('ledMarquee.title')}`,
  path: '/pages/text/led-marquee/index',
  imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
}))

onShareTimeline(() => ({
  title: `EH Tools - ${t('ledMarquee.title')}`
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.led-marquee-page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-content {
  padding: $spacing-md;
  padding-bottom: 0;
}

// 全屏预览
.fullscreen-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  // CSS 模拟横屏效果
  &.landscape-mode {
    // 旋转 90 度实现横屏
    transform: rotate(90deg);
    transform-origin: center center;
    // 交换宽高
    width: 100vh;
    height: 100vw;
    // 重新定位到屏幕中心
    top: 50%;
    left: 50%;
    margin-top: -50vw;
    margin-left: -50vh;
  }
}

.marquee-container {
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.marquee-text {
  white-space: nowrap;
  font-weight: bold;
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
  padding: 0 100%;

  &.scroll-left {
    animation: scroll-left linear infinite;
  }

  &.scroll-right {
    animation: scroll-right linear infinite;
  }

  &.paused {
    animation-play-state: paused;
  }
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

@keyframes scroll-right {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

.fullscreen-tip {
  position: absolute;
  bottom: 80rpx;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}

// 预览卡片
.preview-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.preview-area {
  height: 160rpx;
  border-radius: $radius-md;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
}

.preview-marquee {
  width: 100%;
}

.preview-actions {
  display: flex;
  gap: $spacing-md;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sunken);
  border-radius: $radius-md;
  font-size: 28rpx;
  color: var(--text-primary);
  transition: all $transition-normal;

  &.active {
    background: rgba(255, 71, 87, 0.2);
    color: #ff4757;
  }

  &.primary {
    background: linear-gradient(135deg, #ff4757, #ff6b81);
    color: #fff;
  }

  &:active {
    transform: scale(0.96);
  }
}

// 设置卡片
.setting-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.setting-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-value {
  font-size: 26rpx;
  color: var(--text-secondary);
}

// 文字输入
.text-input {
  width: 100%;
  height: 160rpx;
  background: var(--bg-sunken);
  border: none;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: 28rpx;
  color: var(--text-primary);
  box-sizing: border-box;
}

// 颜色预设
.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.color-item {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  border: 4rpx solid transparent;
  transition: all $transition-normal;
  box-shadow: var(--shadow-neumorphic-sm);

  &.active {
    border-color: var(--color-primary);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

// 方向按钮
.direction-btns {
  display: flex;
  gap: $spacing-md;
}

.direction-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sunken);
  border-radius: $radius-md;
  font-size: 26rpx;
  color: var(--text-secondary);
  transition: all $transition-normal;

  &.active {
    background: linear-gradient(135deg, #ff4757, #ff6b81);
    color: #fff;
  }

  &:active {
    transform: scale(0.96);
  }
}

// 滑块
.slider-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.slider-label {
  font-size: 24rpx;
  color: var(--text-placeholder);
  flex-shrink: 0;
}

slider {
  flex: 1;
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}
</style>
