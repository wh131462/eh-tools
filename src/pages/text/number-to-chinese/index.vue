<template>
  <view class="page number-to-chinese-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <nav-bar :title="t('numberToChinese.title')" />

    <!-- 输入区 -->
    <view class="main-card">
      <view class="mode-switch">
        <view
          class="mode-btn"
          :class="{ active: mode === 'amount' }"
          @click="mode = 'amount'"
        >
          <text class="mode-btn-text">{{ t('numberToChinese.amountMode') }}</text>
        </view>
        <view
          class="mode-btn"
          :class="{ active: mode === 'number' }"
          @click="mode = 'number'"
        >
          <text class="mode-btn-text">{{ t('numberToChinese.numberMode') }}</text>
        </view>
      </view>
      <text class="mode-tip">{{ mode === 'amount' ? t('numberToChinese.amountTip') : t('numberToChinese.numberTip') }}</text>

      <input
        v-model="inputValue"
        class="number-input"
        type="digit"
        placeholder="1234.56"
        @input="handleConvert"
      />
      <view class="action-bar">
        <view class="action-btn" @click="handlePaste">
          <text class="action-btn-text">{{ t('numberToChinese.paste') }}</text>
        </view>
        <view class="action-btn" @click="handleClear">
          <text class="action-btn-text">{{ t('numberToChinese.clear') }}</text>
        </view>
      </view>
    </view>

    <!-- 结果展示 -->
    <view v-if="result" class="result-card">
      <text class="result-label">{{ mode === 'amount' ? t('numberToChinese.capitalAmount') : t('numberToChinese.capitalNumber') }}</text>
      <text class="result-value" selectable>{{ result }}</text>
      <view class="copy-btn" @click="handleCopy">
        <text class="copy-btn-text">{{ t('numberToChinese.copy') }}</text>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="errorMsg" class="error-card">
      <text class="error-text">{{ errorMsg }}</text>
    </view>

    <!-- 示例 -->
    <view class="example-card">
      <text class="example-title">{{ t('numberToChinese.example') }}</text>
      <view class="example-list">
        <view v-for="item in examples" :key="item.input" class="example-item" @click="applyExample(item.input)">
          <text class="example-input">{{ item.input }}</text>
          <text class="example-arrow">→</text>
          <text class="example-output">{{ item.output }}</text>
        </view>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="numberToChineseShareCanvas"
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

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 状态 ===
const inputValue = ref('')
const result = ref('')
const errorMsg = ref('')
const mode = ref<'amount' | 'number'>('amount')

// 工具分享图配置
const toolShareConfig = {
  toolName: t('numberToChinese.title'),
  category: 'text' as const,
  subtitle: t('numberToChinese.subtitle')
}

const toolShareImageUrl = ref('')

function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// === 大写数字映射 ===
const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const UNITS = ['', '拾', '佰', '仟']
const BIG_UNITS = ['', '万', '亿', '兆']

// === 示例数据 ===
const examples = computed(() => {
  if (mode.value === 'amount') {
    return [
      { input: '0', output: '零元整' },
      { input: '100', output: '壹佰元整' },
      { input: '1234.56', output: '壹仟贰佰叁拾肆元伍角陆分' },
      { input: '10001.01', output: '壹万零壹元零壹分' },
      { input: '100000000', output: '壹亿元整' }
    ]
  }
  return [
    { input: '0', output: '零' },
    { input: '100', output: '壹佰' },
    { input: '1234', output: '壹仟贰佰叁拾肆' },
    { input: '10001', output: '壹万零壹' },
    { input: '100000000', output: '壹亿' }
  ]
})

// === 转换逻辑 ===

/** 将整数部分转换为大写（不含金额单位） */
function convertIntegerPart(intStr: string): string {
  if (intStr === '0' || intStr === '') return '零'

  // 去除前导零
  intStr = intStr.replace(/^0+/, '') || '0'
  if (intStr === '0') return '零'

  const len = intStr.length
  let result = ''
  let zeroFlag = false // 是否需要补零

  // 按4位一组处理
  const groupCount = Math.ceil(len / 4)
  const firstGroupLen = len % 4 || 4

  for (let g = 0; g < groupCount; g++) {
    const start = g === 0 ? 0 : firstGroupLen + (g - 1) * 4
    const end = g === 0 ? firstGroupLen : start + 4
    const group = intStr.slice(start, end)
    const bigUnitIdx = groupCount - 1 - g

    let groupStr = ''
    let groupZero = true // 该组是否全为零

    for (let i = 0; i < group.length; i++) {
      const digit = parseInt(group[i])
      const unitIdx = group.length - 1 - i

      if (digit === 0) {
        zeroFlag = true
      } else {
        if (zeroFlag) {
          groupStr += '零'
          zeroFlag = false
        }
        groupStr += DIGITS[digit] + UNITS[unitIdx]
        groupZero = false
      }
    }

    if (!groupZero) {
      result += groupStr + BIG_UNITS[bigUnitIdx]
      zeroFlag = false
    } else {
      zeroFlag = true
    }
  }

  return result
}

