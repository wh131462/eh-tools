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
        <!-- 缩放控制栏 -->
        <view class="zoom-controls">
          <view class="zoom-info">
            <text class="zoom-label">{{ Math.round(scale * 100) }}%</text>
          </view>
          <view class="zoom-actions">
            <view class="zoom-btn" @click="zoomOut">
              <text>−</text>
            </view>
            <view class="zoom-btn" @click="zoomIn">
              <text>+</text>
            </view>
            <view class="zoom-btn reset-btn" @click="resetZoom">
              <text>{{ t('colorPicker.reset') }}</text>
            </view>
          </view>
        </view>

        <!-- 图片容器（支持缩放和平移） -->
        <view
          class="canvas-wrapper"
          :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- #ifdef MP-WEIXIN -->
          <canvas
            type="2d"
            id="colorCanvas"
            class="color-canvas"
            :style="{
              width: canvasWidth + 'px',
              height: canvasHeight + 'px',
              transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
              transformOrigin: 'center center'
            }"
          />
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <canvas
            canvas-id="colorCanvas"
            id="colorCanvas"
            class="color-canvas"
            :style="{
              width: canvasWidth + 'px',
              height: canvasHeight + 'px',
              transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
              transformOrigin: 'center center'
            }"
          />
          <!-- #endif -->
          <!-- 取色指示器 -->
          <view
            v-if="showIndicator"
            class="color-indicator"
            :style="{
              left: indicatorX + 'px',
              top: indicatorY + 'px',
              borderColor: indicatorBorderColor
            }"
          >
            <view class="indicator-inner" :style="{ backgroundColor: currentColor }" />
            <view class="indicator-crosshair horizontal" />
            <view class="indicator-crosshair vertical" />
          </view>
        </view>

        <view class="image-actions">
          <view class="action-btn" @click="selectImage">
            <text>{{ t('colorPicker.reselect') }}</text>
          </view>
        </view>
        <view class="pick-tip">{{ t('colorPicker.zoomTip') }}</view>
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

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="colorPickerShareCanvas"
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

// 工具分享图配置
const toolShareConfig = {
  toolName: t('colorPicker.title'),
  icon: '🖼️',
  category: 'image' as const,
  subtitle: '从图片中提取颜色'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// === 状态 ===
const imageUrl = ref('')
const currentColor = ref('')
const currentRgb = ref('')
const colorHistory = ref<string[]>([])
const canvasWidth = ref(300)
const canvasHeight = ref(300)
const dpr = ref(1) // 设备像素比

// Canvas 2D 上下文和节点
let canvasNode: any = null
let canvasCtx: any = null
const isCanvasReady = ref(false) // 标记 canvas 是否准备就绪

// 缩放和平移状态
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const MIN_SCALE = 1
const MAX_SCALE = 5

// 触摸状态
const lastTouchDistance = ref(0)
const lastTouchCenter = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const isZooming = ref(false)
const touchStartTime = ref(0)

// 指示器状态（存储 canvas 上的实际坐标）
const showIndicator = ref(false)
const canvasPickX = ref(0) // canvas 上的取色点 X 坐标
const canvasPickY = ref(0) // canvas 上的取色点 Y 坐标

// 计算指示器在屏幕上的位置（跟随缩放和平移）
const indicatorX = computed(() => {
  const centerX = canvasWidth.value / 2
  // 从 canvas 坐标转换到屏幕坐标
  return (canvasPickX.value - centerX) * scale.value + centerX + translateX.value
})

const indicatorY = computed(() => {
  const centerY = canvasHeight.value / 2
  // 从 canvas 坐标转换到屏幕坐标
  return (canvasPickY.value - centerY) * scale.value + centerY + translateY.value
})

// 计算指示器边框颜色（根据背景色自动选择黑或白）
const indicatorBorderColor = computed(() => {
  if (!currentColor.value) return '#ffffff'
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(currentColor.value)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }
  return '#ffffff'
})

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

  // 重置状态
  resetZoom()
  isCanvasReady.value = false
  canvasCtx = null
  canvasNode = null

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
        initCanvas2D(url)
      }, 200)
    },
    fail: (err) => {
      console.error('获取图片信息失败:', err)
      showToast(t('common.failed'))
    }
  })
}

