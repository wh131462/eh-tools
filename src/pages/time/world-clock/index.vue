<template>
  <view class="page clock-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('worldClock.title')" />

    <!-- 本地时间 -->
    <view class="local-section">
      <view class="local-header">
        <text class="local-label">{{ t('worldClock.localTime') }}</text>
        <text class="local-date">{{ localDate }}</text>
      </view>
      <!-- 模拟时钟 -->
      <view class="analog-clock">
        <view class="clock-face">
          <view v-for="i in 12" :key="i" class="clock-mark" :style="{ transform: `rotate(${i * 30}deg)` }">
            <view :class="i % 3 === 0 ? 'mark-major' : 'mark-minor'" />
          </view>
          <view class="clock-hand hour-hand" :style="{ transform: `rotate(${hourDeg}deg)` }" />
          <view class="clock-hand minute-hand" :style="{ transform: `rotate(${minuteDeg}deg)` }" />
          <view class="clock-hand second-hand" :style="{ transform: `rotate(${secondDeg}deg)` }" />
          <view class="clock-center" />
        </view>
      </view>
      <view class="local-time">{{ localTime }}</view>
      <!-- 12/24小时制切换 -->
      <view class="time-format-toggle" @click="toggleTimeFormat">
        <text>{{ is24Hour ? '24' : '12' }}{{ t('worldClock.hourFormat') }}</text>
      </view>
    </view>

    <!-- 时区列表 -->
    <view class="timezone-list">
      <view
        v-for="(tz, index) in timezones"
        :key="tz.id"
        class="timezone-item"
        :class="{ 'tz-dragging': dragIndex === index }"
        @longpress="onDragStart(index, $event)"
        @touchmove.prevent="onDragMove($event)"
        @touchend="onDragEnd"
      >
        <view class="tz-info">
          <view class="tz-city">
            <text class="tz-icon">{{ getDayNightIcon(tz.offset) }}</text>
            {{ t(`worldClock.cities.${tz.id}`) }}
          </view>
          <view class="tz-diff">{{ getTimeDifference(tz.offset) }}</view>
        </view>
        <view class="tz-time">
          <text class="tz-hour">{{ getTimezoneTime(tz.offset) }}</text>
          <text class="tz-date">{{ getTimezoneDate(tz.offset) }}</text>
        </view>
        <view class="tz-delete" @click="removeTimezone(index)">
          <text>-</text>
        </view>
      </view>
    </view>

    <!-- 添加时区按钮 -->
    <view class="add-section">
      <view class="add-btn" @click="showAddPicker = true">
        <text class="add-icon">+</text>
        <text class="add-text">{{ t('worldClock.addTimezone') }}</text>
      </view>
    </view>

    <!-- 时区选择器 -->
    <view v-if="showAddPicker" class="picker-mask" @click="showAddPicker = false; searchKeyword = ''">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">{{ t('worldClock.selectTimezone') }}</text>
        </view>
        <view class="picker-search">
          <input
            class="picker-search-input"
            :placeholder="t('worldClock.searchPlaceholder')"
            v-model="searchKeyword"
          />
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view v-if="availableTimezones.length === 0" class="picker-empty">
            <text>{{ t('worldClock.noResult') }}</text>
          </view>
          <view
            v-for="tz in availableTimezones"
            :key="tz.id"
            class="picker-item"
            @click="addTimezone(tz)"
          >
            <view class="picker-city">{{ t(`worldClock.cities.${tz.id}`) }}</view>
            <view class="picker-diff">{{ tz.diff }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="worldClockShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onHide, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('worldClock.title'),
  icon: '🌍',
  category: 'time' as const,
  subtitle: t('worldClock.subtitle')
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

interface Timezone {
  id: string
  city: string
  offset: number
  diff: string
}

// 预设时区
const allTimezones: Timezone[] = [
  // 亚洲
  { id: 'beijing', city: 'Beijing', offset: 8, diff: 'UTC+8' },
  { id: 'shanghai', city: 'Shanghai', offset: 8, diff: 'UTC+8' },
  { id: 'hongkong', city: 'Hong Kong', offset: 8, diff: 'UTC+8' },
  { id: 'taipei', city: 'Taipei', offset: 8, diff: 'UTC+8' },
  { id: 'singapore', city: 'Singapore', offset: 8, diff: 'UTC+8' },
  { id: 'tokyo', city: 'Tokyo', offset: 9, diff: 'UTC+9' },
  { id: 'seoul', city: 'Seoul', offset: 9, diff: 'UTC+9' },
  { id: 'mumbai', city: 'Mumbai', offset: 5.5, diff: 'UTC+5:30' },
  { id: 'dubai', city: 'Dubai', offset: 4, diff: 'UTC+4' },
  // 欧洲
  { id: 'london', city: 'London', offset: 0, diff: 'UTC+0' },
  { id: 'paris', city: 'Paris', offset: 1, diff: 'UTC+1' },
  { id: 'berlin', city: 'Berlin', offset: 1, diff: 'UTC+1' },
  { id: 'moscow', city: 'Moscow', offset: 3, diff: 'UTC+3' },
  // 美洲
  { id: 'new_york', city: 'New York', offset: -5, diff: 'UTC-5' },
  { id: 'chicago', city: 'Chicago', offset: -6, diff: 'UTC-6' },
  { id: 'denver', city: 'Denver', offset: -7, diff: 'UTC-7' },
  { id: 'los_angeles', city: 'Los Angeles', offset: -8, diff: 'UTC-8' },
  { id: 'sao_paulo', city: 'Sao Paulo', offset: -3, diff: 'UTC-3' },
  // 大洋洲
  { id: 'sydney', city: 'Sydney', offset: 10, diff: 'UTC+10' },
  { id: 'auckland', city: 'Auckland', offset: 12, diff: 'UTC+12' },
  // 其他
  { id: 'utc', city: 'UTC', offset: 0, diff: 'UTC+0' }
]

// 状态
const currentTime = ref(new Date())
const showAddPicker = ref(false)
const is24Hour = ref(uni.getStorageSync('world_clock_24hour') ?? true)
const searchKeyword = ref('')
const dragIndex = ref(-1)
const dragStartY = ref(0)
const itemHeight = 100 // 大约每个item的高度(rpx转px约50px)
const timezones = ref<Timezone[]>(
  uni.getStorageSync('world_clocks') || [
    { id: 'new_york', city: 'New York', offset: -5, diff: 'UTC-5' },
    { id: 'london', city: 'London', offset: 0, diff: 'UTC+0' },
    { id: 'tokyo', city: 'Tokyo', offset: 9, diff: 'UTC+9' }
  ]
)

// 本地时间
const localTime = computed(() => {
  const date = currentTime.value
  return formatTime(date)
})

// 本地日期
const localDate = computed(() => {
  const date = currentTime.value
  return formatDate(date)
})

// 模拟时钟指针角度
const hourDeg = computed(() => {
  const date = currentTime.value
  return (date.getHours() % 12) * 30 + date.getMinutes() * 0.5
})

const minuteDeg = computed(() => {
  const date = currentTime.value
  return date.getMinutes() * 6 + date.getSeconds() * 0.1
})

const secondDeg = computed(() => {
  return currentTime.value.getSeconds() * 6
})

// 可添加的时区（排除已添加的，支持搜索）
const availableTimezones = computed(() => {
  const addedIds = timezones.value.map(tz => tz.id)
  let list = allTimezones.filter(tz => !addedIds.includes(tz.id))

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    list = list.filter(tz => {
      const cityName = t(`worldClock.cities.${tz.id}`).toLowerCase()
      return cityName.includes(keyword) || tz.city.toLowerCase().includes(keyword) || tz.diff.toLowerCase().includes(keyword)
    })
  }

  return list
})

