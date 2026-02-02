<template>
  <view class="page salary-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('salary.title')" />

    <!-- 输入区域 -->
    <view class="input-section">
      <view class="input-item">
        <view class="input-label">{{ t('salary.baseSalary') }} ({{ t('salary.unit.yuan') }})</view>
        <input
          class="input-field"
          type="digit"
          placeholder="5000"
          v-model="baseSalary"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('salary.dailyHours') }} ({{ t('salary.unit.hours') }})</view>
        <input
          class="input-field"
          type="digit"
          placeholder="9"
          v-model="dailyHours"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('salary.weekendHours') }} ({{ t('salary.unit.hoursPerMonth') }})</view>
        <input
          class="input-field"
          type="digit"
          placeholder="0"
          v-model="weekendHours"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('salary.holidayHours') }} ({{ t('salary.unit.hoursPerMonth') }})</view>
        <input
          class="input-field"
          type="digit"
          placeholder="0"
          v-model="holidayHours"
        />
      </view>
    </view>

    <!-- 结果显示 -->
    <view v-if="result" class="result-section">
      <!-- 总工资 -->
      <view class="total-salary" :class="{ illegal: result.isIllegal }">
        <view class="total-label">{{ t('salary.totalSalary') }}</view>
        <view class="total-value">¥ {{ result.totalSalary }}</view>
      </view>

      <!-- 进度条 -->
      <view class="progress-bar">
        <view
          class="progress-fill"
          :class="{ illegal: result.isIllegal }"
          :style="{ width: result.progressWidth + '%' }"
        ></view>
      </view>

      <!-- 工资构成 -->
      <view class="salary-breakdown">
        <view class="breakdown-item">
          <view class="breakdown-tag normal">{{ t('salary.normalSalary') }}</view>
          <view class="breakdown-value">¥ {{ result.normalSalary }}</view>
        </view>
        <view class="breakdown-item">
          <view class="breakdown-tag weekday">{{ t('salary.weekdayOvertime') }}</view>
          <view class="breakdown-value">¥ {{ result.weekdayOvertime }}</view>
        </view>
        <view class="breakdown-item">
          <view class="breakdown-tag weekend">{{ t('salary.weekendOvertime') }}</view>
          <view class="breakdown-value">¥ {{ result.weekendOvertime }}</view>
        </view>
        <view class="breakdown-item">
          <view class="breakdown-tag holiday">{{ t('salary.holidayOvertime') }}</view>
          <view class="breakdown-value">¥ {{ result.holidayOvertime }}</view>
        </view>
      </view>

      <!-- 违法警告 -->
      <view v-if="result.isIllegal" class="illegal-section">
        <view class="illegal-title">⚠️ {{ t('salary.illegal') }}</view>
        <view class="illegal-list">
          <view v-if="result.violations.dailyHours" class="illegal-item">
            • {{ t('salary.illegalDaily') }}
          </view>
          <view v-if="result.violations.dailyOvertime" class="illegal-item">
            • {{ t('salary.illegalDailyOvertime') }}
          </view>
          <view v-if="result.violations.monthlyOvertime" class="illegal-item">
            • {{ t('salary.illegalMonthlyOvertime') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 说明 -->
    <view class="info-section">
      <view class="info-title">{{ t('salary.infoTitle') }}</view>
      <view class="info-content">
        <view class="info-item">• {{ t('salary.infoStandardHours') }}</view>
        <view class="info-item">• {{ t('salary.infoMonthlyDays') }}</view>
        <view class="info-item">• {{ t('salary.infoWeekdayRate') }}</view>
        <view class="info-item">• {{ t('salary.infoWeekendRate') }}</view>
        <view class="info-item">• {{ t('salary.infoHolidayRate') }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 常量
const STANDARD_HOURS = 8
const MONTHLY_WORK_DAYS = 21.75
const WEEKDAY_RATE = 1.5
const WEEKEND_RATE = 2.0
const HOLIDAY_RATE = 3.0

// 输入值
const baseSalary = ref('5000')
const dailyHours = ref('9')
const weekendHours = ref('0')
const holidayHours = ref('0')

// 计算结果
const result = computed(() => {
  const base = parseFloat(baseSalary.value) || 0
  const daily = parseFloat(dailyHours.value) || 0
  const weekend = parseFloat(weekendHours.value) || 0
  const holiday = parseFloat(holidayHours.value) || 0

  if (base <= 0) return null

  // 时薪 = 基本工资 / (8 × 21.75)
  const hourlyRate = base / (STANDARD_HOURS * MONTHLY_WORK_DAYS)

  // 正常工资
  const normalSalary = base

  // 工作日加班费 = max(0, 日工作时长 - 8) × 21.75 × 时薪 × 1.5
  const dailyOvertime = Math.max(0, daily - STANDARD_HOURS)
  const weekdayOvertime = dailyOvertime * MONTHLY_WORK_DAYS * hourlyRate * WEEKDAY_RATE

  // 周末加班费 = 周末加班时长 × 时薪 × 2.0
  const weekendOvertime = weekend * hourlyRate * WEEKEND_RATE

  // 节假日加班费 = 节假日加班时长 × 时薪 × 3.0
  const holidayOvertime = holiday * hourlyRate * HOLIDAY_RATE

  // 总工资
  const totalSalary = normalSalary + weekdayOvertime + weekendOvertime + holidayOvertime

  // 月加班总时长
  const monthlyOvertimeHours = dailyOvertime * MONTHLY_WORK_DAYS + weekend + holiday

  // 合法性检查
  const violations = {
    dailyHours: daily > 12,
    dailyOvertime: dailyOvertime > 3,
    monthlyOvertime: monthlyOvertimeHours > 36
  }

  const isIllegal = violations.dailyHours || violations.dailyOvertime || violations.monthlyOvertime

  // 进度条宽度（基于加班比例）
  const overtimeRatio = (totalSalary - normalSalary) / normalSalary
  const progressWidth = Math.min(100, (1 + overtimeRatio) * 50)

  return {
    normalSalary: normalSalary.toFixed(2),
    weekdayOvertime: weekdayOvertime.toFixed(2),
    weekendOvertime: weekendOvertime.toFixed(2),
    holidayOvertime: holidayOvertime.toFixed(2),
    totalSalary: totalSalary.toFixed(2),
    isIllegal,
    violations,
    progressWidth
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('salary.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.salary-page {
  min-height: 100vh;
  padding: $spacing-md;
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

// 结果显示
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.total-salary {
  text-align: center;
  margin-bottom: $spacing-md;

  &.illegal {
    .total-value {
      color: var(--error);
    }
  }
}

.total-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.total-value {
  font-size: 64rpx;
  font-weight: bold;
  color: var(--primary);
}

// 进度条
.progress-bar {
  height: 12rpx;
  background-color: var(--bg-page);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: $spacing-lg;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success), var(--primary));
  border-radius: 6rpx;
  transition: width 0.3s ease;

  &.illegal {
    background: linear-gradient(90deg, var(--warning), var(--error));
  }
}

// 工资构成
.salary-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.breakdown-tag {
  font-size: $font-size-xs;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;

  &.normal {
    background-color: var(--bg-primary-light);
    color: var(--primary);
  }

  &.weekday {
    background-color: rgba(82, 196, 26, 0.1);
    color: var(--success);
  }

  &.weekend {
    background-color: rgba(250, 173, 20, 0.1);
    color: var(--warning);
  }

  &.holiday {
    background-color: rgba(255, 77, 79, 0.1);
    color: var(--error);
  }
}

.breakdown-value {
  font-size: $font-size-sm;
  color: var(--text-primary);
}

// 违法警告
.illegal-section {
  background-color: rgba(255, 77, 79, 0.05);
  border: 1rpx solid rgba(255, 77, 79, 0.2);
  border-radius: $radius-sm;
  padding: $spacing-md;
}

.illegal-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--error);
  margin-bottom: $spacing-sm;
}

.illegal-list {
  font-size: $font-size-sm;
}

.illegal-item {
  color: var(--error);
  margin-bottom: $spacing-xs;

  &:last-child {
    margin-bottom: 0;
  }
}

// 说明
.info-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.info-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: $spacing-sm;
}

.info-content {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.info-item {
  margin-bottom: $spacing-xs;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
