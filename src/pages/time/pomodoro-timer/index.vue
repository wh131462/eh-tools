<template>
  <view class="page pomodoro-timer-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('pomodoroTimer.title')" />

    <!-- 状态标签 -->
    <view class="status-tabs">
      <view
        class="status-tab"
        :class="{ active: currentPhase === 'focus' }"
        @click="switchPhase('focus')"
      >
        {{ t('pomodoroTimer.focusTime') }}
      </view>
      <view
        class="status-tab"
        :class="{ active: currentPhase === 'shortBreak' }"
        @click="switchPhase('shortBreak')"
      >
        {{ t('pomodoroTimer.shortBreak') }}
      </view>
      <view
        class="status-tab"
        :class="{ active: currentPhase === 'longBreak' }"
        @click="switchPhase('longBreak')"
      >
        {{ t('pomodoroTimer.longBreak') }}
      </view>
    </view>

    <!-- 计时器显示 -->
    <view class="timer-display">
      <view class="timer-ring" :style="ringStyle">
        <view class="timer-inner">
          <text class="timer-text">{{ formatTime(remainingSeconds) }}</text>
          <text class="timer-phase">{{ phaseLabel }}</text>
        </view>
      </view>
    </view>

    <!-- 轮次指示器 -->
    <view class="round-indicator">
      <view
        v-for="i in config.longBreakInterval"
        :key="i"
        class="round-dot"
        :class="{ completed: i <= currentRound }"
      />
    </view>
    <text class="round-text">{{ t('pomodoroTimer.round') }} {{ currentRound }} / {{ config.longBreakInterval }}</text>

    <!-- 控制按钮 -->
    <view class="controls">
      <button class="control-btn primary" @click="toggleTimer">
        {{ isRunning ? t('common.pause') : t('common.start') }}
      </button>
      <button class="control-btn" @click="resetTimer">
        {{ t('common.reset') }}
      </button>
    </view>

    <!-- 今日统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ todayFocusMinutes }}</text>
        <text class="stat-label">{{ t('pomodoroTimer.todayFocus') }} ({{ t('pomodoroTimer.minuteUnit') }})</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ todayRounds }}</text>
        <text class="stat-label">{{ t('pomodoroTimer.todayRounds') }} ({{ t('pomodoroTimer.roundUnit') }})</text>
      </view>
    </view>

    <!-- 设置区域 -->
    <view class="settings-card">
      <text class="settings-title">{{ t('pomodoroTimer.settings') }}</text>

      <view class="setting-row">
        <text class="setting-label">{{ t('pomodoroTimer.focusMinutes') }}</text>
        <view class="setting-control">
          <view class="stepper-btn" @click="adjustConfig('focusMinutes', -5)">-</view>
          <text class="setting-value">{{ config.focusMinutes }} {{ t('pomodoroTimer.minuteUnit') }}</text>
          <view class="stepper-btn" @click="adjustConfig('focusMinutes', 5)">+</view>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">{{ t('pomodoroTimer.shortBreakMinutes') }}</text>
        <view class="setting-control">
          <view class="stepper-btn" @click="adjustConfig('shortBreakMinutes', -1)">-</view>
          <text class="setting-value">{{ config.shortBreakMinutes }} {{ t('pomodoroTimer.minuteUnit') }}</text>
          <view class="stepper-btn" @click="adjustConfig('shortBreakMinutes', 1)">+</view>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">{{ t('pomodoroTimer.longBreakMinutes') }}</text>
        <view class="setting-control">
          <view class="stepper-btn" @click="adjustConfig('longBreakMinutes', -5)">-</view>
          <text class="setting-value">{{ config.longBreakMinutes }} {{ t('pomodoroTimer.minuteUnit') }}</text>
          <view class="stepper-btn" @click="adjustConfig('longBreakMinutes', 5)">+</view>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">{{ t('pomodoroTimer.longBreakInterval') }}</text>
        <view class="setting-control">
          <view class="stepper-btn" @click="adjustConfig('longBreakInterval', -1)">-</view>
          <text class="setting-value">{{ config.longBreakInterval }} {{ t('pomodoroTimer.roundUnit') }}</text>
          <view class="stepper-btn" @click="adjustConfig('longBreakInterval', 1)">+</view>
        </view>
      </view>
    </view>
    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="pomodoroTimerShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('pomodoroTimer.title'),
  icon: '🍅',
  category: 'time' as const,
  subtitle: '专注时间管理'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// === 类型 ===
type Phase = 'focus' | 'shortBreak' | 'longBreak'

// === 配置 ===
const config = reactive({
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4
})

// === 状态 ===
const currentPhase = ref<Phase>('focus')
const remainingSeconds = ref(config.focusMinutes * 60)
const isRunning = ref(false)
const currentRound = ref(1)
const todayFocusMinutes = ref(0)
const todayRounds = ref(0)

let timer: number | null = null
let lastTickTime = 0

// === 计算属性 ===
const totalSeconds = computed(() => {
  switch (currentPhase.value) {
    case 'focus': return config.focusMinutes * 60
    case 'shortBreak': return config.shortBreakMinutes * 60
    case 'longBreak': return config.longBreakMinutes * 60
  }
})

const progress = computed(() => {
  if (totalSeconds.value === 0) return 0
  return 1 - remainingSeconds.value / totalSeconds.value
})

const ringStyle = computed(() => {
  const deg = progress.value * 360
  const color = currentPhase.value === 'focus' ? '#ff6348' : '#2ed573'
  return {
    background: `conic-gradient(${color} ${deg}deg, var(--bg-sunken) ${deg}deg)`
  }
})

