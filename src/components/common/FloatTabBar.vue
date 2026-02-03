<template>
  <view class="float-tabbar">
    <view
      v-for="(item, index) in localizedTabs"
      :key="item.path"
      class="tabbar-item"
      :class="{ active: currentIndex === index }"
      @click="handleClick(item, index)"
    >
      <view class="tabbar-item-icon">
        <!-- 双图标预渲染，避免切换时图片加载闪烁 -->
        <image
          :src="item.icon"
          class="tab-icon"
          :class="{ 'is-hidden': currentIndex === index }"
          mode="aspectFit"
        />
        <image
          :src="item.activeIcon"
          class="tab-icon icon-active"
          :class="{ 'is-visible': currentIndex === index }"
          mode="aspectFit"
        />
      </view>
      <text class="tabbar-item-label">{{ item.text }}</text>
    </view>
  </view>
</template>

<script lang="ts">
export interface TabItem {
  path: string
  textKey: string
  icon: string
  activeIcon: string
}

export const defaultTabs: TabItem[] = [
  {
    path: '/pages/index/index',
    textKey: 'tabbar.home',
    icon: '/static/icons/home.svg',
    activeIcon: '/static/icons/home-filled.svg'
  },
  {
    path: '/pages/favorites/index',
    textKey: 'tabbar.favorites',
    icon: '/static/icons/star.svg',
    activeIcon: '/static/icons/star-filled.svg'
  },
  {
    path: '/pages/mine/index',
    textKey: 'tabbar.mine',
    icon: '/static/icons/user.svg',
    activeIcon: '/static/icons/user-filled.svg'
  }
]
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  tabs?: TabItem[]
}>(), {
  tabs: () => defaultTabs
})

// 使用 computed 确保语言切换时文字能响应式更新
const localizedTabs = computed(() => {
  return props.tabs.map(tab => ({
    ...tab,
    text: t(tab.textKey)
  }))
})

const currentIndex = ref(0)

// 获取当前页面路径并更新索引
const updateCurrentIndex = () => {
  const pages = getCurrentPages()
  if (pages.length === 0) return

  const currentPage = pages[pages.length - 1]
  const currentPath = '/' + currentPage.route

  // 找到当前路径对应的 tab 索引
  const index = props.tabs.findIndex(tab => tab.path === currentPath)
  if (index !== -1) {
    currentIndex.value = index
  }
}

onMounted(() => {
  updateCurrentIndex()

  // 监听页面显示事件，更新当前索引
  uni.$on('tabbar-update', updateCurrentIndex)
})

// 组件卸载时移除监听
onUnmounted(() => {
  uni.$off('tabbar-update', updateCurrentIndex)
})

const handleClick = (item: { path: string; text: string }, index: number) => {
  if (currentIndex.value === index) return

  currentIndex.value = index

  // tabBar 页面使用 switchTab
  uni.switchTab({
    url: item.path
  })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.float-tabbar {
  position: fixed;
  bottom: calc(#{$safe-bottom} + 32rpx);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 9999rpx;
  box-shadow:
    0 8rpx 32rpx rgba(102, 126, 234, 0.15),
    0 2rpx 8rpx rgba(0, 0, 0, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  padding: 12rpx 24rpx;
  display: flex;
  gap: 8rpx;
  z-index: 9999;
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

// 暗色主题适配
:global(.theme-dark) .float-tabbar {
  background: rgba(30, 30, 46, 0.95);
  box-shadow:
    0 8rpx 32rpx rgba(0, 0, 0, 0.3),
    0 2rpx 8rpx rgba(0, 0, 0, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.tabbar-item {
  width: 100rpx;
  height: 80rpx;
  border-radius: 9999rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow:
      0 6rpx 24rpx rgba(102, 126, 234, 0.5),
      0 2rpx 8rpx rgba(118, 75, 162, 0.3);
    padding: 0 28rpx;
    width: auto;
    min-width: 140rpx;
  }

  &:not(.active):active {
    transform: scale(0.95);
    background: rgba(102, 126, 234, 0.1);
  }
}

.tabbar-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 44rpx;
  height: 44rpx;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  .active & {
    transform: scale(1.15);
  }
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.85;
  transition: opacity 0.25s ease-out;
  transform: translateZ(0);

  // 普通图标隐藏
  &.is-hidden {
    opacity: 0;
  }

  // 激活图标默认隐藏
  &.icon-active {
    opacity: 0;
    filter: brightness(0) invert(1);

    // 激活时显示
    &.is-visible {
      opacity: 1;
    }
  }
}

// 暗色主题下未激活图标
:global(.theme-dark) .tab-icon:not(.icon-active):not(.is-hidden) {
  opacity: 0.7;
}

.tabbar-item-label {
  font-size: 20rpx;
  font-weight: 500;
  color: #667eea;
  max-width: 80rpx;
  overflow: hidden;
  opacity: 0.85;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  .active & {
    color: #ffffff;
    max-width: 120rpx;
    opacity: 1;
    font-weight: 600;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
  }
}

// 暗色主题适配
:global(.theme-dark) .tabbar-item:not(.active) .tabbar-item-label {
  color: #a0aec0;
}
</style>
