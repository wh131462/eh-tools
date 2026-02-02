<template>
  <view class="page calendar-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('calendar.title')" />

    <!-- 月份导航 -->
    <view class="month-nav">
      <view class="nav-btn" @click="prevMonth">‹</view>
      <view class="month-title" @click="goToday">
        {{ currentYear }}{{ t('calendar.year') }} {{ currentMonth }}{{ t('calendar.month') }}
      </view>
      <view class="nav-btn" @click="nextMonth">›</view>
    </view>

    <!-- 星期标题 -->
    <view class="weekday-header">
      <view
        v-for="(day, index) in weekdays"
        :key="index"
        class="weekday-item"
        :class="{ weekend: index === 0 || index === 6 }"
      >
        {{ day }}
      </view>
    </view>

    <!-- 日历网格 -->
    <view class="calendar-grid">
      <view
        v-for="(day, index) in calendarDays"
        :key="index"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'is-today': day.isToday,
          'is-selected': day.isSelected,
          'is-weekend': day.isWeekend
        }"
        @click="selectDate(day)"
      >
        <text class="day-number">{{ day.day }}</text>
        <text class="lunar-text">{{ day.lunarText }}</text>
      </view>
    </view>

    <!-- 农历详情面板 -->
    <view v-if="selectedLunarInfo" class="lunar-panel">
      <view class="lunar-header">
        <text class="lunar-date">{{ selectedLunarInfo.lunarDate }}</text>
        <text class="ganzhi">{{ selectedLunarInfo.ganzhi }}</text>
      </view>

      <!-- 宜忌 -->
      <view class="yi-ji-section">
        <view class="yi-section">
          <view class="section-label yi-label">{{ t('calendar.suitable') }}</view>
          <view class="section-content">{{ selectedLunarInfo.yi || t('calendar.allSuitable') }}</view>
        </view>
        <view class="ji-section">
          <view class="section-label ji-label">{{ t('calendar.avoid') }}</view>
          <view class="section-content">{{ selectedLunarInfo.ji || t('calendar.allAvoid') }}</view>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="detail-grid">
        <view class="detail-item" v-if="selectedLunarInfo.zodiac">
          <text class="detail-label">{{ t('calendar.zodiac') }}</text>
          <text class="detail-value">{{ selectedLunarInfo.zodiac }}</text>
        </view>
        <view class="detail-item" v-if="selectedLunarInfo.solarTerm">
          <text class="detail-label">{{ t('calendar.solarTerm') }}</text>
          <text class="detail-value">{{ selectedLunarInfo.solarTerm }}</text>
        </view>
        <view class="detail-item" v-if="selectedLunarInfo.festival">
          <text class="detail-label">{{ t('calendar.festival') }}</text>
          <text class="detail-value">{{ selectedLunarInfo.festival }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 当前显示的年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

// 选中的日期
const selectedDate = ref(new Date())

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 农历月份名称
const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

// 天干地支
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const zodiacNames = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 节气
const solarTerms = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
  '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至']

// 公历节日
const getSolarFestivals = (): Record<string, string> => {
  return {
    '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '3-12': '植树节',
    '4-1': '愚人节', '5-1': '劳动节', '5-4': '青年节', '6-1': '儿童节',
    '7-1': '建党节', '8-1': '建军节', '9-10': '教师节', '10-1': '国庆节',
    '12-24': '平安夜', '12-25': '圣诞节'
  }
}

// 农历节日
const getLunarFestivals = (): Record<string, string> => {
  return {
    '1-1': '春节', '1-15': '元宵节', '5-5': '端午节', '7-7': '七夕',
    '7-15': '中元节', '8-15': '中秋节', '9-9': '重阳节', '12-30': '除夕'
  }
}

// 简化的农历计算
function getLunarDate(date: Date) {
  const baseDate = new Date(1900, 0, 31)
  const offset = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)

  // 简化计算，使用近似值
  let lunarYear = 1900
  let lunarMonth = 1
  let lunarDay = 1
  let daysCount = offset

  // 简化：每年约354天
  while (daysCount >= 354) {
    daysCount -= 354
    lunarYear++
  }

  // 简化：每月约29.5天
  while (daysCount >= 30) {
    daysCount -= 30
    lunarMonth++
    if (lunarMonth > 12) {
      lunarMonth = 1
      lunarYear++
    }
  }

  lunarDay = daysCount + 1

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    monthName: lunarMonths[lunarMonth - 1] + t('calendar.monthSuffix'),
    dayName: lunarDays[Math.min(lunarDay - 1, 29)]
  }
}

// 获取干支年
function getGanZhiYear(year: number) {
  const ganIndex = (year - 4) % 10
  const zhiIndex = (year - 4) % 12
  return tianGan[ganIndex] + diZhi[zhiIndex]
}

// 获取生肖
function getZodiac(year: number) {
  return zodiacNames[(year - 4) % 12]
}

// 获取节气（简化版）
function getSolarTerm(date: Date): string {
  const month = date.getMonth()
  const day = date.getDate()

  // 简化的节气日期（大约）
  const termDays = [6, 20, 4, 19, 6, 21, 5, 20, 6, 21, 6, 22, 7, 23, 8, 23, 8, 23, 9, 24, 8, 22, 7, 22]

  const termIndex = month * 2
  if (day === termDays[termIndex]) {
    return solarTerms[termIndex]
  } else if (day === termDays[termIndex + 1]) {
    return solarTerms[termIndex + 1]
  }
  return ''
}

