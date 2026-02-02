<template>
  <view class="page color-picker-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('colorPicker.title')" />

    <!-- 图片选择区域 -->
    <view class="main-card">
      <view v-if="!imageUrl" class="image-placeholder" @click="selectImage">
        <image src="/static/icons/image.svg" class="placeholder-icon" mode="aspectFit" />
        <text class="placeholder-text">{{ t('colorPicker.selectImageTip') }}</text>
      </view>

      <view v-else class="image-container">
        <canvas
          canvas-id="colorCanvas"
          id="colorCanvas"
          class="color-canvas"
          :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
          @touchstart="handleCanvasClick"
        />
        <view class="image-actions">
          <view class="action-btn" @click="selectImage">
            <text>{{ t('colorPicker.reselect') }}</text>
          </view>
        </view>
        <view class="pick-tip">{{ t('colorPicker.tapToPick') }}</view>
      </view>
    </view>

    <!-- 已选颜色 -->
    <view v-if="currentColor" class="result-card">
      <view class="section-title">{{ t('colorPicker.pickedColor') }}</view>
      <view class="color-display">
        <view class="color-preview" :style="{ backgroundColor: currentColor }" />
        <view class="color-values">
          <view class="color-row" @click="copyColor(currentColor)">
            <text class="color-label">HEX</text>
            <text class="color-value">{{ currentColor }}</text>
            <image src="/static/icons/copy.svg" class="copy-icon" mode="aspectFit" />
          </view>
          <view class="color-row" @click="copyColor(currentRgb)">
            <text class="color-label">RGB</text>
            <text class="color-value">{{ currentRgb }}</text>
            <image src="/static/icons/copy.svg" class="copy-icon" mode="aspectFit" />
          </view>
        </view>
      </view>
    </view>

    <!-- 取色历史 -->
    <view class="history-card">
      <view class="section-header">
        <text class="section-title">{{ t('colorPicker.colorHistory') }}</text>
        <text v-if="colorHistory.length > 0" class="clear-btn" @click="clearHistory">{{ t('colorPicker.clearHistory') }}</text>
      </view>
      <view v-if="colorHistory.length > 0" class="color-history">
        <view
          v-for="(color, index) in colorHistory"
          :key="index"
          class="history-item"
          :style="{ backgroundColor: color }"
          @click="selectHistoryColor(color)"
        />
      </view>
      <view v-else class="empty-history">
        <text class="empty-text">{{ t('colorPicker.noHistory') }}</text>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { getDefaultShareConfig, showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 状态 ===
const imageUrl = ref('')
const currentColor = ref('')
const currentRgb = ref('')
const colorHistory = ref<string[]>([])
const canvasWidth = ref(300)
const canvasHeight = ref(300)
const dpr = ref(1) // 设备像素比

// 存储 key
const HISTORY_KEY = 'color_picker_history'

// === 方法 ===

// 选择图片
const selectImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      imageUrl.value = res.tempFilePaths[0]
      drawImageToCanvas(res.tempFilePaths[0])
    }
  })
}

// 绘制图片到 canvas
const drawImageToCanvas = (url: string) => {
  const sysInfo = uni.getSystemInfoSync()
  dpr.value = sysInfo.pixelRatio || 1

  uni.getImageInfo({
    src: url,
    success: (info) => {
      // 计算合适的 canvas 显示尺寸
      const maxWidth = sysInfo.windowWidth - 64
      const ratio = info.width / info.height

      if (ratio > 1) {
        canvasWidth.value = Math.min(maxWidth, info.width)
        canvasHeight.value = canvasWidth.value / ratio
      } else {
        canvasHeight.value = Math.min(maxWidth, info.height)
        canvasWidth.value = canvasHeight.value * ratio
      }

      // 延迟绘制，等待 canvas 尺寸更新
      setTimeout(() => {
        const ctx = uni.createCanvasContext('colorCanvas')
        // 按照 CSS 尺寸绘制（canvas 内部会自动处理）
        ctx.drawImage(url, 0, 0, canvasWidth.value, canvasHeight.value)
        ctx.draw()
      }, 100)
    }
  })
}

// 点击 canvas 取色
const handleCanvasClick = (e: any) => {
  // 获取点击坐标（相对于 canvas 元素）
  let x: number, y: number

  // 优先使用 touches (触摸事件) 或 detail (点击事件)
  if (e.touches && e.touches.length > 0) {
    // 触摸事件需要计算相对位置
    const touch = e.touches[0]
    const query = uni.createSelectorQuery()
    query.select('#colorCanvas').boundingClientRect((rect: any) => {
      if (rect) {
        x = touch.clientX - rect.left
        y = touch.clientY - rect.top
        pickColorAt(x, y)
      }
    }).exec()
  } else if (e.detail && typeof e.detail.x === 'number') {
    // 点击事件
    x = e.detail.x
    y = e.detail.y
    pickColorAt(x, y)
  }
}

