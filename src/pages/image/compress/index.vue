<template>
  <view class="page compress-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('compress.title')" />

    <!-- 选择图片按钮 -->
    <view class="select-section">
      <view class="select-btn" @click="selectImage">
        <text class="select-icon">+</text>
        <text class="select-text">{{ t('compress.selectImage') }}</text>
      </view>
    </view>

    <!-- 压缩质量设置 -->
    <view v-if="imageList.length > 0" class="quality-section">
      <view class="section-title">{{ t('compress.quality') }}</view>
      <view class="quality-slider">
        <slider
          :value="quality"
          :min="10"
          :max="100"
          :step="5"
          activeColor="var(--primary)"
          @change="onQualityChange"
        />
        <view class="quality-labels">
          <text>10%</text>
          <text class="current-quality">{{ quality }}%</text>
          <text>100%</text>
        </view>
      </view>
      <view class="quality-tips">
        <text :class="{ active: quality <= 30 }">{{ t('compress.ratio') }}</text>
        <text :class="{ active: quality > 30 && quality < 70 }">-</text>
        <text :class="{ active: quality >= 70 }">{{ t('compress.bestQuality') }}</text>
      </view>
    </view>

    <!-- 图片列表 -->
    <view v-if="imageList.length > 0" class="image-list">
      <view
        v-for="(item, index) in imageList"
        :key="index"
        class="image-item"
      >
        <!-- 原图 -->
        <view class="image-preview">
          <image
            class="preview-img"
            :src="item.originalPath"
            mode="aspectFill"
            @click="previewImage(item.originalPath)"
          />
          <view class="image-info">
            <text class="info-label">{{ t('compress.original') }}</text>
            <text class="info-size">{{ formatSize(item.originalSize) }}</text>
          </view>
        </view>

        <!-- 箭头 -->
        <view class="arrow-icon">→</view>

        <!-- 压缩后 -->
        <view class="image-preview">
          <image
            v-if="item.compressedPath"
            class="preview-img"
            :src="item.compressedPath"
            mode="aspectFill"
            @click="previewImage(item.compressedPath)"
          />
          <view v-else class="preview-loading">
            <text>...</text>
          </view>
          <view class="image-info">
            <text class="info-label">{{ t('compress.compressed') }}</text>
            <text v-if="item.compressedSize" class="info-size success">
              {{ formatSize(item.compressedSize) }}
              <text class="ratio">({{ getCompressionRatio(item) }})</text>
            </text>
            <text v-else class="info-size">-</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="item-actions">
          <view
            v-if="item.compressedPath"
            class="action-btn save"
            @click="saveImage(item)"
          >
            {{ t('compress.save') }}
          </view>
          <view class="action-btn delete" @click="removeImage(index)">
            {{ t('common.delete') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view v-if="imageList.length > 0" class="action-section">
      <button class="compress-btn" @click="compressAll">
        {{ t('compress.compress') }}
      </button>
      <button
        v-if="hasCompressed"
        class="save-all-btn"
        @click="saveAllImages"
      >
        {{ t('compress.saveAll') }}
      </button>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="compressShareCanvas"
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
  toolName: t('compress.title'),
  icon: '🗜️',
  category: 'image' as const,
  subtitle: '快速压缩图片'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

interface ImageItem {
  originalPath: string
  originalSize: number
  compressedPath?: string
  compressedSize?: number
}

// 状态
const imageList = ref<ImageItem[]>([])
const quality = ref(80)

// 是否有压缩完成的图片
const hasCompressed = computed(() => {
  return imageList.value.some(item => item.compressedPath)
})

// 选择图片
const selectImage = () => {
  uni.chooseImage({
    count: 9,
    sizeType: ['original'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        // 获取文件信息
        const fileInfo = await getFileInfo(tempPath)
        imageList.value.push({
          originalPath: tempPath,
          originalSize: fileInfo.size
        })
      }
    }
  })
}

// 获取文件信息
const getFileInfo = (filePath: string): Promise<{ size: number }> => {
  return new Promise((resolve) => {
    uni.getFileInfo({
      filePath,
      success: (res) => {
        resolve({ size: res.size })
      },
      fail: () => {
        resolve({ size: 0 })
      }
    })
  })
}

// 压缩质量改变
const onQualityChange = (e: any) => {
  quality.value = e.detail.value
}

// 压缩所有图片
const compressAll = async () => {
  uni.showLoading({ title: t('common.loading') })

  try {
    for (let i = 0; i < imageList.value.length; i++) {
      const item = imageList.value[i]
      const compressed = await compressImage(item.originalPath)
      item.compressedPath = compressed.path
      item.compressedSize = compressed.size
    }
    showToast(t('common.success'))
  } catch (error) {
    showToast(t('common.failed'))
  } finally {
    uni.hideLoading()
  }
}

// 压缩单张图片
const compressImage = (src: string): Promise<{ path: string; size: number }> => {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src,
      quality: quality.value,
      success: async (res) => {
        const fileInfo = await getFileInfo(res.tempFilePath)
        resolve({
          path: res.tempFilePath,
          size: fileInfo.size
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 格式化文件大小
const formatSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 获取压缩比
const getCompressionRatio = (item: ImageItem) => {
  if (!item.compressedSize || !item.originalSize) return '-'
  const ratio = ((1 - item.compressedSize / item.originalSize) * 100).toFixed(0)
  return `-${ratio}%`
}

// 预览图片
const previewImage = (url: string) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

// 保存单张图片
const saveImage = (item: ImageItem) => {
  if (!item.compressedPath) return

  uni.saveImageToPhotosAlbum({
    filePath: item.compressedPath,
    success: () => {
      showToast(t('common.saveSuccess'))
    },
    fail: () => {
      showToast(t('common.saveFailed'))
    }
  })
}

// 保存所有图片
const saveAllImages = async () => {
  const compressedItems = imageList.value.filter(item => item.compressedPath)
  if (compressedItems.length === 0) return

  uni.showLoading({ title: t('common.loading') })

  let successCount = 0
  for (const item of compressedItems) {
    try {
      await new Promise<void>((resolve, reject) => {
        uni.saveImageToPhotosAlbum({
          filePath: item.compressedPath!,
          success: () => {
            successCount++
            resolve()
          },
          fail: () => reject()
        })
      })
    } catch (error) {
      // 继续处理下一张
    }
  }

  uni.hideLoading()
  showToast(`${t('common.saveSuccess')} (${successCount}/${compressedItems.length})`)
}

// 移除图片
const removeImage = (index: number) => {
  imageList.value.splice(index, 1)
}

// 分享给好友
onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('compress.title')}`,
    path: '/pages/image/compress/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('compress.title')}`
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('compress.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.compress-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 200rpx;
  box-sizing: border-box;
}

// 选择图片
.select-section {
  margin-bottom: $spacing-md;
}

.select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  border: 2rpx dashed var(--border-light);

  &:active {
    background-color: var(--bg-hover);
  }
}

.select-icon {
  font-size: 64rpx;
  color: var(--primary);
  margin-bottom: $spacing-xs;
}

.select-text {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

// 压缩质量
.quality-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.quality-slider {
  margin-bottom: $spacing-sm;
}

.quality-labels {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-xs;
  color: var(--text-placeholder);
  margin-top: $spacing-xs;
}

.current-quality {
  color: var(--primary);
  font-weight: 500;
}

.quality-tips {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-xs;
  color: var(--text-placeholder);

  text {
    &.active {
      color: var(--primary);
      font-weight: 500;
    }
  }
}

// 图片列表
.image-list {
  margin-bottom: $spacing-md;
}

.image-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.image-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-sm;
  background-color: var(--bg-page);
}

.preview-loading {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  color: var(--text-placeholder);
}

.image-info {
  margin-top: $spacing-xs;
  text-align: center;
}

.info-label {
  display: block;
  font-size: $font-size-xs;
  color: var(--text-secondary);
  margin-bottom: 4rpx;
}

.info-size {
  font-size: $font-size-xs;
  color: var(--text-primary);

  &.success {
    color: var(--success);
  }
}

.ratio {
  color: var(--primary);
  margin-left: 4rpx;
}

.arrow-icon {
  font-size: $font-size-lg;
  color: var(--text-placeholder);
  padding: 0 $spacing-xs;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.action-btn {
  font-size: $font-size-xs;
  padding: 8rpx 16rpx;
  border-radius: $radius-sm;
  text-align: center;

  &.save {
    background-color: var(--primary);
    color: #FFFFFF;
  }

  &.delete {
    background-color: rgba(255, 77, 79, 0.1);
    color: var(--error);
  }
}

// 操作按钮
.action-section {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: var(--bg-page);
  display: flex;
  gap: $spacing-sm;
}

.compress-btn,
.save-all-btn {
  flex: 1;
  height: 88rpx;
  font-size: $font-size-md;
  border-radius: $radius-sm;
  border: none;

  &::after {
    border: none;
  }
}

.compress-btn {
  background-color: var(--primary);
  color: #FFFFFF;

  &:active {
    opacity: 0.8;
  }
}

.save-all-btn {
  background-color: var(--success);
  color: #FFFFFF;

  &:active {
    opacity: 0.8;
  }
}
</style>
