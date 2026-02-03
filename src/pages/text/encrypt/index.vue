<template>
  <view class="page encode-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('encrypt.title')" />

    <!-- 模式切换 -->
    <view class="mode-section">
      <view
        class="mode-btn"
        :class="{ active: mode === 'encrypt' }"
        @click="mode = 'encrypt'"
      >
        {{ t('encrypt.encrypt') }}
      </view>
      <view
        class="mode-btn"
        :class="{ active: mode === 'decrypt' }"
        @click="mode = 'decrypt'"
      >
        {{ t('encrypt.decrypt') }}
      </view>
    </view>

    <!-- 算法选择 -->
    <view class="algorithm-section">
      <view class="section-title">{{ t('encrypt.algorithm') }}</view>
      <view class="algorithm-list">
        <view
          v-for="algo in algorithms"
          :key="algo.id"
          class="algorithm-item"
          :class="{ active: algorithm === algo.id }"
          @click="selectAlgorithm(algo.id)"
        >
          {{ algo.name }}
        </view>
      </view>
    </view>

    <!-- 口令输入（对称算法需要） -->
    <view v-if="needsKey" class="key-section">
      <view class="section-title">{{ t('encrypt.key') }}</view>
      <input
        class="key-input"
        type="text"
        :placeholder="t('encrypt.keyPlaceholder')"
        v-model="key"
      />
      <view v-if="keyError" class="error-text">{{ keyError }}</view>
    </view>

    <!-- 输入文本 -->
    <view class="input-section">
      <view class="section-title">{{ t('encrypt.inputText') }}</view>
      <textarea
        class="input-textarea"
        :placeholder="t('encrypt.inputPlaceholder')"
        v-model="inputText"
      />
    </view>

    <!-- 处理按钮 -->
    <button class="process-btn" @click="process">
      {{ t('encrypt.process') }}
    </button>

    <!-- 结果显示 -->
    <view v-if="result" class="result-section">
      <view class="result-header">
        <text class="section-title">{{ t('encrypt.result') }}</text>
        <view class="copy-btn" @click="copyResult">
          {{ t('common.copy') }}
        </view>
      </view>
      <view class="result-content">
        <text selectable>{{ result }}</text>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="encryptShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'
import CryptoJS from 'crypto-js'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('encrypt.title'),
  icon: '🔐',
  category: 'text' as const,
  subtitle: '支持多种编码/加密算法'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 算法列表
const algorithms = [
  { id: 'base64', name: 'Base64', needsKey: false },
  { id: 'url', name: 'URL', needsKey: false },
  { id: 'hex', name: 'Hex', needsKey: false },
  { id: 'md5', name: 'MD5', needsKey: false, encryptOnly: true },
  { id: 'sha1', name: 'SHA1', needsKey: false, encryptOnly: true },
  { id: 'sha256', name: 'SHA256', needsKey: false, encryptOnly: true },
  { id: 'aes', name: 'AES', needsKey: true },
  { id: 'des', name: 'DES', needsKey: true },
  { id: 'triple_des', name: '3DES', needsKey: true }
]

// 状态
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const algorithm = ref('base64')
const key = ref('')
const inputText = ref('')
const result = ref('')
const keyError = ref('')

// 是否需要口令
const needsKey = computed(() => {
  const algo = algorithms.find(a => a.id === algorithm.value)
  return algo?.needsKey || false
})

// 是否仅支持编码（哈希算法）
const encryptOnly = computed(() => {
  const algo = algorithms.find(a => a.id === algorithm.value)
  return algo?.encryptOnly || false
})

// 选择算法
const selectAlgorithm = (algoId: string) => {
  algorithm.value = algoId
  result.value = ''
  keyError.value = ''

  // 哈希算法只能编码
  const algo = algorithms.find(a => a.id === algoId)
  if (algo?.encryptOnly) {
    mode.value = 'encrypt'
  }
}

// 处理编码/解码
const process = () => {
  if (!inputText.value.trim()) {
    showToast(t('encrypt.textEmpty'))
    return
  }

  // 需要口令的算法检查
  if (needsKey.value && !key.value) {
    showToast(t('encrypt.keyRequired'))
    return
  }

  keyError.value = ''

  try {
    if (mode.value === 'encrypt') {
      result.value = encrypt()
    } else {
      result.value = decrypt()
    }
  } catch (error: any) {
    showToast(t('encrypt.processFailed'))
    console.error(error)
  }
}