// 在指定坐标取色
const pickColorAt = (x: number, y: number) => {
  // 确保坐标在有效范围内
  x = Math.max(0, Math.min(x, canvasWidth.value - 1))
  y = Math.max(0, Math.min(y, canvasHeight.value - 1))

  uni.canvasGetImageData({
    canvasId: 'colorCanvas',
    x: Math.floor(x),
    y: Math.floor(y),
    width: 1,
    height: 1,
    success: (res) => {
      if (res.data && res.data.length >= 3) {
        const r = res.data[0]
        const g = res.data[1]
        const b = res.data[2]

        const hex = rgbToHex(r, g, b)
        currentColor.value = hex
        currentRgb.value = `rgb(${r}, ${g}, ${b})`

        // 添加到历史记录
        addToHistory(hex)
      }
    },
    fail: (err) => {
      console.error('取色失败:', err)
      showToast(t('common.failed'))
    }
  })
}

// RGB 转 HEX
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 添加到历史记录
const addToHistory = (color: string) => {
  // 避免重复
  const index = colorHistory.value.indexOf(color)
  if (index !== -1) {
    colorHistory.value.splice(index, 1)
  }
  // 添加到开头
  colorHistory.value.unshift(color)
  // 最多保存 20 个
  if (colorHistory.value.length > 20) {
    colorHistory.value.pop()
  }
  // 保存到本地
  saveHistory()
}

// 保存历史记录
const saveHistory = () => {
  uni.setStorageSync(HISTORY_KEY, colorHistory.value)
}

// 加载历史记录
const loadHistory = () => {
  const saved = uni.getStorageSync(HISTORY_KEY)
  if (saved && Array.isArray(saved)) {
    colorHistory.value = saved
  }
}

// 清空历史记录
const clearHistory = () => {
  uni.showModal({
    title: t('common.confirm'),
    content: t('colorPicker.clearHistoryConfirm'),
    success: (res) => {
      if (res.confirm) {
        colorHistory.value = []
        uni.removeStorageSync(HISTORY_KEY)
      }
    }
  })
}

// 选择历史颜色
const selectHistoryColor = (color: string) => {
  currentColor.value = color
  // 解析 RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    currentRgb.value = `rgb(${r}, ${g}, ${b})`
  }
}

// 复制颜色值
const copyColor = (value: string) => {
  uni.setClipboardData({
    data: value,
    success: () => {
      showToast(t('colorPicker.copySuccess'))
    }
  })
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
  loadHistory()
})

onShareAppMessage(() => getDefaultShareConfig())
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('colorPicker.title')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.color-picker-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  border: 2rpx dashed var(--border-color);
  border-radius: $radius-md;
  cursor: pointer;

  .placeholder-icon {
    width: 96rpx;
    height: 96rpx;
    opacity: 0.5;
    margin-bottom: $spacing-md;
  }

  .placeholder-text {
    font-size: $font-size-md;
    color: var(--text-secondary);
  }
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-canvas {
  border-radius: $radius-md;
  background-color: var(--bg-sunken);
}

.image-actions {
  display: flex;
  justify-content: center;
  margin-top: $spacing-md;
}

.action-btn {
  padding: $spacing-sm $spacing-lg;
  background: var(--gradient-primary);
  border-radius: $radius-round;
  color: #fff;
  font-size: $font-size-sm;
}

.pick-tip {
  margin-top: $spacing-sm;
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.result-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.color-display {
  display: flex;
  gap: $spacing-md;
}

.color-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  flex-shrink: 0;
}

.color-values {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $spacing-sm;
}

.color-row {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-sm;
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }
}

.color-label {
  width: 80rpx;
  font-size: $font-size-sm;
  font-weight: 600;
  color: var(--text-secondary);
}

.color-value {
  flex: 1;
  font-size: $font-size-md;
  font-family: monospace;
  color: var(--text-primary);
}

.copy-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}

.history-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.clear-btn {
  font-size: $font-size-sm;
  color: var(--color-primary);
}

.color-history {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.history-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-sm;
  box-shadow: var(--shadow-neumorphic-sm);
  cursor: pointer;
  transition: all $transition-normal;

  &:active {
    transform: scale(0.95);
  }
}

.empty-history {
  padding: $spacing-lg;
  text-align: center;
}

.empty-text {
  font-size: $font-size-md;
  color: var(--text-placeholder);
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}
</style>
