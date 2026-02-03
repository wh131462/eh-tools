<template>
  <view class="page home-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('home.title')" :show-back="false" />

    <!-- 欢迎横幅 -->
    <WelcomeBanner />

    <!-- 搜索框 -->
    <SearchBox
      v-model="searchKeyword"
      :editable="true"
      :focus="searchFocus"
      @click="handleSearchClick"
      @confirm="handleSearchConfirm"
    />

    <!-- 搜索结果 -->
    <view v-if="searchKeyword" class="search-results">
      <view v-if="searchResults.length > 0" class="search-results-list">
        <view
          v-for="tool in searchResults"
          :key="tool.id"
          class="search-result-item"
          @click="handleToolClick(tool.path)"
        >
          <view class="search-result-icon" :style="{ background: getCategoryGradient(tool.category) }">
            <image :src="getToolIcon(tool.icon)" class="svg-icon size-40" mode="aspectFit" />
          </view>
          <view class="search-result-info">
            <text class="search-result-name">{{ t(tool.nameKey) }}</text>
            <text class="search-result-category">{{ getCategoryName(tool.category) }}</text>
          </view>
          <view class="search-result-actions">
            <view
              class="favorite-btn"
              :class="{ 'is-favorite': favoritesStore.isFavorite(tool.id) }"
              @click.stop="handleToggleFavorite(tool.id)"
            >
              <image
                :src="favoritesStore.isFavorite(tool.id) ? '/static/icons/star-filled.svg' : '/static/icons/star.svg'"
                class="svg-icon size-40"
                mode="aspectFit"
              />
            </view>
            <view class="search-result-arrow">
              <image src="/static/icons/arrow-right.svg" class="svg-icon size-32" mode="aspectFit" />
            </view>
          </view>
        </view>
      </view>
      <view v-else class="search-empty">
        <text class="search-empty-text">{{ t('home.noResult') }}</text>
      </view>
    </view>

    <!-- 主内容区域（搜索时隐藏） -->
    <view v-show="!searchKeyword">
      <!-- 最近使用 -->
      <RecentTools />

      <!-- 工具分类列表 -->
      <view class="tool-categories">
        <view v-for="category in categories" :key="category.id" class="category-section">
          <!-- 分类标题 -->
          <view class="section-header">
            <view class="section-title">
              <view class="section-title-icon" :style="{ background: getCategoryGradient(category.id) }">
                <image :src="getCategoryIcon(category.id)" class="svg-icon size-40" mode="aspectFit" />
              </view>
              <text class="section-title-text">{{ t(category.nameKey) }}</text>
            </view>
          </view>

          <!-- 工具网格 -->
          <view class="tool-grid">
            <ToolCard
              v-for="tool in category.tools"
              :key="tool.id"
              :name="t(tool.nameKey)"
              :path="tool.path"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />

    <!-- 悬浮 TabBar -->
    <FloatTabBar />

    <!-- 首页分享图 Canvas -->
    <share-canvas
      canvas-id="homeShareCanvas"
      share-type="home"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import WelcomeBanner from '@/components/common/WelcomeBanner.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import RecentTools from '@/components/common/RecentTools.vue'
import ToolCard from '@/components/common/ToolCard.vue'
import FloatTabBar from '@/components/common/FloatTabBar.vue'
import { TOOL_CATEGORIES, TOOLS } from '@/types'
import { useSettingsStore, useFavoritesStore } from '@/store'
import { navigateTo, showToast } from '@/utils'

const { t } = useI18n()

// 首页分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}
const settingsStore = useSettingsStore()
const favoritesStore = useFavoritesStore()

// 工具分类
const categories = TOOL_CATEGORIES

// 搜索相关
const searchKeyword = ref('')
const searchFocus = ref(false)

// 搜索结果
const searchResults = computed(() => {
  if (!searchKeyword.value.trim()) return []
  const keyword = searchKeyword.value.toLowerCase().trim()
  return TOOLS.filter(tool => {
    const name = t(tool.nameKey).toLowerCase()
    const id = tool.id.toLowerCase()
    return name.includes(keyword) || id.includes(keyword)
  })
})

