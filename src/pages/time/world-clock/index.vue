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
      <view class="local-time">{{ localTime }}</view>
    </view>

    <!-- 时区列表 -->
    <view class="timezone-list">
      <view
        v-for="(tz, index) in timezones"
        :key="tz.id"
        class="timezone-item"
      >
        <view class="tz-info">
          <view class="tz-city">{{ tz.city }}</view>
          <view class="tz-diff">{{ tz.diff }}</view>
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
    <view v-if="showAddPicker" class="picker-mask" @click="showAddPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">{{ t('worldClock.selectTimezone') }}</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view
            v-for="tz in availableTimezones"
            :key="tz.id"
            class="picker-item"
            @click="addTimezone(tz)"
          >
            <view class="picker-city">{{ tz.city }}</view>
            <view class="picker-diff">{{ tz.diff }}</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onHide } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

interface Timezone {
  id: string
  city: string
  offset: number
  diff: string
}

// 预设时区
const allTimezones: Timezone[] = [
  { id: 'utc', city: 'UTC', offset: 0, diff: 'UTC+0' },
  { id: 'london', city: 'London', offset: 0, diff: 'UTC+0' },
  { id: 'paris', city: 'Paris', offset: 1, diff: 'UTC+1' },
  { id: 'berlin', city: 'Berlin', offset: 1, diff: 'UTC+1' },
  { id: 'moscow', city: 'Moscow', offset: 3, diff: 'UTC+3' },
  { id: 'dubai', city: 'Dubai', offset: 4, diff: 'UTC+4' },
  { id: 'mumbai', city: 'Mumbai', offset: 5.5, diff: 'UTC+5:30' },
  { id: 'singapore', city: 'Singapore', offset: 8, diff: 'UTC+8' },
  { id: 'hongkong', city: 'Hong Kong', offset: 8, diff: 'UTC+8' },
  { id: 'tokyo', city: 'Tokyo', offset: 9, diff: 'UTC+9' },
  { id: 'seoul', city: 'Seoul', offset: 9, diff: 'UTC+9' },
  { id: 'sydney', city: 'Sydney', offset: 10, diff: 'UTC+10' },
  { id: 'auckland', city: 'Auckland', offset: 12, diff: 'UTC+12' },
  { id: 'los_angeles', city: 'Los Angeles', offset: -8, diff: 'UTC-8' },
  { id: 'denver', city: 'Denver', offset: -7, diff: 'UTC-7' },
  { id: 'chicago', city: 'Chicago', offset: -6, diff: 'UTC-6' },
  { id: 'new_york', city: 'New York', offset: -5, diff: 'UTC-5' },
  { id: 'sao_paulo', city: 'Sao Paulo', offset: -3, diff: 'UTC-3' }
]

// 状态
const currentTime = ref(new Date())
const showAddPicker = ref(false)
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

// 可添加的时区（排除已添加的）
const availableTimezones = computed(() => {
  const addedIds = timezones.value.map(tz => tz.id)
  return allTimezones.filter(tz => !addedIds.includes(tz.id))
})

// 格式化时间
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 格式化日期
const formatDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${month}/${day} ${weekdays[date.getDay()]}`
}

// 获取时区时间
const getTimezoneTime = (offset: number) => {
  const now = currentTime.value
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const tzTime = new Date(utc + offset * 3600000)
  const hours = String(tzTime.getHours()).padStart(2, '0')
  const minutes = String(tzTime.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
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

// 添加时区
const addTimezone = (tz: Timezone) => {
  timezones.value.push(tz)
  saveTimezones()
  showAddPicker.value = false
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

  &:last-child {
    margin-bottom: 0;
  }
}

.tz-info {
  flex: 1;
}

.tz-city {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
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
