<template>
  <view class="page qrcode-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('qrcode.title')" />

    <!-- 模式切换 -->
    <view class="mode-tabs">
      <view
        class="tab-item"
        :class="{ active: mode === 'generate' }"
        @click="mode = 'generate'"
      >
        {{ t('qrcode.generate') }}
      </view>
      <view
        class="tab-item"
        :class="{ active: mode === 'scan' }"
        @click="mode = 'scan'"
      >
        {{ t('qrcode.scan') }}
      </view>
    </view>

    <!-- 生成模式 -->
    <view v-if="mode === 'generate'" class="content-section">
      <!-- 输入区域 -->
      <view class="input-section">
        <textarea
          class="text-input"
          :placeholder="t('qrcode.inputPlaceholder')"
          v-model="inputText"
          :maxlength="500"
        />
        <view class="char-count">{{ inputText.length }}/500</view>
      </view>

      <!-- 生成按钮 -->
      <button class="primary-btn" @click="generateQRCode">
        {{ t('qrcode.generateBtn') }}
      </button>

      <!-- 二维码显示 -->
      <view v-if="showQRCode" class="qrcode-wrapper">
        <view class="qrcode-container">
          <canvas
            canvas-id="qrcode-canvas"
            id="qrcode-canvas"
            class="qrcode-canvas"
          />
        </view>

        <view class="action-buttons">
          <button class="action-btn primary" @click="saveToAlbum">
            <image class="btn-icon" src="/static/icons/save-white.svg" mode="aspectFit" />
            {{ t('qrcode.saveToAlbum') }}
          </button>
          <button class="action-btn secondary" @click="verifyQRCode">
            <image class="btn-icon" src="/static/icons/check-gray.svg" mode="aspectFit" />
            {{ t('qrcode.verify') }}
          </button>
        </view>
      </view>

      <!-- 结果显示 -->
      <view v-if="resultText" class="result-section">
        <view class="result-header">
          <text class="result-label">{{ t('qrcode.scanResult') }}</text>
        </view>
        <view class="result-content">{{ resultText }}</view>
        <button class="copy-btn" @click="copyResult">
          {{ t('common.copy') }}
        </button>
      </view>
    </view>

    <!-- 扫描模式 -->
    <view v-if="mode === 'scan'" class="content-section">
      <!-- 扫描按钮区域 -->
      <view class="scan-buttons">
        <view class="scan-btn" @click="scanFromCamera">
          <view class="scan-icon-wrapper">
            <image class="scan-icon" src="/static/icons/camera-white.svg" mode="aspectFit" />
          </view>
          <text class="scan-text">{{ t('qrcode.scanCamera') }}</text>
          <text class="scan-desc">使用摄像头扫描</text>
        </view>
        <view class="scan-btn" @click="scanFromAlbum">
          <view class="scan-icon-wrapper">
            <image class="scan-icon" src="/static/icons/image-white.svg" mode="aspectFit" />
          </view>
          <text class="scan-text">{{ t('qrcode.scanAlbum') }}</text>
          <text class="scan-desc">支持多码识别</text>
        </view>
      </view>

      <!-- 扫描中提示 -->
      <view v-if="isScanning" class="scanning-tip">
        <text>正在识别二维码...</text>
      </view>

      <!-- 多个扫描结果 -->
      <view v-if="scanResults.length > 0" class="results-container">
        <view class="results-header">
          <view class="results-title-wrap">
            <image class="results-icon" src="/static/icons/check.svg" mode="aspectFit" />
            <text class="results-title">{{ t('qrcode.scanResult') }}</text>
          </view>
          <view class="results-badge">{{ scanResults.length }}</view>
        </view>

        <view class="results-list">
          <view
            v-for="(result, index) in scanResults"
            :key="index"
            class="result-card"
          >
            <view class="result-card-header">
              <view class="result-index">
                <text class="index-text">{{ index + 1 }}</text>
              </view>
              <view class="result-type">二维码</view>
            </view>
            <view class="result-card-body">
              <text class="result-text" selectable>{{ result }}</text>
            </view>
            <view class="result-card-footer">
              <button class="result-action copy" @click="copyOneResult(result)">
                <image class="action-icon" src="/static/icons/copy.svg" mode="aspectFit" />
                <text>复制内容</text>
              </button>
              <button class="result-action generate" @click="generateFromResult(result)">
                <image class="action-icon" src="/static/icons/qrcode.svg" mode="aspectFit" />
                <text>生成二维码</text>
              </button>
            </view>
          </view>
        </view>

        <!-- 复制全部按钮 -->
        <button v-if="scanResults.length > 1" class="copy-all-btn" @click="copyAllResults">
          <image class="btn-icon" src="/static/icons/copy.svg" mode="aspectFit" />
          复制全部结果
        </button>
      </view>

      <!-- 隐藏的 canvas 用于图片处理 -->
      <canvas
        canvas-id="image-canvas"
        id="image-canvas"
        class="hidden-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import qrcode from 'qrcode-generator'
