<template>
  <view v-if="visible" class="popup-mask" @click="handleCancel">
    <view class="popup-box" :class="{ show: showContent }" @click.stop>
      <view class="popup-header">
        <text class="btn-cancel" @click="handleCancel">{{ cancelText }}</text>
        <text class="title">{{ title }}</text>
        <text class="btn-confirm" @click="handleConfirm">{{ confirmText }}</text>
      </view>
      <view class="picker-wrapper">
        <picker-view :value="pickerValue" class="picker" @change="onChange">
          <picker-view-column>
            <view v-for="h in hours" :key="h" class="item">{{ String(h).padStart(2, '0') }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in minutes" :key="m" class="item">{{ String(m).padStart(2, '0') }}</view>
          </picker-view-column>
        </picker-view>
        <view class="separator-overlay">:</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  cancelText?: string
  confirmText?: string
  startHour?: number
  endHour?: number
  minuteStep?: number
}>(), {
  title: '选择时间',
  cancelText: '取消',
  confirmText: '确定',
  startHour: 0,
  endHour: 23,
  minuteStep: 1
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const visible = ref(false)
const showContent = ref(false)
const pickerValue = ref([0, 0])

// 小时列表
const hours = computed(() => {
  const arr: number[] = []
  for (let i = props.startHour; i <= props.endHour; i++) arr.push(i)
  return arr
})

// 分钟列表
const minutes = computed(() => {
  const arr: number[] = []
  for (let i = 0; i < 60; i += props.minuteStep) arr.push(i)
  return arr
})

const onChange = (e: any) => {
  const v = e.detail.value
  pickerValue.value = [v[0], v[1]]
}

const open = (timeStr?: string) => {
  visible.value = true
  nextTick(() => { showContent.value = true })

  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    const hi = hours.value.indexOf(h)
    const mi = minutes.value.indexOf(m)
    pickerValue.value = [hi >= 0 ? hi : 0, mi >= 0 ? mi : 0]
  } else {
    const now = new Date()
    const hi = hours.value.indexOf(now.getHours())
    const mi = Math.floor(now.getMinutes() / props.minuteStep)
    pickerValue.value = [hi >= 0 ? hi : 0, mi]
  }
}

const close = () => {
  showContent.value = false
  setTimeout(() => { visible.value = false }, 200)
}

const handleCancel = () => { close(); emit('cancel') }

const handleConfirm = () => {
  const h = String(hours.value[pickerValue.value[0]]).padStart(2, '0')
  const m = String(minutes.value[pickerValue.value[1]]).padStart(2, '0')
  emit('confirm', `${h}:${m}`)
  close()
}

defineExpose({ open, close })
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
}

.popup-box {
  width: 100%;
  background: var(--bg-card, #fff);
  border-radius: 24rpx 24rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.2s;
  padding-bottom: env(safe-area-inset-bottom);

  &.show { transform: translateY(0); }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--border-light, #eee);
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.btn-cancel {
  font-size: 28rpx;
  color: var(--text-secondary, #999);
}

.btn-confirm {
  font-size: 28rpx;
  color: var(--primary, #667eea);
  font-weight: 500;
}

.picker-wrapper {
  position: relative;
  height: 400rpx;
}

.picker {
  height: 100%;
}

.separator-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-primary, #333);
  pointer-events: none;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 500;
  color: var(--text-primary, #333);
  font-family: 'SF Mono', Monaco, monospace;
}
</style>
