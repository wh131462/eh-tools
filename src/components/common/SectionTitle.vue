<template>
  <view class="section-title">
    <view class="title-line"></view>
    <text class="title-text">{{ title }}</text>
    <view class="title-line"></view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: $spacing-lg 0 $spacing-md;
}

.title-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(
    to right,
    transparent,
    var(--border-color),
    transparent
  );
  max-width: 80rpx;
}

.title-text {
  padding: 0 $spacing-md;
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
}
</style>
