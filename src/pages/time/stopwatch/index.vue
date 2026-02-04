<template>
  <view class="page stopwatch-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('stopwatch.title')" />

    <!-- 计时器显示 -->
    <view class="timer-display">
      <view class="timer-ring" :style="ringStyle">
        <view class="timer-inner">
          <text class="timer-text">{{ formatTime(elapsedTime) }}</text>
          <text class="timer-ms">{{ formatMs(elapsedTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <button
        class="control-btn"
        :class="{ disabled: !isRunning && elapsedTime === 0 }"
        :disabled="!isRunning && elapsedTime === 0"
        @click="handleLapOrReset"
      >
        {{ isRunning ? t('stopwatch.lap') : t('common.reset') }}
      </button>
      <button
        class="control-btn primary"
        :class="{ running: isRunning }"
        @click="toggleTimer"
      >
        {{ isRunning ? t('common.stop') : t('common.start') }}
      </button>
    </view>

    <!-- 计次记录 -->
    <view class="laps-section">
      <view class="laps-header">
        <text class="laps-title">{{ t('stopwatch.laps') }}</text>
        <text
          v-if="laps.length > 0"
          class="laps-clear"
          @click="handleClearLaps"
        >
          {{ t('stopwatch.clear') }}
        </text>
      </view>

      <view v-if="laps.length > 0" class="laps-list">
        <view
          v-for="(lap, index) in laps"
          :key="index"
          class="lap-item"
          :class="{ best: lap.isBest, worst: lap.isWorst }"
        >
          <view class="lap-index">
            <text class="lap-number">#{{ laps.length - index }}</text>
            <text v-if="lap.isBest" class="lap-badge best">{{ t('stopwatch.bestLap') }}</text>
            <text v-if="lap.isWorst" class="lap-badge worst">{{ t('stopwatch.worstLap') }}</text>
          </view>
          <view class="lap-times">
            <view class="lap-time-item">
              <text class="lap-time-label">{{ t('stopwatch.lapTime') }}</text>
              <text class="lap-time-value">{{ formatTime(lap.lapTime) }}.{{ formatMs(lap.lapTime) }}</text>
            </view>
            <view class="lap-time-item">
              <text class="lap-time-label">{{ t('stopwatch.totalTime') }}</text>
              <text class="lap-time-value">{{ formatTime(lap.totalTime) }}.{{ formatMs(lap.totalTime) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="laps-empty">
        <text class="empty-text">{{ t('stopwatch.noLaps') }}</text>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="stopwatchShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('stopwatch.title'),
  category: 'time' as const,
  subtitle: '精准计时工具'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 计次记录类型
interface LapRecord {
  lapTime: number
  totalTime: number
  isBest: boolean
  isWorst: boolean
}

// === 状态 ===
const isRunning = ref(false)
const elapsedTime = ref(0) // 毫秒
const laps = ref<LapRecord[]>([])
const lastLapTime = ref(0) // 上次计次时的时间

let timer: number | null = null
let startTime = 0
let pausedTime = 0

// === 计算属性 ===
const ringStyle = computed(() => {
  const progress = isRunning.value ? 1 : (elapsedTime.value > 0 ? 0.5 : 0)
  const deg = progress * 360
  const color = isRunning.value ? '#00b894' : '#667eea'
  return {
    background: `conic-gradient(${color} ${deg}deg, var(--bg-sunken) ${deg}deg)`
  }
})

// === 方法 ===
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatMs = (ms: number): string => {
  return String(Math.floor((ms % 1000) / 10)).padStart(2, '0')
}

const toggleTimer = () => {
  if (isRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  startTime = Date.now() - pausedTime
  timer = setInterval(() => {
    elapsedTime.value = Date.now() - startTime
  }, 10) as unknown as number
}

const stopTimer = () => {
  isRunning.value = false
  pausedTime = elapsedTime.value
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetTimer = () => {
  stopTimer()
  elapsedTime.value = 0
  pausedTime = 0
  lastLapTime.value = 0
  laps.value = []
}

const recordLap = () => {
  const currentTime = elapsedTime.value
  const lapTime = currentTime - lastLapTime.value
  lastLapTime.value = currentTime

  // 添加新计次记录
  const newLap: LapRecord = {
    lapTime,
    totalTime: currentTime,
    isBest: false,
    isWorst: false
  }

  // 插入到列表开头
  laps.value.unshift(newLap)

  // 更新最快/最慢标记
  updateBestWorst()
}

const updateBestWorst = () => {
  if (laps.value.length < 2) return

  // 重置所有标记
  laps.value.forEach(lap => {
    lap.isBest = false
    lap.isWorst = false
  })

  // 找出最快和最慢
  const lapTimes = laps.value.map(lap => lap.lapTime)
  const minTime = Math.min(...lapTimes)
  const maxTime = Math.max(...lapTimes)

  laps.value.forEach(lap => {
    if (lap.lapTime === minTime) lap.isBest = true
    if (lap.lapTime === maxTime) lap.isWorst = true
  })
}

const handleLapOrReset = () => {
  if (isRunning.value) {
    recordLap()
  } else {
    resetTimer()
  }
}

const handleClearLaps = () => {
  uni.showModal({
    title: t('common.confirm'),
    content: t('stopwatch.clearConfirm'),
    success: (res) => {
      if (res.confirm) {
        laps.value = []
        lastLapTime.value = 0
      }
    }
  })
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('stopwatch.title')}`,
    path: '/pages/time/stopwatch/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('stopwatch.title')}`
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.stopwatch-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

// 计时器显示
.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-lg;
  margin-top: $spacing-md;
}

.timer-ring {
  width: 440rpx;
  height: 440rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $transition-fast;
}

.timer-inner {
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  background-color: var(--bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-neumorphic-sm);
}

.timer-text {
  font-size: 72rpx;
  font-weight: bold;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  color: var(--text-primary);
  letter-spacing: 2rpx;
}

.timer-ms {
  font-size: 48rpx;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  color: var(--text-secondary);
  margin-top: $spacing-xs;
}

// 控制按钮
.controls {
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  padding: 0 $spacing-md;
}

.control-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-card);
  border-radius: $radius-round;
  box-shadow: var(--shadow-neumorphic-sm);
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  border: none;
  transition: all $transition-normal;

  &::after {
    border: none;
  }

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.98);
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.primary {
    background: linear-gradient(135deg, #00b894, #00cec9);
    color: #ffffff;
    box-shadow: 0 4rpx 16rpx rgba(0, 184, 148, 0.4);

    &:active {
      box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    }

    &.running {
      background: linear-gradient(135deg, #ff6348, #ff4757);
      box-shadow: 0 4rpx 16rpx rgba(255, 99, 72, 0.4);
    }
  }
}

// 计次记录
.laps-section {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.laps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 1rpx solid var(--border-light);
}

.laps-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
}

.laps-clear {
  font-size: $font-size-sm;
  color: var(--text-secondary);

  &:active {
    opacity: 0.7;
  }
}

.laps-list {
  max-height: 500rpx;
  overflow-y: auto;
}

.lap-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &.best {
    .lap-time-value {
      color: #00b894;
    }
  }

  &.worst {
    .lap-time-value {
      color: #ff6348;
    }
  }
}

.lap-index {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  min-width: 120rpx;
}

.lap-number {
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-secondary);
}

.lap-badge {
  font-size: $font-size-xs;
  padding: 2rpx 8rpx;
  border-radius: $radius-sm;
  font-weight: 500;

  &.best {
    background-color: rgba(0, 184, 148, 0.15);
    color: #00b894;
  }

  &.worst {
    background-color: rgba(255, 99, 72, 0.15);
    color: #ff6348;
  }
}

.lap-times {
  display: flex;
  gap: $spacing-lg;
}

.lap-time-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.lap-time-label {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
  margin-bottom: 2rpx;
}

.lap-time-value {
  font-size: $font-size-md;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  color: var(--text-primary);
  font-weight: 500;
}

.laps-empty {
  padding: $spacing-xl;
  text-align: center;
}

.empty-text {
  font-size: $font-size-md;
  color: var(--text-placeholder);
}
</style>