/** 金额模式: 数字转大写金额 */
function numberToChineseAmount(num: number): string {
  if (isNaN(num)) return ''
  if (num < 0) return '负' + numberToChineseAmount(-num)

  // 处理超大数字
  if (num >= 1e16) return t('numberToChinese.maxLength')

  // 四舍五入到分
  const rounded = Math.round(num * 100) / 100
  const [intPart, decPart = ''] = rounded.toFixed(2).split('.')

  const intChinese = convertIntegerPart(intPart)

  const jiao = parseInt(decPart[0] || '0')
  const fen = parseInt(decPart[1] || '0')

  if (jiao === 0 && fen === 0) {
    return intChinese + '元整'
  }

  let decChinese = ''
  if (jiao === 0) {
    decChinese = '零' + DIGITS[fen] + '分'
  } else if (fen === 0) {
    decChinese = DIGITS[jiao] + '角'
  } else {
    decChinese = DIGITS[jiao] + '角' + DIGITS[fen] + '分'
  }

  return intChinese + '元' + decChinese
}

/** 数字模式: 纯数字转大写 */
function numberToChineseNumber(num: number): string {
  if (isNaN(num)) return ''
  if (num < 0) return '负' + numberToChineseNumber(-num)

  if (num >= 1e16) return t('numberToChinese.maxLength')

  const str = String(num)
  const [intPart, decPart] = str.split('.')

  let result = convertIntegerPart(intPart)

  if (decPart) {
    result += '点'
    for (const ch of decPart) {
      result += DIGITS[parseInt(ch)]
    }
  }

  return result
}

function handleConvert() {
  errorMsg.value = ''
  result.value = ''

  const val = inputValue.value.trim()
  if (!val) return

  const num = parseFloat(val)
  if (isNaN(num)) {
    errorMsg.value = t('numberToChinese.invalidInput')
    return
  }

  if (mode.value === 'amount') {
    result.value = numberToChineseAmount(num)
  } else {
    result.value = numberToChineseNumber(num)
  }
}

function handleCopy() {
  if (!result.value) return
  uni.setClipboardData({
    data: result.value,
    success: () => {
      uni.showToast({ title: t('numberToChinese.copySuccess'), icon: 'success' })
    }
  })
}

function handleClear() {
  inputValue.value = ''
  result.value = ''
  errorMsg.value = ''
}

function handlePaste() {
  uni.getClipboardData({
    success: (res) => {
      inputValue.value = res.data
      handleConvert()
    }
  })
}

function applyExample(value: string) {
  inputValue.value = value
  handleConvert()
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
})

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('numberToChinese.title')}`,
    path: '/pages/text/number-to-chinese/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => ({
  title: `EH Tools - ${t('numberToChinese.title')}`
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.number-to-chinese-page {
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

.mode-switch {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.mode-btn {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  text-align: center;
  background-color: var(--bg-elevated);
  transition: all $transition-normal;

  &.active {
    background: $gradient-primary;
  }
}

.mode-btn-text {
  font-size: $font-size-md;
  color: var(--text-regular);

  .mode-btn.active & {
    color: #ffffff;
    font-weight: 600;
  }
}

.mode-tip {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-md;
  display: block;
}

.number-input {
  width: 100%;
  height: 96rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-xl;
  font-weight: 600;
  border-radius: $radius-md;
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  box-sizing: border-box;
  text-align: center;
  letter-spacing: 2rpx;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.action-btn {
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-md;
  background-color: var(--bg-elevated);
  transition: all $transition-normal;

  &:active {
    background-color: var(--bg-sunken);
    transform: scale(0.96);
  }
}

.action-btn-text {
  font-size: $font-size-sm;
  color: var(--text-regular);
}

.result-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.result-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
  display: block;
}

.result-value {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $primary;
  line-height: 1.6;
  word-break: break-all;
  display: block;
  margin-bottom: $spacing-md;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-round;
  background: $gradient-primary;
  transition: all $transition-normal;

  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
}

.copy-btn-text {
  font-size: $font-size-md;
  color: #ffffff;
  font-weight: 600;
}

.error-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.error-text {
  font-size: $font-size-md;
  color: $warning;
}

.example-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.example-title {
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
  display: block;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.example-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  background-color: var(--bg-elevated);
  transition: all $transition-normal;

  &:active {
    background-color: var(--bg-sunken);
    transform: scale(0.98);
  }
}

.example-input {
  font-size: $font-size-md;
  color: var(--text-primary);
  font-weight: 600;
  min-width: 160rpx;
}

.example-arrow {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.example-output {
  font-size: $font-size-sm;
  color: $primary;
  flex: 1;
  word-break: break-all;
}
</style>
