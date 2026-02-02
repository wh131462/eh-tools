<template>
  <view class="page time-diff-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('timeDiff.title')" />

    <!-- 时间输入 -->
    <view class="time-section">
      <view class="time-item">
        <view class="time-label">{{ t('timeDiff.startTime') }}</view>
        <picker
          mode="date"
          :value="startDate"
          @change="onStartDateChange"
        >
          <view class="time-picker">
            <text>{{ startDate }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
        <picker
          mode="time"
          :value="startTime"
          @change="onStartTimeChange"
        >
          <view class="time-picker">
            <text>{{ startTime }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <view class="time-item">
        <view class="time-label">{{ t('timeDiff.endTime') }}</view>
        <picker
          mode="date"
          :value="endDate"
          @change="onEndDateChange"
        >
          <view class="time-picker">
            <text>{{ endDate }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
        <picker
          mode="time"
          :value="endTime"
          @change="onEndTimeChange"
        >
          <view class="time-picker">
            <text>{{ endTime }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 快捷选项 -->
    <view class="quick-section">
      <view class="section-title">{{ t('timeDiff.quickOptions') }}</view>
      <view class="quick-buttons">
        <view class="quick-btn" @click="setQuickOption('weekAgo')">
          {{ t('timeDiff.weekAgo') }}
        </view>
        <view class="quick-btn" @click="setQuickOption('monthAgo')">
          {{ t('timeDiff.monthAgo') }}
        </view>
        <view class="quick-btn" @click="setQuickOption('yearAgo')">
          {{ t('timeDiff.yearAgo') }}
        </view>
        <view class="quick-btn" @click="setQuickOption('nextWeek')">
          {{ t('timeDiff.nextWeek') }}
        </view>
      </view>
    </view>

    <!-- 结果显示 -->
    <view class="result-section">
      <view class="section-title">{{ t('timeDiff.result') }}</view>
      <view class="result-grid">
        <view class="result-item">
          <view class="result-value">{{ diffResult.years }}</view>
          <view class="result-label">{{ t('timeDiff.years') }}</view>
        </view>
        <view class="result-item">
          <view class="result-value">{{ diffResult.months }}</view>
          <view class="result-label">{{ t('timeDiff.months') }}</view>
        </view>
        <view class="result-item">
          <view class="result-value">{{ diffResult.weeks }}</view>
          <view class="result-label">{{ t('timeDiff.weeks') }}</view>
        </view>
        <view class="result-item">
          <view class="result-value">{{ diffResult.days }}</view>
          <view class="result-label">{{ t('timeDiff.days') }}</view>
        </view>
        <view class="result-item">
          <view class="result-value">{{ diffResult.hours }}</view>
          <view class="result-label">{{ t('timeDiff.hours') }}</view>
        </view>
        <view class="result-item">
          <view class="result-value">{{ diffResult.minutes }}</view>
          <view class="result-label">{{ t('timeDiff.minutes') }}</view>
        </view>
        <view class="result-item full-width">
          <view class="result-value">{{ diffResult.seconds }}</view>
          <view class="result-label">{{ t('timeDiff.seconds') }}</view>
        </view>
      </view>

      <!-- 总计显示 -->
      <view class="total-section">
        <view class="total-item">
          <text class="total-label">{{ t('timeDiff.totalDays') }}</text>
          <text class="total-value">{{ diffResult.totalDays }} {{ t('timeDiff.dayUnit') }}</text>
        </view>
        <view class="total-item">
          <text class="total-label">{{ t('timeDiff.totalHours') }}</text>
          <text class="total-value">{{ diffResult.totalHours }} {{ t('timeDiff.hourUnit') }}</text>
        </view>
        <view class="total-item">
          <text class="total-label">{{ t('timeDiff.totalMinutes') }}</text>
          <text class="total-value">{{ diffResult.totalMinutes }} {{ t('timeDiff.minuteUnit') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化时间
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 当前时间
const now = new Date()

// 状态
const startDate = ref(formatDate(now))
const startTime = ref(formatTime(now))
const endDate = ref(formatDate(now))
const endTime = ref(formatTime(now))

// 解析日期时间
const parseDateTime = (dateStr: string, timeStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes, 0)
}

// 计算时间差
const diffResult = computed(() => {
  const start = parseDateTime(startDate.value, startTime.value)
  const end = parseDateTime(endDate.value, endTime.value)

  let diffMs = end.getTime() - start.getTime()
  const isNegative = diffMs < 0
  diffMs = Math.abs(diffMs)

  // 总计
  const totalSeconds = Math.floor(diffMs / 1000)
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // 分解计算
  const years = Math.floor(totalDays / 365)
  const remainingDaysAfterYears = totalDays % 365

  const months = Math.floor(remainingDaysAfterYears / 30)
  const remainingDaysAfterMonths = remainingDaysAfterYears % 30

  const weeks = Math.floor(remainingDaysAfterMonths / 7)
  const days = remainingDaysAfterMonths % 7

  const remainingMs = diffMs % (1000 * 60 * 60 * 24)
  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const remainingMsAfterHours = remainingMs % (1000 * 60 * 60)
  const minutes = Math.floor(remainingMsAfterHours / (1000 * 60))
  const seconds = Math.floor((remainingMsAfterHours % (1000 * 60)) / 1000)

  const prefix = isNegative ? '-' : ''

  return {
    years: prefix + years,
    months: prefix + months,
    weeks: prefix + weeks,
    days: prefix + days,
    hours: prefix + hours,
    minutes: prefix + minutes,
    seconds: prefix + seconds,
    totalDays: prefix + totalDays,
    totalHours: prefix + totalHours,
    totalMinutes: prefix + totalMinutes
  }
})

// 日期选择器事件
const onStartDateChange = (e: any) => {
  startDate.value = e.detail.value
}

const onStartTimeChange = (e: any) => {
  startTime.value = e.detail.value
}

const onEndDateChange = (e: any) => {
  endDate.value = e.detail.value
}

const onEndTimeChange = (e: any) => {
  endTime.value = e.detail.value
}

// 快捷选项
const setQuickOption = (option: string) => {
  const now = new Date()

  switch (option) {
    case 'weekAgo': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      startDate.value = formatDate(weekAgo)
      startTime.value = formatTime(weekAgo)
      endDate.value = formatDate(now)
      endTime.value = formatTime(now)
      break
    }
    case 'monthAgo': {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      startDate.value = formatDate(monthAgo)
      startTime.value = formatTime(monthAgo)
      endDate.value = formatDate(now)
      endTime.value = formatTime(now)
      break
    }
    case 'yearAgo': {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      startDate.value = formatDate(yearAgo)
      startTime.value = formatTime(yearAgo)
      endDate.value = formatDate(now)
      endTime.value = formatTime(now)
      break
    }
    case 'nextWeek': {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      startDate.value = formatDate(now)
      startTime.value = formatTime(now)
      endDate.value = formatDate(nextWeek)
      endTime.value = formatTime(nextWeek)
      break
    }
  }
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('timeDiff.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.time-diff-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 时间输入
.time-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.time-item {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.time-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.time-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  font-size: $font-size-md;
  color: var(--text-primary);
  margin-bottom: $spacing-xs;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}

.picker-arrow {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
}

// 快捷选项
.quick-section {
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

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-sm;
}

.quick-btn {
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: var(--primary);
  background-color: var(--bg-primary-light);
  border-radius: $radius-sm;

  &:active {
    opacity: 0.7;
  }
}

// 结果显示
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.result-item {
  text-align: center;
  padding: $spacing-md;
  background-color: var(--bg-page);
  border-radius: $radius-sm;

  &.full-width {
    grid-column: span 3;
  }
}

.result-value {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: $spacing-xs;
}

.result-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

// 总计
.total-section {
  padding-top: $spacing-md;
  border-top: 1rpx solid var(--border-light);
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-xs 0;
}

.total-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.total-value {
  font-size: $font-size-md;
  color: var(--text-primary);
  font-weight: 500;
}
</style>