// 初始化 Canvas 2D 并绘制图片
const initCanvas2D = (url: string) => {
  // #ifdef MP-WEIXIN
  const query = uni.createSelectorQuery()
  query.select('#colorCanvas')
    .fields({ node: true, size: true }, () => {})
    .exec((res: any) => {
      if (!res || !res[0] || !res[0].node) {
        console.error('无法获取 canvas 节点，res:', res)
        showToast(t('common.failed'))
        return
      }

      canvasNode = res[0].node
      canvasCtx = canvasNode.getContext('2d')

      if (!canvasCtx) {
        console.error('无法获取 canvas 2d 上下文')
        showToast(t('common.failed'))
        return
      }

      // 设置 canvas 实际像素尺寸（考虑 DPR）
      canvasNode.width = canvasWidth.value * dpr.value
      canvasNode.height = canvasHeight.value * dpr.value

      // 创建图片对象并绘制
      const img = canvasNode.createImage()
      img.onload = () => {
        // 清除画布并绘制图片
        canvasCtx.clearRect(0, 0, canvasNode.width, canvasNode.height)
        // 直接使用实际像素尺寸绘制，不用 scale
        canvasCtx.drawImage(img, 0, 0, canvasNode.width, canvasNode.height)
        isCanvasReady.value = true
        console.log('Canvas 2D 图片绘制完成')
      }
      img.onerror = (err: any) => {
        console.error('图片加载失败:', err)
        showToast(t('common.failed'))
      }
      img.src = url
    })
  // #endif

  // #ifndef MP-WEIXIN
  // 非微信平台使用旧 API
  const ctx = uni.createCanvasContext('colorCanvas')
  ctx.drawImage(url, 0, 0, canvasWidth.value, canvasHeight.value)
  ctx.draw(false, () => {
    isCanvasReady.value = true
    console.log('Canvas 旧 API 图片绘制完成')
  })
  // #endif
}

// 在指定坐标取色
const pickColorAt = (x: number, y: number) => {
  // 检查 canvas 是否准备就绪
  if (!isCanvasReady.value) {
    console.warn('Canvas 尚未准备就绪')
    showToast(t('colorPicker.loading') || '加载中...')
    return
  }

  // 确保坐标在有效范围内
  x = Math.max(0, Math.min(x, canvasWidth.value - 1))
  y = Math.max(0, Math.min(y, canvasHeight.value - 1))

  // #ifdef MP-WEIXIN
  // 微信小程序使用 Canvas 2D API
  if (canvasCtx && canvasNode) {
    try {
      // 转换为实际像素坐标
      const pixelX = Math.floor(x * dpr.value)
      const pixelY = Math.floor(y * dpr.value)
      const imageData = canvasCtx.getImageData(pixelX, pixelY, 1, 1)
      const data = imageData.data

      if (data && data.length >= 3) {
        const r = data[0]
        const g = data[1]
        const b = data[2]

        const hex = rgbToHex(r, g, b)
        currentColor.value = hex
        currentRgb.value = `rgb(${r}, ${g}, ${b})`

        // 添加到历史记录
        addToHistory(hex)
      }
    } catch (err) {
      console.error('Canvas 2D 取色失败:', err)
      showToast(t('common.failed'))
    }
  } else {
    console.error('Canvas 上下文不可用')
    showToast(t('common.failed'))
  }
  // #endif

  // #ifndef MP-WEIXIN
  // 非微信平台使用旧 API
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
  // #endif
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

// === 缩放控制方法 ===

// 放大
const zoomIn = () => {
  scale.value = Math.min(MAX_SCALE, scale.value + 0.5)
}

// 缩小
const zoomOut = () => {
  const newScale = Math.max(MIN_SCALE, scale.value - 0.5)
  scale.value = newScale
  // 如果缩小到最小，重置位移
  if (newScale === MIN_SCALE) {
    translateX.value = 0
    translateY.value = 0
  }
}

// 重置缩放
const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  showIndicator.value = false
}

// === 触摸处理方法 ===

// 计算两点之间的距离
const getDistance = (touches: any[]) => {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// 计算两点的中心
const getCenter = (touches: any[]) => {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  }
}

// 触摸开始
const handleTouchStart = (e: any) => {
  touchStartTime.value = Date.now()
  const touches = e.touches || []

  if (touches.length === 2) {
    // 双指缩放开始
    isZooming.value = true
    isDragging.value = false
    lastTouchDistance.value = getDistance(touches)
    lastTouchCenter.value = getCenter(touches)
  } else if (touches.length === 1) {
    // 单指拖动或取色
    isDragging.value = true
    isZooming.value = false
    lastTouchCenter.value = {
      x: touches[0].clientX,
      y: touches[0].clientY
    }
  }
}

