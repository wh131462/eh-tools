<template>
  <view class="page tax-calculator-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('taxCalculator.title')" />

    <!-- 输入区域 -->
    <view class="main-card">
      <!-- 月收入 -->
      <view class="input-group">
        <text class="input-label">{{ t('taxCalculator.monthlyIncome') }}</text>
        <view class="input-wrapper">
          <input
            v-model="monthlyIncome"
            type="digit"
            class="input-field"
            :placeholder="t('taxCalculator.monthlyIncomePlaceholder')"
          />
          <text class="input-unit">{{ t('taxCalculator.unit.yuan') }}</text>
        </view>
      </view>

      <!-- 五险一金 -->
      <view class="input-group">
        <text class="input-label">{{ t('taxCalculator.socialInsurance') }}</text>
        <view class="input-wrapper">
          <input
            v-model="socialInsurance"
            type="digit"
            class="input-field"
            :placeholder="t('taxCalculator.socialInsurancePlaceholder')"
          />
          <text class="input-unit">{{ t('taxCalculator.unit.yuan') }}</text>
        </view>
      </view>

      <!-- 专项附加扣除 -->
      <view class="input-group">
        <text class="input-label">{{ t('taxCalculator.specialDeduction') }}</text>
        <view class="input-wrapper">
          <input
            v-model="specialDeduction"
            type="digit"
            class="input-field"
            :placeholder="t('taxCalculator.specialDeductionPlaceholder')"
          />
          <text class="input-unit">{{ t('taxCalculator.unit.yuan') }}</text>
        </view>
      </view>

      <!-- 起征点 -->
      <view class="input-group">
        <text class="input-label">{{ t('taxCalculator.threshold') }}</text>
        <view class="input-wrapper">
          <input
            v-model="threshold"
            type="digit"
            class="input-field"
            disabled
          />
          <text class="input-unit">{{ t('taxCalculator.unit.yuan') }}</text>
        </view>
      </view>

      <!-- 计算按钮 -->
      <view class="calculate-btn" @click="calculate">
        <text class="calculate-btn-text">{{ t('taxCalculator.calculate') }}</text>
      </view>
    </view>

    <!-- 计算结果 -->
    <view v-if="showResult" class="result-card">
      <view class="result-title">{{ t('taxCalculator.result') }}</view>

      <view class="result-item highlight">
        <text class="result-label">{{ t('taxCalculator.tax') }}</text>
        <text class="result-value primary">{{ formatMoney(taxResult.tax) }} {{ t('taxCalculator.unit.yuan') }}</text>
      </view>

      <view class="result-item highlight">
        <text class="result-label">{{ t('taxCalculator.afterTaxIncome') }}</text>
        <text class="result-value success">{{ formatMoney(taxResult.afterTaxIncome) }} {{ t('taxCalculator.unit.yuan') }}</text>
      </view>

      <view class="result-divider" />

      <view class="result-item">
        <text class="result-label">{{ t('taxCalculator.taxableIncome') }}</text>
        <text class="result-value">{{ formatMoney(taxResult.taxableIncome) }} {{ t('taxCalculator.unit.yuan') }}</text>
      </view>

      <view class="result-item">
        <text class="result-label">{{ t('taxCalculator.taxRate') }}</text>
        <text class="result-value">{{ taxResult.taxRate }}{{ t('taxCalculator.unit.percent') }}</text>
      </view>

      <view class="result-item">
        <text class="result-label">{{ t('taxCalculator.quickDeduction') }}</text>
        <text class="result-value">{{ formatMoney(taxResult.quickDeduction) }} {{ t('taxCalculator.unit.yuan') }}</text>
      </view>

      <view class="result-divider" />

      <view class="result-item">
        <text class="result-label">{{ t('taxCalculator.annualTax') }}</text>
        <text class="result-value">{{ formatMoney(taxResult.annualTax) }} {{ t('taxCalculator.unit.yuan') }}</text>
      </view>

      <view class="result-item">
        <text class="result-label">{{ t('taxCalculator.annualAfterTax') }}</text>
        <text class="result-value">{{ formatMoney(taxResult.annualAfterTax) }} {{ t('taxCalculator.unit.yuan') }}</text>
      </view>
    </view>

    <!-- 税率表 -->
    <view class="tax-brackets-card">
      <view class="brackets-title">{{ t('taxCalculator.taxBrackets') }}</view>
      <view class="brackets-table">
        <view class="brackets-header">
          <text class="brackets-cell bracket-col">{{ t('taxCalculator.bracket') }}</text>
          <text class="brackets-cell range-col">{{ t('taxCalculator.incomeRange') }}</text>
          <text class="brackets-cell rate-col">{{ t('taxCalculator.rate') }}</text>
          <text class="brackets-cell deduction-col">{{ t('taxCalculator.deduction') }}</text>
        </view>
        <view v-for="(bracket, index) in taxBrackets" :key="index" class="brackets-row">
          <text class="brackets-cell bracket-col">{{ index + 1 }}</text>
          <text class="brackets-cell range-col">{{ bracket.range }}</text>
          <text class="brackets-cell rate-col">{{ bracket.rate }}%</text>
          <text class="brackets-cell deduction-col">{{ bracket.deduction }}</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { getDefaultShareConfig, showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// === 状态 ===
const monthlyIncome = ref('')
const socialInsurance = ref('')
const specialDeduction = ref('')
const threshold = ref('5000')
const showResult = ref(false)

const taxResult = reactive({
  taxableIncome: 0,
  taxRate: 0,
  quickDeduction: 0,
  tax: 0,
  afterTaxIncome: 0,
  annualTax: 0,
  annualAfterTax: 0
})

// 中国个人所得税税率表（综合所得适用）
const taxBrackets = [
  { range: '≤36,000', rate: 3, deduction: 0 },
  { range: '36,000-144,000', rate: 10, deduction: 2520 },
  { range: '144,000-300,000', rate: 20, deduction: 16920 },
  { range: '300,000-420,000', rate: 25, deduction: 31920 },
  { range: '420,000-660,000', rate: 30, deduction: 52920 },
  { range: '660,000-960,000', rate: 35, deduction: 85920 },
  { range: '>960,000', rate: 45, deduction: 181920 }
]

// === 方法 ===
const formatMoney = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const calculate = () => {
  const income = parseFloat(monthlyIncome.value) || 0
  const insurance = parseFloat(socialInsurance.value) || 0
  const deduction = parseFloat(specialDeduction.value) || 0
  const thresholdValue = parseFloat(threshold.value) || 5000

  if (income <= 0) {
    showToast(t('taxCalculator.incomeRequired'))
    return
  }

  // 计算月应纳税所得额
  const monthlyTaxableIncome = Math.max(0, income - insurance - deduction - thresholdValue)

  // 计算年应纳税所得额
  const annualTaxableIncome = monthlyTaxableIncome * 12

  // 根据年应纳税所得额确定税率和速算扣除数
  let rate = 0
  let quickDeduction = 0

  if (annualTaxableIncome <= 36000) {
    rate = 3
    quickDeduction = 0
  } else if (annualTaxableIncome <= 144000) {
    rate = 10
    quickDeduction = 2520
  } else if (annualTaxableIncome <= 300000) {
    rate = 20
    quickDeduction = 16920
  } else if (annualTaxableIncome <= 420000) {
    rate = 25
    quickDeduction = 31920
  } else if (annualTaxableIncome <= 660000) {
    rate = 30
    quickDeduction = 52920
  } else if (annualTaxableIncome <= 960000) {
    rate = 35
    quickDeduction = 85920
  } else {
    rate = 45
    quickDeduction = 181920
  }

  // 计算年度应纳税额
  const annualTax = Math.max(0, annualTaxableIncome * rate / 100 - quickDeduction)

  // 计算月度应纳税额（简化计算，实际按累计预扣法）
  const monthlyTax = annualTax / 12

  // 更新结果
  taxResult.taxableIncome = monthlyTaxableIncome
  taxResult.taxRate = rate
  taxResult.quickDeduction = quickDeduction / 12
  taxResult.tax = monthlyTax
  taxResult.afterTaxIncome = income - insurance - monthlyTax
  taxResult.annualTax = annualTax
  taxResult.annualAfterTax = (income - insurance) * 12 - annualTax

  showResult.value = true
}

// === 生命周期 ===
onShow(() => {
  settingsStore.initTheme()
})

onShareAppMessage(() => getDefaultShareConfig())
onShareTimeline(() => ({
  title: 'EH Tools - ' + t('taxCalculator.title')
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.tax-calculator-page {
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

.input-group {
  margin-bottom: $spacing-lg;

  &:last-of-type {
    margin-bottom: $spacing-lg;
  }
}

.input-label {
  display: block;
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: $spacing-sm;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  padding: 0 $spacing-md;
  box-shadow: var(--shadow-neumorphic-inset);
}

.input-field {
  flex: 1;
  height: 88rpx;
  font-size: $font-size-lg;
  color: var(--text-primary);
  background: transparent;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.input-unit {
  font-size: $font-size-md;
  color: var(--text-secondary);
  margin-left: $spacing-sm;
}

.calculate-btn {
  background: $gradient-primary;
  border-radius: $radius-md;
  padding: $spacing-md;
  text-align: center;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-normal;

  &:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-neumorphic-inset);
  }
}

.calculate-btn-text {
  font-size: $font-size-lg;
  font-weight: 600;
  color: #fff;
}

.result-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.result-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-lg;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;

  &.highlight {
    padding: $spacing-md;
    background-color: var(--bg-sunken);
    border-radius: $radius-md;
    margin-bottom: $spacing-sm;
  }
}

.result-label {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

.result-value {
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-primary);

  &.primary {
    color: $primary;
    font-size: $font-size-xl;
  }

  &.success {
    color: $success;
    font-size: $font-size-xl;
  }
}

.result-divider {
  height: 1rpx;
  background-color: var(--border-light);
  margin: $spacing-md 0;
}

.tax-brackets-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.brackets-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.brackets-table {
  overflow: hidden;
  border-radius: $radius-md;
  background-color: var(--bg-sunken);
}

.brackets-header {
  display: flex;
  background-color: var(--bg-hover);
  padding: $spacing-sm $spacing-md;
}

.brackets-row {
  display: flex;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
}

.brackets-cell {
  font-size: $font-size-sm;
  color: var(--text-secondary);

  .brackets-header & {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.bracket-col {
  width: 60rpx;
  text-align: center;
}

.range-col {
  flex: 1;
  text-align: center;
}

.rate-col {
  width: 80rpx;
  text-align: center;
}

.deduction-col {
  width: 120rpx;
  text-align: right;
}
</style>
