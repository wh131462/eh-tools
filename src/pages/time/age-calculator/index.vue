<template>
  <view class="page age-calculator-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('ageCalculator.title')" />

    <!-- 生日输入 -->
    <view class="input-section">
      <view class="input-label">{{ t('ageCalculator.birthday') }}</view>
      <view class="date-picker" @click="openDatePicker">
        <text :class="{ placeholder: !birthday }">
          {{ birthday || t('ageCalculator.birthdayPlaceholder') }}
        </text>
        <text class="picker-arrow">▼</text>
      </view>
    </view>

    <!-- 日期选择器弹窗 -->
    <DatePickerPopup
      ref="datePickerRef"
      :title="t('ageCalculator.selectBirthday')"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      :end-year="currentYear"
      @confirm="onDateConfirm"
    />

    <!-- 结果展示 -->
    <view v-if="birthday" class="result-section">
      <view class="section-title">{{ t('ageCalculator.result') }}</view>

      <!-- 主要年龄显示 -->
      <view class="age-main">
        <view class="age-value">{{ ageResult.years }}</view>
        <view class="age-label">{{ t('ageCalculator.age') }}</view>
      </view>

      <!-- 精确年龄 -->
      <view class="age-detail">
        <view class="detail-title">{{ t('ageCalculator.exactAge') }}</view>
        <view class="detail-value">
          {{ ageResult.years }} {{ t('ageCalculator.years') }}
          {{ ageResult.months }} {{ t('ageCalculator.months') }}
          {{ ageResult.days }} {{ t('ageCalculator.days') }}
        </view>
      </view>

      <!-- 统计网格 -->
      <view class="stats-grid">
        <view class="stat-item">
          <view class="stat-value">{{ ageResult.totalDays }}</view>
          <view class="stat-label">{{ t('ageCalculator.totalDays') }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ ageResult.totalWeeks }}</view>
          <view class="stat-label">{{ t('ageCalculator.totalWeeks') }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ ageResult.totalMonths }}</view>
          <view class="stat-label">{{ t('ageCalculator.totalMonths') }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ ageResult.totalHours }}</view>
          <view class="stat-label">{{ t('ageCalculator.totalHours') }}</view>
        </view>
      </view>

      <!-- 下次生日倒计时 -->
      <view class="birthday-countdown">
        <view class="countdown-icon">🎂</view>
        <view class="countdown-text">
          <text class="countdown-label">{{ t('ageCalculator.nextBirthday') }}</text>
          <text class="countdown-value">
            {{ ageResult.daysToNextBirthday }} {{ t('ageCalculator.dayUnit') }}
          </text>
        </view>
      </view>

      <!-- 其他信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="info-label">{{ t('ageCalculator.bornWeekday') }}</text>
          <text class="info-value">{{ ageResult.weekday }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">{{ t('ageCalculator.zodiac') }}</text>
          <text class="info-value">{{ ageResult.zodiac }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">{{ t('ageCalculator.constellation') }}</text>
          <text class="info-value">{{ ageResult.constellation }}</text>
        </view>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="ageCalculatorShareCanvas"
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
import DatePickerPopup from '@/components/common/DatePickerPopup.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('ageCalculator.title'),
  icon: '🎂',
  category: 'time' as const,
  subtitle: '精确年龄计算'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 当前年份
const currentYear = new Date().getFullYear()

// 状态
const birthday = ref('')
const datePickerRef = ref<InstanceType<typeof DatePickerPopup> | null>(null)

// 打开日期选择器
const openDatePicker = () => {
  datePickerRef.value?.open(birthday.value)
}

// 日期确认
const onDateConfirm = (date: string) => {
  birthday.value = date
}

// 生肖数据
const zodiacNames = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 星座数据
const constellations = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座']

// 星期数据
const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

// 计算生肖
const getZodiac = (year: number): string => {
  const index = (year - 1900) % 12
  return zodiacNames[index]
}

// 计算星座
const getConstellation = (month: number, day: number): string => {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22]
  const index = day < dates[month - 1] ? month - 1 : month
  return constellations[index]
}

// 计算年龄结果
const ageResult = computed(() => {
  if (!birthday.value) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      totalHours: 0,
      daysToNextBirthday: 0,
      weekday: '',
      zodiac: '',
      constellation: ''
    }
  }

  const birthDate = new Date(birthday.value)
  const today = new Date()

  // 计算周岁
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  let days = today.getDate() - birthDate.getDate()

  // 调整月份和年份
  if (days < 0) {
    months--
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  // 计算总时长
  const diffMs = today.getTime() - birthDate.getTime()
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)
  const totalMonths = years * 12 + months
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))

  // 计算下次生日
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
  }
  const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // 获取出生星期
  const weekday = weekdays[birthDate.getDay()]

  // 生肖和星座
  const zodiac = getZodiac(birthDate.getFullYear())
  const constellation = getConstellation(birthDate.getMonth() + 1, birthDate.getDate())

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    daysToNextBirthday,
    weekday,
    zodiac,
    constellation
  }
})

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('ageCalculator.title')}`,
    path: '/pages/time/age-calculator/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('ageCalculator.title')}`
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('ageCalculator.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.age-calculator-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

// 输入区域
.input-section {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.input-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
  font-size: $font-size-md;
  color: var(--text-primary);

  .placeholder {
    color: var(--text-placeholder);
  }

  &:active {
    opacity: 0.8;
  }
}

.picker-arrow {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
}

// 结果区域
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: $spacing-lg;
}

// 主要年龄展示
.age-main {
  text-align: center;
  padding: $spacing-xl 0;
  background: var(--gradient-primary);
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
}

.age-value {
  font-size: 96rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1.2;
  margin-bottom: $spacing-xs;
}

.age-label {
  font-size: $font-size-lg;
  color: rgba(255, 255, 255, 0.9);
}

// 精确年龄
.age-detail {
  text-align: center;
  padding: $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  margin-bottom: $spacing-lg;
}

.detail-title {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.detail-value {
  font-size: $font-size-lg;
  color: var(--text-primary);
  font-weight: 500;
}

// 统计网格
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.stat-item {
  text-align: center;
  padding: $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
}

.stat-value {
  font-size: $font-size-xxl;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: $spacing-xs;
}

.stat-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

// 生日倒计时
.birthday-countdown {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: linear-gradient(135deg, #fd79a8, #fdcb6e);
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
}

.countdown-icon {
  font-size: 48rpx;
}

.countdown-text {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.countdown-label {
  font-size: $font-size-md;
  color: #FFFFFF;
  font-weight: 500;
}

.countdown-value {
  font-size: $font-size-lg;
  color: #FFFFFF;
  font-weight: bold;
}

// 其他信息
.info-section {
  border-top: 1rpx solid var(--border-light);
  padding-top: $spacing-md;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
}

.info-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.info-value {
  font-size: $font-size-md;
  color: var(--text-primary);
  font-weight: 500;
}

.bottom-placeholder {
  height: $spacing-md;
}
</style>
