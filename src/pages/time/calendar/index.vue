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

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="calendarShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store'
import { SolarDay } from 'tyme4ts'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 工具分享图配置
const toolShareConfig = {
  toolName: t('calendar.title'),
  icon: '📅',
  category: 'time' as const,
  subtitle: '农历黄历查询'
}

// 工具分享图 URL
const toolShareImageUrl = ref('')

// 工具分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 当前显示的年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

// 选中的日期
const selectedDate = ref(new Date())

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 获取某天的 tyme4ts 信息
function getDayInfo(date: Date) {
  const solarDay = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const lunarDay = solarDay.getLunarDay()
  const lunarMonth = lunarDay.getLunarMonth()
  const termDay = solarDay.getTermDay()

  // 节气：只有当天是节气日才显示
  const solarTerm = termDay.getDayIndex() === 0 ? termDay.getSolarTerm().getName() : ''

  // 节日：优先公历节日 > 农历节日
  const solarFestival = solarDay.getFestival()
  const lunarFestival = lunarDay.getFestival()
  const festival = solarFestival?.getName() || lunarFestival?.getName() || ''

  // 农历日名
  const lunarDayName = lunarDay.getName()
  // 农历月名（初一时显示月名）
  const lunarMonthName = lunarMonth.getName()

  return {
    solarDay,
    lunarDay,
    lunarMonth,
    solarTerm,
    festival,
    lunarDayName,
    lunarMonthName,
    lunarText: festival || solarTerm || (lunarDayName === '初一' ? lunarMonthName : lunarDayName)
  }
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
    const info = getDayInfo(date)

    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      ...info
    })
  }

  // 填充当月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = `${year}-${month}-${day}`
    const info = getDayInfo(date)

    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      ...info
    })
  }

  // 填充下月日期
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month, day)
    const info = getDayInfo(date)

    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      ...info
    })
  }

  return days
})

// 选中日期的农历信息
const selectedLunarInfo = computed(() => {
  const date = selectedDate.value
  const info = getDayInfo(date)
  const lunarDay = info.lunarDay
  const lunarMonth = info.lunarMonth
  const lunarYear = lunarMonth.getLunarYear()

  // 干支：年月日
  const yearSixtyCycle = lunarYear.getSixtyCycle()
  const monthSixtyCycle = lunarMonth.getSixtyCycle()
  const daySixtyCycle = lunarDay.getSixtyCycle()

  // 生肖
  const zodiac = yearSixtyCycle.getEarthBranch().getZodiac().getName()

  // 宜忌
  const recommends = lunarDay.getRecommends()
  const avoids = lunarDay.getAvoids()

  return {
    lunarDate: `${t('calendar.lunarPrefix')}${info.lunarMonthName}${info.lunarDayName}`,
    ganzhi: `${yearSixtyCycle.getName()}${t('calendar.year')} ${monthSixtyCycle.getName()}${t('calendar.month')} ${daySixtyCycle.getName()}${t('calendar.day')}`,
    zodiac: zodiac,
    solarTerm: info.solarTerm,
    festival: info.festival,
    yi: recommends.length > 0 ? recommends.map(r => r.getName()).join(' ') : t('calendar.allSuitable'),
    ji: avoids.length > 0 ? avoids.map(a => a.getName()).join(' ') : t('calendar.allAvoid')
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

onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('calendar.title')}`,
    path: '/pages/time/calendar/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => {
  return {
    title: `EH Tools - ${t('calendar.title')}`
  }
})

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
