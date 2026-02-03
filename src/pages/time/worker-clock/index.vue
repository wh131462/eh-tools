<template>
  <view class="page worker-clock-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('workerClock.title')" />

    <!-- 状态卡片 -->
    <view class="status-card">
      <view class="status-icon" :class="currentStatusClass">
        <image :src="currentStatusIcon" class="status-svg" mode="aspectFit" />
      </view>
      <view class="status-info">
        <text class="status-text">{{ currentStatusText }}</text>
        <text class="status-time">{{ currentTimeStr }}</text>
      </view>
    </view>

    <!-- 主要倒计时卡片 -->
    <view class="countdown-card main-countdown" v-if="showMainCountdown">
      <view class="countdown-label">{{ mainCountdownLabel }}</view>
      <view class="countdown-time">
        <view class="time-block">
          <text class="time-value">{{ mainCountdown.hours }}</text>
          <text class="time-unit">{{ t('workerClock.unit.hour') }}</text>
        </view>
        <text class="time-separator">:</text>
        <view class="time-block">
          <text class="time-value">{{ mainCountdown.minutes }}</text>
          <text class="time-unit">{{ t('workerClock.unit.minute') }}</text>
        </view>
        <text class="time-separator">:</text>
        <view class="time-block">
          <text class="time-value">{{ mainCountdown.seconds }}</text>
          <text class="time-unit">{{ t('workerClock.unit.second') }}</text>
        </view>
      </view>
    </view>

    <!-- 进度卡片 -->
    <view class="progress-section">
      <view class="section-title">{{ t('workerClock.progress.today') }}</view>
      <view class="progress-cards">
        <!-- 今日进度 -->
        <view class="progress-card">
          <view class="progress-header">
            <text class="progress-label">{{ t('workerClock.progress.today') }}</text>
            <text class="progress-value">{{ todayProgress }}%</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: todayProgress + '%' }"></view>
          </view>
        </view>

        <!-- 本周进度 -->
        <view class="progress-card">
          <view class="progress-header">
            <text class="progress-label">{{ t('workerClock.progress.week') }}</text>
            <text class="progress-value">{{ weekProgress }}%</text>
          </view>
          <view class="progress-bar bar-week">
            <view class="progress-fill fill-week" :style="{ width: weekProgress + '%' }"></view>
          </view>
        </view>

        <!-- 本月进度 -->
        <view class="progress-card">
          <view class="progress-header">
            <text class="progress-label">{{ t('workerClock.progress.month') }}</text>
            <text class="progress-value">{{ monthProgress }}%</text>
          </view>
          <view class="progress-bar bar-month">
            <view class="progress-fill fill-month" :style="{ width: monthProgress + '%' }"></view>
          </view>
        </view>

        <!-- 年度进度 -->
        <view class="progress-card">
          <view class="progress-header">
            <text class="progress-label">{{ t('workerClock.progress.year') }}</text>
            <text class="progress-value">{{ yearProgress }}%</text>
          </view>
          <view class="progress-bar bar-year">
            <view class="progress-fill fill-year" :style="{ width: yearProgress + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 收入卡片 -->
    <view class="income-section" v-if="settings.monthlySalary > 0">
      <view class="section-title">{{ t('workerClock.income.today') }}</view>
      <view class="income-cards">
        <view class="income-card main-income">
          <text class="income-label">{{ t('workerClock.income.today') }}</text>
          <view class="income-value">
            <text class="income-currency">¥</text>
            <text class="income-amount">{{ todayEarned }}</text>
          </view>
        </view>
        <view class="income-card">
          <text class="income-label">{{ t('workerClock.income.month') }}</text>
          <view class="income-value small">
            <text class="income-currency">¥</text>
            <text class="income-amount">{{ monthEarned }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他倒计时 -->
    <view class="countdown-section">
      <view class="countdown-grid">
        <!-- 周末倒计时 -->
        <view class="countdown-item" v-if="!isWeekend">
          <text class="countdown-item-label">{{ t('workerClock.countdown.weekend') }}</text>
          <text class="countdown-item-value">{{ weekendCountdown }} {{ t('workerClock.unit.day') }}</text>
        </view>
        <!-- 发薪日倒计时 -->
        <view class="countdown-item">
          <text class="countdown-item-label">{{ t('workerClock.countdown.payday') }}</text>
          <text class="countdown-item-value">{{ paydayCountdown }} {{ t('workerClock.unit.day') }}</text>
        </view>
        <!-- 节假日倒计时 -->
        <view class="countdown-item">
          <text class="countdown-item-label">{{ nextHoliday.name }}</text>
          <text class="countdown-item-value">{{ nextHoliday.days }} {{ t('workerClock.unit.day') }}</text>
        </view>
      </view>
    </view>

    <!-- 打工人语录 -->
    <view class="quote-card" @click="refreshQuote">
      <view class="quote-icon">
        <image src="/static/icons/quote.svg" class="quote-svg" mode="aspectFit" />
      </view>
      <text class="quote-text">{{ currentQuote }}</text>
    </view>

    <!-- 设置按钮 -->
    <view class="settings-btn" @click="showSettings = true">
      <image src="/static/icons/settings.svg" class="settings-icon" mode="aspectFit" />
      <text>{{ t('workerClock.settings.title') }}</text>
    </view>

    <!-- 设置弹窗 -->
    <view class="settings-popup" v-if="showSettings">
      <view class="settings-mask" @click="showSettings = false"></view>
      <view class="settings-content" @click.stop>
        <view class="settings-header">
          <text class="settings-title">{{ t('workerClock.settings.title') }}</text>
          <view class="close-btn" @click="showSettings = false">
            <text>×</text>
          </view>
        </view>

        <scroll-view scroll-y class="settings-scroll">
          <!-- 工作时间设置 -->
          <view class="settings-group">
            <view class="settings-group-title">{{ t('workerClock.settings.workTime') }}</view>
            <view class="time-picker-row">
              <view class="time-picker-item">
                <text class="time-picker-label">{{ t('workerClock.settings.startTime') }}</text>
                <view class="time-picker-input" @click="openStartTimePicker">
                  <text class="time-picker-value">{{ settings.startTime }}</text>
                  <text class="time-picker-arrow">▼</text>
                </view>
              </view>
              <view class="time-picker-separator">—</view>
              <view class="time-picker-item">
                <text class="time-picker-label">{{ t('workerClock.settings.endTime') }}</text>
                <view class="time-picker-input" @click="openEndTimePicker">
                  <text class="time-picker-value">{{ settings.endTime }}</text>
                  <text class="time-picker-arrow">▼</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 午休时间设置 -->
          <view class="settings-group">
            <view class="settings-group-title">{{ t('workerClock.settings.lunchBreak') }}</view>
            <view class="time-picker-row">
              <view class="time-picker-item">
                <text class="time-picker-label">{{ t('workerClock.settings.lunchStart') }}</text>
                <view class="time-picker-input" @click="openLunchStartPicker">
                  <text class="time-picker-value">{{ settings.lunchStart }}</text>
                  <text class="time-picker-arrow">▼</text>
                </view>
              </view>
              <view class="time-picker-separator">—</view>
              <view class="time-picker-item">
                <text class="time-picker-label">{{ t('workerClock.settings.lunchEnd') }}</text>
                <view class="time-picker-input" @click="openLunchEndPicker">
                  <text class="time-picker-value">{{ settings.lunchEnd }}</text>
                  <text class="time-picker-arrow">▼</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 休息模式 -->
          <view class="settings-group">
            <view class="settings-group-title">{{ t('workerClock.settings.restMode') }}</view>
            <view class="rest-mode-options">
              <view
                class="rest-mode-option"
                :class="{ active: settings.restMode === 'double' }"
                @click.stop="settings.restMode = 'double'"
              >
                <text>{{ t('workerClock.settings.doubleWeekend') }}</text>
              </view>
              <view
                class="rest-mode-option"
                :class="{ active: settings.restMode === 'single' }"
                @click.stop="settings.restMode = 'single'"
              >
                <text>{{ t('workerClock.settings.singleWeekend') }}</text>
              </view>
              <view
                class="rest-mode-option"
                :class="{ active: settings.restMode === 'alternate' }"
                @click.stop="settings.restMode = 'alternate'"
              >
                <text>{{ t('workerClock.settings.alternateWeekend') }}</text>
              </view>
            </view>
          </view>

          <!-- 薪资设置 -->
          <view class="settings-group">
            <view class="settings-group-title">{{ t('workerClock.settings.salary') }}</view>
            <view class="salary-input-item">
              <text class="salary-input-label">{{ t('workerClock.settings.monthlySalary') }}</text>
              <view class="salary-input-wrapper" @click.stop>
                <input
                  type="digit"
                  class="salary-input-field"
                  v-model="settings.monthlySalary"
                  placeholder="0"
                  @click.stop
                />
                <text class="salary-input-unit">{{ t('workerClock.unit.yuan') }}</text>
              </view>
            </view>
            <view class="salary-input-item">
              <text class="salary-input-label">{{ t('workerClock.settings.payday') }}</text>
              <view class="salary-picker-input" @click="openPaydayPicker">
                <text class="salary-picker-value">{{ settings.payday }} {{ t('workerClock.unit.dayOfMonth') }}</text>
                <text class="salary-picker-arrow">▼</text>
              </view>
            </view>
          </view>

          <!-- 保存按钮 -->
          <view class="save-btn" @click.stop="saveSettings">
            <text>{{ t('common.save') }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 下班庆祝动效 -->
    <view class="celebrate-overlay" v-if="showCelebrate" @click="showCelebrate = false">
      <view class="celebrate-content">
        <image src="/static/icons/celebrate.svg" class="celebrate-icon" mode="aspectFit" />
        <text class="celebrate-text">{{ t('workerClock.status.offWork') }}</text>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" />

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="workerClockShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />

    <!-- 时间选择器弹窗 -->
    <TimePickerPopup
      ref="startTimePickerRef"
      :title="t('workerClock.settings.startTime')"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      @confirm="onStartTimeConfirm"
    />
    <TimePickerPopup
      ref="endTimePickerRef"
      :title="t('workerClock.settings.endTime')"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      @confirm="onEndTimeConfirm"
    />
    <TimePickerPopup
      ref="lunchStartPickerRef"
      :title="t('workerClock.settings.lunchStart')"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      @confirm="onLunchStartConfirm"
    />
    <TimePickerPopup
      ref="lunchEndPickerRef"
      :title="t('workerClock.settings.lunchEnd')"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      @confirm="onLunchEndConfirm"
    />
    <SelectorPickerPopup
      ref="paydayPickerRef"
      :title="t('workerClock.settings.payday')"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      :options="paydays"
      :suffix="t('workerClock.unit.dayOfMonth')"
      @confirm="onPaydayConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import TimePickerPopup from '@/components/common/TimePickerPopup.vue'
import SelectorPickerPopup from '@/components/common/SelectorPickerPopup.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 时间选择器引用
const startTimePickerRef = ref<InstanceType<typeof TimePickerPopup> | null>(null)
const endTimePickerRef = ref<InstanceType<typeof TimePickerPopup> | null>(null)
const lunchStartPickerRef = ref<InstanceType<typeof TimePickerPopup> | null>(null)
const lunchEndPickerRef = ref<InstanceType<typeof TimePickerPopup> | null>(null)
const paydayPickerRef = ref<InstanceType<typeof SelectorPickerPopup> | null>(null)

// === 打工人语录 ===
const WORKER_QUOTES = [
  '打工人，打工魂，打工都是人上人！',
  '今天搬砖不狠，明天地位不稳。',
  '没有困难的工作，只有勇敢的打工人。',
  '累吗？累就对了，舒服是留给有钱人的。',
  '生活不止眼前的苟且，还有下周和下下周。',
  '打工赚钱，花钱购物，人生完美闭环。',
  '不是工作需要我，是我的房贷需要它。',
  '早安，打工人！今天也要元气满满地搬砖！',
  '工资是我唯一的快乐源泉。',
  '努力工作是为了更好的摸鱼。',
  '打工一天，开心一秒。',
  '愿你的工资配得上你的辛苦。',
  '今天又是为资本家奋斗的一天。',
  '我不是在上班，我是在用时间换生存。',
  '只有脚踏实地的人，才能说地不好走。'
]

// === 状态 ===
const currentTime = ref(new Date())
const showSettings = ref(false)
const showCelebrate = ref(false)
const currentQuoteIndex = ref(0)
const toolShareImageUrl = ref('')

// 设置
const settings = ref({
  startTime: '09:00',
  endTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  restMode: 'double' as 'double' | 'single' | 'alternate',
  monthlySalary: 0,
  payday: 10
})

// 发薪日选项 (1-31号)
const paydays = Array.from({ length: 31 }, (_, i) => i + 1)

// 定时器
let timer: ReturnType<typeof setInterval> | null = null

// === 计算属性 ===

// 当前时间字符串
const currentTimeStr = computed(() => {
  const h = currentTime.value.getHours().toString().padStart(2, '0')
  const m = currentTime.value.getMinutes().toString().padStart(2, '0')
  const s = currentTime.value.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

// 是否是周末
const isWeekend = computed(() => {
  const day = currentTime.value.getDay()
  if (settings.value.restMode === 'double') {
    return day === 0 || day === 6
  } else if (settings.value.restMode === 'single') {
    return day === 0
  } else {
    // 大小周：偶数周双休，奇数周单休
    const weekNum = Math.floor((currentTime.value.getTime() - new Date(currentTime.value.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    if (weekNum % 2 === 0) {
      return day === 0 || day === 6
    }
    return day === 0
  }
})

// 是否在工作时间
const isWorkTime = computed(() => {
  if (isWeekend.value) return false

  const now = currentTime.value
  const [startH, startM] = settings.value.startTime.split(':').map(Number)
  const [endH, endM] = settings.value.endTime.split(':').map(Number)
  const [lunchStartH, lunchStartM] = settings.value.lunchStart.split(':').map(Number)
  const [lunchEndH, lunchEndM] = settings.value.lunchEnd.split(':').map(Number)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  const lunchStartMinutes = lunchStartH * 60 + lunchStartM
  const lunchEndMinutes = lunchEndH * 60 + lunchEndM

  // 午休时间不算工作时间
  if (currentMinutes >= lunchStartMinutes && currentMinutes < lunchEndMinutes) {
    return false
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
})

// 是否在午休
const isLunchBreak = computed(() => {
  if (isWeekend.value) return false

  const now = currentTime.value
  const [lunchStartH, lunchStartM] = settings.value.lunchStart.split(':').map(Number)
  const [lunchEndH, lunchEndM] = settings.value.lunchEnd.split(':').map(Number)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const lunchStartMinutes = lunchStartH * 60 + lunchStartM
  const lunchEndMinutes = lunchEndH * 60 + lunchEndM

  return currentMinutes >= lunchStartMinutes && currentMinutes < lunchEndMinutes
})

// 当前状态
const currentStatusText = computed(() => {
  if (isWeekend.value) return t('workerClock.status.weekend')
  if (isLunchBreak.value) return t('workerClock.status.lunchBreak')
  if (isWorkTime.value) return t('workerClock.status.working')
  return t('workerClock.status.offWork')
})

const currentStatusClass = computed(() => {
  if (isWeekend.value) return 'status-weekend'
  if (isLunchBreak.value) return 'status-lunch'
  if (isWorkTime.value) return 'status-working'
  return 'status-off'
})

const currentStatusIcon = computed(() => {
  if (isWeekend.value) return '/static/icons/status-weekend.svg'
  if (isLunchBreak.value) return '/static/icons/status-lunch.svg'
  if (isWorkTime.value) return '/static/icons/status-working.svg'
  return '/static/icons/status-off.svg'
})

// 是否显示主倒计时
const showMainCountdown = computed(() => {
  if (isWeekend.value) return false
  return true
})

// 主倒计时标签
const mainCountdownLabel = computed(() => {
  if (isLunchBreak.value) {
    return t('workerClock.countdown.lunchBreak')
  }

  const now = currentTime.value
  const [startH, startM] = settings.value.startTime.split(':').map(Number)
  const [lunchStartH, lunchStartM] = settings.value.lunchStart.split(':').map(Number)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = startH * 60 + startM
  const lunchStartMinutes = lunchStartH * 60 + lunchStartM

  // 上班前
  if (currentMinutes < startMinutes) {
    return t('workerClock.tip.notWorkTime')
  }

  // 上午显示午休倒计时
  if (currentMinutes < lunchStartMinutes) {
    return t('workerClock.countdown.lunchBreak')
  }

  return t('workerClock.countdown.offWork')
})

// 主倒计时
const mainCountdown = computed(() => {
  const now = currentTime.value
  const [endH, endM] = settings.value.endTime.split(':').map(Number)
  const [lunchStartH, lunchStartM] = settings.value.lunchStart.split(':').map(Number)
  const [lunchEndH, lunchEndM] = settings.value.lunchEnd.split(':').map(Number)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const currentSeconds = now.getSeconds()
  const endMinutes = endH * 60 + endM
  const lunchStartMinutes = lunchStartH * 60 + lunchStartM
  const lunchEndMinutes = lunchEndH * 60 + lunchEndM

  let targetMinutes = endMinutes

  // 午休中，倒计时到午休结束
  if (isLunchBreak.value) {
    targetMinutes = lunchEndMinutes
  } else if (currentMinutes < lunchStartMinutes) {
    // 上午，倒计时到午休开始
    targetMinutes = lunchStartMinutes
  }

  let diffSeconds = (targetMinutes - currentMinutes) * 60 - currentSeconds
  if (diffSeconds < 0) diffSeconds = 0

  const hours = Math.floor(diffSeconds / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
})

// 今日进度
const todayProgress = computed(() => {
  if (isWeekend.value) return 100

  const now = currentTime.value
  const [startH, startM] = settings.value.startTime.split(':').map(Number)
  const [endH, endM] = settings.value.endTime.split(':').map(Number)
  const [lunchStartH, lunchStartM] = settings.value.lunchStart.split(':').map(Number)
  const [lunchEndH, lunchEndM] = settings.value.lunchEnd.split(':').map(Number)

  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  const lunchDuration = (lunchEndH * 60 + lunchEndM) - (lunchStartH * 60 + lunchStartM)
  const totalWorkMinutes = endMinutes - startMinutes - lunchDuration

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (currentMinutes <= startMinutes) return 0
  if (currentMinutes >= endMinutes) return 100

  let workedMinutes = currentMinutes - startMinutes
  // 扣除午休时间
  if (currentMinutes > lunchStartH * 60 + lunchStartM) {
    const lunchPassed = Math.min(currentMinutes - (lunchStartH * 60 + lunchStartM), lunchDuration)
    workedMinutes -= lunchPassed
  }

  const progress = Math.min(100, Math.max(0, (workedMinutes / totalWorkMinutes) * 100))
  return Math.round(progress)
})

// 本周进度
const weekProgress = computed(() => {
  const day = currentTime.value.getDay()
  const workDays = settings.value.restMode === 'double' ? 5 : settings.value.restMode === 'single' ? 6 : 5.5
  const passedDays = day === 0 ? workDays : Math.min(day, workDays)

  // 考虑今天的进度
  const todayFraction = isWeekend.value ? 0 : todayProgress.value / 100
  const progress = ((passedDays - 1 + todayFraction) / workDays) * 100

  return Math.min(100, Math.max(0, Math.round(progress)))
})

// 本月进度
const monthProgress = computed(() => {
  const now = currentTime.value
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()

  const progress = (currentDay / daysInMonth) * 100
  return Math.round(progress)
})

// 年度进度
const yearProgress = computed(() => {
  const now = currentTime.value
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear() + 1, 0, 1)
  const total = end.getTime() - start.getTime()
  const passed = now.getTime() - start.getTime()

  const progress = (passed / total) * 100
  return Math.round(progress * 10) / 10
})

// 今日已赚
const todayEarned = computed(() => {
  if (settings.value.monthlySalary <= 0) return '0.00'
  if (isWeekend.value) return '0.00'

  const dailySalary = settings.value.monthlySalary / 21.75
  const earned = dailySalary * (todayProgress.value / 100)

  return earned.toFixed(2)
})

// 本月累计
const monthEarned = computed(() => {
  if (settings.value.monthlySalary <= 0) return '0.00'

  const now = currentTime.value
  const currentDay = now.getDate()
  const workDaysRatio = currentDay / 30 // 简化计算
  const earned = settings.value.monthlySalary * workDaysRatio

  return earned.toFixed(0)
})

// 周末倒计时
const weekendCountdown = computed(() => {
  const now = currentTime.value
  const day = now.getDay()

  if (day === 0) return 0
  if (day === 6) return 0

  return 6 - day
})

// 发薪日倒计时
const paydayCountdown = computed(() => {
  const now = currentTime.value
  const currentDay = now.getDate()
  const payday = settings.value.payday

  if (currentDay === payday) return 0
  if (currentDay < payday) return payday - currentDay

  // 下个月
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return daysInMonth - currentDay + payday
})

// 下一个节假日
const nextHoliday = computed(() => {
  const now = currentTime.value
  const year = now.getFullYear()

  // 简化的节假日列表
  const holidays = [
    { name: t('workerClock.holidays.newYear'), date: new Date(year, 0, 1) },
    { name: t('workerClock.holidays.springFestival'), date: new Date(year, 1, 10) },
    { name: t('workerClock.holidays.qingming'), date: new Date(year, 3, 5) },
    { name: t('workerClock.holidays.laborDay'), date: new Date(year, 4, 1) },
    { name: t('workerClock.holidays.dragonBoat'), date: new Date(year, 5, 10) },
    { name: t('workerClock.holidays.midAutumn'), date: new Date(year, 8, 15) },
    { name: t('workerClock.holidays.nationalDay'), date: new Date(year, 9, 1) },
    { name: t('workerClock.holidays.newYear'), date: new Date(year + 1, 0, 1) }
  ]

  for (const holiday of holidays) {
    if (holiday.date > now) {
      const days = Math.ceil((holiday.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      return { name: holiday.name, days }
    }
  }

  return { name: t('workerClock.holidays.newYear'), days: 365 }
})

// 当前语录
const currentQuote = computed(() => WORKER_QUOTES[currentQuoteIndex.value])

// 分享配置
const toolShareConfig = {
  toolName: t('workerClock.title'),
  category: 'time' as const,
  subtitle: t('workerClock.subtitle')
}

// === 方法 ===

// 更新时间
const updateTime = () => {
  currentTime.value = new Date()
}

// 刷新语录
const refreshQuote = () => {
  currentQuoteIndex.value = Math.floor(Math.random() * WORKER_QUOTES.length)
}

// 打开时间选择器
const openStartTimePicker = () => {
  startTimePickerRef.value?.open(settings.value.startTime)
}

const openEndTimePicker = () => {
  endTimePickerRef.value?.open(settings.value.endTime)
}

const openLunchStartPicker = () => {
  lunchStartPickerRef.value?.open(settings.value.lunchStart)
}

const openLunchEndPicker = () => {
  lunchEndPickerRef.value?.open(settings.value.lunchEnd)
}

// 时间选择确认
const onStartTimeConfirm = (time: string) => {
  settings.value.startTime = time
}

const onEndTimeConfirm = (time: string) => {
  settings.value.endTime = time
}

const onLunchStartConfirm = (time: string) => {
  settings.value.lunchStart = time
}

const onLunchEndConfirm = (time: string) => {
  settings.value.lunchEnd = time
}

// 打开发薪日选择器
const openPaydayPicker = () => {
  paydayPickerRef.value?.open(settings.value.payday)
}

// 发薪日确认
const onPaydayConfirm = (value: number) => {
  settings.value.payday = value
}

// 保存设置
const saveSettings = () => {
  uni.setStorageSync('workerClockSettings', settings.value)
  showSettings.value = false
  uni.showToast({ title: t('common.saveSuccess'), icon: 'success' })
}

// 加载设置
const loadSettings = () => {
  const saved = uni.getStorageSync('workerClockSettings')
  if (saved) {
    settings.value = { ...settings.value, ...saved }
  }
}

// 分享图生成完成
function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// === 生命周期 ===
onMounted(() => {
  loadSettings()
  refreshQuote()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

onShow(() => {
  settingsStore.initTheme()
})

// 分享配置
onShareAppMessage(() => ({
  title: `EH Tools - ${t('workerClock.title')}`,
  path: '/pages/time/worker-clock/index',
  imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
}))

onShareTimeline(() => ({
  title: `EH Tools - ${t('workerClock.title')}`
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.worker-clock-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

// 状态卡片
.status-card {
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.status-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.status-svg {
  width: 100%;
  height: 100%;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.status-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.status-time {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

// 主倒计时卡片
.countdown-card {
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;

  &.main-countdown {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
}

.countdown-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: $spacing-md;
  text-align: center;
}

.countdown-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  font-size: 64rpx;
  font-weight: 700;
  color: #fff;
  font-family: 'SF Mono', Monaco, monospace;
  min-width: 100rpx;
  text-align: center;
}

.time-unit {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.time-separator {
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  margin-top: -20rpx;
}

// 进度区域
.progress-section {
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
  padding-left: $spacing-xs;
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.progress-card {
  background: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-md;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.progress-label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.progress-value {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.progress-bar {
  height: 12rpx;
  background: var(--bg-sunken);
  border-radius: 6rpx;
  overflow: hidden;

  &.bar-week .progress-fill { background: linear-gradient(90deg, #f093fb, #f5576c); }
  &.bar-month .progress-fill { background: linear-gradient(90deg, #11998e, #38ef7d); }
  &.bar-year .progress-fill { background: linear-gradient(90deg, #f7971e, #ffd200); }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

// 收入区域
.income-section {
  margin-bottom: $spacing-md;
}

.income-cards {
  display: flex;
  gap: $spacing-sm;
}

.income-card {
  flex: 1;
  background: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-md;

  &.main-income {
    background: linear-gradient(135deg, #11998e, #38ef7d);

    .income-label,
    .income-currency,
    .income-amount {
      color: #fff;
    }
  }
}

.income-label {
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.income-value {
  display: flex;
  align-items: baseline;

  &.small {
    .income-amount { font-size: 36rpx; }
  }
}

.income-currency {
  font-size: 28rpx;
  color: var(--text-primary);
  margin-right: 4rpx;
}

.income-amount {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

// 倒计时网格
.countdown-section {
  margin-bottom: $spacing-md;
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.countdown-item {
  background: var(--bg-card);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-md;
  text-align: center;
}

.countdown-item-label {
  font-size: 22rpx;
  color: var(--text-secondary);
  display: block;
  margin-bottom: $spacing-xs;
}

.countdown-item-value {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}

// 语录卡片
.quote-card {
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-lg;
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.quote-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.quote-svg {
  width: 100%;
  height: 100%;
}

.quote-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
}

// 设置按钮
.settings-btn {
  background: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  padding: $spacing-md $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
  }
}

.settings-icon {
  width: 40rpx;
  height: 40rpx;
}

// 设置弹窗
.settings-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.settings-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.settings-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-card);
  border-radius: $radius-xl $radius-xl 0 0;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1rpx solid var(--border-light);
}

.settings-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: var(--text-secondary);
}

.settings-scroll {
  flex: 1;
  padding: $spacing-md;
  box-sizing: border-box;
  overflow-x: hidden;
}

.settings-group {
  margin-bottom: $spacing-lg;
  width: 100%;
  box-sizing: border-box;
}

.settings-group-title {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
  padding-left: $spacing-xs;
}

// 时间选择器样式 - 参考年龄计算器
.time-picker-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  width: 100%;
  box-sizing: border-box;
}

.time-picker-item {
  flex: 1;
  min-width: 0;
}

.time-picker-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.time-picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);

  &:active {
    opacity: 0.8;
  }
}

.time-picker-value {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

.time-picker-arrow {
  font-size: 22rpx;
  color: var(--text-placeholder);
}

.time-picker-separator {
  font-size: 28rpx;
  color: var(--text-placeholder);
  flex-shrink: 0;
  padding-top: 40rpx;
}

// 薪资输入样式 - 与时间选择器一致
.salary-input-item {
  margin-bottom: $spacing-sm;
}

.salary-input-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.salary-input-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);
}

.salary-input-field {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  background: transparent;
  border: none;
}

.salary-input-unit {
  font-size: 24rpx;
  color: var(--text-placeholder);
  margin-left: $spacing-sm;
}

.salary-picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-sunken);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-inset);

  &:active {
    opacity: 0.8;
  }
}

.salary-picker-value {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.salary-picker-arrow {
  font-size: 22rpx;
  color: var(--text-placeholder);
}

// 休息模式选项
.rest-mode-options {
  display: flex;
  gap: $spacing-sm;
  width: 100%;
  box-sizing: border-box;
}

.rest-mode-option {
  flex: 1;
  min-width: 0;
  padding: $spacing-sm $spacing-xs;
  background: var(--bg-elevated);
  border-radius: $radius-md;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-secondary);
  transition: all $transition-normal;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.active {
    background: var(--color-primary);
    color: #fff;
  }
}

// 保存按钮
.save-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: $radius-lg;
  padding: $spacing-md;
  text-align: center;
  margin-top: $spacing-md;

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
  }
}

// 庆祝动效
.celebrate-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.celebrate-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.celebrate-icon {
  width: 200rpx;
  height: 200rpx;
  animation: bounce 0.5s ease infinite alternate;
}

.celebrate-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: 700;
  margin-top: $spacing-lg;
}

@keyframes bounce {
  from { transform: scale(1); }
  to { transform: scale(1.2); }
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}
</style>
