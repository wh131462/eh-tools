<template>
  <view class="page word-counter-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <nav-bar :title="t('wordCounter.title')" />

    <!-- 输入区 -->
    <view class="main-card">
      <textarea
        v-model="inputText"
        class="text-input"
        :placeholder="t('wordCounter.inputPlaceholder')"
        :maxlength="-1"
        auto-height
      />
      <view class="action-bar">
        <view class="action-btn" @click="handlePaste">
          <text class="action-btn-text">{{ t('wordCounter.paste') }}</text>
        </view>
        <view class="action-btn" @click="handleClear">
          <text class="action-btn-text">{{ t('wordCounter.clear') }}</text>
        </view>
      </view>
    </view>

    <!-- 核心统计 -->
    <view class="stats-card">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalChars }}</text>
          <text class="stat-label">{{ t('wordCounter.totalChars') }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.chineseChars }}</text>
          <text class="stat-label">{{ t('wordCounter.chineseChars') }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.englishWords }}</text>
          <text class="stat-label">{{ t('wordCounter.englishWords') }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.numbers }}</text>
          <text class="stat-label">{{ t('wordCounter.numbers') }}</text>
        </view>
      </view>
    </view>

    <!-- 详细统计 -->
    <view class="detail-card">
      <text class="detail-title">{{ t('wordCounter.detail') }}</text>
      <view class="detail-list">
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.charsNoSpace') }}</text>
          <text class="detail-value">{{ stats.charsNoSpace }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.punctuation') }}</text>
          <text class="detail-value">{{ stats.punctuation }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.spaces') }}</text>
          <text class="detail-value">{{ stats.spaces }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.lines') }}</text>
          <text class="detail-value">{{ stats.lines }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.paragraphs') }}</text>
          <text class="detail-value">{{ stats.paragraphs }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.fullWidth') }}</text>
          <text class="detail-value">{{ stats.fullWidth }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">{{ t('wordCounter.halfWidth') }}</text>
          <text class="detail-value">{{ stats.halfWidth }}</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />
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
const inputText = ref('')

// === 计算统计 ===
const stats = computed(() => {
  const text = inputText.value

  // 总字符数
  const totalChars = text.length

  // 中文字符（包含中文标点）
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length

  // 英文单词
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length

  // 数字
  const numbers = (text.match(/\d+/g) || []).length

  // 标点符号（中英文标点）
  const punctuation = (text.match(/[^\w\s\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length

  // 空格
  const spaces = (text.match(/ /g) || []).length

  // 字符（不含空格）
  const charsNoSpace = totalChars - spaces

  // 行数
  const lines = text.length === 0 ? 0 : text.split('\n').length

  // 段落数（以空行分隔）
  const paragraphs = text.length === 0 ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0)

  // 全角字符
  const fullWidth = (text.match(/[\uff01-\uff5e\u3000-\u303f\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length

  // 半角字符
  const halfWidth = totalChars - fullWidth - (text.match(/[\n\r\t]/g) || []).length

  return {
    totalChars,
    chineseChars,
    englishWords,
    numbers,
    punctuation,
    spaces,
    charsNoSpace,
    lines,
    paragraphs,
    fullWidth,
    halfWidth: halfWidth > 0 ? halfWidth : 0
  }
})

// === 方法 ===
const handleClear = () => {
  inputText.value = ''
}

const handlePaste = async () => {
  try {
    const res = await uni.getClipboardData()
    if (res.data) {
      inputText.value = res.data
    }
  } catch {
    // 粘贴失败静默处理
  }
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
})

onShareAppMessage(() => getDefaultShareConfig())
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('wordCounter.title')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.word-counter-page {
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

.text-input {
  width: 100%;
  min-height: 200rpx;
  max-height: 400rpx;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  padding: $spacing-md;
  box-sizing: border-box;
  box-shadow: var(--shadow-neumorphic-inset);
  line-height: 1.6;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.action-btn {
  padding: $spacing-xs $spacing-md;
  background-color: var(--bg-elevated);
  border-radius: $radius-round;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-normal;

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.96);
  }
}

.action-btn-text {
  font-size: $font-size-sm;
  color: var(--primary);
  font-weight: 500;
}

.stats-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
}

.stat-value {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: var(--primary);
  line-height: 1.2;
}

.stat-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-top: $spacing-xs;
}

.detail-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.detail-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: $font-size-md;
  color: var(--text-regular);
}

.detail-value {
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-primary);
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}
</style>