// 触摸移动
const handleTouchMove = (e: any) => {
  const touches = e.touches || []

  if (touches.length === 2 && isZooming.value) {
    // 双指缩放
    const newDistance = getDistance(touches)
    const delta = newDistance - lastTouchDistance.value

    // 根据距离变化调整缩放
    const scaleChange = delta * 0.01
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + scaleChange))
    scale.value = newScale

    lastTouchDistance.value = newDistance
  } else if (touches.length === 1 && isDragging.value && scale.value > 1) {
    // 单指拖动（仅在放大时）
    const touch = touches[0]
    const deltaX = touch.clientX - lastTouchCenter.value.x
    const deltaY = touch.clientY - lastTouchCenter.value.y

    // 限制位移范围
    const maxTranslate = (scale.value - 1) * Math.max(canvasWidth.value, canvasHeight.value) / 2
    translateX.value = Math.min(maxTranslate, Math.max(-maxTranslate, translateX.value + deltaX))
    translateY.value = Math.min(maxTranslate, Math.max(-maxTranslate, translateY.value + deltaY))

    lastTouchCenter.value = {
      x: touch.clientX,
      y: touch.clientY
    }
  }
}

// 触摸结束
const handleTouchEnd = (e: any) => {
  const touchDuration = Date.now() - touchStartTime.value
  const changedTouches = e.changedTouches || []
  const touches = e.touches || []

  // 如果是短按且不是缩放操作，执行取色
  if (touchDuration < 200 && !isZooming.value && changedTouches.length === 1) {
    const touch = changedTouches[0]
    pickColorWithTransform(touch.clientX, touch.clientY)
  }

  // 重置状态
  if (touches.length === 0) {
    isDragging.value = false
    isZooming.value = false
  } else if (touches.length === 1) {
    // 从双指变为单指
    isZooming.value = false
    isDragging.value = true
    lastTouchCenter.value = {
      x: touches[0].clientX,
      y: touches[0].clientY
    }
  }
}

// 带变换的取色（考虑缩放和平移）
const pickColorWithTransform = (clientX: number, clientY: number) => {
  // 检查是否有图片加载
  if (!imageUrl.value) {
    return
  }

  const query = uni.createSelectorQuery()
  query.select('.canvas-wrapper').boundingClientRect()
  query.exec((res: any[]) => {
    const rect = res[0]
    if (rect) {
      // 计算相对于 wrapper 的位置
      const wrapperX = clientX - rect.left
      const wrapperY = clientY - rect.top

      // 反向计算 canvas 上的实际坐标（考虑缩放和平移）
      const centerX = canvasWidth.value / 2
      const centerY = canvasHeight.value / 2

      // 从屏幕坐标转换到 canvas 坐标
      const canvasX = (wrapperX - centerX - translateX.value) / scale.value + centerX
      const canvasY = (wrapperY - centerY - translateY.value) / scale.value + centerY

      // 检查坐标是否在有效范围内
      if (canvasX < 0 || canvasX >= canvasWidth.value || canvasY < 0 || canvasY >= canvasHeight.value) {
        return
      }

      // 更新指示器位置（存储 canvas 坐标，指示器会自动跟随变换）
      canvasPickX.value = canvasX
      canvasPickY.value = canvasY
      showIndicator.value = true

      // 取色
      pickColorAt(canvasX, canvasY)
    }
  })
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
  loadHistory()
})

// 分享给好友
onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('colorPicker.title')}`,
    path: '/pages/image/color-picker/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('colorPicker.title')}`
  }
})
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

.zoom-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
}

.zoom-info {
  .zoom-label {
    font-size: $font-size-md;
    font-weight: 600;
    color: var(--text-primary);
    font-family: monospace;
  }
}

.zoom-actions {
  display: flex;
  gap: $spacing-sm;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64rpx;
  height: 56rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-card);
  border-radius: $radius-sm;
  box-shadow: var(--shadow-neumorphic-sm);
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);

  &:active {
    opacity: 0.8;
    transform: scale(0.95);
  }

  &.reset-btn {
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-primary);
  }
}

.canvas-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: $radius-md;
  background-color: var(--bg-sunken);
  touch-action: none;
}

.color-canvas {
  border-radius: $radius-md;
  background-color: var(--bg-sunken);
  transition: transform 0.1s ease-out;
}

.color-indicator {
  position: absolute;
  width: 48rpx;
  height: 48rpx;
  border: 3rpx solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 0 0 2rpx rgba(0, 0, 0, 0.3), 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  z-index: 10;

  .indicator-inner {
    position: absolute;
    top: 4rpx;
    left: 4rpx;
    right: 4rpx;
    bottom: 4rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
  }

  .indicator-crosshair {
    position: absolute;
    background-color: inherit;

    &.horizontal {
      top: 50%;
      left: -12rpx;
      right: -12rpx;
      height: 2rpx;
      transform: translateY(-50%);
      background: linear-gradient(90deg, transparent 0%, currentColor 30%, currentColor 70%, transparent 100%);
    }

    &.vertical {
      left: 50%;
      top: -12rpx;
      bottom: -12rpx;
      width: 2rpx;
      transform: translateX(-50%);
      background: linear-gradient(180deg, transparent 0%, currentColor 30%, currentColor 70%, transparent 100%);
    }
  }
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
