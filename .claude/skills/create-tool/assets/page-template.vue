<template>
  <view class="page __TOOL_ID__-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 主内容卡片 -->
    <view class="main-card">
      <!-- 工具功能区 -->
    </view>

    <!-- 结果展示 (可选) -->
    <view v-if="false" class="result-card">
      <!-- 计算/处理结果 -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { getDefaultShareConfig } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 状态 ===

// === 方法 ===

// === 生命周期 ===
onShow(() => {
  uni.setNavigationBarTitle({ title: t('__CAMEL_ID__.title') })
  settingsStore.initTheme()
})

onShareAppMessage(() => getDefaultShareConfig())
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('__CAMEL_ID__.title')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.__TOOL_ID__-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.result-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}
</style>
