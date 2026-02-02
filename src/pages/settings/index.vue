<template>
  <view class="page settings-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('settings.title')" />

    <!-- 页面标题区 -->
    <view class="page-header">
      <view class="header-icon">
        <image src="/static/icons/settings.svg" class="svg-icon" mode="aspectFit" />
      </view>
      <text class="header-title">{{ t('settings.title') }}</text>
      <text class="header-subtitle">{{ t('settings.subtitle') }}</text>
    </view>

    <view class="settings-section">
      <!-- 语言设置 -->
      <view class="settings-item" @click="showLanguagePicker = true">
        <view class="item-left">
          <view class="item-icon-wrapper" style="background: var(--gradient-info);">
            <image src="/static/icons/language.svg" class="item-icon" mode="aspectFit" />
          </view>
          <view class="item-content">
            <text class="item-title">{{ t('settings.language') }}</text>
            <text class="item-desc">{{ t('settings.languageDesc') }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-value">{{ currentLanguageText }}</text>
          <image src="/static/icons/arrow-right.svg" class="item-arrow" mode="aspectFit" />
        </view>
      </view>

      <!-- 深色模式 -->
      <view class="settings-item">
        <view class="item-left">
          <view class="item-icon-wrapper" style="background: var(--gradient-primary);">
            <image src="/static/icons/moon.svg" class="item-icon" mode="aspectFit" />
          </view>
          <view class="item-content">
            <text class="item-title">{{ t('settings.darkMode') }}</text>
            <text class="item-desc">{{ isDarkMode ? t('settings.darkModeOnDesc') : t('settings.darkModeOffDesc') }}</text>
          </view>
        </view>
        <view class="item-right">
          <switch
            :checked="isDarkMode"
            :color="'#667eea'"
            @change="onThemeChange"
          />
        </view>
      </view>
    </view>

    <!-- 语言选择器 -->
    <view v-if="showLanguagePicker" class="picker-mask" @click="showLanguagePicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">{{ t('settings.language') }}</text>
          <view class="picker-close" @click="showLanguagePicker = false">
            <image src="/static/icons/close.svg" class="close-icon" mode="aspectFit" />
          </view>
        </view>
        <view class="picker-options">
          <view
            class="picker-option"
            :class="{ active: language === 'zh' }"
            @click="selectLanguage('zh')"
          >
            <view class="option-left">
              <text class="option-flag">🇨🇳</text>
              <text class="option-text">{{ t('settings.languageZh') }}</text>
            </view>
            <view v-if="language === 'zh'" class="option-check">
              <image src="/static/icons/check.svg" class="check-icon" mode="aspectFit" />
            </view>
          </view>
          <view
            class="picker-option"
            :class="{ active: language === 'en' }"
            @click="selectLanguage('en')"
          >
            <view class="option-left">
              <text class="option-flag">🇺🇸</text>
              <text class="option-text">{{ t('settings.languageEn') }}</text>
            </view>
            <view v-if="language === 'en'" class="option-check">
              <image src="/static/icons/check.svg" class="check-icon" mode="aspectFit" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import type { Language, ThemeMode } from '@/store'

const { t, locale } = useI18n()
const settingsStore = useSettingsStore()

// 语言选择器显示状态
const showLanguagePicker = ref(false)

// 当前语言
const language = computed(() => settingsStore.language)

// 当前语言文本
const currentLanguageText = computed(() => {
  return language.value === 'zh' ? t('settings.languageZh') : t('settings.languageEn')
})

// 是否深色模式
const isDarkMode = computed(() => settingsStore.themeMode === 'dark')

// 选择语言
const selectLanguage = (lang: Language) => {
  settingsStore.setLanguage(lang)
  locale.value = lang
  showLanguagePicker.value = false

  // 更新导航栏标题
  uni.setNavigationBarTitle({
    title: t('settings.title')
  })
}

// 切换主题
const onThemeChange = (e: any) => {
  const mode: ThemeMode = e.detail.value ? 'dark' : 'light'
  settingsStore.setThemeMode(mode)
}

// 设置导航栏标题
onShow(() => {
  uni.setNavigationBarTitle({
    title: t('settings.title')
  })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.settings-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 页面标题区
.page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl $spacing-md;
  margin-bottom: $spacing-md;
}

.header-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  .svg-icon {
    width: 60rpx;
    height: 60rpx;
    filter: brightness(0) invert(1);
  }
}

.header-title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-xs;
}

.header-subtitle {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.settings-section {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: var(--shadow-neumorphic);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;
}

.item-icon {
  width: 44rpx;
  height: 44rpx;
  filter: brightness(0) invert(1);
}

.item-content {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.item-desc {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-right: $spacing-xs;
}

.item-arrow {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}

// 语言选择器
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-bg);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.picker-content {
  width: 100%;
  background-color: var(--bg-card);
  border-radius: $radius-xl $radius-xl 0 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid var(--border-light);
}

.picker-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
}

.picker-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--bg-sunken);

  &:active {
    opacity: 0.7;
  }
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.6;
}

.picker-options {
  padding: $spacing-md;
}

.picker-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-radius: $radius-md;
  margin-bottom: $spacing-sm;
  background-color: var(--bg-sunken);
  transition: all $transition-fast;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background: var(--bg-primary-light);
    box-shadow: inset 0 0 0 2rpx var(--primary);
  }
}

.option-left {
  display: flex;
  align-items: center;
}

.option-flag {
  font-size: 48rpx;
  margin-right: $spacing-md;
}

.option-text {
  font-size: $font-size-md;
  color: var(--text-primary);
  font-weight: 500;
}

.option-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 28rpx;
  height: 28rpx;
  filter: brightness(0) invert(1);
}
</style>
