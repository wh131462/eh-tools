<template>
  <view class="page json-formatter-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('jsonFormatter.title')" />

    <!-- 输入卡片 -->
    <view class="main-card">
      <view class="card-header">
        <text class="card-title">{{ t('jsonFormatter.input') }}</text>
        <view class="header-actions">
          <button class="action-btn" @click="handlePaste">
            <text class="action-text">{{ t('jsonFormatter.paste') }}</text>
          </button>
          <button class="action-btn" @click="handleClear">
            <text class="action-text">{{ t('jsonFormatter.clear') }}</text>
          </button>
        </view>
      </view>
      <textarea
        v-model="inputText"
        class="json-input"
        :placeholder="t('jsonFormatter.inputPlaceholder')"
        :placeholder-class="'input-placeholder'"
        :auto-height="false"
      />
    </view>

    <!-- 操作按钮 -->
    <view class="action-card">
      <view class="indent-selector">
        <text class="selector-label">{{ t('jsonFormatter.indentSize') }}:</text>
        <view class="selector-options">
          <view
            v-for="size in [2, 4]"
            :key="size"
            class="selector-option"
            :class="{ active: indentSize === size }"
            @click="indentSize = size"
          >
            <text class="option-text">{{ size }} {{ t('jsonFormatter.spaces') }}</text>
          </view>
        </view>
      </view>
      <view class="action-buttons">
        <button class="primary-btn format-btn" @click="handleFormat">
          <text class="btn-text">{{ t('jsonFormatter.format') }}</text>
        </button>
        <button class="primary-btn compress-btn" @click="handleCompress">
          <text class="btn-text">{{ t('jsonFormatter.compress') }}</text>
        </button>
      </view>
    </view>

    <!-- 结果展示 -->
    <view v-if="outputText" class="result-card">
      <view class="card-header">
        <text class="card-title">{{ t('jsonFormatter.output') }}</text>
        <button class="action-btn copy-btn" @click="handleCopy">
          <text class="action-text">{{ t('common.copy') }}</text>
        </button>
      </view>
      <view class="json-output-wrapper">
        <text class="json-output" user-select>{{ outputText }}</text>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="jsonFormatterShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast, copyToClipboard } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('jsonFormatter.title'),
  icon: '{ }',
  category: 'text' as const,
  subtitle: 'JSON格式化与压缩'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// === 状态 ===
const inputText = ref('')
const outputText = ref('')
const indentSize = ref(2)

// === 方法 ===
// 格式化
const handleFormat = () => {
  if (!inputText.value.trim()) {
    showToast(t('jsonFormatter.emptyInput'))
    return
  }

  try {
    const parsed = JSON.parse(inputText.value)
    outputText.value = JSON.stringify(parsed, null, indentSize.value)
    showToast(t('jsonFormatter.formatSuccess'))
  } catch (error) {
    showToast(t('jsonFormatter.invalidJson'))
  }
}

// 压缩
const handleCompress = () => {
  if (!inputText.value.trim()) {
    showToast(t('jsonFormatter.emptyInput'))
    return
  }

  try {
    const parsed = JSON.parse(inputText.value)
    outputText.value = JSON.stringify(parsed)
    showToast(t('jsonFormatter.compressSuccess'))
  } catch (error) {
    showToast(t('jsonFormatter.invalidJson'))
  }
}

// 清空
const handleClear = () => {
  inputText.value = ''
  outputText.value = ''
}

// 粘贴
const handlePaste = () => {
  uni.getClipboardData({
    success: (res) => {
      inputText.value = res.data
    }
  })
}

// 复制
const handleCopy = () => {
  copyToClipboard(outputText.value)
}

// === 生命周期 ===
onShow(() => {
  uni.setNavigationBarTitle({ title: t('jsonFormatter.title') })
  settingsStore.initTheme()
})

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('jsonFormatter.title')}`,
    path: '/pages/text/json-formatter/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => ({
  title: `EH Tools - ${t('jsonFormatter.title')}`
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.json-formatter-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card,
.action-card,
.result-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  padding: $spacing-xs $spacing-md;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;
  font-size: 24rpx;
  color: var(--text-regular);
  border: none;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-fast;

  &::after {
    border: none;
  }

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.96);
  }
}

.action-text {
  font-size: 24rpx;
  color: var(--text-regular);
}

.json-input {
  width: 100%;
  min-height: 400rpx;
  padding: $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
  font-size: 26rpx;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  box-sizing: border-box;
}

.input-placeholder {
  color: var(--text-placeholder);
}

.indent-selector {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.selector-label {
  font-size: 28rpx;
  color: var(--text-regular);
}

.selector-options {
  display: flex;
  gap: $spacing-sm;
}

.selector-option {
  padding: $spacing-xs $spacing-md;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-fast;

  &.active {
    background: var(--gradient-primary);
    box-shadow: var(--shadow-neumorphic-sm);

    .option-text {
      color: #fff;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.option-text {
  font-size: 24rpx;
  color: var(--text-regular);
}

.action-buttons {
  display: flex;
  gap: $spacing-md;
}

.primary-btn {
  flex: 1;
  padding: $spacing-md;
  border-radius: $radius-md;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-fast;

  &::after {
    border: none;
  }

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.98);
  }
}

.format-btn {
  background: var(--gradient-primary);

  .btn-text {
    color: #fff;
  }
}

.compress-btn {
  background: var(--gradient-info);

  .btn-text {
    color: #fff;
  }
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.json-output-wrapper {
  padding: $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
  max-height: 800rpx;
  overflow-y: auto;
}

.json-output {
  font-size: 26rpx;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.copy-btn {
  margin-left: auto;
  margin-right: 0;
  background: var(--gradient-success);

  .action-text {
    color: #fff;
  }
}

</style>
