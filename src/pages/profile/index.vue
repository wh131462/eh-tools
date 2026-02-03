<template>
  <view class="page profile-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('profile.title')" />

    <!-- 头像选择 -->
    <view class="avatar-section">
      <view class="avatar-bg">
        <view class="avatar-bg-circle circle-1" />
        <view class="avatar-bg-circle circle-2" />
      </view>
      <view class="avatar-content">
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <view class="avatar-wrapper">
            <image
              v-if="formData.avatar"
              class="avatar"
              :src="formData.avatar"
              mode="aspectFill"
            />
            <view v-else class="avatar avatar-default">
              <image src="/static/icons/user.svg" class="avatar-icon" mode="aspectFit" />
            </view>
            <view class="avatar-edit">
              <image src="/static/icons/settings.svg" class="edit-icon" mode="aspectFit" />
            </view>
          </view>
          <text class="avatar-tip">{{ t('profile.chooseAvatar') }}</text>
        </button>
      </view>
    </view>

    <!-- 昵称输入 -->
    <view class="form-section">
      <view class="section-title">
        <image src="/static/icons/user.svg" class="section-icon" mode="aspectFit" />
        <text>{{ t('profile.basicInfo') }}</text>
      </view>
      <view class="form-card">
        <view class="form-item">
          <view class="form-left">
            <view class="form-icon-wrapper">
              <image src="/static/icons/user.svg" class="form-icon" mode="aspectFit" />
            </view>
            <text class="form-label">{{ t('profile.nickname') }}</text>
          </view>
          <input
            class="form-input"
            type="nickname"
            :placeholder="t('profile.nicknamePlaceholder')"
            v-model="formData.nickname"
          />
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <!-- 未登录：显示登录按钮 -->
      <button
        v-if="!userInfo.isLogin"
        class="btn-primary"
        @click="handleLogin"
      >
        <image src="/static/icons/user.svg" class="btn-icon" mode="aspectFit" />
        <text>{{ t('profile.loginBtn') }}</text>
      </button>

      <!-- 已登录且有修改：显示保存按钮 -->
      <button
        v-if="userInfo.isLogin && hasChanges"
        class="btn-primary"
        @click="handleSave"
      >
        <image src="/static/icons/check.svg" class="btn-icon" mode="aspectFit" />
        <text>{{ t('profile.saveBtn') }}</text>
      </button>

      <!-- 已登录：显示退出按钮 -->
      <button
        v-if="userInfo.isLogin"
        class="btn-logout"
        @click="handleLogout"
      >
        <text>{{ t('profile.logoutBtn') }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore, useSettingsStore } from '@/store'
import { showToast, showConfirm, navigateBack } from '@/utils'
import { useShare } from '@/composables/useShare'

const { t } = useI18n()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 表单数据
const formData = reactive({
  avatar: userInfo.value.avatar,
  nickname: userInfo.value.nickname
})

// 是否有修改
const hasChanges = computed(() => {
  return formData.avatar !== userInfo.value.avatar ||
    formData.nickname !== userInfo.value.nickname
})

// 选择头像
const onChooseAvatar = (e: any) => {
  formData.avatar = e.detail.avatarUrl
}

// 登录
const handleLogin = () => {
  if (!formData.nickname.trim()) {
    showToast(t('profile.nicknameEmpty'))
    return
  }

  userStore.login(formData.avatar, formData.nickname.trim())
  showToast(t('common.success'), 'success')
  navigateBack()
}

// 保存修改
const handleSave = () => {
  if (!formData.nickname.trim()) {
    showToast(t('profile.nicknameEmpty'))
    return
  }

  userStore.updateUserInfo({
    avatar: formData.avatar,
    nickname: formData.nickname.trim()
  })
  showToast(t('common.saveSuccess'), 'success')
  navigateBack()
}

// 退出登录
const handleLogout = async () => {
  const confirmed = await showConfirm(
    t('common.confirm'),
    t('profile.logoutConfirm')
  )

  if (confirmed) {
    userStore.logout()
    formData.avatar = ''
    formData.nickname = ''
    showToast(t('common.success'), 'success')
    navigateBack()
  }
}

useShare({ title: t('profile.title'), path: '/pages/profile/index' })

// 设置导航栏标题
onShow(() => {
  uni.setNavigationBarTitle({
    title: t('profile.title')
  })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.profile-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

.avatar-section {
  position: relative;
  padding: $spacing-xl;
  background: var(--gradient-primary);
  border-radius: $radius-lg;
  margin-bottom: $spacing-md;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
}

.avatar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.avatar-bg-circle {
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

.avatar-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;

  &::after {
    border: none;
  }
}

.avatar-wrapper {
  position: relative;
  margin-bottom: $spacing-md;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
}

.avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 90rpx;
  height: 90rpx;
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 56rpx;
  height: 56rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.edit-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.6;
}

.avatar-tip {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.9);
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

.form-section {
  margin-bottom: $spacing-md;
}

.form-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: var(--shadow-neumorphic);
}

.form-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
}

.form-left {
  display: flex;
  align-items: center;
  margin-right: $spacing-md;
}

.form-icon-wrapper {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-md;
  background: var(--bg-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-sm;
}

.form-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.8;
}

.form-label {
  font-size: $font-size-md;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input {
  flex: 1;
  height: 80rpx;
  font-size: $font-size-md;
  color: var(--text-primary);
  text-align: right;
}

.action-section {
  margin-top: $spacing-xl;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  background: var(--gradient-primary);
  color: #FFFFFF;
  font-size: $font-size-md;
  font-weight: 500;
  border-radius: $radius-lg;
  border: none;
  margin-bottom: $spacing-md;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.btn-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: $spacing-sm;
  filter: brightness(0) invert(1);
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  background-color: var(--bg-card);
  color: var(--error);
  font-size: $font-size-md;
  font-weight: 500;
  border-radius: $radius-lg;
  border: none;
  margin-top: $spacing-lg;
  box-shadow: var(--shadow-neumorphic);

  &::after {
    border: none;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}
</style>
