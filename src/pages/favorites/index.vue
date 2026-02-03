<template>
  <view class="page favorites-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('favorites.title')" :show-back="false" />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-icon" style="background: var(--gradient-gold);">
        <image src="/static/icons/star-filled.svg" class="svg-icon size-48" mode="aspectFit" />
      </view>
      <text class="header-title">{{ t('favorites.title') }}</text>
    </view>

    <!-- 收藏列表 -->
    <view v-if="favoriteTools.length > 0" class="favorites-list">
      <view
        v-for="tool in favoriteTools"
        :key="tool.id"
        class="favorite-item"
        @click="handleToolClick(tool.path)"
      >
        <view class="favorite-item-icon" :style="{ background: getToolGradient(tool.category) }">
          <image :src="getToolIcon(tool.id)" class="svg-icon size-48" mode="aspectFit" />
        </view>
        <view class="favorite-item-info">
          <text class="favorite-item-name">{{ t(tool.nameKey) }}</text>
          <text class="favorite-item-category">{{ getCategoryName(tool.category) }}</text>
        </view>
        <view class="favorite-item-actions">
          <view class="action-btn" @click.stop="handleRemoveFavorite(tool.id)">
            <image src="/static/icons/star-filled.svg" class="svg-icon size-40" mode="aspectFit" />
          </view>
          <view class="action-arrow">
            <image src="/static/icons/arrow-right.svg" class="svg-icon size-32" mode="aspectFit" />
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-icon">
        <image src="/static/icons/star.svg" class="svg-icon size-128" mode="aspectFit" />
      </view>
      <text class="empty-title">{{ t('favorites.empty') }}</text>
      <text class="empty-desc">{{ t('favorites.emptyDesc') }}</text>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />

    <!-- 悬浮 TabBar -->
    <FloatTabBar />

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="favoritesShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { ToolShareImageConfig } from '@/utils/shareCanvas'
import FloatTabBar from '@/components/common/FloatTabBar.vue'
import { useFavoritesStore, useSettingsStore } from '@/store'
import { TOOL_CATEGORIES, type ToolCategory, type Tool } from '@/types'
import { navigateTo, showToast } from '@/utils'

const { t } = useI18n()

// 工具分享图配置
const toolShareConfig: ToolShareImageConfig = {
  toolName: '我的收藏',
  icon: '⭐',
  category: 'default' as const,
  subtitle: '常用工具快速访问'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}
const favoritesStore = useFavoritesStore()
const settingsStore = useSettingsStore()

// 工具图标映射
const TOOL_ICONS: Record<string, string> = {
  // 时间工具
  'calendar': '/static/icons/calendar.svg',
  'countdown': '/static/icons/timer.svg',
  'time-diff': '/static/icons/hourglass.svg',
  'world-clock': '/static/icons/globe.svg',
  // 计算工具
  'calculator': '/static/icons/calculator.svg',
  'salary': '/static/icons/money.svg',
  'bmi': '/static/icons/scale.svg',
  'mortgage': '/static/icons/building.svg',
  'unit-converter': '/static/icons/ruler.svg',
  // 文本工具
  'encrypt': '/static/icons/lock.svg',
  'qrcode': '/static/icons/qrcode.svg',
  // 图片工具
  'compress': '/static/icons/compress.svg',
  'filter': '/static/icons/palette.svg',
  'color-card': '/static/icons/color-card.svg',
  'color-converter': '/static/icons/color-swap.svg',
  // 生活工具
  'lucky-wheel': '/static/icons/wheel.svg',
}

// 获取所有工具的扁平列表
const allTools = computed(() => {
  const tools: Tool[] = []
  TOOL_CATEGORIES.forEach(category => {
    category.tools.forEach(tool => {
      tools.push(tool)
    })
  })
  return tools
})

// 收藏的工具列表
const favoriteTools = computed(() => {
  const favoriteIds = favoritesStore.favorites
  return allTools.value.filter(tool => favoriteIds.includes(tool.id))
})

// 获取工具图标
const getToolIcon = (toolId: string): string => {
  return TOOL_ICONS[toolId] || '/static/icons/star.svg'
}

// 获取工具渐变色
const getToolGradient = (category: ToolCategory): string => {
  const gradients: Record<string, string> = {
    time: 'var(--gradient-time)',
    calc: 'var(--gradient-calc)',
    text: 'var(--gradient-text)',
    image: 'var(--gradient-image)',
    life: 'var(--gradient-life)'
  }
  return gradients[category] || 'var(--gradient-primary)'
}

// 获取分类名称
const getCategoryName = (category: ToolCategory): string => {
  const categoryInfo = TOOL_CATEGORIES.find(c => c.id === category)
  return categoryInfo ? t(categoryInfo.nameKey) : ''
}

// 点击工具
const handleToolClick = (path: string) => {
  navigateTo(path)
}

// 移除收藏
const handleRemoveFavorite = (toolId: string) => {
  favoritesStore.removeFavorite(toolId)
  showToast(t('favorites.removed'))
}

// 设置导航栏标题
const updateNavTitle = () => {
  uni.setNavigationBarTitle({
    title: t('favorites.title')
  })
}

// 页面显示时更新标题
onShow(() => {
  updateNavTitle()
  settingsStore.initTheme()
  // 通知 TabBar 更新状态
  uni.$emit('tabbar-update')
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: 'EH Tools - 我的收藏',
    path: '/pages/favorites/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('home.banner.desc1')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.favorites-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: var(--bg-card);
  border-radius: $radius-xl;
  box-shadow: var(--shadow-neumorphic);
  margin-bottom: $spacing-lg;
}

.header-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .svg-icon {
    filter: brightness(0) invert(1);
  }
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-normal;

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.98);
  }
}

.favorite-item-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .svg-icon {
    filter: brightness(0) invert(1);
  }
}

.favorite-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.favorite-item-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.favorite-item-category {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.favorite-item-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  transition: all $transition-normal;

  &:active {
    background: var(--bg-sunken);
  }
}

.action-arrow {
  opacity: 0.5;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 3 $spacing-lg;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: $radius-round;
  box-shadow: var(--shadow-neumorphic);
  margin-bottom: $spacing-lg;
  opacity: 0.6;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-sm;
}

.empty-desc {
  font-size: 28rpx;
  color: var(--text-secondary);
  text-align: center;
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}

// SVG 图标通用样式
.svg-icon {
  display: inline-block;
  flex-shrink: 0;

  &.size-32 {
    width: 32rpx;
    height: 32rpx;
  }

  &.size-40 {
    width: 40rpx;
    height: 40rpx;
  }

  &.size-48 {
    width: 48rpx;
    height: 48rpx;
  }

  &.size-128 {
    width: 128rpx;
    height: 128rpx;
  }
}
</style>
