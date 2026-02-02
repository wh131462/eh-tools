<template>
  <view class="welcome-banner" :style="bannerStyle">
    <!-- 装饰圆形 -->
    <view class="welcome-decoration welcome-decoration-1" />
    <view class="welcome-decoration welcome-decoration-2" />

    <!-- 图标 -->
    <view class="welcome-icon">
      <image :src="iconSrc" class="svg-icon" mode="aspectFit" />
    </view>

    <!-- 标题 -->
    <view class="welcome-title">{{ greeting }}</view>

    <!-- 副标题 -->
    <view class="welcome-subtitle">{{ subtitle }}</view>

  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/modules/settings'

const { t } = useI18n()

withDefaults(defineProps<{
  showVersion?: boolean
  versionText?: string
}>(), {
  showVersion: true,
  versionText: ''
})

const settingsStore = useSettingsStore()

// 根据时间段显示不同的问候语和图标
const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) {
    return { text: t('home.greeting.morning'), icon: '/static/icons/sun.svg', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
  } else if (hour >= 12 && hour < 18) {
    return { text: t('home.greeting.afternoon'), icon: '/static/icons/sun.svg', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  } else if (hour >= 18 && hour < 22) {
    return { text: t('home.greeting.evening'), icon: '/static/icons/moon.svg', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  } else {
    return { text: t('home.greeting.night'), icon: '/static/icons/moon.svg', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }
  }
})

const greeting = computed(() => timeGreeting.value.text)
const iconSrc = computed(() => {
  // 深色模式显示月亮图标
  if (settingsStore.isDark) {
    return '/static/icons/moon.svg'
  }
  return timeGreeting.value.icon
})

const bannerStyle = computed(() => {
  if (settingsStore.isDark) {
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  }
  return {
    background: timeGreeting.value.gradient
  }
})

const subtitle = computed(() => {
  if (settingsStore.isDark) {
    return t('home.darkModeSubtitle')
  }
  return t('home.welcomeSubtitle')
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.welcome-banner {
  position: relative;
  margin: $spacing-md;
  padding: $spacing-xl;
  border-radius: $radius-xl;
  overflow: hidden;
}

.welcome-decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  &-1 {
    top: -100rpx;
    right: -60rpx;
    width: 400rpx;
    height: 400rpx;
  }

  &-2 {
    bottom: -60rpx;
    left: -40rpx;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.08);
  }
}

.welcome-icon {
  position: relative;
  z-index: 1;
  margin-bottom: $spacing-sm;

  .svg-icon {
    width: 80rpx;
    height: 80rpx;
  }
}

.welcome-title {
  position: relative;
  z-index: 1;
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: $spacing-xs;
}

.welcome-subtitle {
  position: relative;
  z-index: 1;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.welcome-version {
  position: relative;
  z-index: 1;
  display: inline-block;
  margin-top: $spacing-md;
  padding: 12rpx 28rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-round;
  font-size: 24rpx;
  color: #ffffff;
  backdrop-filter: blur(4px);
}
</style>