// 格式化时间
const formatTime = (date: Date) => {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (!is24Hour.value) {
    const period = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${period}`
  }

  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`
}

// 星期几数组
const weekdays = computed(() => {
  const locale = settingsStore.language || 'zh'
  return locale === 'zh'
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
})

// 格式化日期
const formatDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day} ${weekdays.value[date.getDay()]}`
}

// 获取时区时间
const getTimezoneTime = (offset: number) => {
  const now = currentTime.value
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const tzTime = new Date(utc + offset * 3600000)
  let hours = tzTime.getHours()
  const minutes = String(tzTime.getMinutes()).padStart(2, '0')

  if (!is24Hour.value) {
    const period = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

// 获取时区日期
const getTimezoneDate = (offset: number) => {
  const now = currentTime.value
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const tzTime = new Date(utc + offset * 3600000)
  const month = String(tzTime.getMonth() + 1).padStart(2, '0')
  const day = String(tzTime.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

// 判断是否是白天 (6:00-18:00)
const isDaytime = (offset: number) => {
  const now = currentTime.value
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const tzTime = new Date(utc + offset * 3600000)
  const hour = tzTime.getHours()
  return hour >= 6 && hour < 18
}

// 获取白天/黑夜图标
const getDayNightIcon = (offset: number) => {
  return isDaytime(offset) ? '☀️' : '🌙'
}

// 获取与本地时间的时差
const getTimeDifference = (offset: number) => {
  const localOffset = -new Date().getTimezoneOffset() / 60
  const diff = offset - localOffset

  if (diff === 0) {
    return t('worldClock.sameAsLocal')
  }

  const absDiff = Math.abs(diff)
  const hours = Math.floor(absDiff)
  const minutes = Math.round((absDiff - hours) * 60)

  let timeStr = `${hours}${t('worldClock.hours')}`
  if (minutes > 0) {
    timeStr += `${minutes}${t('worldClock.minutes')}`
  }

  return diff > 0
    ? t('worldClock.aheadOfLocal', { time: timeStr })
    : t('worldClock.behindLocal', { time: timeStr })
}

// 切换时间格式
const toggleTimeFormat = () => {
  is24Hour.value = !is24Hour.value
  uni.setStorageSync('world_clock_24hour', is24Hour.value)
}

// 拖拽排序
const onDragStart = (index: number, e: TouchEvent) => {
  dragIndex.value = index
  dragStartY.value = e.touches[0].clientY
  uni.vibrateShort({ type: 'light' })
}

const onDragMove = (e: TouchEvent) => {
  if (dragIndex.value < 0) return
  const currentY = e.touches[0].clientY
  const diff = currentY - dragStartY.value
  const moveCount = Math.round(diff / itemHeight)

  if (moveCount !== 0) {
    const newIndex = Math.max(0, Math.min(timezones.value.length - 1, dragIndex.value + moveCount))
    if (newIndex !== dragIndex.value) {
      const item = timezones.value.splice(dragIndex.value, 1)[0]
      timezones.value.splice(newIndex, 0, item)
      dragIndex.value = newIndex
      dragStartY.value = currentY
    }
  }
}

const onDragEnd = () => {
  if (dragIndex.value >= 0) {
    dragIndex.value = -1
    saveTimezones()
  }
}

// 添加时区
const addTimezone = (tz: Timezone) => {
  timezones.value.push(tz)
  saveTimezones()
  showAddPicker.value = false
  searchKeyword.value = ''
  showToast(t('common.success'))
}

// 移除时区
const removeTimezone = (index: number) => {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: t('worldClock.deleteConfirm'),
    success: (res) => {
      if (res.confirm) {
        timezones.value.splice(index, 1)
        saveTimezones()
        showToast(t('common.deleteSuccess'))
      }
    }
  })
}

// 保存时区
const saveTimezones = () => {
  uni.setStorageSync('world_clocks', timezones.value)
}

// 更新时间
let timer: ReturnType<typeof setInterval> | null = null

const startTimer = () => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('worldClock.title')}`,
    path: '/pages/time/world-clock/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('worldClock.title')}`
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('worldClock.title') })
  settingsStore.initTheme()
  startTimer()
})

