<template>
  <view class="page regex-tester-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <nav-bar :title="t('regexTester.title')" />

    <!-- 正则表达式输入 -->
    <view class="main-card">
      <view class="section-title">{{ t('regexTester.pattern') }}</view>
      <view class="input-wrapper">
        <text class="regex-delimiter">/</text>
        <input
          v-model="pattern"
          class="pattern-input"
          :placeholder="t('regexTester.patternPlaceholder')"
          @input="handlePatternChange"
        />
        <text class="regex-delimiter">/</text>
        <text class="flags-text">{{ flagsString }}</text>
      </view>

      <!-- 错误提示 -->
      <view v-if="regexError" class="error-tip">
        {{ t('regexTester.invalidRegex') }}: {{ regexError }}
      </view>

      <!-- 匹配标志 -->
      <view class="flags-section">
        <view class="section-subtitle">{{ t('regexTester.flags') }}</view>
        <view class="flags-grid">
          <view
            v-for="flag in flagOptions"
            :key="flag.value"
            class="flag-item"
            :class="{ active: flags[flag.value] }"
            @click="toggleFlag(flag.value)"
          >
            <view class="flag-checkbox">
              <text v-if="flags[flag.value]" class="check-mark">&#10003;</text>
            </view>
            <text class="flag-label">{{ flag.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 测试文本输入 -->
    <view class="main-card">
      <view class="section-header">
        <view class="section-title">{{ t('regexTester.testText') }}</view>
        <view class="action-btns">
          <view class="action-btn" @click="pasteText">
            <text>{{ t('regexTester.paste') }}</text>
          </view>
          <view class="action-btn" @click="clearText">
            <text>{{ t('regexTester.clear') }}</text>
          </view>
        </view>
      </view>
      <textarea
        v-model="testText"
        class="test-textarea"
        :placeholder="t('regexTester.testTextPlaceholder')"
        @input="handleTextChange"
      />
    </view>

    <!-- 匹配结果 -->
    <view class="result-card">
      <view class="section-header">
        <view class="section-title">{{ t('regexTester.matchResult') }}</view>
        <view v-if="matches.length > 0" class="match-count">
          {{ t('regexTester.matchCount') }}: {{ matches.length }}
        </view>
      </view>

      <view v-if="!pattern || !testText" class="empty-state">
        <text class="empty-text">{{ t('regexTester.noMatch') }}</text>
      </view>

      <view v-else-if="matches.length === 0 && !regexError" class="empty-state">
        <text class="empty-text">{{ t('regexTester.noMatch') }}</text>
      </view>

      <view v-else-if="!regexError" class="matches-list">
        <!-- 高亮显示的文本 -->
        <view class="highlighted-text">
          <rich-text :nodes="highlightedHtml" />
        </view>

        <!-- 匹配详情 -->
        <view v-if="matches.length > 0" class="match-details">
          <view v-for="(match, index) in matches" :key="index" class="match-item">
            <view class="match-header">
              <text class="match-index">#{{ index + 1 }}</text>
              <text class="match-value" @click="copyMatch(match[0])">{{ match[0] }}</text>
            </view>
            <!-- 捕获分组 -->
            <view v-if="match.length > 1" class="groups-section">
              <text class="groups-title">{{ t('regexTester.matchGroups') }}</text>
              <view v-for="(group, gIndex) in match.slice(1)" :key="gIndex" class="group-item">
                <text class="group-index">{{ t('regexTester.groupIndex') }} {{ gIndex + 1 }}:</text>
                <text class="group-value">{{ group || '(empty)' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 常用正则 -->
    <view class="main-card">
      <view class="section-title">{{ t('regexTester.commonPatterns') }}</view>
      <view class="patterns-grid">
        <view
          v-for="item in commonPatterns"
          :key="item.key"
          class="pattern-chip"
          @click="applyPattern(item.pattern)"
        >
          <text>{{ t(`regexTester.patterns.${item.key}`) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { getDefaultShareConfig, showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 状态 ===
const pattern = ref('')
const testText = ref('')
const regexError = ref('')
const matches = ref<string[][]>([])

// 标志状态
const flags = ref<Record<string, boolean>>({
  g: true,
  i: false,
  m: false,
  s: false,
  u: false
})

// 标志选项
const flagOptions = computed(() => [
  { value: 'g', label: t('regexTester.flagGlobal') },
  { value: 'i', label: t('regexTester.flagIgnoreCase') },
  { value: 'm', label: t('regexTester.flagMultiline') },
  { value: 's', label: t('regexTester.flagDotAll') },
  { value: 'u', label: t('regexTester.flagUnicode') }
])

// 常用正则
const commonPatterns = [
  { key: 'email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { key: 'phone', pattern: '1[3-9]\\d{9}' },
  { key: 'url', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*' },
  { key: 'ipv4', pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)' },
  { key: 'date', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}' },
  { key: 'chinese', pattern: '[\\u4e00-\\u9fa5]+' },
  { key: 'idCard', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]' }
]

// 计算标志字符串
const flagsString = computed(() => {
  return Object.entries(flags.value)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag)
    .join('')
})

// 高亮显示的 HTML
const highlightedHtml = computed(() => {
  if (!pattern.value || !testText.value || regexError.value) {
    return escapeHtml(testText.value)
  }

  try {
    const regex = new RegExp(pattern.value, flagsString.value)
    let result = testText.value
    const highlightMatches: { start: number; end: number; text: string }[] = []

    if (flags.value.g) {
      let match
      while ((match = regex.exec(testText.value)) !== null) {
        highlightMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        })
        if (!flags.value.g) break
      }
    } else {
      const match = regex.exec(testText.value)
      if (match) {
        highlightMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        })
      }
    }

    // 从后向前替换，避免索引偏移
    highlightMatches.sort((a, b) => b.start - a.start)
    for (const m of highlightMatches) {
      const before = result.substring(0, m.start)
      const after = result.substring(m.end)
      result = before + `<span style="background-color: #667eea40; color: #667eea; padding: 2px 4px; border-radius: 4px;">${escapeHtml(m.text)}</span>` + after
    }

    return result.replace(/\n/g, '<br/>')
  } catch {
    return escapeHtml(testText.value)
  }
})

// === 方法 ===
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>')
}

function toggleFlag(flag: string) {
  flags.value[flag] = !flags.value[flag]
  executeMatch()
}

function handlePatternChange() {
  executeMatch()
}

function handleTextChange() {
  executeMatch()
}

function executeMatch() {
  regexError.value = ''
  matches.value = []

  if (!pattern.value || !testText.value) {
    return
  }

  try {
    const regex = new RegExp(pattern.value, flagsString.value)
    const results: string[][] = []

    if (flags.value.g) {
      let match
      while ((match = regex.exec(testText.value)) !== null) {
        results.push([...match])
      }
    } else {
      const match = regex.exec(testText.value)
      if (match) {
        results.push([...match])
      }
    }

    matches.value = results
  } catch (e: unknown) {
    regexError.value = e instanceof Error ? e.message : String(e)
  }
}

function applyPattern(patternStr: string) {
  pattern.value = patternStr
  executeMatch()
}

function copyMatch(text: string) {
  uni.setClipboardData({
    data: text,
    success: () => showToast(t('common.copySuccess'))
  })
}

async function pasteText() {
  try {
    const res = await uni.getClipboardData()
    if (res.data) {
      testText.value = res.data
      executeMatch()
    }
  } catch {
    // ignore
  }
}

function clearText() {
  testText.value = ''
  matches.value = []
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
})

onShareAppMessage(() => getDefaultShareConfig())
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('regexTester.title')
}))

