<template>
  <view class="tool-card" :class="{ 'is-favorite': isFavorited }" @click="handleClick" @longpress="handleLongPress">
    <!-- 收藏标记 -->
    <view v-if="isFavorited" class="favorite-badge">
      <image src="/static/icons/star-filled.svg" class="badge-icon" mode="aspectFit" />
    </view>
    <view class="tool-card-icon" :style="iconStyle">
      <image :src="iconSrc" class="svg-icon" mode="aspectFit" />
    </view>
    <text class="tool-card-name">{{ name }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo, showToast } from '@/utils'
import { useFavoritesStore, useRecentToolsStore } from '@/store'

const { t } = useI18n()
const favoritesStore = useFavoritesStore()
const recentToolsStore = useRecentToolsStore()

// 工具图标映射
const TOOL_ICONS: Record<string, string> = {
  // 时间工具
  'calendar': '/static/icons/calendar.svg',
  'countdown': '/static/icons/timer.svg',
  'time-diff': '/static/icons/hourglass.svg',
  'world-clock': '/static/icons/globe.svg',
  'timestamp-converter': '/static/icons/timestamp.svg',
  'age-calculator': '/static/icons/age.svg',
  'pomodoro-timer': '/static/icons/pomodoro.svg',
  'worker-clock': '/static/icons/worker-clock.svg',
  // 计算工具
  'calculator': '/static/icons/calculator.svg',
  'salary': '/static/icons/money.svg',
  'bmi': '/static/icons/scale.svg',
  'mortgage': '/static/icons/building.svg',
  'unit-converter': '/static/icons/ruler.svg',
  'tax-calculator': '/static/icons/tax-calculator.svg',
  // 文本工具
  'encrypt': '/static/icons/lock.svg',
  'qrcode': '/static/icons/qrcode.svg',
  'json-formatter': '/static/icons/json-format.svg',
  'word-counter': '/static/icons/word-counter.svg',
  'regex-tester': '/static/icons/regex.svg',
  'led-marquee': '/static/icons/led-marquee.svg',
  // 图片工具
  'compress': '/static/icons/compress.svg',
  'color-tool': '/static/icons/color-card.svg',
  'color-picker': '/static/icons/color-picker.svg',
  // 生活工具
  'lucky-wheel': '/static/icons/wheel.svg',
  'kinship-calculator': '/static/icons/kinship.svg',
  'license-plate': '/static/icons/license-plate.svg',
  'todo-list': '/static/icons/todo-list.svg',
  'size-chart': '/static/icons/size-chart.svg',
}

// 工具渐变色映射
const TOOL_GRADIENTS: Record<string, string> = {
  'calendar': 'var(--gradient-calendar)',
  'countdown': 'var(--gradient-timer)',
  'time-diff': 'var(--gradient-hourglass)',
  'world-clock': 'var(--gradient-globe)',
  'timestamp-converter': 'var(--gradient-timestamp)',
  'age-calculator': 'var(--gradient-age)',
  'pomodoro-timer': 'var(--gradient-pomodoro)',
  'worker-clock': 'var(--gradient-worker-clock)',
  'calculator': 'var(--gradient-calculator)',
  'salary': 'var(--gradient-money)',
  'bmi': 'var(--gradient-scale)',
  'mortgage': 'var(--gradient-building)',
  'unit-converter': 'var(--gradient-ruler)',
  'tax-calculator': 'var(--gradient-tax-calculator)',
  'encrypt': 'var(--gradient-lock)',
  'qrcode': 'var(--gradient-qrcode)',
  'json-formatter': 'var(--gradient-json-format)',
  'word-counter': 'var(--gradient-word-counter)',
  'regex-tester': 'var(--gradient-regex)',
  'led-marquee': 'var(--gradient-led-marquee)',
  'compress': 'var(--gradient-compress)',
  'color-tool': 'var(--gradient-color-tool)',
  'color-picker': 'var(--gradient-color-picker)',
  'lucky-wheel': 'var(--gradient-wheel)',
  'kinship-calculator': 'var(--gradient-kinship)',
  'license-plate': 'var(--gradient-license-plate)',
  'todo-list': 'var(--gradient-todo-list)',
  'size-chart': 'var(--gradient-size-chart)',
}

const props = defineProps<{
  icon?: string
  name: string
  path: string
  gradient?: string
  toolId?: string  // 工具 ID，用于收藏功能
}>()

// 获取工具 ID
const getToolId = computed(() => {
  if (props.toolId) return props.toolId
  // 从路径推断工具 ID
  const pathSegments = props.path.split('/').filter(s => s && s !== 'index')
  return pathSegments[pathSegments.length - 1] || ''
})

// 是否已收藏
const isFavorited = computed(() => {
  return favoritesStore.isFavorite(getToolId.value)
})

// 获取图标路径
const iconSrc = computed(() => {
  if (props.icon) {
    return props.icon
  }
  // 从路径推断工具 ID
  const pathSegments = props.path.split('/').filter(s => s && s !== 'index')
  const toolKey = pathSegments[pathSegments.length - 1] || ''
  return TOOL_ICONS[toolKey] || '/static/icons/star.svg'
})

// 图标背景样式
const iconStyle = computed(() => {
  if (props.gradient) {
    return { background: props.gradient }
  }
  // 从路径推断工具 ID 并获取渐变
  const pathSegments = props.path.split('/').filter(s => s && s !== 'index')
  const toolKey = pathSegments[pathSegments.length - 1] || ''
  return { background: TOOL_GRADIENTS[toolKey] || 'var(--gradient-primary)' }
})

const handleClick = () => {
  const toolId = getToolId.value
  if (toolId) {
    recentToolsStore.addRecentTool(toolId)
  }
  navigateTo(props.path)
}

// 长按收藏/取消收藏
const handleLongPress = () => {
  const toolId = getToolId.value
  if (!toolId) return

  if (favoritesStore.isFavorite(toolId)) {
    favoritesStore.removeFavorite(toolId)
    showToast(t('favorites.removed'))
  } else {
    favoritesStore.addFavorite(toolId)
    showToast(t('favorites.added'))
  }
  // 震动反馈
  uni.vibrateShort({ type: 'light' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.tool-card {
  position: relative;
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all $transition-normal;
  height: 180rpx;
  box-sizing: border-box;

  &.is-favorite {
    box-shadow: var(--shadow-neumorphic-sm), 0 0 0 2rpx var(--color-primary);
  }

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.96);
  }
}

.favorite-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .badge-icon {
    width: 24rpx;
    height: 24rpx;
  }
}

.tool-card-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  .svg-icon {
    width: 48rpx;
    height: 48rpx;
  }
}

.tool-card-name {
  font-size: 22rpx;
  line-height: 1.3;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}
</style>
