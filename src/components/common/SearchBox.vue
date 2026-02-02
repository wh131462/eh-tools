<template>
  <view class="search-box" @click="handleClick">
    <view class="search-box-icon">
      <image src="/static/icons/search.svg" class="svg-icon" mode="aspectFit" />
    </view>
    <input
      v-if="editable"
      class="search-box-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder || t('home.searchPlaceholder')"
      :focus="focus"
      @input="handleInput"
      @confirm="handleConfirm"
    />
    <text v-else class="search-box-placeholder">{{ placeholder || t('home.searchPlaceholder') }}</text>
  </view>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  editable?: boolean
  focus?: boolean
}>(), {
  modelValue: '',
  placeholder: '',
  editable: false,
  focus: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'click'): void
  (e: 'confirm', value: string): void
}>()

const handleClick = () => {
  emit('click')
}

const handleInput = (e: any) => {
  emit('update:modelValue', e.detail.value)
}

const handleConfirm = (e: any) => {
  emit('confirm', e.detail.value)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.search-box {
  margin: 0 $spacing-md $spacing-md;
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: 28rpx 36rpx;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  transition: all $transition-normal;

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
  }
}

.search-box-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .svg-icon {
    width: 40rpx;
    height: 40rpx;
  }
}

.search-box-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 30rpx;
  color: var(--text-primary);
  outline: none;
}

.search-box-placeholder {
  flex: 1;
  font-size: 30rpx;
  color: var(--text-placeholder);
}
</style>
