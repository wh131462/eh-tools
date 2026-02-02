<template>
  <view class="page timestamp-converter-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('timestampConverter.title')" />

    <!-- 当前时间戳 -->
    <view class="main-card">
      <view class="card-title">{{ t('timestampConverter.currentTimestamp') }}</view>
      <view class="current-timestamp">
        <text class="timestamp-value">{{ currentTimestamp }}</text>
        <view class="timestamp-unit">
          <text class="unit-label">{{ t('timestampConverter.seconds') }}</text>
        </view>
      </view>
      <view class="current-datetime">
        <text class="datetime-text">{{ currentDateTime }}</text>
      </view>
    </view>

    <!-- 时间戳转时间 -->
    <view class="main-card">
      <view class="card-title">{{ t('timestampConverter.timestampToTime') }}</view>
      <view class="input-group">
        <input
          v-model="inputTimestamp"
          class="input-field"
          type="number"
          :placeholder="t('timestampConverter.timestampPlaceholder')"
        />
        <view class="unit-switch">
          <view
            class="unit-option"
            :class="{ active: tsUnit === 's' }"
            @click="tsUnit = 's'"
          >
            <text>s</text>
          </view>
          <view
            class="unit-option"
            :class="{ active: tsUnit === 'ms' }"
            @click="tsUnit = 'ms'"
          >
            <text>ms</text>
          </view>
        </view>
      </view>
      <view class="btn-primary btn-block btn-round" @click="convertTimestampToTime">
        <text class="btn-text-white">{{ t('timestampConverter.convert') }}</text>
      </view>
      <view v-if="tsToTimeResult" class="result-box">
        <text class="result-label">{{ t('timestampConverter.result') }}</text>
        <view class="result-row">
          <text class="result-value">{{ tsToTimeResult }}</text>
          <view class="copy-btn" @click="copyText(tsToTimeResult)">
            <text class="copy-text">{{ t('timestampConverter.copy') }}</text>
          </view>
        </view>
      </view>
      <view v-if="tsToTimeError" class="error-text">
        <text>{{ tsToTimeError }}</text>
      </view>
    </view>

    <!-- 时间转时间戳 -->
    <view class="main-card">
      <view class="card-title">{{ t('timestampConverter.timeToTimestamp') }}</view>
      <view class="input-group">
        <picker mode="date" :value="inputDate" @change="onDateChange">
          <view class="picker-field">
            <text :class="{ placeholder: !inputDate }">{{ inputDate || t('timestampConverter.selectDate') }}</text>
          </view>
        </picker>
        <picker mode="time" :value="inputTime" @change="onTimeChange">
          <view class="picker-field">
            <text :class="{ placeholder: !inputTime }">{{ inputTime || t('timestampConverter.selectTime') }}</text>
          </view>
        </picker>
      </view>
      <view class="btn-primary btn-block btn-round" @click="convertTimeToTimestamp">
        <text class="btn-text-white">{{ t('timestampConverter.convert') }}</text>
      </view>
      <view v-if="timeToTsResult" class="result-box">
        <text class="result-label">{{ t('timestampConverter.result') }}</text>
        <view class="result-row">
          <text class="result-value">{{ timeToTsResult.seconds }}</text>
          <text class="result-unit">s</text>
          <view class="copy-btn" @click="copyText(timeToTsResult.seconds)">
            <text class="copy-text">{{ t('timestampConverter.copy') }}</text>
          </view>
        </view>
        <view class="result-row">
          <text class="result-value">{{ timeToTsResult.milliseconds }}</text>
          <text class="result-unit">ms</text>
          <view class="copy-btn" @click="copyText(timeToTsResult.milliseconds)">
            <text class="copy-text">{{ t('timestampConverter.copy') }}</text>
          </view>
        </view>
      </view>
      <view v-if="timeToTsError" class="error-text">
        <text>{{ timeToTsError }}</text>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { getDefaultShareConfig } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 当前时间戳 ===
const currentTimestamp = ref('')
const currentDateTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const updateCurrent = () => {
  const now = Math.floor(Date.now() / 1000)
  currentTimestamp.value = String(now)
  const d = new Date(now * 1000)
  currentDateTime.value = formatDate(d)
}

