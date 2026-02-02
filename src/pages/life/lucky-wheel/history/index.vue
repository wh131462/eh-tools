<template>
  <view class="page history-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('luckyWheel.historyPage.title')" />

    <!-- 历史列表 -->
    <view v-if="history.length > 0" class="history-list">
      <view
        v-for="record in history"
        :key="record.id"
        class="history-item"
        @longpress="deleteRecord(record)"
      >
        <view class="record-info">
          <view class="record-result">{{ record.itemName }}</view>
          <view class="record-config">{{ record.configName }}</view>
        </view>
        <view class="record-time">{{ formatTime(record.timestamp) }}</view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">-</text>
      <text class="empty-text">{{ t('luckyWheel.historyPage.empty') }}</text>
    </view>

    <!-- 清空按钮 -->
    <view v-if="history.length > 0" class="clear-section">
      <button class="clear-btn" @click="clearAll">
        {{ t('common.delete') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useWheelStore, useSettingsStore } from '@/store'
import { showToast } from '@/utils'
import type { WheelHistory } from '@/types'

const { t } = useI18n()
const wheelStore = useWheelStore()
const settingsStore = useSettingsStore()

// 历史记录
const history = computed(() => wheelStore.history)

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 删除记录
const deleteRecord = (record: WheelHistory) => {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: t('luckyWheel.historyPage.deleteConfirm'),
    success: (res) => {
      if (res.confirm) {
        wheelStore.deleteHistory(record.id)
        showToast(t('common.deleteSuccess'))
      }
    }
  })
}

// 清空所有
const clearAll = () => {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: t('luckyWheel.historyPage.clearConfirm'),
    success: (res) => {
      if (res.confirm) {
        wheelStore.clearHistory()
        showToast(t('common.deleteSuccess'))
      }
    }
  })
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('luckyWheel.historyPage.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.history-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 历史列表
.history-list {
  margin-bottom: $spacing-md;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    background-color: var(--bg-hover);
  }
}

.record-info {
  flex: 1;
}

.record-result {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--primary);
  margin-bottom: 4rpx;
}

.record-config {
  font-size: $font-size-xs;
  color: var(--text-secondary);
}

.record-time {
  font-size: $font-size-xs;
  color: var(--text-placeholder);
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  color: var(--text-placeholder);
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

// 清空按钮
.clear-section {
  padding-top: $spacing-md;
}

.clear-btn {
  width: 100%;
  height: 80rpx;
  background-color: rgba(255, 77, 79, 0.1);
  color: var(--error);
  font-size: $font-size-md;
  border-radius: $radius-sm;
  border: none;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
