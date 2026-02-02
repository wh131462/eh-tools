<template>
  <view class="empty-state">
    <view class="empty-icon">{{ icon }}</view>
    <view class="empty-text">{{ text || t('common.empty') }}</view>
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withDefaults(defineProps<{
  icon?: string
  text?: string
}>(), {
  icon: '📭',
  text: ''
})
</script>

<style lang="scss" scoped>

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 2;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-size-md;
  color: var(--text-placeholder);
}
</style>
