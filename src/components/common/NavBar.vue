<template>
  <view v-if="visible" class="nav-bar" :class="{ 'theme-dark': isDark }">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 导航栏内容 -->
    <view class="nav-content">
      <!-- 左侧区域 -->
      <view class="nav-left" @click="handleBack">
        <image
          v-if="showBack"
          class="back-icon"
          :src="isDark ? '/static/icons/arrow-left-white.svg' : '/static/icons/arrow-left.svg'"
          mode="aspectFit"
        />
        <slot name="left"></slot>
      </view>
      <!-- 标题 -->
      <view class="nav-title">
        <text class="title-text">{{ title }}</text>
      </view>
      <!-- 右侧区域 -->
      <view class="nav-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
  <!-- 占位，防止内容被导航栏遮挡 -->
  <view v-if="visible && placeholder" class="nav-placeholder" :style="{ height: navHeight + 'px' }"></view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/store'

const settingsStore = useSettingsStore()

const props = withDefaults(defineProps<{
  title?: string
  showBack?: boolean
  visible?: boolean
  placeholder?: boolean
}>(), {
  title: '',
  showBack: true,
  visible: true,
  placeholder: true
})

const emit = defineEmits<{
  back: []
}>()

// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 20
const navContentHeight = 44 // 导航栏内容高度
const navHeight = statusBarHeight + navContentHeight

// 暗色模式
const isDark = computed(() => settingsStore.isDark)

// 返回按钮点击
const handleBack = () => {
  if (!props.showBack) return
  emit('back')
  // 默认返回上一页
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({})
  }
}

// 导出高度信息供外部使用
defineExpose({
  statusBarHeight,
  navContentHeight,
  navHeight
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: var(--bg-page);
  transition: background-color $transition-fast;

  &.theme-dark {
    background-color: $dark-bg-page;
  }
}

.status-bar {
  width: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 $spacing-sm;
}

.nav-left {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.nav-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text {
  font-size: $font-size-lg;
  font-weight: 500;
  color: var(--text-primary);

  .theme-dark & {
    color: $dark-text-primary;
  }
}

.nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.nav-placeholder {
  width: 100%;
}
</style>
