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

      <!-- 二维码显示 - 始终显示 -->
      <view class="qrcode-wrapper">
        <view class="qrcode-container">
          <canvas
            canvas-id="qrcode-canvas"
            id="qrcode-canvas"
            class="qrcode-canvas"
          />
          <!-- 生成按钮 - 覆盖在容器中央 -->
          <view v-if="!isGenerated" class="generate-overlay">
            <button class="generate-btn" @click="generateQRCode">
              {{ t('qrcode.generateBtn') }}
            </button>
          </view>
          <!-- 刷新按钮 - 内容变化后显示 -->
          <view v-if="isGenerated && needRefresh" class="refresh-overlay" @click="generateQRCode">
            <image class="refresh-icon" src="/static/icons/refresh.svg" mode="aspectFit" />
          </view>
        </view>

        <!-- 操作按钮 - 生成后显示 -->
        <view v-if="isGenerated" class="action-buttons">
          <button class="action-btn primary" @click="saveToAlbum">
            <image class="btn-icon" src="/static/icons/save-white.svg" mode="aspectFit" />
            {{ t('qrcode.saveToAlbum') }}
          </button>
          <button class="action-btn secondary bordered" @click="verifyQRCode">
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
            <image class="scan-icon" src="/static/icons/camera.svg" mode="aspectFit" />
          </view>
          <text class="scan-text">{{ t('qrcode.scanCamera') }}</text>
          <text class="scan-desc">使用摄像头扫描</text>
        </view>
        <view class="scan-btn" @click="scanFromAlbum">
          <view class="scan-icon-wrapper">
            <image class="scan-icon" src="/static/icons/image.svg" mode="aspectFit" />
          </view>
          <text class="scan-text">{{ t('qrcode.scanAlbum') }}</text>
          <text class="scan-desc">从相册选择图片</text>
        </view>
      </view>

      <!-- 扫描中提示 -->
      <view v-if="isScanning" class="scanning-tip">
        <text>正在识别二维码...</text>
      </view>

      <!-- 扫描结果 -->
      <view v-if="scanResult" class="result-section">
        <view class="result-header">
          <text class="result-label">{{ t('qrcode.scanResult') }}</text>
        </view>
        <view class="result-content">{{ scanResult }}</view>
        <view class="result-actions">
          <button class="result-btn copy" @click="copyScanResult">
            <image class="btn-icon" src="/static/icons/copy.svg" mode="aspectFit" />
            {{ t('common.copy') }}
          </button>
          <button class="result-btn generate" @click="generateFromResult(scanResult)">
            <image class="btn-icon" src="/static/icons/qrcode.svg" mode="aspectFit" />
            生成二维码
          </button>
        </view>
      </view>

      <!-- 隐藏的 canvas 用于图片处理 -->
      <canvas
        canvas-id="image-canvas"
        id="image-canvas"
        class="hidden-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      />
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="qrcodeShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import qrcode from 'qrcode-generator'
import jsQR from 'jsqr'
import { useSettingsStore } from '@/store'
import { copyToClipboard, showToast, checkSaveImagePermission } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('qrcode.title'),
  icon: '📱',
  category: 'text' as const,
  subtitle: '生成与扫描二维码'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 状态
const mode = ref<'generate' | 'scan'>('generate')
const inputText = ref('')
const isGenerated = ref(false) // 是否已生成二维码
const needRefresh = ref(false) // 内容变化后需要刷新
const generatedText = ref('') // 当前生成的二维码对应的文本
const resultText = ref('')

// 扫描相关状态
const scanResult = ref('')
const isScanning = ref(false)
const canvasWidth = ref(300)
const canvasHeight = ref(300)

// 生成二维码
const generateQRCode = async () => {
  if (!inputText.value.trim()) {
    showToast(t('qrcode.textEmpty'))
    return
  }

  resultText.value = ''

  await nextTick()

  try {
    drawQRCode('qrcode-canvas', inputText.value)
    generatedText.value = inputText.value
    isGenerated.value = true
    needRefresh.value = false
  } catch (e) {
    showToast(t('qrcode.generateFailed'))
  }
}

