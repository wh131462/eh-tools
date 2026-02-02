<template>
  <view class="page mortgage-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('mortgage.title')" />

    <!-- 输入区域 -->
    <view class="input-section">
      <view class="input-item">
        <view class="input-label">{{ t('mortgage.loanAmount') }} ({{ t('mortgage.unit.yuan') }})</view>
        <input
          class="input-field"
          type="text"
          placeholder="1,000,000"
          :value="loanAmountDisplay"
          @input="handleAmountInput"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('mortgage.loanTerm') }} ({{ t('mortgage.unit.year') }})</view>
        <input
          class="input-field"
          type="digit"
          placeholder="30"
          v-model="loanTerm"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('mortgage.interestRate') }} ({{ t('mortgage.unit.percent') }})</view>
        <input
          class="input-field"
          type="digit"
          placeholder="4.2"
          v-model="interestRate"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('mortgage.repaymentMethod') }}</view>
        <view class="method-switch">
          <view
            class="method-btn"
            :class="{ active: method === 'equal_principal_interest' }"
            @click="method = 'equal_principal_interest'"
          >
            {{ t('mortgage.equalPrincipalInterest') }}
          </view>
          <view
            class="method-btn"
            :class="{ active: method === 'equal_principal' }"
            @click="method = 'equal_principal'"
          >
            {{ t('mortgage.equalPrincipal') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 计算按钮 -->
    <button class="calc-btn" @click="calculate">
      {{ t('mortgage.calculate') }}
    </button>

    <!-- 结果概览 -->
    <view v-if="result" class="result-section">
      <view class="result-item">
        <view class="result-label">{{ t('mortgage.monthlyPayment') }}</view>
        <view class="result-value primary">
          {{ method === 'equal_principal_interest' ? result.monthlyPayment : result.firstMonthPayment + ' ~ ' + result.lastMonthPayment }}
        </view>
      </view>
      <view class="result-item">
        <view class="result-label">{{ t('mortgage.totalPayment') }}</view>
        <view class="result-value">{{ result.totalPayment }}</view>
      </view>
      <view class="result-item">
        <view class="result-label">{{ t('mortgage.totalInterest') }}</view>
        <view class="result-value">{{ result.totalInterest }}</view>
      </view>
    </view>

    <!-- 还款计划 -->
    <view v-if="result && result.schedule.length > 0" class="schedule-section">
      <view class="schedule-header">
        <text class="section-title">{{ t('mortgage.repaymentPlan') }}</text>
        <text class="expand-btn" @click="showAllSchedule = !showAllSchedule">
          {{ showAllSchedule ? t('mortgage.collapse') : t('mortgage.expand') }}
        </text>
      </view>

      <!-- 表头 -->
      <view class="table-header">
        <text class="col-period">{{ t('mortgage.period') }}</text>
        <text class="col-principal">{{ t('mortgage.principal') }}</text>
        <text class="col-interest">{{ t('mortgage.interest') }}</text>
        <text class="col-total">{{ t('mortgage.totalAmount') }}</text>
      </view>

      <!-- 摘要显示 -->
      <view v-if="!showAllSchedule" class="schedule-summary">
        <view class="table-row">
          <text class="col-period">1</text>
          <text class="col-principal">{{ result.schedule[0].principal }}</text>
          <text class="col-interest">{{ result.schedule[0].interest }}</text>
          <text class="col-total">{{ result.schedule[0].total }}</text>
        </view>
        <view class="summary-dots">...</view>
        <view class="table-row">
          <text class="col-period">{{ result.schedule.length }}</text>
          <text class="col-principal">{{ result.schedule[result.schedule.length - 1].principal }}</text>
          <text class="col-interest">{{ result.schedule[result.schedule.length - 1].interest }}</text>
          <text class="col-total">{{ result.schedule[result.schedule.length - 1].total }}</text>
        </view>
      </view>

      <!-- 完整列表 -->
      <scroll-view v-else class="schedule-list" scroll-y>
        <view
          v-for="item in result.schedule"
          :key="item.period"
          class="table-row"
        >
          <text class="col-period">{{ item.period }}</text>
          <text class="col-principal">{{ item.principal }}</text>
          <text class="col-interest">{{ item.interest }}</text>
          <text class="col-total">{{ item.total }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 输入值
const loanAmount = ref('')
const loanAmountDisplay = ref('')
const loanTerm = ref('')
const interestRate = ref('')
const method = ref<'equal_principal_interest' | 'equal_principal'>('equal_principal_interest')

// 结果
const result = ref<any>(null)
const showAllSchedule = ref(false)

// 格式化金额
const formatMoney = (num: number) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化输入框显示（千分位，无小数）
const formatInputNumber = (value: string) => {
  const num = value.replace(/,/g, '')
  if (!num || isNaN(Number(num))) return ''
  return Number(num).toLocaleString('zh-CN', {
    maximumFractionDigits: 0
  })
}

// 处理金额输入
const handleAmountInput = (e: any) => {
  const value = e.detail.value.replace(/,/g, '')
  loanAmount.value = value
  loanAmountDisplay.value = formatInputNumber(value)
}

// 计算
const calculate = () => {
  const amount = parseFloat(loanAmount.value)
  const years = parseInt(loanTerm.value)
  const rate = parseFloat(interestRate.value)

  if (!amount || !years || !rate || amount <= 0 || years <= 0 || rate <= 0) {
    showToast(t('mortgage.invalidInput'))
    return
  }

  const monthlyRate = rate / 12 / 100
  const months = years * 12
  const schedule: any[] = []

  let totalPayment = 0
  let totalInterest = 0
  let monthlyPayment = 0
  let firstMonthPayment = 0
  let lastMonthPayment = 0

  if (method.value === 'equal_principal_interest') {
    // 等额本息
    // M = P × [r(1+r)^n] / [(1+r)^n - 1]
    const pow = Math.pow(1 + monthlyRate, months)
    monthlyPayment = amount * (monthlyRate * pow) / (pow - 1)

    let remainingPrincipal = amount
    for (let i = 1; i <= months; i++) {
      const interest = remainingPrincipal * monthlyRate
      const principal = monthlyPayment - interest
      remainingPrincipal -= principal

      schedule.push({
        period: i,
        principal: formatMoney(principal),
        interest: formatMoney(interest),
        total: formatMoney(monthlyPayment),
        remaining: formatMoney(Math.max(0, remainingPrincipal))
      })

      totalInterest += interest
    }

    totalPayment = monthlyPayment * months
    firstMonthPayment = monthlyPayment
    lastMonthPayment = monthlyPayment
  } else {
    // 等额本金
    const monthlyPrincipal = amount / months

    let remainingPrincipal = amount
    for (let i = 1; i <= months; i++) {
      const interest = remainingPrincipal * monthlyRate
      const total = monthlyPrincipal + interest
      remainingPrincipal -= monthlyPrincipal

      schedule.push({
        period: i,
        principal: formatMoney(monthlyPrincipal),
        interest: formatMoney(interest),
        total: formatMoney(total),
        remaining: formatMoney(Math.max(0, remainingPrincipal))
      })

      totalPayment += total
      totalInterest += interest

      if (i === 1) firstMonthPayment = total
      if (i === months) lastMonthPayment = total
    }
  }

  result.value = {
    monthlyPayment: formatMoney(monthlyPayment),
    firstMonthPayment: formatMoney(firstMonthPayment),
    lastMonthPayment: formatMoney(lastMonthPayment),
    totalPayment: formatMoney(totalPayment),
    totalInterest: formatMoney(totalInterest),
    schedule
  }

  showAllSchedule.value = false
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('mortgage.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.mortgage-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: $spacing-xl;
  box-sizing: border-box;
}

// 输入区域
.input-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.input-item {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.input-field {
  width: 100%;
  height: 80rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  box-sizing: border-box;
}

.method-switch {
  display: flex;
  gap: $spacing-sm;
}

.method-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: var(--text-secondary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &.active {
    background-color: var(--primary);
    color: #FFFFFF;
  }
}

// 计算按钮
.calc-btn {
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

// 结果概览
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
}

.result-label {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

.result-value {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);

  &.primary {
    font-size: $font-size-lg;
    color: var(--primary);
  }
}

// 还款计划
.schedule-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
}

.expand-btn {
  font-size: $font-size-sm;
  color: var(--primary);
}

.table-header {
  display: flex;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);
  font-size: $font-size-sm;
  color: var(--text-secondary);
  font-weight: 500;
}

.table-row {
  display: flex;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);
  font-size: $font-size-sm;

  &:last-child {
    border-bottom: none;
  }
}

.col-period {
  width: 15%;
  color: var(--text-primary);
}

.col-principal,
.col-interest,
.col-total {
  width: 28.33%;
  color: var(--text-secondary);
  text-align: right;
}

.summary-dots {
  text-align: center;
  padding: $spacing-sm 0;
  color: var(--text-placeholder);
}

.schedule-list {
  max-height: 600rpx;
}
</style>