// 编码
const encrypt = (): string => {
  const text = inputText.value

  switch (algorithm.value) {
    case 'base64':
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))

    case 'url':
      return encodeURIComponent(text)

    case 'hex':
      return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(text))

    case 'md5':
      return CryptoJS.MD5(text).toString()

    case 'sha1':
      return CryptoJS.SHA1(text).toString()

    case 'sha256':
      return CryptoJS.SHA256(text).toString()

    case 'aes':
      return CryptoJS.AES.encrypt(text, key.value).toString()

    case 'des':
      return CryptoJS.DES.encrypt(text, key.value).toString()

    case 'triple_des':
      return CryptoJS.TripleDES.encrypt(text, key.value).toString()

    default:
      return text
  }
}

// 解码
const decrypt = (): string => {
  const text = inputText.value

  switch (algorithm.value) {
    case 'base64':
      try {
        return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text))
      } catch {
        throw new Error('Invalid Base64 string')
      }

    case 'url':
      try {
        return decodeURIComponent(text)
      } catch {
        throw new Error('Invalid URL encoded string')
      }

    case 'hex':
      try {
        return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(text))
      } catch {
        throw new Error('Invalid Hex string')
      }

    case 'aes':
      try {
        const bytes = CryptoJS.AES.decrypt(text, key.value)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        if (!decrypted) throw new Error('Decryption failed')
        return decrypted
      } catch {
        throw new Error('AES decryption failed')
      }

    case 'des':
      try {
        const bytes = CryptoJS.DES.decrypt(text, key.value)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        if (!decrypted) throw new Error('Decryption failed')
        return decrypted
      } catch {
        throw new Error('DES decryption failed')
      }

    case 'triple_des':
      try {
        const bytes = CryptoJS.TripleDES.decrypt(text, key.value)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        if (!decrypted) throw new Error('Decryption failed')
        return decrypted
      } catch {
        throw new Error('3DES decryption failed')
      }

    default:
      return text
  }
}

// 复制结果
const copyResult = () => {
  if (!result.value) return

  uni.setClipboardData({
    data: result.value,
    success: () => {
      showToast(t('common.copySuccess'))
    }
  })
}

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('encrypt.title')}`,
    path: '/pages/text/encrypt/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => ({
  title: `EH Tools - ${t('encrypt.title')}`
}))

onShow(() => {
  uni.setNavigationBarTitle({ title: t('encrypt.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.encode-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 模式切换
.mode-section {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.mode-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
  color: var(--text-secondary);
  background-color: var(--bg-card);
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &.active {
    background-color: var(--primary);
    color: #FFFFFF;
  }
}

// 算法选择
.algorithm-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.algorithm-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.algorithm-item {
  padding: $spacing-xs $spacing-md;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  border: 2rpx solid transparent;
  transition: all $transition-fast;

  &.active {
    background-color: var(--bg-primary-light);
    color: var(--primary);
    border-color: var(--primary);
  }

  &:active {
    opacity: 0.7;
  }
}

// 密钥输入
.key-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.key-input {
  width: 100%;
  height: 80rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  box-sizing: border-box;
}

.error-text {
  font-size: $font-size-xs;
  color: var(--error);
  margin-top: $spacing-xs;
}

// 输入文本
.input-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.input-textarea {
  width: 100%;
  height: 200rpx;
  padding: $spacing-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  box-sizing: border-box;
}

// 处理按钮
.process-btn {
  width: 100%;
  height: 88rpx;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: $font-size-md;
  border-radius: $radius-sm;
  border: none;
  margin-bottom: $spacing-md;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}

// 结果显示
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  .section-title {
    margin-bottom: 0;
  }
}

.copy-btn {
  padding: $spacing-xs $spacing-md;
  font-size: $font-size-sm;
  color: var(--primary);
  background-color: var(--bg-primary-light);
  border-radius: $radius-sm;

  &:active {
    opacity: 0.7;
  }
}

.result-content {
  padding: $spacing-md;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  word-break: break-all;
  font-size: $font-size-sm;
  color: var(--text-primary);
  font-family: monospace;
  line-height: 1.6;
}
</style>