// 初始化显示 hello world 模拟二维码
const initPreviewQRCode = () => {
  drawQRCode('qrcode-canvas', 'Hello World')
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
  // QR 码标准要求四周至少有 4 个模块的静默区（白边）
  const margin = 4
  const totalModules = moduleCount + margin * 2
  const cellSize = size / totalModules

  const ctx = uni.createCanvasContext(canvasId)

  // 白色背景
  ctx.setFillStyle('#FFFFFF')
  ctx.fillRect(0, 0, size, size)

  // 绘制二维码模块（带白边偏移）
  ctx.setFillStyle('#000000')
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          (col + margin) * cellSize,
          (row + margin) * cellSize,
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
      scanResult.value = res.result
    },
    fail: () => {
      showToast(t('qrcode.scanFailed'))
    }
  })
}

// 相册扫描
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

// 使用 jsQR 处理图片识别二维码
const processImageWithJsQR = async (imagePath: string) => {
  isScanning.value = true
  scanResult.value = ''

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

    // 使用 jsQR 识别二维码
    const code = jsQR(new Uint8ClampedArray(pixelData.data), width, height, {
      inversionAttempts: 'attemptBoth'
    })

    if (code) {
      scanResult.value = code.data
      showToast('识别成功', 'success')
    } else {
      showToast('未识别到二维码')
    }
  } catch (e) {
    console.error('QR scan error:', e)
    showToast(t('qrcode.scanFailed'))
  } finally {
    isScanning.value = false
  }
}

// 复制扫描结果
const copyScanResult = () => {
  copyToClipboard(scanResult.value)
}

// 从扫描结果生成二维码
const generateFromResult = (result: string) => {
  mode.value = 'generate'
  inputText.value = result
  nextTick(() => {
    generateQRCode()
  })
}

// 监听输入内容变化
watch(inputText, (newVal) => {
  if (isGenerated.value && newVal !== generatedText.value) {
    needRefresh.value = true
  } else if (newVal === generatedText.value) {
    needRefresh.value = false
  }
})

// 监听模式切换，重新绘制二维码
watch(mode, async (newMode) => {
  if (newMode === 'generate') {
    await nextTick()
    // 延迟确保 canvas 已渲染
    setTimeout(() => {
      if (isGenerated.value && generatedText.value) {
        drawQRCode('qrcode-canvas', generatedText.value)
      } else {
        initPreviewQRCode()
      }
    }, 50)
  }
})

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('qrcode.title')}`,
    path: '/pages/text/qrcode/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => ({
  title: `EH Tools - ${t('qrcode.title')}`
}))

onShow(() => {
  uni.setNavigationBarTitle({ title: t('qrcode.title') })
  settingsStore.initTheme()

  // 页面显示时，重新绘制二维码
  if (mode.value === 'generate') {
    nextTick(() => {
      setTimeout(() => {
        if (isGenerated.value && generatedText.value) {
          drawQRCode('qrcode-canvas', generatedText.value)
        } else {
          initPreviewQRCode()
        }
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
  line-height: 88rpx;
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
  position: relative;
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

// 生成按钮覆盖层
.generate-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: $radius-md;
  z-index: 10;
}

.generate-btn {
  min-width: 200rpx;
  height: 80rpx;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: $font-size-md;
  font-weight: 500;
  border-radius: $radius-sm;
  border: none;
  line-height: 80rpx;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}

// 刷新按钮覆盖层
.refresh-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: $radius-md;
  z-index: 10;
  cursor: pointer;

  &:active {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

.refresh-icon {
  width: 80rpx;
  height: 80rpx;
  // 使用主色调
  filter: brightness(0) saturate(100%) invert(45%) sepia(85%) saturate(1000%) hue-rotate(210deg) brightness(95%) contrast(95%);
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

    &.bordered {
      border: 2rpx solid var(--primary);
      color: var(--primary);

      .btn-icon {
        // 图标也使用主色调
        filter: brightness(0) saturate(100%) invert(45%) sepia(85%) saturate(1000%) hue-rotate(210deg) brightness(95%) contrast(95%);
      }
    }
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
  // 将 #667eea 图标转为白色，适配渐变背景
  filter: brightness(0) invert(1);
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

// 扫描结果操作按钮
.result-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-md;
}

.result-btn {
  flex: 1;
  height: 72rpx;
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

  &:active {
    opacity: 0.8;
  }

  .btn-icon {
    width: 32rpx;
    height: 32rpx;
  }

  &.copy {
    background-color: var(--bg-page);
    color: var(--primary);
    border: 1rpx solid var(--primary);
    // 图标保持原色 #667eea，与文字 var(--primary) 一致
  }

  &.generate {
    background-color: var(--primary);
    color: #FFFFFF;

    .btn-icon {
      // 图标变白，与文字颜色一致
      filter: brightness(0) invert(1);
    }
  }
}

// 隐藏的 canvas
.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