// 获取节日
function getFestival(date: Date, lunar: { month: number; day: number }): string {
  const solarKey = `${date.getMonth() + 1}-${date.getDate()}`
  const lunarKey = `${lunar.month}-${lunar.day}`

  const sf = getSolarFestivals()
  const lf = getLunarFestivals()
  return sf[solarKey] || lf[lunarKey] || ''
}

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const days: any[] = []

  // 当月第一天
  const firstDay = new Date(year, month - 1, 1)
  const firstDayWeek = firstDay.getDay()

  // 当月天数
  const daysInMonth = new Date(year, month, 0).getDate()

  // 上月天数
  const prevMonthDays = new Date(year, month - 1, 0).getDate()

  // 今天
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

  // 选中日期
  const selectedStr = `${selectedDate.value.getFullYear()}-${selectedDate.value.getMonth() + 1}-${selectedDate.value.getDate()}`

  // 填充上月日期
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(year, month - 2, day)
    const lunar = getLunarDate(date)
    const festival = getFestival(date, lunar)

    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      lunarText: festival || (lunar.day === 1 ? lunar.monthName : lunar.dayName),
      lunar
    })
  }

  // 填充当月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = `${year}-${month}-${day}`
    const lunar = getLunarDate(date)
    const festival = getFestival(date, lunar)
    const solarTerm = getSolarTerm(date)

    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      lunarText: festival || solarTerm || (lunar.day === 1 ? lunar.monthName : lunar.dayName),
      lunar,
      solarTerm,
      festival
    })
  }

  // 填充下月日期
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month, day)
    const lunar = getLunarDate(date)
    const festival = getFestival(date, lunar)

    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      lunarText: festival || (lunar.day === 1 ? lunar.monthName : lunar.dayName),
      lunar
    })
  }

  return days
})

// 选中日期的农历信息
const selectedLunarInfo = computed(() => {
  const date = selectedDate.value
  const lunar = getLunarDate(date)
  const year = date.getFullYear()

  return {
    lunarDate: `${t('calendar.lunarPrefix')}${lunar.monthName}${lunar.dayName}`,
    ganzhi: `${getGanZhiYear(year)}${t('calendar.year')} 【${getZodiac(year)}${t('calendar.year')}】`,
    zodiac: getZodiac(year),
    solarTerm: getSolarTerm(date),
    festival: getFestival(date, lunar),
    yi: t('calendar.defaultYi'),
    ji: t('calendar.defaultJi')
  }
})

// 上一月
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
}

// 下一月
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
}

// 回到今天
const goToday = () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
  selectedDate.value = today
}

// 选择日期
const selectDate = (day: any) => {
  selectedDate.value = day.date
  if (!day.isCurrentMonth) {
    currentYear.value = day.date.getFullYear()
    currentMonth.value = day.date.getMonth() + 1
  }
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('calendar.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.calendar-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;

  &:active {
    background-color: var(--bg-hover);
  }
}

.month-title {
  font-size: $font-size-lg;
  font-weight: 500;
  color: var(--text-primary);
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--bg-card);
  border-radius: $radius-md $radius-md 0 0;
  padding: $spacing-sm 0;
}

.weekday-item {
  text-align: center;
  font-size: $font-size-sm;
  color: var(--text-secondary);

  &.weekend {
    color: var(--error);
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--bg-card);
  border-radius: 0 0 $radius-md $radius-md;
  padding-bottom: $spacing-sm;
}

.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm 0;
  min-height: 100rpx;

  &:active {
    background-color: var(--bg-hover);
  }

  &.other-month {
    opacity: 0.4;
  }

  &.is-today {
    .day-number {
      background-color: var(--primary);
      color: #FFFFFF;
      border-radius: 50%;
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &.is-selected:not(.is-today) {
    .day-number {
      background-color: var(--bg-primary-light);
      color: var(--primary);
      border-radius: 50%;
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &.is-weekend {
    .day-number {
      color: var(--error);
    }
  }
}

.day-number {
  font-size: $font-size-md;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.lunar-text {
  font-size: 20rpx;
  color: var(--text-secondary);
  max-width: 90rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 农历详情面板
.lunar-panel {
  margin-top: $spacing-md;
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.lunar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
  margin-bottom: $spacing-md;
}

.lunar-date {
  font-size: $font-size-lg;
  font-weight: 500;
  color: var(--text-primary);
}

.ganzhi {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.yi-ji-section {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.yi-section,
.ji-section {
  flex: 1;
}

.section-label {
  font-size: $font-size-sm;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  margin-bottom: $spacing-xs;
  display: inline-block;
}

.yi-label {
  background-color: rgba(82, 196, 26, 0.1);
  color: var(--success);
}

.ji-label {
  background-color: rgba(255, 77, 79, 0.1);
  color: var(--error);
}

.section-content {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  line-height: 1.6;
}

.detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.detail-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.detail-value {
  font-size: $font-size-sm;
  color: var(--primary);
}
</style>