import jsQR from 'jsqr'
import { useSettingsStore } from '@/store'
import { copyToClipboard, showToast, checkSaveImagePermission } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 状态
const mode = ref<'generate' | 'scan'>('generate')
const inputText = ref('')
const showQRCode = ref(false)
const resultText = ref('')

// 扫描相关状态
const scanResults = ref<string[]>([])
const isScanning = ref(false)
const canvasWidth = ref(300)
const canvasHeight = ref(300)

// 生成二维码
const generateQRCode = async () => {
  if (!inputText.value.trim()) {
    showToast(t('qrcode.textEmpty'))
    return
  }

  showQRCode.value = true
  resultText.value = ''

  await nextTick()

  try {
    drawQRCode('qrcode-canvas', inputText.value)
  } catch (e) {
    showToast(t('qrcode.generateFailed'))
    showQRCode.value = false
  }
}

// 将字符串转换为 UTF-8 字节字符串
const toUTF8ByteString = (str: string): string => {
  return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  })
}

// 绘制二维码到 Canvas
const drawQRCode = (canvasId: string, text: string) => {
  const qr = qrcode(0, 'M')
  // 使用 Byte 模式 + UTF-8 编码支持中文
  qr.addData(toUTF8ByteString(text), 'Byte')
  qr.make()

  const moduleCount = qr.getModuleCount()
  const size = 210
  const cellSize = size / moduleCount

  const ctx = uni.createCanvasContext(canvasId)

  // 白色背景
  ctx.setFillStyle('#FFFFFF')
  ctx.fillRect(0, 0, size, size)

  // 绘制二维码模块
  ctx.setFillStyle('#000000')
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize,
          cellSize
        )
      }
    }
  }

  ctx.draw()
}

// 保存到相册
const saveToAlbum = async () => {
  const hasPermission = await checkSaveImagePermission()
  if (!hasPermission) return

  try {
    const res = await new Promise<UniApp.CanvasToTempFilePathRes>((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvasId: 'qrcode-canvas',
        success: resolve,
        fail: reject
      })
    })

    await new Promise<void>((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => resolve(),
        fail: reject
      })
    })

    showToast(t('qrcode.saveSuccess'), 'success')
  } catch (e) {
    showToast(t('qrcode.saveFailed'))
  }
}

// 验证二维码
const verifyQRCode = () => {
  resultText.value = inputText.value
  showToast(t('qrcode.verifySuccess'), 'success')
}

// 复制结果
const copyResult = () => {
  copyToClipboard(resultText.value)
}

// 摄像头扫描
const scanFromCamera = () => {
  uni.scanCode({
    scanType: ['qrCode'],
    success: (res) => {
      scanResults.value = [res.result]
    },
    fail: () => {
      showToast(t('qrcode.scanFailed'))
    }
  })
}

// 相册扫描 - 使用 jsQR 支持多码识别，失败时回退系统 API（支持小程序码）
const scanFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      await processImageWithJsQR(tempFilePath)
    },
    fail: () => {
      // 用户取消选择不提示
    }
  })
}

// 尝试使用系统 API 扫描（支持小程序码）
const trySystemScan = () => {
  uni.showModal({
    title: '未识别到二维码',
    content: '是否使用系统扫码？（支持小程序码）',
    confirmText: '使用系统',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 使用系统 API，支持小程序码
        uni.scanCode({
          onlyFromCamera: false,
          scanType: ['qrCode', 'barCode'],
          success: (result) => {
            scanResults.value = [result.result]
            showToast('识别成功', 'success')
          },
          fail: () => {
            showToast(t('qrcode.scanFailed'))
          }
        })
      }
    }
  })
}