// 监听变化
watch([pattern, testText, flagsString], () => {
  executeMatch()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.regex-tester-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card,
.result-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.section-subtitle {
  font-size: $font-size-md;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-sunken);
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  box-shadow: var(--shadow-neumorphic-inset);
}

.regex-delimiter {
  font-size: $font-size-xl;
  color: var(--text-secondary);
  font-family: monospace;
}

.pattern-input {
  flex: 1;
  font-size: $font-size-md;
  color: var(--text-primary);
  background: transparent;
  font-family: monospace;
  padding: $spacing-xs $spacing-sm;
}

.flags-text {
  font-size: $font-size-md;
  color: $primary;
  font-family: monospace;
  min-width: 60rpx;
}

.error-tip {
  margin-top: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 65, 108, 0.1);
  border-radius: $radius-sm;
  color: $error;
  font-size: $font-size-sm;
}

.flags-section {
  margin-top: $spacing-lg;
}

.flags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.flag-item {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-md;
  background: var(--bg-sunken);
  border-radius: $radius-round;
  transition: all $transition-normal;

  &.active {
    background: rgba(102, 126, 234, 0.15);

    .flag-checkbox {
      background: $primary;
      border-color: $primary;
    }

    .flag-label {
      color: $primary;
    }
  }
}

.flag-checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid var(--text-placeholder);
  border-radius: 8rpx;
  margin-right: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  color: #fff;
  font-size: 20rpx;
}

.flag-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.action-btns {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  padding: $spacing-xs $spacing-md;
  background: var(--bg-sunken);
  border-radius: $radius-round;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  transition: all $transition-normal;

  &:active {
    background: var(--bg-hover);
  }
}

.test-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: $spacing-md;
  background: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
  font-size: $font-size-md;
  color: var(--text-primary);
  line-height: 1.6;
  box-sizing: border-box;
}

.match-count {
  font-size: $font-size-sm;
  color: $primary;
  background: rgba(102, 126, 234, 0.1);
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-round;
}

.empty-state {
  padding: $spacing-xl;
  text-align: center;
}

.empty-text {
  color: var(--text-placeholder);
  font-size: $font-size-md;
}

.highlighted-text {
  padding: $spacing-md;
  background: var(--bg-sunken);
  border-radius: $radius-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  line-height: 1.8;
  word-break: break-all;
  margin-bottom: $spacing-md;
}

.match-details {
  margin-top: $spacing-md;
}

.match-item {
  padding: $spacing-md;
  background: var(--bg-sunken);
  border-radius: $radius-md;
  margin-bottom: $spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.match-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.match-index {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
  min-width: 48rpx;
}

.match-value {
  flex: 1;
  font-size: $font-size-md;
  color: $primary;
  font-family: monospace;
  word-break: break-all;
}

.groups-section {
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1rpx solid var(--border-light);
}

.groups-title {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.group-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-xs 0;
}

.group-index {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
  min-width: 100rpx;
}

.group-value {
  flex: 1;
  font-size: $font-size-sm;
  color: var(--text-primary);
  font-family: monospace;
  word-break: break-all;
}

.patterns-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.pattern-chip {
  padding: $spacing-sm $spacing-md;
  background: var(--bg-sunken);
  border-radius: $radius-round;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  transition: all $transition-normal;

  &:active {
    background: rgba(102, 126, 234, 0.15);
    color: $primary;
  }
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}
</style>
