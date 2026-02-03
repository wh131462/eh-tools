<template>
  <view class="share-result-container" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 使用 Canvas 2D API - 隐藏在屏幕外 -->
    <canvas
      v-if="visible"
      type="2d"
      id="shareResultCanvas"
      class="share-result-canvas-hidden"
      :style="{
        width: canvasWidth + 'px',
        height: canvasHeight + 'px'
      }"
    />

    <!-- 预览弹窗 -->
    <view v-if="visible" class="share-modal" @click.self="handleClose">
      <view class="share-modal-content">
        <view class="share-modal-header">
          <text class="share-modal-title">{{ t('shareResult.title') }}</text>
          <view class="share-modal-close" @click="handleClose">
            <text class="close-icon">×</text>
          </view>
        </view>

        <view class="share-preview">
          <image v-if="previewUrl" :src="previewUrl" mode="aspectFit" class="preview-image" />
          <!-- 创意加载动画：模拟分享图绘制过程 -->
          <view v-else class="preview-loading">
            <!-- 骨架结构 -->
            <view class="loading-skeleton">
              <!-- 顶部渐变条 -->
              <view class="skeleton-top-bar"></view>

              <!-- 图标区域 -->
              <view class="skeleton-icon-area">
                <view class="skeleton-icon">
                  <view class="icon-pulse"></view>
                  <view class="icon-ring"></view>
                </view>
              </view>

              <!-- 标题区域 -->
              <view class="skeleton-title">
                <view class="title-line"></view>
              </view>

              <!-- 结果区域 -->
              <view class="skeleton-result">
                <view class="result-label"></view>
                <view class="result-value"></view>
                <view class="result-badge"></view>
              </view>

              <!-- 副结果区域 -->
              <view class="skeleton-sub-results">
                <view class="sub-item"></view>
                <view class="sub-item"></view>
              </view>

              <!-- 底部logo区域 -->
              <view class="skeleton-footer">
                <view class="footer-logo"></view>
                <view class="footer-text"></view>
              </view>

              <!-- 底部渐变条 -->
              <view class="skeleton-bottom-bar"></view>
            </view>

            <!-- 绘制进度指示器 -->
            <view class="loading-indicator">
              <view class="brush-icon">
                <view class="brush-body"></view>
                <view class="brush-tip"></view>
                <view class="brush-trail"></view>
              </view>
              <text class="loading-text">{{ t('shareResult.generating') }}</text>
              <view class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
          </view>
        </view>

        <view class="share-actions">
          <button class="share-btn share-btn-primary" @click="handleSaveImage">
            <text>{{ t('shareResult.saveImage') }}</text>
          </button>
          <button class="share-btn share-btn-secondary" open-type="share" @click="handleShare">
            <text>{{ t('shareResult.shareToFriend') }}</text>
          </button>
        </view>

        <view class="share-tip">
          <text>{{ t('shareResult.tip') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/modules/settings'
import { generateResultShareImage, type ResultShareConfig } from '@/utils/shareCanvas'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 获取组件实例
const instance = getCurrentInstance()

// Props
const props = defineProps<{
  visible: boolean
  config: ResultShareConfig
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'generated', url: string): void
}>()

// Canvas 尺寸
const canvasWidth = 600
const canvasHeight = 720

// 预览图 URL
const previewUrl = ref('')

// 监听显示状态，自动生成分享图
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      // 等待 Canvas 挂载
      await nextTick()
      setTimeout(async () => {
        if (!previewUrl.value) {
          await generateImage()
        }
      }, 300)
    }
  }
)

// 监听配置变化，重新生成
watch(
  () => props.config,
  async () => {
    if (props.visible) {
      previewUrl.value = ''
      await nextTick()
      setTimeout(async () => {
        await generateImage()
      }, 300)
    }
  },
  { deep: true }
)

// 生成分享图
async function generateImage() {
  console.log('[ShareResult] 开始生成分享图:', props.config.title)
  try {
    // 等待 Canvas 渲染
    await new Promise(resolve => setTimeout(resolve, 500))

    const url = await generateResultShareImage(
      'shareResultCanvas',
      props.config,
      canvasWidth,
      canvasHeight,
      instance?.proxy  // 传入组件实例
    )
    console.log('[ShareResult] 分享图生成成功:', url)
    previewUrl.value = url
    emit('generated', url)
  } catch (error) {
    console.error('[ShareResult] 生成分享图失败:', error)
    uni.showToast({
      title: t('shareResult.generateFailed'),
      icon: 'none'
    })
  }
}

// 保存图片到相册
async function handleSaveImage() {
  if (!previewUrl.value) {
    uni.showToast({
      title: t('shareResult.noImage'),
      icon: 'none'
    })
    return
  }

  try {
    // 检查相册权限
    const authResult = await uni.authorize({ scope: 'scope.writePhotosAlbum' }).catch(() => null)

    await uni.saveImageToPhotosAlbum({
      filePath: previewUrl.value
    })

    uni.showToast({
      title: t('shareResult.saveSuccess'),
      icon: 'success'
    })
  } catch (error: any) {
    if (error?.errMsg?.includes('auth deny')) {
      uni.showModal({
        title: t('shareResult.permissionTitle'),
        content: t('shareResult.permissionContent'),
        confirmText: t('shareResult.goSettings'),
        success: (res) => {
          if (res.confirm) {
            uni.openSetting({})
          }
        }
      })
    } else {
      uni.showToast({
        title: t('shareResult.saveFailed'),
        icon: 'none'
      })
    }
  }
}