// 使用 jsQR 处理图片识别多个二维码
const processImageWithJsQR = async (imagePath: string) => {
  isScanning.value = true
  scanResults.value = []

  try {
    // 获取图片信息
    const imageInfo = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
      uni.getImageInfo({
        src: imagePath,
        success: resolve,
        fail: reject
      })
    })

    // 设置 canvas 尺寸（限制最大尺寸以提高性能）
    const maxSize = 1000
    let width = imageInfo.width
    let height = imageInfo.height

    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height)
      width = Math.floor(width * ratio)
      height = Math.floor(height * ratio)
    }

    canvasWidth.value = width
    canvasHeight.value = height

    await nextTick()

    // 绘制图片到 canvas
    const ctx = uni.createCanvasContext('image-canvas')
    ctx.drawImage(imagePath, 0, 0, width, height)

    await new Promise<void>((resolve) => {
      ctx.draw(false, () => {
        setTimeout(resolve, 100) // 等待绘制完成
      })
    })

    // 获取像素数据
    const pixelData = await new Promise<UniApp.CanvasGetImageDataRes>((resolve, reject) => {
      uni.canvasGetImageData({
        canvasId: 'image-canvas',
        x: 0,
        y: 0,
        width: width,
        height: height,
        success: resolve,
        fail: reject
      })
    })

    // 使用 jsQR 识别多个二维码
    const results = await scanMultipleQRCodes(
      new Uint8ClampedArray(pixelData.data),
      width,
      height
    )

    if (results.length > 0) {
      scanResults.value = results
      showToast(`识别到 ${results.length} 个二维码`, 'success')
    } else {
      // jsQR 识别失败，尝试使用系统 API（支持小程序码）
      trySystemScan()
    }
  } catch (e) {
    console.error('QR scan error:', e)
    showToast(t('qrcode.scanFailed'))
  } finally {
    isScanning.value = false
  }
}

// 扫描多个二维码
const scanMultipleQRCodes = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): Promise<string[]> => {
  const results: string[] = []
  const data = new Uint8ClampedArray(imageData) // 复制数据以便修改
  const maxIterations = 10 // 最多识别 10 个二维码

  for (let i = 0; i < maxIterations; i++) {
    const code = jsQR(data, width, height, {
      inversionAttempts: 'attemptBoth'
    })

    if (!code) break

    // 避免重复
    if (!results.includes(code.data)) {
      results.push(code.data)
    }

    // 将已识别的二维码区域涂白，以便识别下一个
    const { topLeftCorner, bottomRightCorner } = code.location
    const padding = 10 // 增加一些边距

    const startX = Math.max(0, Math.floor(topLeftCorner.x) - padding)
    const startY = Math.max(0, Math.floor(topLeftCorner.y) - padding)
    const endX = Math.min(width, Math.ceil(bottomRightCorner.x) + padding)
    const endY = Math.min(height, Math.ceil(bottomRightCorner.y) + padding)

    // 涂白该区域
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4
        data[idx] = 255     // R
        data[idx + 1] = 255 // G
        data[idx + 2] = 255 // B
        // data[idx + 3] 保持 Alpha 不变
      }
    }
  }

  return results
}

// 复制单个结果
const copyOneResult = (result: string) => {
  copyToClipboard(result)
}

// 复制全部结果
const copyAllResults = () => {
  copyToClipboard(scanResults.value.join('\n'))
  showToast('已复制全部结果', 'success')
}

// 从扫描结果生成二维码
const generateFromResult = (result: string) => {
  mode.value = 'generate'
  inputText.value = result
  nextTick(() => {
    generateQRCode()
  })
}

// 监听模式切换，重新绘制二维码
watch(mode, async (newMode) => {
  if (newMode === 'generate' && showQRCode.value && inputText.value) {
    await nextTick()
    // 延迟确保 canvas 已渲染
    setTimeout(() => {
      drawQRCode('qrcode-canvas', inputText.value)
    }, 50)
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('qrcode.title') })
  settingsStore.initTheme()

  // 页面显示时，如果有已生成的二维码，重新绘制
  if (mode.value === 'generate' && showQRCode.value && inputText.value) {
    nextTick(() => {
      setTimeout(() => {
        drawQRCode('qrcode-canvas', inputText.value)
      }, 50)
    })
  }
})
</script>

<style lang="scss" scoped>
.qrcode-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: $spacing-xl;
  box-sizing: border-box;
}

// 模式切换标签
.mode-tabs {
  display: flex;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-xs;
  margin-bottom: $spacing-md;
}

.tab-item {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
  color: var(--text-secondary);
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &.active {
    background-color: var(--primary);
    color: #FFFFFF;
  }
}

// 内容区域
.content-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

// 输入区域
.input-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.text-input {
  width: 100%;
  height: 200rpx;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: transparent;
  box-sizing: border-box;
}

.char-count {
  text-align: right;
  font-size: $font-size-sm;
  color: var(--text-placeholder);
  margin-top: $spacing-xs;
}

