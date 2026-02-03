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
          <view v-for="(item, index) in options" :key="index" class="item">
            {{ typeof item === 'object' ? item.label : item }}{{ suffix }}
          </view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface OptionItem {
  label: string
  value: any
}

const props = withDefaults(defineProps<{
  title?: string
  cancelText?: string
  confirmText?: string
  options: (string | number | OptionItem)[]
  suffix?: string
}>(), {
  title: '请选择',
  cancelText: '取消',
  confirmText: '确定',
  suffix: ''
})

const emit = defineEmits<{
  (e: 'confirm', value: any, index: number): void
  (e: 'cancel'): void
}>()

const visible = ref(false)
const showContent = ref(false)
const pickerValue = ref([0])

const onChange = (e: any) => {
  pickerValue.value = [e.detail.value[0]]
}

const open = (currentValue?: any) => {
  visible.value = true
  nextTick(() => { showContent.value = true })

  if (currentValue !== undefined) {
    const index = props.options.findIndex(item => {
      if (typeof item === 'object') {
        return item.value === currentValue
      }
      return item === currentValue
    })
    pickerValue.value = [index >= 0 ? index : 0]
  } else {
    pickerValue.value = [0]
  }
}

const close = () => {
  showContent.value = false
  setTimeout(() => { visible.value = false }, 200)
}

const handleCancel = () => { close(); emit('cancel') }

const handleConfirm = () => {
  const index = pickerValue.value[0]
  const item = props.options[index]
  const value = typeof item === 'object' ? item.value : item
  emit('confirm', value, index)
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

.picker {
  height: 400rpx;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 500;
  color: var(--text-primary, #333);
}
</style>
