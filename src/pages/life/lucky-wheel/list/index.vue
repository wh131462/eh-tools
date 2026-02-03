<template>
  <view class="page list-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('luckyWheel.list.title')" />

    <!-- 创建新配置 -->
    <view class="create-section">
      <view class="create-btn" @click="createConfig">
        <text class="create-icon">+</text>
        <text class="create-text">{{ t('luckyWheel.list.createNew') }}</text>
      </view>
    </view>

    <!-- 配置列表 -->
    <view class="config-list">
      <view
        v-for="config in configs"
        :key="config.id"
        class="config-item"
        :class="{ active: config.id === currentConfigId }"
        @click="selectConfig(config.id)"
      >
        <view class="config-info">
          <view class="config-name">{{ config.name }}</view>
          <view class="config-desc">
            {{ config.description || t('luckyWheel.list.items', { count: config.items.length }) }}
          </view>
          <view class="config-meta">
            {{ config.items.length }} {{ t('luckyWheel.list.items') }}
          </view>
        </view>
        <view class="config-colors">
          <view
            v-for="(item, index) in config.items.slice(0, 5)"
            :key="index"
            class="color-dot"
            :style="{ backgroundColor: item.color }"
          ></view>
          <text v-if="config.items.length > 5" class="more-dots">+{{ config.items.length - 5 }}</text>
        </view>
        <view class="config-actions" @click.stop>
          <view
            v-if="!config.id.startsWith('preset-')"
            class="action-btn edit"
            @click="editConfig(config)"
          >
            {{ t('common.edit') }}
          </view>
          <view
            v-if="!config.id.startsWith('preset-')"
            class="action-btn delete"
            @click="deleteConfig(config)"
          >
            {{ t('common.delete') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="wheelListShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useWheelStore, useSettingsStore } from '@/store'
import { showToast } from '@/utils'
import type { WheelConfig } from '@/types'

const { t } = useI18n()
const wheelStore = useWheelStore()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('luckyWheel.list.title'),
  icon: '🎯',
  category: 'life' as const,
  subtitle: '管理转盘配置'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 配置列表
const configs = computed(() => wheelStore.configs)
const currentConfigId = computed(() => wheelStore.currentConfigId)

// 选择配置
const selectConfig = (id: string) => {
  wheelStore.setCurrentConfig(id)
  showToast(t('common.success'))
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

// 创建配置
const createConfig = () => {
  uni.navigateTo({
    url: '/pages/life/lucky-wheel/config/index'
  })
}

// 编辑配置
const editConfig = (config: WheelConfig) => {
  uni.navigateTo({
    url: `/pages/life/lucky-wheel/config/index?id=${config.id}`
  })
}

// 删除配置
const deleteConfig = (config: WheelConfig) => {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: t('luckyWheel.list.deleteConfirm'),
    success: (res) => {
      if (res.confirm) {
        wheelStore.deleteConfig(config.id)
        showToast(t('common.deleteSuccess'))
      }
    }
  })
}

// 分享给好友
onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('luckyWheel.list.title')}`,
    path: '/pages/life/lucky-wheel/list/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('luckyWheel.list.title')}`
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('luckyWheel.list.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.list-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 创建按钮
.create-section {
  margin-bottom: $spacing-md;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  border: 2rpx dashed var(--primary);

  &:active {
    background-color: rgba(24, 144, 255, 0.05);
  }
}

.create-icon {
  font-size: $font-size-xl;
  color: var(--primary);
  margin-right: $spacing-xs;
}

.create-text {
  font-size: $font-size-md;
  color: var(--primary);
}

// 配置列表
.config-list {
  //
}

.config-item {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  border: 2rpx solid transparent;
  transition: all $transition-fast;

  &.active {
    border-color: var(--primary);
    background-color: rgba(24, 144, 255, 0.05);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.config-info {
  flex: 1;
  min-width: 0;
}

.config-name {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.config-desc {
  font-size: $font-size-xs;
  color: var(--text-secondary);
  margin-bottom: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.config-meta {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
}

.config-colors {
  display: flex;
  align-items: center;
  margin: 0 $spacing-md;
}

.color-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  margin-left: -8rpx;
  border: 2rpx solid var(--bg-card);

  &:first-child {
    margin-left: 0;
  }
}

.more-dots {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
  margin-left: $spacing-xs;
}

.config-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.action-btn {
  font-size: $font-size-xs;
  padding: 8rpx 16rpx;
  border-radius: $radius-sm;
  text-align: center;

  &.edit {
    background-color: var(--bg-primary-light);
    color: var(--primary);
  }

  &.delete {
    background-color: rgba(255, 77, 79, 0.1);
    color: var(--error);
  }

  &:active {
    opacity: 0.7;
  }
}
</style>