// 主按钮
.primary-btn {
  height: 88rpx;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: $font-size-md;
  border-radius: $radius-sm;
  border: none;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}

// 二维码展示区域
.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-lg;
}

.qrcode-container {
  width: 440rpx;
  height: 440rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: $radius-md;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  padding: $spacing-sm;
  box-sizing: border-box;

  .theme-dark & {
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);
  }
}

.qrcode-canvas {
  width: 420rpx;
  height: 420rpx;
  background-color: #FFFFFF;
}

// 操作按钮组
.action-buttons {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;
  width: 100%;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  border-radius: $radius-sm;
  border: none;

  &::after {
    border: none;
  }

  &.primary {
    background-color: var(--primary);
    color: #FFFFFF;
  }

  &.secondary {
    background-color: var(--bg-page);
    color: var(--text-primary);
    border: 1rpx solid var(--border-light);
  }

  .btn-icon {
    width: 32rpx;
    height: 32rpx;
  }
}

// 结果展示区域
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .theme-dark & {
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.2);
  }
}

.result-header {
  margin-bottom: $spacing-sm;
}

.result-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  font-weight: 500;
}

.result-content {
  font-size: $font-size-md;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.6;
  padding: $spacing-sm;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  margin-bottom: $spacing-md;
}

.copy-btn {
  width: 100%;
  height: 72rpx;
  background-color: var(--bg-page);
  color: var(--primary);
  font-size: $font-size-sm;
  font-weight: 500;
  border-radius: $radius-sm;
  border: 1rpx solid var(--primary);

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}

// 扫描按钮区域
.scan-buttons {
  display: flex;
  gap: $spacing-md;
}

.scan-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all $transition-fast;

  .theme-dark & {
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
    background-color: var(--bg-hover);
  }
}

.scan-icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--primary-light, #6366f1));
  border-radius: 50%;
  margin-bottom: $spacing-md;
}

.scan-icon {
  width: 48rpx;
  height: 48rpx;
}

.scan-text {
  font-size: $font-size-md;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: $spacing-xs;
}

.scan-desc {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
}

// 扫描中提示
.scanning-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-lg;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  color: var(--text-secondary);
  font-size: $font-size-sm;
}

// 多结果容器
.results-container {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

  .theme-dark & {
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
}

.results-title-wrap {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.results-icon {
  width: 40rpx;
  height: 40rpx;
}

.results-title {
  font-size: $font-size-lg;
  color: var(--text-primary);
  font-weight: 600;
}

.results-badge {
  min-width: 48rpx;
  height: 48rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--primary-light, #6366f1));
  color: #FFFFFF;
  font-size: $font-size-md;
  font-weight: 600;
  border-radius: 24rpx;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

// 结果卡片
.result-card {
  background-color: var(--bg-page);
  border-radius: $radius-md;
  overflow: hidden;
  border: 1rpx solid var(--border-light);

  .theme-dark & {
    border-color: transparent;
  }
}

.result-card-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-md 0;
}

.result-index {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--primary-light, #6366f1));
  border-radius: $radius-sm;

  .index-text {
    color: #FFFFFF;
    font-size: $font-size-sm;
    font-weight: 600;
  }
}

.result-type {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
  background-color: var(--bg-card);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.result-card-body {
  padding: $spacing-md;
}

.result-text {
  font-size: $font-size-md;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.7;
  display: block;
}

.result-card-footer {
  display: flex;
  border-top: 1rpx solid var(--border-light);

  .theme-dark & {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.result-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  height: 88rpx;
  font-size: $font-size-sm;
  background-color: transparent;
  border: none;
  border-radius: 0;
  position: relative;

  &::after {
    border: none;
  }

  &:active {
    background-color: var(--bg-hover);
  }

  .action-icon {
    width: 32rpx;
    height: 32rpx;
  }

  &.copy {
    color: var(--text-secondary);
    border-right: 1rpx solid var(--border-light);

    .theme-dark & {
      border-color: rgba(255, 255, 255, 0.1);
    }
  }

  &.generate {
    color: var(--primary);
    font-weight: 500;
  }
}

.copy-all-btn {
  width: 100%;
  height: 88rpx;
  margin-top: $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  background: linear-gradient(135deg, var(--primary), var(--primary-light, #6366f1));
  color: #FFFFFF;
  font-size: $font-size-md;
  font-weight: 500;
  border-radius: $radius-md;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.3);

  .btn-icon {
    width: 36rpx;
    height: 36rpx;
    filter: brightness(0) invert(1);
  }

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.9;
    transform: scale(0.99);
  }
}

// 隐藏的 canvas
.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