const phaseLabel = computed(() => {
  switch (currentPhase.value) {
    case 'focus': return t('pomodoroTimer.focusTime')
    case 'shortBreak': return t('pomodoroTimer.shortBreak')
    case 'longBreak': return t('pomodoroTimer.longBreak')
  }
})

// === 方法 ===
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const switchPhase = (phase: Phase) => {
  if (isRunning.value) return
  currentPhase.value = phase
  remainingSeconds.value = totalSeconds.value
}

const toggleTimer = () => {
  if (isRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  if (remainingSeconds.value <= 0) return
  isRunning.value = true
  lastTickTime = Date.now()
  timer = setInterval(() => {
    const now = Date.now()
    const elapsed = Math.floor((now - lastTickTime) / 1000)
    if (elapsed >= 1) {
      lastTickTime = now
      remainingSeconds.value = Math.max(0, remainingSeconds.value - elapsed)
      if (remainingSeconds.value <= 0) {
        onPhaseComplete()
      }
    }
  }, 200) as unknown as number
}

const stopTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetTimer = () => {
  stopTimer()
  remainingSeconds.value = totalSeconds.value
}

const onPhaseComplete = () => {
  stopTimer()

  if (currentPhase.value === 'focus') {
    // 记录专注统计
    todayFocusMinutes.value += config.focusMinutes
    todayRounds.value += 1
    saveTodayStats()

    // 判断下一阶段
    if (currentRound.value >= config.longBreakInterval) {
      currentPhase.value = 'longBreak'
      currentRound.value = 1
    } else {
      currentPhase.value = 'shortBreak'
      currentRound.value += 1
    }

    uni.showModal({
      title: t('pomodoroTimer.focusCompleted'),
      content: t('pomodoroTimer.focusMsg'),
      showCancel: false
    })
  } else {
    // 休息结束，回到专注
    currentPhase.value = 'focus'

    uni.showModal({
      title: t('pomodoroTimer.breakCompleted'),
      content: t('pomodoroTimer.breakMsg'),
      showCancel: false
    })
  }

  remainingSeconds.value = totalSeconds.value
}

const adjustConfig = (key: keyof typeof config, delta: number) => {
  if (isRunning.value) return
  const newVal = config[key] + delta
  if (key === 'longBreakInterval') {
    config[key] = Math.max(1, Math.min(10, newVal))
  } else {
    config[key] = Math.max(1, Math.min(120, newVal))
  }
  // 同步更新当前计时
  remainingSeconds.value = totalSeconds.value
}

// === 持久化 ===
const STATS_KEY = 'pomodoro_today_stats'

const loadTodayStats = () => {
  try {
    const data = uni.getStorageSync(STATS_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      const today = new Date().toDateString()
      if (parsed.date === today) {
        todayFocusMinutes.value = parsed.focusMinutes || 0
        todayRounds.value = parsed.rounds || 0
      }
    }
  } catch {
    // ignore
  }
}

const saveTodayStats = () => {
  const today = new Date().toDateString()
  uni.setStorageSync(STATS_KEY, JSON.stringify({
    date: today,
    focusMinutes: todayFocusMinutes.value,
    rounds: todayRounds.value
  }))
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
  loadTodayStats()
})

onUnmounted(() => {
  stopTimer()
})

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('pomodoroTimer.title')}`,
    path: '/pages/time/pomodoro-timer/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('pomodoroTimer.title')}`
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.pomodoro-timer-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

// 状态标签
.status-tabs {
  display: flex;
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-xs;
  margin-bottom: $spacing-lg;
}

.status-tab {
  flex: 1;
  text-align: center;
  padding: $spacing-sm 0;
  font-size: $font-size-md;
  color: var(--text-secondary);
  border-radius: $radius-md;
  transition: all $transition-normal;

  &.active {
    background-color: var(--primary);
    color: #ffffff;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
  }
}

// 计时器
.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

.timer-ring {
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $transition-fast;
}

.timer-inner {
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background-color: var(--bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-neumorphic-sm);
}

.timer-text {
  font-size: 80rpx;
  font-weight: bold;
  font-family: monospace;
  color: var(--text-primary);
}

.timer-phase {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-top: $spacing-xs;
}

// 轮次指示器
.round-indicator {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
}

.round-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: var(--bg-sunken);
  transition: all $transition-normal;

  &.completed {
    background-color: #ff6348;
  }
}

.round-text {
  display: block;
  text-align: center;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-lg;
}

// 控制按钮
.controls {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.control-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  font-size: $font-size-lg;
  color: var(--text-primary);
  border: none;

  &::after {
    border: none;
  }

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.98);
  }

  &.primary {
    background: linear-gradient(135deg, #ff6348, #ff4757);
    color: #ffffff;
    box-shadow: 0 4rpx 16rpx rgba(255, 99, 72, 0.4);

    &:active {
      box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    }
  }
}

// 统计卡片
.stats-card {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.stat-value {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.stat-divider {
  width: 2rpx;
  height: 64rpx;
  background-color: var(--border-light);
}

// 设置卡片
.settings-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.settings-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid var(--border-light);
  }
}

.setting-label {
  font-size: $font-size-md;
  color: var(--text-primary);
}

.setting-control {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.stepper-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-elevated);
  border-radius: $radius-sm;
  font-size: $font-size-lg;
  color: var(--text-primary);
  font-weight: bold;

  &:active {
    background-color: var(--bg-sunken);
  }
}

.setting-value {
  font-size: $font-size-md;
  color: var(--text-regular);
  min-width: 120rpx;
  text-align: center;
}

</style>