onHide(() => {
  stopTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>

.clock-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 本地时间
.local-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  text-align: center;
}

.local-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.local-label {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

.local-date {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.local-time {
  font-size: 96rpx;
  font-weight: bold;
  color: var(--primary);
  font-family: monospace;
}

// 模拟时钟
.analog-clock {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.clock-face {
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  border: 4rpx solid var(--text-secondary);
  position: relative;
  background-color: var(--bg-card);
}

.clock-mark {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2rpx;
  height: 100%;
  transform-origin: center center;
}

.mark-major {
  width: 6rpx;
  height: 24rpx;
  background-color: var(--text-primary);
  border-radius: 3rpx;
  margin-left: -3rpx;
}

.mark-minor {
  width: 4rpx;
  height: 12rpx;
  background-color: var(--text-secondary);
  border-radius: 2rpx;
  margin-left: -2rpx;
}

.clock-hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 4rpx;
}

.hour-hand {
  width: 6rpx;
  height: 80rpx;
  margin-left: -3rpx;
  background-color: var(--text-primary);
}

.minute-hand {
  width: 4rpx;
  height: 105rpx;
  margin-left: -2rpx;
  background-color: var(--text-primary);
}

.second-hand {
  width: 2rpx;
  height: 120rpx;
  margin-left: -1rpx;
  background-color: var(--primary);
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16rpx;
  height: 16rpx;
  margin: -8rpx 0 0 -8rpx;
  border-radius: 50%;
  background-color: var(--primary);
}

.time-format-toggle {
  margin-top: $spacing-sm;
  padding: 8rpx 24rpx;
  background-color: var(--bg-hover);
  border-radius: $radius-sm;
  display: inline-block;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

// 时区列表
.timezone-list {
  margin-bottom: $spacing-md;
}

.timezone-item {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  transition: transform 0.15s, box-shadow 0.15s;

  &:last-child {
    margin-bottom: 0;
  }

  &.tz-dragging {
    transform: scale(1.02);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    opacity: 0.9;
    z-index: 10;
    position: relative;
  }
}

.tz-info {
  flex: 1;
}

.tz-city {
  display: flex;
  align-items: center;
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.tz-icon {
  margin-right: 8rpx;
  font-size: $font-size-md;
}

.tz-diff {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.tz-time {
  text-align: right;
  margin-right: $spacing-md;
}

.tz-hour {
  font-size: $font-size-xl;
  font-weight: 500;
  color: var(--text-primary);
  font-family: monospace;
  display: block;
}

.tz-date {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.tz-delete {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  color: var(--error);
  background-color: rgba(255, 77, 79, 0.1);
  border-radius: 50%;

  &:active {
    opacity: 0.7;
  }
}

// 添加按钮
.add-section {
  margin-bottom: $spacing-md;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  border: 2rpx dashed var(--border-light);

  &:active {
    background-color: var(--bg-hover);
  }
}

.add-icon {
  font-size: $font-size-xl;
  color: var(--primary);
  margin-right: $spacing-xs;
}

.add-text {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

// 选择器弹窗
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-bg);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.picker-content {
  width: 100%;
  max-height: 60vh;
  background-color: var(--bg-card);
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
}

.picker-title {
  font-size: $font-size-lg;
  font-weight: 500;
  color: var(--text-primary);
}

.picker-search {
  padding: $spacing-sm $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
}

.picker-search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-hover);
  border-radius: $radius-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  box-sizing: border-box;
}

.picker-empty {
  padding: $spacing-xl;
  text-align: center;
  font-size: $font-size-md;
  color: var(--text-secondary);
}

.picker-list {
  max-height: 50vh;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}

.picker-city {
  font-size: $font-size-md;
  color: var(--text-primary);
}

.picker-diff {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}
</style>
