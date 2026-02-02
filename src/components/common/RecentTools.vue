<template>
  <view v-if="recentTools.length > 0" class="recent-tools">
    <view class="section-header">
      <text class="section-title">{{ t('home.recentUsed') }}</text>
    </view>
    <scroll-view class="recent-scroll" scroll-x enable-flex>
      <view class="recent-list">
        <view
          v-for="tool in recentTools"
          :key="tool.id"
          class="recent-item"
          @click="handleClick(tool)"
        >
          <view class="recent-icon" :style="{ background: getCategoryGradient(tool.category) }">
            <image :src="getToolIcon(tool.icon)" class="svg-icon" mode="aspectFit" />
          </view>
          <text class="recent-name">{{ t(tool.nameKey) }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRecentToolsStore } from '@/store'
import { navigateTo } from '@/utils'
import type { Tool, ToolCategory } from '@/types'

const { t } = useI18n()
const recentToolsStore = useRecentToolsStore()

const recentTools = computed(() => recentToolsStore.recentTools)

const categoryGradients: Record<ToolCategory, string> = {
  time: 'var(--gradient-time)',
  calc: 'var(--gradient-calc)',
  text: 'var(--gradient-text)',
  image: 'var(--gradient-image)',
  life: 'var(--gradient-life)'
}

const getCategoryGradient = (category: ToolCategory) => {
  return categoryGradients[category] || 'var(--gradient-primary)'
}

const getToolIcon = (icon: string) => {
  return `/static/icons/${icon}.svg`
}

const handleClick = (tool: Tool) => {
  navigateTo(tool.path)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.recent-tools {
  margin-bottom: $spacing-md;
}

.section-header {
  padding: 0 $spacing-md;
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-secondary);
}

.recent-scroll {
  width: 100%;
  white-space: nowrap;
}

.recent-list {
  display: inline-flex;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
}

.recent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm;
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  min-width: 140rpx;
  cursor: pointer;
  transition: all $transition-normal;

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.96);
  }
}

.recent-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  .svg-icon {
    width: 32rpx;
    height: 32rpx;
    filter: brightness(0) invert(1);
  }
}

.recent-name {
  font-size: 22rpx;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120rpx;
}
</style>
