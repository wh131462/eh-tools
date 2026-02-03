<template>
  <view class="page mine-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('mine.title')" :show-back="false" />

    <!-- 用户信息区 -->
    <view class="user-section" @click="goToProfile">
      <view class="user-bg">
        <view class="user-bg-circle circle-1" />
        <view class="user-bg-circle circle-2" />
      </view>
      <view class="user-content">
        <view class="avatar-wrapper">
          <image
            v-if="userInfo.avatar"
            class="avatar"
            :src="userInfo.avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar avatar-default">
            <image src="/static/icons/user.svg" class="avatar-icon" mode="aspectFit" />
          </view>
          <view class="avatar-badge">
            <image src="/static/icons/arrow-right.svg" class="badge-icon" mode="aspectFit" />
          </view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userInfo.isLogin ? userInfo.nickname : t('mine.login') }}</text>
          <text class="user-tip">{{ userInfo.isLogin ? t('mine.viewProfile') : t('profile.chooseAvatar') }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToSettings">
        <view class="menu-left">
          <view class="menu-icon-wrapper" style="background: var(--gradient-primary);">
            <image src="/static/icons/settings.svg" class="menu-icon" mode="aspectFit" />
          </view>
          <view class="menu-content">
            <text class="menu-title">{{ t('mine.settings') }}</text>
            <text class="menu-desc">{{ t('mine.settingsDesc') }}</text>
          </view>
        </view>
        <view class="menu-right">
          <image src="/static/icons/arrow-right.svg" class="menu-arrow" mode="aspectFit" />
        </view>
      </view>
      <view class="menu-item" @click="goToAbout">
        <view class="menu-left">
          <view class="menu-icon-wrapper" style="background: var(--gradient-info);">
            <image src="/static/icons/info.svg" class="menu-icon" mode="aspectFit" />
          </view>
          <view class="menu-content">
            <text class="menu-title">{{ t('mine.about') }}</text>
            <text class="menu-desc">{{ t('mine.aboutDesc') }}</text>
          </view>
        </view>
        <view class="menu-right">
          <image src="/static/icons/arrow-right.svg" class="menu-arrow" mode="aspectFit" />
        </view>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="copyright">
      <view class="copyright-logo">
        <image src="/static/eh-tools-logo.svg" class="logo-img" mode="aspectFit" />
      </view>
      <text class="copyright-text">{{ t('mine.copyright', { years: copyrightYears }) }}</text>
    </view>

    <!-- 悬浮 TabBar -->
    <FloatTabBar />

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="mineShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { ToolShareImageConfig } from '@/utils/shareCanvas'
import FloatTabBar from '@/components/common/FloatTabBar.vue'
import { useUserStore, useSettingsStore } from '@/store'
import { navigateTo, getCopyrightYears } from '@/utils'

const { t } = useI18n()

// 工具分享图配置
const toolShareConfig: ToolShareImageConfig = {
  toolName: '个人中心',
  icon: '👤',
  category: 'default' as const,
  subtitle: '设置与管理'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}
const userStore = useUserStore()
const settingsStore = useSettingsStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 版权年份
const copyrightYears = getCopyrightYears()

// 跳转到个人信息页
const goToProfile = () => {
  navigateTo('/pages/profile/index')
}

// 跳转到设置页
const goToSettings = () => {
  navigateTo('/pages/settings/index')
}

// 跳转到关于页
const goToAbout = () => {
  navigateTo('/pages/about/index')
}

// 设置导航栏标题
const updateNavTitle = () => {
  uni.setNavigationBarTitle({
    title: t('mine.title')
  })
}

// 页面显示时更新标题
onShow(() => {
  updateNavTitle()
  settingsStore.initTheme()
  // 通知 TabBar 更新状态
  uni.$emit('tabbar-update')
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: 'EH Tools - 个人中心',
    path: '/pages/mine/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('home.banner.desc1')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.mine-page {
  min-height: 100vh;
  padding-bottom: calc($tabbar-height + $safe-bottom + $spacing-md);
  box-sizing: border-box;
}

.user-section {
  position: relative;
  margin: $spacing-md;
  padding: $spacing-xl;
  background: var(--gradient-primary);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);

  &:active {
    opacity: 0.95;
  }
}

.user-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.user-bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  &.circle-1 {
    width: 300rpx;
    height: 300rpx;
    top: -100rpx;
    right: -50rpx;
  }

  &.circle-2 {
    width: 200rpx;
    height: 200rpx;
    bottom: -60rpx;
    left: -40rpx;
    background: rgba(255, 255, 255, 0.08);
  }
}

.user-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-right: $spacing-lg;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
}

.avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 70rpx;
  height: 70rpx;
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.avatar-badge {
  position: absolute;
  right: -8rpx;
  bottom: -8rpx;
  width: 48rpx;
  height: 48rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.badge-icon {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.6;
}

.user-info {
  flex: 1;
}

.nickname {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: $spacing-xs;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.user-tip {
  display: block;
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
}

.menu-section {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  margin: 0 $spacing-md $spacing-md;
  overflow: hidden;
  box-shadow: var(--shadow-neumorphic);
}

.menu-item {
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

.menu-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;
}

.menu-icon {
  width: 44rpx;
  height: 44rpx;
  filter: brightness(0) invert(1);
}

.menu-content {
  display: flex;
  flex-direction: column;
}

.menu-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-arrow {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}

.copyright {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
}

.copyright-logo {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: $spacing-sm;
  opacity: 0.3;
}

.logo-img {
  width: 100%;
  height: 100%;
}

.copyright-text {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
}
</style>