// 分享
function handleShare() {
  // 分享由 open-type="share" 处理
  handleClose()
}

// 关闭弹窗
function handleClose() {
  emit('update:visible', false)
}

// 暴露方法供父组件调用
defineExpose({
  generateImage,
  getImageUrl: () => previewUrl.value
})
</script>

<style lang="scss">
@use '@/styles/variables.scss' as *;

.share-result-canvas-hidden {
  position: fixed !important;
  left: -9999px !important;
  top: -9999px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: -9999 !important;
}

.share-result-container {
  &.theme-dark {
    .share-modal-content {
      background: var(--card-bg);
    }

    .share-modal-title {
      color: var(--text-color);
    }

    .preview-loading {
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
    }

    .title-line,
    .result-label,
    .sub-item,
    .footer-text {
      background: linear-gradient(90deg, #2a2a4a 25%, #3a3a5a 50%, #2a2a4a 75%);
      background-size: 200% 100%;
    }

    .skeleton-result {
      background: rgba(102, 126, 234, 0.1);
    }

    .loading-text {
      color: #9fa8da;
    }

    .dot {
      background: #9fa8da;
    }

    .share-btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-color);
    }

    .share-tip {
      color: var(--text-tertiary);
    }
  }
}

.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.share-modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.share-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border-color, #eee);
}

.share-modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-color, #333);
}

.share-modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-secondary, #f5f5f5);
}

.close-icon {
  font-size: 40rpx;
  color: var(--text-secondary, #666);
  line-height: 1;
}

.share-preview {
  padding: 32rpx;
  display: flex;
  justify-content: center;
}

.preview-image {
  width: 480rpx;
  height: 576rpx;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.preview-loading {
  width: 480rpx;
  height: 576rpx;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #f8f9fe 0%, #f0f2f8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.1);
}

// ===== 骨架屏结构 =====
.loading-skeleton {
  width: 100%;
  height: 100%;
  padding: 24rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

// 顶部渐变条
.skeleton-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

// 图标区域
.skeleton-icon-area {
  margin-top: 40rpx;
  margin-bottom: 32rpx;
}

.skeleton-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-pulse {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulse 1.5s ease-in-out infinite;
}

.icon-ring {
  position: absolute;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 3rpx solid transparent;
  border-top-color: #667eea;
  border-right-color: #764ba2;
  animation: spin 1.2s linear infinite;
}

// 标题区域
.skeleton-title {
  margin-bottom: 32rpx;
}

.title-line {
  width: 200rpx;
  height: 32rpx;
  border-radius: 16rpx;
  background: linear-gradient(90deg, #e8eaf6 25%, #f5f5f5 50%, #e8eaf6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

// 结果区域
.skeleton-result {
  width: 100%;
  padding: 24rpx;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.result-label {
  width: 100rpx;
  height: 20rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #e8eaf6 25%, #f5f5f5 50%, #e8eaf6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  animation-delay: 0.1s;
}

.result-value {
  width: 160rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  opacity: 0.3;
}

.result-badge {
  width: 120rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  animation-delay: 0.2s;
  opacity: 0.2;
}

// 副结果区域
.skeleton-sub-results {
  display: flex;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.sub-item {
  width: 120rpx;
  height: 48rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #e8eaf6 25%, #f5f5f5 50%, #e8eaf6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.3s;
  }
}

// 底部logo区域
.skeleton-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin-top: auto;
  margin-bottom: 24rpx;
}

.footer-logo {
  width: 140rpx;
  height: 28rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  opacity: 0.4;
}

.footer-text {
  width: 100rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #e8eaf6 25%, #f5f5f5 50%, #e8eaf6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  animation-delay: 0.4s;
}

// 底部渐变条
.skeleton-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  animation-delay: 0.5s;
}

// ===== 加载指示器 =====
.loading-indicator {
  position: absolute;
  bottom: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

// 画笔图标
.brush-icon {
  width: 48rpx;
  height: 48rpx;
  position: relative;
  animation: brush-move 2s ease-in-out infinite;
}

.brush-body {
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
  border-radius: 4rpx 4rpx 0 0;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-30deg);
  transform-origin: bottom center;
}

.brush-tip {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 12rpx solid #667eea;
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%) rotate(-30deg);
}

.brush-trail {
  width: 40rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent 0%, #667eea 50%, #764ba2 100%);
  border-radius: 2rpx;
  position: absolute;
  bottom: 4rpx;
  right: -8rpx;
  opacity: 0.6;
  animation: trail-fade 2s ease-in-out infinite;
}

.loading-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
  letter-spacing: 2rpx;
}

// 加载点动画
.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #667eea;
  animation: dot-bounce 1.4s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

// ===== 动画定义 =====
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes brush-move {
  0%, 100% {
    transform: translateX(-20rpx) rotate(-5deg);
  }
  50% {
    transform: translateX(20rpx) rotate(5deg);
  }
}

@keyframes trail-fade {
  0%, 100% {
    opacity: 0.3;
    width: 20rpx;
  }
  50% {
    opacity: 0.8;
    width: 50rpx;
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.share-actions {
  display: flex;
  gap: 24rpx;
  padding: 0 32rpx 32rpx;
}

.share-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  border: none;

  &::after {
    border: none;
  }
}

.share-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.share-btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.share-tip {
  text-align: center;
  padding: 0 32rpx 32rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