const formatDate = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// === 时间戳转时间 ===
const inputTimestamp = ref('')
const tsUnit = ref<'s' | 'ms'>('s')
const tsToTimeResult = ref('')
const tsToTimeError = ref('')

const convertTimestampToTime = () => {
  tsToTimeResult.value = ''
  tsToTimeError.value = ''
  const val = Number(inputTimestamp.value)
  if (!inputTimestamp.value || isNaN(val)) {
    tsToTimeError.value = t('timestampConverter.invalidTimestamp')
    return
  }
  const ms = tsUnit.value === 's' ? val * 1000 : val
  const d = new Date(ms)
  if (isNaN(d.getTime())) {
    tsToTimeError.value = t('timestampConverter.invalidTimestamp')
    return
  }
  tsToTimeResult.value = formatDate(d)
}

// === 时间转时间戳 ===
const inputDate = ref('')
const inputTime = ref('')
const timeToTsResult = ref<{ seconds: string; milliseconds: string } | null>(null)
const timeToTsError = ref('')

const onDateChange = (e: any) => {
  inputDate.value = e.detail.value
}
const onTimeChange = (e: any) => {
  inputTime.value = e.detail.value
}

const convertTimeToTimestamp = () => {
  timeToTsResult.value = null
  timeToTsError.value = ''
  if (!inputDate.value || !inputTime.value) {
    timeToTsError.value = t('timestampConverter.invalidDateTime')
    return
  }
  const dateStr = `${inputDate.value} ${inputTime.value}:00`
  const d = new Date(dateStr.replace(/-/g, '/'))
  if (isNaN(d.getTime())) {
    timeToTsError.value = t('timestampConverter.invalidDateTime')
    return
  }
  const ms = d.getTime()
  timeToTsResult.value = {
    seconds: String(Math.floor(ms / 1000)),
    milliseconds: String(ms)
  }
}

// === 复制 ===
const copyText = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: t('common.copySuccess'), icon: 'success' })
    }
  })
}

// === 生命周期 ===
onShow(() => {
  uni.setNavigationBarTitle({ title: t('timestampConverter.title') })
  settingsStore.initTheme()
  updateCurrent()
  timer = setInterval(updateCurrent, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

onShareAppMessage(() => getDefaultShareConfig())
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('timestampConverter.title')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.timestamp-converter-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.card-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.current-timestamp {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.timestamp-value {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: var(--primary);
  font-family: monospace;
}

.unit-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.current-datetime {
  margin-top: $spacing-xs;
}

.datetime-text {
  font-size: $font-size-md;
  color: var(--text-regular);
  font-family: monospace;
}

.input-group {
  margin-bottom: $spacing-md;
}

.input-field {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
  padding: 28rpx 36rpx;
  font-size: $font-size-md;
  color: var(--text-primary);
  margin-bottom: $spacing-sm;
}

.unit-switch {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

.unit-option {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background-color: var(--bg-card);
  box-shadow: var(--shadow-neumorphic-sm);
  font-size: $font-size-md;
  color: var(--text-secondary);
  transition: all $transition-normal;

  &.active {
    background: var(--gradient-primary);
    color: #FFFFFF;
    box-shadow: none;
  }
}

.picker-field {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
  padding: 28rpx 36rpx;
  font-size: $font-size-md;
  color: var(--text-primary);
  margin-bottom: $spacing-sm;

  .placeholder {
    color: var(--text-placeholder);
  }
}

.btn-primary {
  width: calc(100% - $spacing-lg * 2);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-round;
  background: var(--gradient-primary);
  margin-top: $spacing-sm;
  transition: all $transition-normal;

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

.btn-text-white {
  color: #FFFFFF;
  font-size: $font-size-lg;
  font-weight: 600;
}

.result-box {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
}

.result-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
  display: block;
}

.result-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-xs;
}

.result-value {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--primary);
  font-family: monospace;
  flex: 1;
  word-break: break-all;
}

.result-unit {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.copy-btn {
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  background-color: var(--bg-card);
  box-shadow: var(--shadow-neumorphic-sm);

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
  }
}

.copy-text {
  font-size: $font-size-sm;
  color: var(--primary);
}

.error-text {
  margin-top: $spacing-sm;
  font-size: $font-size-sm;
  color: var(--error);
}

</style>
