<template>
  <view class="page color-tool-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('colorTool.title')" :visible="!isFullscreen" />

    <!-- 全屏打光模式 -->
    <view
      v-if="isFullscreen"
      class="fullscreen-overlay"
      :style="{ backgroundColor: currentColor }"
      @click="exitFullscreen"
    >
      <view
        v-if="showHint"
        class="fullscreen-hint"
        :style="{ color: getContrastColor(currentColor) }"
      >
        {{ t('colorTool.tapToExit') }}
      </view>
    </view>

    <!-- 颜色预览区域 - 点击进入全屏 -->
    <view class="preview-section" @click="enterFullscreen">
      <view class="color-preview" :style="{ backgroundColor: currentColor }">
        <view class="preview-info" :style="{ color: getContrastColor(currentColor) }">
          <text class="preview-hex">{{ currentColor }}</text>
          <text class="preview-hint">{{ t('colorTool.tapForFullscreen') }}</text>
        </view>
      </view>
      <view class="preview-actions">
        <view class="action-btn" @click.stop="copyColor(currentColor)">
          <text>{{ t('common.copy') }}</text>
        </view>
        <view class="action-btn" @click.stop="addToFavorites">
          <text>{{ t('colorTool.addToFavorites') }}</text>
        </view>
      </view>
    </view>

    <!-- 颜色选择器 -->
    <view v-show="activeTab === 'picker'" class="picker-section">
      <!-- HSL 滑块 -->
      <view class="slider-group">
        <view class="slider-item">
          <view class="slider-header">
            <text class="slider-label">H ({{ t('colorTool.hue') }})</text>
            <text class="slider-value">{{ hsl.h }}°</text>
          </view>
          <view class="hue-slider-track">
            <slider
              :value="hsl.h"
              :min="0"
              :max="360"
              :step="1"
              block-size="20"
              activeColor="transparent"
              backgroundColor="transparent"
              @change="onHueChange"
            />
          </view>
        </view>

        <view class="slider-item">
          <view class="slider-header">
            <text class="slider-label">S ({{ t('colorTool.saturation') }})</text>
            <text class="slider-value">{{ hsl.s }}%</text>
          </view>
          <slider
            :value="hsl.s"
            :min="0"
            :max="100"
            :step="1"
            block-size="20"
            activeColor="var(--primary)"
            @change="onSaturationChange"
          />
        </view>

        <view class="slider-item">
          <view class="slider-header">
            <text class="slider-label">L ({{ t('colorTool.lightness') }})</text>
            <text class="slider-value">{{ hsl.l }}%</text>
          </view>
          <slider
            :value="hsl.l"
            :min="0"
            :max="100"
            :step="1"
            block-size="20"
            activeColor="var(--primary)"
            @change="onLightnessChange"
          />
        </view>
      </view>
    </view>

    <!-- 颜色转换 Tab -->
    <view v-show="activeTab === 'converter'" class="converter-section">
      <!-- HEX 输入 -->
      <view class="input-group">
        <view class="input-label">HEX</view>
        <view class="input-row">
          <text class="input-prefix">#</text>
          <input
            class="color-input"
            :value="hex"
            maxlength="6"
            @input="onHexInput"
          />
          <view class="copy-btn" @click="copyColor('#' + hex)">
            {{ t('common.copy') }}
          </view>
        </view>
      </view>

      <!-- RGB 输入 -->
      <view class="input-group">
        <view class="input-label">RGB</view>
        <view class="input-row rgb-row">
          <view class="rgb-input-item">
            <text class="rgb-label">R</text>
            <input
              class="rgb-input"
              type="number"
              :value="rgb.r"
              @input="(e) => onRgbInput('r', e)"
            />
          </view>
          <view class="rgb-input-item">
            <text class="rgb-label">G</text>
            <input
              class="rgb-input"
              type="number"
              :value="rgb.g"
              @input="(e) => onRgbInput('g', e)"
            />
          </view>
          <view class="rgb-input-item">
            <text class="rgb-label">B</text>
            <input
              class="rgb-input"
              type="number"
              :value="rgb.b"
              @input="(e) => onRgbInput('b', e)"
            />
          </view>
          <view class="copy-btn" @click="copyColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)">
            {{ t('common.copy') }}
          </view>
        </view>
      </view>

      <!-- HSL 显示 -->
      <view class="input-group">
        <view class="input-label">HSL</view>
        <view class="input-row hsl-display">
          <text class="hsl-value">hsl({{ hsl.h }}, {{ hsl.s }}%, {{ hsl.l }}%)</text>
          <view class="copy-btn" @click="copyColor(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)">
            {{ t('common.copy') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 色卡 Tab -->
    <view v-show="activeTab === 'palette'" class="palette-section">
      <!-- Material 调色板 -->
      <view class="palette-group">
        <view class="palette-title">Material Design</view>
        <view class="color-grid">
          <view
            v-for="color in materialColors"
            :key="color"
            class="color-item"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            @longpress="copyColor(color)"
          >
            <view v-if="currentColor === color" class="color-selected">✓</view>
          </view>
        </view>
      </view>

      <!-- 收藏夹 -->
      <view v-if="favorites.length > 0" class="palette-group">
        <view class="palette-title">{{ t('colorTool.favorites') }}</view>
        <view class="color-grid">
          <view
            v-for="color in favorites"
            :key="color"
            class="color-item"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            @longpress="removeFavorite(color)"
          >
            <view v-if="currentColor === color" class="color-selected">✓</view>
          </view>
        </view>
        <view class="palette-hint">{{ t('colorTool.longPressToDelete') }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onHide } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 状态
const activeTab = ref<'picker' | 'converter' | 'palette'>('picker')
const isFullscreen = ref(false)
const showHint = ref(false)
let hintTimer: ReturnType<typeof setTimeout> | null = null

// HSL 值
const hsl = reactive({
  h: 200,
  s: 70,
  l: 50
})

// HEX 值
const hex = ref('1890FF')

// RGB 值
const rgb = reactive({
  r: 24,
  g: 144,
  b: 255
})

// 收藏颜色
const favorites = ref<string[]>(
  uni.getStorageSync('color_favorites') || []
)

// Material Design 调色板
const materialColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B', '#000000',
  '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'
]

// 当前颜色
const currentColor = computed(() => {
  return '#' + hex.value
})

// HSL 转 HEX
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

// HEX 转 RGB
const hexToRgb = (hexStr: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// RGB 转 HEX
const rgbToHex = (r: number, g: number, b: number): string => {
  return [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('').toUpperCase()
}

// RGB 转 HSL
const rgbToHsl = (r: number, g: number, b: number): { h: number, s: number, l: number } => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// 获取对比色（用于文字显示）
const getContrastColor = (hexColor: string): string => {
  const rgbVal = hexToRgb(hexColor)
  if (!rgbVal) return '#000000'
  const brightness = (rgbVal.r * 299 + rgbVal.g * 587 + rgbVal.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

// 更新 HSL
const updateFromHsl = () => {
  hex.value = hslToHex(hsl.h, hsl.s, hsl.l)
  const rgbVal = hexToRgb(hex.value)
  if (rgbVal) {
    rgb.r = rgbVal.r
    rgb.g = rgbVal.g
    rgb.b = rgbVal.b
  }
}

// 更新 RGB -> HSL & HEX
const updateFromRgb = () => {
  hex.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  const hslVal = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hsl.h = hslVal.h
  hsl.s = hslVal.s
  hsl.l = hslVal.l
}

// HSL 滑块事件
const onHueChange = (e: any) => {
  hsl.h = e.detail.value
  updateFromHsl()
}

const onSaturationChange = (e: any) => {
  hsl.s = e.detail.value
  updateFromHsl()
}

const onLightnessChange = (e: any) => {
  hsl.l = e.detail.value
  updateFromHsl()
}

// HEX 输入
const onHexInput = (e: any) => {
  let value = e.detail.value.toUpperCase().replace(/[^0-9A-F]/g, '')
  hex.value = value

  if (value.length === 6) {
    const rgbVal = hexToRgb(value)
    if (rgbVal) {
      rgb.r = rgbVal.r
      rgb.g = rgbVal.g
      rgb.b = rgbVal.b
      const hslVal = rgbToHsl(rgb.r, rgb.g, rgb.b)
      hsl.h = hslVal.h
      hsl.s = hslVal.s
      hsl.l = hslVal.l
    }
  } else if (value.length === 3) {
    const expanded = value.split('').map((c:string) => c + c).join('')
    hex.value = expanded
    const rgbVal = hexToRgb(expanded)
    if (rgbVal) {
      rgb.r = rgbVal.r
      rgb.g = rgbVal.g
      rgb.b = rgbVal.b
      const hslVal = rgbToHsl(rgb.r, rgb.g, rgb.b)
      hsl.h = hslVal.h
      hsl.s = hslVal.s
      hsl.l = hslVal.l
    }
  }
}

// RGB 输入
const onRgbInput = (channel: 'r' | 'g' | 'b', e: any) => {
  let value = parseInt(e.detail.value) || 0
  value = Math.max(0, Math.min(255, value))
  rgb[channel] = value
  updateFromRgb()
}

// 选择预设颜色
const selectColor = (color: string) => {
  const rgbVal = hexToRgb(color)
  if (rgbVal) {
    rgb.r = rgbVal.r
    rgb.g = rgbVal.g
    rgb.b = rgbVal.b
    updateFromRgb()
  }
}

// 复制颜色
const copyColor = (color: string) => {
  uni.setClipboardData({
    data: color,
    success: () => showToast(t('common.copySuccess'))
  })
}

// 添加到收藏
const addToFavorites = () => {
  const color = currentColor.value
  if (favorites.value.includes(color)) {
    showToast(t('colorTool.alreadyExists'))
    return
  }
  favorites.value.unshift(color)
  uni.setStorageSync('color_favorites', favorites.value)
  showToast(t('colorTool.addedToFavorites'))
}

// 移除收藏
const removeFavorite = (color: string) => {
  const index = favorites.value.indexOf(color)
  if (index > -1) {
    favorites.value.splice(index, 1)
    uni.setStorageSync('color_favorites', favorites.value)
    showToast(t('common.deleteSuccess'))
  }
}

// 进入全屏
const enterFullscreen = () => {
  isFullscreen.value = true
  showHint.value = true

  // 清除之前的定时器
  if (hintTimer) {
    clearTimeout(hintTimer)
  }

  // 1秒后隐藏提示
  hintTimer = setTimeout(() => {
    showHint.value = false
  }, 1000)
}

// 退出全屏
const exitFullscreen = () => {
  isFullscreen.value = false
  showHint.value = false

  // 清除定时器
  if (hintTimer) {
    clearTimeout(hintTimer)
    hintTimer = null
  }
}

onShow(() => {
  settingsStore.initTheme()
})

onHide(() => {
  // 页面隐藏时,如果处于全屏模式,退出并恢复导航栏
  if (isFullscreen.value) {
    exitFullscreen()
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.color-tool-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 全屏打光模式
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-hint {
  font-size: 32rpx;
  opacity: 0.8;
  animation: fadeOut 1s ease-in-out forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 0.8;
  }
  70% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

// 颜色预览区域
.preview-section {
  margin-bottom: $spacing-md;
}

.color-preview {
  height: 200rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.preview-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-hex {
  font-size: 36rpx;
  font-weight: bold;
  font-family: monospace;
}

.preview-hint {
  font-size: $font-size-xs;
  opacity: 0.6;
  margin-top: $spacing-xs;
}

.preview-actions {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-card);
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  color: var(--text-primary);

  &:active {
    background-color: var(--bg-hover);
  }
}

// Tab 切换
.tab-section {
  display: flex;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: 8rpx;
  margin-bottom: $spacing-md;
}

.tab-item {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  border-radius: $radius-sm;
  transition: all 0.2s;

  &.active {
    background-color: var(--primary);
    color: #FFFFFF;
  }
}

// 颜色选择器
.picker-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.slider-item {
  .slider-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-xs;
  }

  .slider-label {
    font-size: $font-size-sm;
    color: var(--text-secondary);
  }

  .slider-value {
    font-size: $font-size-sm;
    color: var(--primary);
    font-family: monospace;
  }
}

.hue-slider-track {
  background: linear-gradient(to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
  border-radius: 8rpx;
  height: 40rpx;
  position: relative;
}

// 颜色转换
.converter-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.input-group {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.input-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.input-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.input-prefix {
  font-size: $font-size-md;
  color: var(--text-secondary);
  font-family: monospace;
}

.color-input {
  flex: 1;
  height: 72rpx;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  padding: 0 $spacing-sm;
  font-size: $font-size-md;
  font-family: monospace;
  color: var(--text-primary);
}

.rgb-row {
  flex-wrap: wrap;
}

.rgb-input-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rgb-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  width: 32rpx;
}

.rgb-input {
  width: 100rpx;
  height: 72rpx;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  padding: 0 $spacing-xs;
  font-size: $font-size-md;
  font-family: monospace;
  text-align: center;
  color: var(--text-primary);
}

.hsl-display {
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  padding: $spacing-sm;
}

.hsl-value {
  flex: 1;
  font-size: $font-size-sm;
  font-family: monospace;
  color: var(--text-primary);
}

.copy-btn {
  padding: 12rpx 24rpx;
  background-color: var(--primary);
  color: #FFFFFF;
  border-radius: $radius-sm;
  font-size: $font-size-xs;

  &:active {
    opacity: 0.8;
  }
}

// 色卡
.palette-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.palette-group {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.palette-title {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-sm;
}

.color-item {
  aspect-ratio: 1;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: relative;

  &:active {
    transform: scale(0.95);
  }
}

.color-selected {
  color: #FFFFFF;
  font-size: $font-size-lg;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.palette-hint {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
  margin-top: $spacing-sm;
  text-align: center;
}
</style>
