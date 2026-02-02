<template>
  <view class="page countdown-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('countdown.title')" />

    <!-- 时间显示 -->
    <view class="time-display" @click="showTimePicker = true">
      <text class="time-text">{{ formatTime(remainingSeconds) }}</text>
    </view>

    <!-- 快捷按钮 -->
    <view class="presets">
      <view class="preset-title">{{ t('countdown.presets') }}</view>
      <view class="preset-grid">
        <view
          v-for="preset in presets"
          :key="preset.seconds"
          class="preset-btn"
          @click="setPreset(preset.seconds)"
        >
          {{ preset.label }}
        </view>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <button
        class="control-btn primary"
        @click="toggleTimer"
      >
        {{ isRunning ? t('common.pause') : t('common.start') }}
      </button>
      <button
        class="control-btn"
        @click="resetTimer"
      >
        {{ t('common.reset') }}
      </button>
    </view>

    <!-- 时间选择器 -->
    <view v-if="showTimePicker" class="picker-mask" @click="showTimePicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-cancel" @click="showTimePicker = false">{{ t('common.cancel') }}</text>
          <text class="picker-title">{{ t('countdown.setTime') }}</text>
          <text class="picker-confirm" @click="confirmTime">{{ t('common.confirm') }}</text>
        </view>
        <picker-view class="picker-view" :value="pickerValue" @change="onPickerChange">
          <picker-view-column>
            <view v-for="h in 24" :key="h" class="picker-item">{{ h - 1 }} {{ t('countdown.hour') }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in 60" :key="m" class="picker-item">{{ m - 1 }} {{ t('countdown.minuteUnit') }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="s in 60" :key="s" class="picker-item">{{ s - 1 }} {{ t('countdown.secondUnit') }}</view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { formatTime as formatTimeUtil } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 状态
const remainingSeconds = ref(0)
const isRunning = ref(false)
const showTimePicker = ref(false)
const pickerValue = ref([0, 0, 0])

let timer: number | null = null

// 预设选项
const presets = computed(() => [
  { label: `1 ${t('countdown.minute')}`, seconds: 60 },
  { label: `3 ${t('countdown.minute')}`, seconds: 180 },
  { label: `5 ${t('countdown.minute')}`, seconds: 300 },
  { label: `10 ${t('countdown.minute')}`, seconds: 600 },
  { label: `15 ${t('countdown.minute')}`, seconds: 900 },
  { label: `30 ${t('countdown.minute')}`, seconds: 1800 }
])

// 格式化时间
const formatTime = (seconds: number) => formatTimeUtil(seconds)

// 设置预设时间
const setPreset = (seconds: number) => {
  stopTimer()
  remainingSeconds.value = seconds
}

// 选择器变化
const onPickerChange = (e: any) => {
  pickerValue.value = e.detail.value
}

// 确认时间
const confirmTime = () => {
  const [h, m, s] = pickerValue.value
  remainingSeconds.value = h * 3600 + m * 60 + s
  showTimePicker.value = false
}

// 开始/暂停
const toggleTimer = () => {
  if (isRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

// 开始计时
const startTimer = () => {
  if (remainingSeconds.value <= 0) return

  isRunning.value = true
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      stopTimer()
      showFinishDialog()
    }
  }, 1000) as unknown as number
}

// 停止计时
const stopTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 重置
const resetTimer = () => {
  stopTimer()
  remainingSeconds.value = 0
}

// 显示完成对话框
const showFinishDialog = () => {
  uni.showModal({
    title: t('countdown.finishedTitle'),
    content: t('countdown.finished'),
    showCancel: false
  })
}

// 页面卸载时清除定时器
onUnmounted(() => {
  stopTimer()
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('countdown.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.countdown-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 2;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  margin-bottom: $spacing-lg;
}

.time-text {
  font-size: 96rpx;
  font-weight: bold;
  font-family: monospace;
  color: var(--text-primary);
}

.presets {
  margin-bottom: $spacing-lg;
}

.preset-title {
  font-size: $font-size-md;
  color: var(--text-secondary);
  margin-bottom: $spacing-md;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.preset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background-color: var(--bg-card);
  border-radius: $radius-sm;
  font-size: $font-size-md;
  color: var(--text-primary);

  &:active {
    background-color: var(--bg-hover);
  }
}

.controls {
  display: flex;
  gap: $spacing-md;
}

.control-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-card);
  border-radius: $radius-sm;
  font-size: $font-size-md;
  color: var(--text-primary);
  border: none;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }

  &.primary {
    background-color: var(--primary);
    color: #FFFFFF;
  }
}

// 时间选择器
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
  background-color: var(--bg-card);
  border-radius: $radius-lg $radius-lg 0 0;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
}

.picker-cancel {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

.picker-title {
  font-size: $font-size-lg;
  font-weight: 500;
  color: var(--text-primary);
}

.picker-confirm {
  font-size: $font-size-md;
  color: var(--primary);
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-lg;
  color: var(--text-primary);
}
</style>
