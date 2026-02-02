<template>
  <view class="list-cell" :class="{ 'has-arrow': arrow }" @click="handleClick">
    <view class="cell-left">
      <view v-if="icon" class="cell-icon">
        <image v-if="icon.startsWith('/')" :src="icon" class="svg-icon" mode="aspectFit" />
        <text v-else>{{ icon }}</text>
      </view>
      <view class="cell-title">{{ title }}</view>
    </view>
    <view class="cell-right">
      <view v-if="value" class="cell-value">{{ value }}</view>
      <slot name="right"></slot>
      <view v-if="arrow" class="cell-arrow">
        <image src="/static/icons/arrow-right.svg" class="svg-icon-arrow" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  value?: string
  icon?: string
  arrow?: boolean
}>(), {
  arrow: true
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>

.list-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  background-color: var(--bg-card);
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}

.cell-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.cell-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: $spacing-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.svg-icon {
  width: 44rpx;
  height: 44rpx;
}

.cell-title {
  font-size: $font-size-md;
  color: var(--text-primary);
}

.cell-right {
  display: flex;
  align-items: center;
}

.cell-value {
  font-size: $font-size-md;
  color: var(--text-secondary);
  margin-right: $spacing-xs;
}

.cell-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-icon-arrow {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}
</style>