// 工具图标映射
const TOOL_ICONS: Record<string, string> = {
  'calendar': '/static/icons/calendar.svg',
  'countdown': '/static/icons/timer.svg',
  'time-diff': '/static/icons/hourglass.svg',
  'world-clock': '/static/icons/globe.svg',
  'timestamp-converter': '/static/icons/timestamp.svg',
  'age-calculator': '/static/icons/age.svg',
  'pomodoro-timer': '/static/icons/pomodoro.svg',
  'calculator': '/static/icons/calculator.svg',
  'salary': '/static/icons/money.svg',
  'bmi': '/static/icons/scale.svg',
  'mortgage': '/static/icons/building.svg',
  'unit-converter': '/static/icons/ruler.svg',
  'tax-calculator': '/static/icons/tax-calculator.svg',
  'encrypt': '/static/icons/lock.svg',
  'qrcode': '/static/icons/qrcode.svg',
  'json-formatter': '/static/icons/json-format.svg',
  'word-counter': '/static/icons/word-counter.svg',
  'regex-tester': '/static/icons/regex.svg',
  'compress': '/static/icons/compress.svg',
  'color-tool': '/static/icons/color-card.svg',
  'color-picker': '/static/icons/color-picker.svg',
  'lucky-wheel': '/static/icons/wheel.svg',
}

// 分类图标映射
const CATEGORY_ICONS: Record<string, string> = {
  'time': '/static/icons/clock.svg',
  'calc': '/static/icons/calculator.svg',
  'text': '/static/icons/lock.svg',
  'image': '/static/icons/image.svg',
  'life': '/static/icons/target.svg',
}

// 分类名称映射键
const CATEGORY_NAME_KEYS: Record<string, string> = {
  'time': 'category.time',
  'calc': 'category.calc',
  'text': 'category.text',
  'image': 'category.image',
  'life': 'category.life',
}

// 获取工具图标
const getToolIcon = (iconName: string): string => {
  return TOOL_ICONS[iconName] || `/static/icons/${iconName}.svg`
}

// 获取分类图标路径
const getCategoryIcon = (categoryId: string): string => {
  return CATEGORY_ICONS[categoryId] || '/static/icons/star.svg'
}

// 获取分类渐变色
const getCategoryGradient = (categoryId: string): string => {
  const gradients: Record<string, string> = {
    time: 'var(--gradient-time)',
    calc: 'var(--gradient-calc)',
    text: 'var(--gradient-text)',
    image: 'var(--gradient-image)',
    life: 'var(--gradient-life)'
  }
  return gradients[categoryId] || 'var(--gradient-primary)'
}

// 获取分类名称
const getCategoryName = (categoryId: string): string => {
  const key = CATEGORY_NAME_KEYS[categoryId]
  return key ? t(key) : categoryId
}

// 搜索点击
const handleSearchClick = () => {
  searchFocus.value = true
}

// 搜索确认
const handleSearchConfirm = (value: string) => {
  if (searchResults.value.length === 1) {
    navigateTo(searchResults.value[0].path)
  }
}

// 工具点击
const handleToolClick = (path: string) => {
  searchKeyword.value = ''
  navigateTo(path)
}

// 切换收藏状态
const handleToggleFavorite = (toolId: string) => {
  if (favoritesStore.isFavorite(toolId)) {
    favoritesStore.removeFavorite(toolId)
    showToast(t('favorites.removed'))
  } else {
    favoritesStore.addFavorite(toolId)
    showToast(t('favorites.added'))
  }
  uni.vibrateShort({ type: 'light' })
}

// 设置导航栏标题
const updateNavTitle = () => {
  uni.setNavigationBarTitle({
    title: t('home.title')
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
    title: 'EH Tools - 实用工具集合',
    path: '/pages/index/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('home.banner.desc1')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.home-page {
  min-height: 100vh;
  padding-bottom: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.tool-categories {
  padding-bottom: $spacing-md;
}

.category-section {
  margin-bottom: $spacing-sm;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg $spacing-md $spacing-md;
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.section-title-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  // 让渐变背景上的图标变白
  .svg-icon {
    filter: brightness(0) invert(1);
  }
}

.section-title-text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.section-more {
  font-size: 26rpx;
  color: var(--text-placeholder);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  padding: 0 $spacing-md;
}

// 搜索结果
.search-results {
  padding: 0 $spacing-md;
}

.search-results-list {
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  overflow: hidden;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  gap: $spacing-md;
  transition: all $transition-normal;

  &:not(:last-child) {
    border-bottom: 1rpx solid var(--border-light);
  }

  &:active {
    background: var(--bg-hover);
  }
}

.search-result-icon {
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

.search-result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.search-result-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.search-result-category {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.search-result-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.favorite-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  transition: all $transition-normal;

  .svg-icon {
    filter: none;
  }

  &:active {
    background: var(--bg-sunken);
    transform: scale(0.9);
  }
}

.search-result-arrow {
  flex-shrink: 0;
  opacity: 0.5;
}

.search-empty {
  padding: $spacing-xl;
  text-align: center;
}

.search-empty-text {
  font-size: 28rpx;
  color: var(--text-placeholder);
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

  &.size-64 {
    width: 64rpx;
    height: 64rpx;
  }
}
</style>
