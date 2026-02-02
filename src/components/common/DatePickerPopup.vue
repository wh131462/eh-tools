<template>
  <view v-if="visible" class="popup-mask" @click="handleCancel">
    <view class="popup-box" :class="{ show: showContent }" @click.stop>
      <view class="popup-header">
        <text class="btn-cancel" @click="handleCancel">{{ cancelText }}</text>
        <text class="title">{{ title }}</text>
        <text class="btn-confirm" @click="handleConfirm">{{ confirmText }}</text>
      </view>
      <picker-view :value="pickerValue" class="picker" @change="onChange">
        <picker-view-column>
          <view v-for="y in years" :key="y" class="item">{{ y }}年</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="m in 12" :key="m" class="item">{{ m }}月</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="d in days" :key="d" class="item">{{ d }}日</view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  cancelText?: string
  confirmText?: string
  startYear?: number
  endYear?: number
}>(), {
  title: '选择日期',
  cancelText: '取消',
  confirmText: '确定',
  startYear: 1900,
  endYear: new Date().getFullYear()
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const visible = ref(false)
const showContent = ref(false)
const pickerValue = ref([0, 0, 0])

const years = computed(() => {
  const arr: number[] = []
  for (let i = props.startYear; i <= props.endYear; i++) arr.push(i)
  return arr
})

const days = computed(() => {
  const y = years.value[pickerValue.value[0]] || 2000
  const m = pickerValue.value[1] + 1
  return new Date(y, m, 0).getDate()
})

const onChange = (e: any) => {
  const v = e.detail.value
  const maxD = new Date(years.value[v[0]], v[1] + 1, 0).getDate()
  pickerValue.value = [v[0], v[1], Math.min(v[2], maxD - 1)]
}

const open = (dateStr?: string) => {
  visible.value = true
  nextTick(() => { showContent.value = true })
  const d = dateStr ? new Date(dateStr) : new Date()
  const yi = years.value.indexOf(d.getFullYear())
  pickerValue.value = [yi >= 0 ? yi : years.value.length - 1, d.getMonth(), d.getDate() - 1]
}

const close = () => {
  showContent.value = false
  setTimeout(() => { visible.value = false }, 200)
}

const handleCancel = () => { close(); emit('cancel') }

const handleConfirm = () => {
  const y = years.value[pickerValue.value[0]]
  const m = String(pickerValue.value[1] + 1).padStart(2, '0')
  const d = String(pickerValue.value[2] + 1).padStart(2, '0')
  emit('confirm', `${y}-${m}-${d}`)
  close()
}

defineExpose({ open, close })
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
}

.popup-box {
  width: 100%;
  background: #fff;
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
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.btn-cancel {
  font-size: 28rpx;
  color: #999;
}

.btn-confirm {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
}

.picker {
  height: 400rpx;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
}
</style>
