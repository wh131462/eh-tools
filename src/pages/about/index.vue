<template>
  <view class="page about-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('about.title')" />

    <!-- 应用信息 -->
    <view class="app-header">
      <view class="app-logo-wrapper">
        <image class="app-logo" src="/static/eh-tools-logo.svg" mode="aspectFit" />
      </view>
      <text class="app-name">EH Tools</text>
      <text class="app-version">v{{ appVersion }}</text>
      <text class="app-slogan">{{ t('about.slogan') }}</text>
    </view>

    <!-- 信息列表 -->
    <view class="info-section">
      <view class="section-title">
        <image src="/static/icons/info.svg" class="section-icon" mode="aspectFit" />
        <text>{{ t('about.appInfo') }}</text>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">{{ t('about.appName') }}</text>
          <text class="info-value">EH Tools</text>
        </view>
        <view class="info-item">
          <text class="info-label">{{ t('about.version') }}</text>
          <text class="info-value">{{ appVersion }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">{{ t('about.description') }}</text>
          <text class="info-value">{{ t('about.descriptionText') }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">{{ t('about.developer') }}</text>
          <text class="info-value">EternalHeart</text>
        </view>
      </view>
    </view>

    <!-- 链接列表 -->
    <view class="link-section">
      <view class="section-title">
        <image src="/static/icons/globe.svg" class="section-icon" mode="aspectFit" />
        <text>{{ t('about.more') }}</text>
      </view>
      <view class="link-list">
        <view class="link-item" @click="copyProjectUrl">
          <view class="link-left">
            <view class="link-icon-wrapper" style="background: var(--gradient-info);">
              <image src="/static/icons/package.svg" class="link-icon" mode="aspectFit" />
            </view>
            <view class="link-content">
              <text class="link-title">{{ t('about.projectUrl') }}</text>
              <text class="link-desc">{{ t('about.projectUrlDesc') }}</text>
            </view>
          </view>
          <view class="link-right">
            <text class="link-action">{{ t('common.copy') }}</text>
          </view>
        </view>
        <view class="link-item" @click="copyFeedbackUrl">
          <view class="link-left">
            <view class="link-icon-wrapper" style="background: var(--gradient-success);">
              <image src="/static/icons/message.svg" class="link-icon" mode="aspectFit" />
            </view>
            <view class="link-content">
              <text class="link-title">{{ t('about.feedback') }}</text>
              <text class="link-desc">{{ t('about.feedbackDesc') }}</text>
            </view>
          </view>
          <view class="link-right">
            <text class="link-action">{{ t('common.copy') }}</text>
          </view>
        </view>
        <view class="link-item" @click="showDonatePopup = true">
          <view class="link-left">
            <view class="link-icon-wrapper" style="background: var(--gradient-danger);">
              <image src="/static/icons/heart.svg" class="link-icon" mode="aspectFit" />
            </view>
            <view class="link-content">
              <text class="link-title">{{ t('about.donate') }}</text>
              <text class="link-desc">{{ t('about.donateDesc') }}</text>
            </view>
          </view>
          <view class="link-right">
            <image src="/static/icons/arrow-right.svg" class="link-arrow" mode="aspectFit" />
          </view>
        </view>
      </view>
    </view>

    <!-- 赞赏弹窗 -->
    <view v-if="showDonatePopup" class="popup-mask" @click="showDonatePopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ t('about.donateTitle') }}</text>
          <view class="popup-close" @click="showDonatePopup = false">
            <image src="/static/icons/close.svg" class="close-icon" mode="aspectFit" />
          </view>
        </view>
        <view class="popup-body">
          <image
            class="donate-qrcode"
            src="/static/images/donate.png"
            mode="aspectFit"
            @click="previewDonateImage"
          />
          <text class="donate-tip">{{ t('about.donateTip') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { copyToClipboard } from '@/utils'
import { useShare } from '@/composables/useShare'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 应用版本号
const appVersion = __APP_VERSION__

// 赞赏弹窗显示状态
const showDonatePopup = ref(false)

// 项目地址
const PROJECT_URL = 'https://github.com/wh131462/eh-tools'
const FEEDBACK_URL = 'https://github.com/wh131462/eh-tools/issues'

// 复制项目地址
const copyProjectUrl = async () => {
  await copyToClipboard(PROJECT_URL)
}

// 复制反馈地址
const copyFeedbackUrl = async () => {
  await copyToClipboard(FEEDBACK_URL)
}

// 预览赞赏图片
const previewDonateImage = () => {
  uni.previewImage({
    urls: ['/static/images/donate.png'],
    current: 0
  })
}

useShare({ title: t('about.title'), path: '/pages/about/index' })

// 设置导航栏标题
onShow(() => {
  uni.setNavigationBarTitle({
    title: t('about.title')
  })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.about-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

.app-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  margin-bottom: $spacing-md;
  box-shadow: var(--shadow-neumorphic);
}

.app-logo-wrapper {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  margin-bottom: $spacing-md;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.2);
}

.app-logo {
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: $spacing-xs;
}

.app-version {
  font-size: $font-size-sm;
  color: var(--primary);
  background: var(--bg-primary-light);
  padding: 8rpx 24rpx;
  border-radius: $radius-round;
  margin-bottom: $spacing-sm;
}

.app-slogan {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

// 区块标题
.section-title {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: 500;
  color: var(--text-secondary);
}

.section-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: $spacing-xs;
  opacity: 0.6;
}

.info-section {
  margin-bottom: $spacing-md;
}

.info-list {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: var(--shadow-neumorphic);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: $font-size-md;
  color: var(--text-primary);
}

.info-value {
  font-size: $font-size-md;
  color: var(--text-secondary);
  max-width: 400rpx;
  text-align: right;
}

.link-section {
  margin-bottom: $spacing-md;
}

.link-list {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: var(--shadow-neumorphic);
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}

.link-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.link-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;
}

.link-icon {
  width: 44rpx;
  height: 44rpx;
  filter: brightness(0) invert(1);
}

.link-content {
  display: flex;
  flex-direction: column;
}

.link-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.link-desc {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.link-right {
  display: flex;
  align-items: center;
}

.link-action {
  font-size: $font-size-sm;
  color: var(--primary);
  padding: 8rpx 24rpx;
  background: var(--bg-primary-light);
  border-radius: $radius-round;
}

.link-arrow {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}

// 弹窗
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup-content {
  width: 80%;
  max-width: 600rpx;
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid var(--border-light);
}

.popup-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
}

.popup-close {
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

.popup-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg;
}

.donate-qrcode {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: $spacing-md;
  border-radius: $radius-md;
}

.donate-tip {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
}
</style>
