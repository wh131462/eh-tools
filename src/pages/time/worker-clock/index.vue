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

    <!-- 加班卡片（下班后显示） -->
    <view class="overtime-card" v-if="showOvertimeCard">
      <view class="overtime-header">
        <text class="overtime-title">{{ hasEndedOvertime ? t('workerClock.overtime.ended') : t('workerClock.status.overtime') }}</text>
        <text class="overtime-type-tag" v-if="hasEndedOvertime">{{ lastOvertimeTypeText }}</text>
      </view>
      <view class="overtime-time">
        <view class="time-block">
          <text class="time-value">{{ hasEndedOvertime ? formattedLastOvertimeTimeStr.hours : overtimeTimeStr.hours }}</text>
          <text class="time-unit">{{ t('workerClock.unit.hour') }}</text>
        </view>
        <text class="time-separator">:</text>
        <view class="time-block">
          <text class="time-value">{{ hasEndedOvertime ? formattedLastOvertimeTimeStr.minutes : overtimeTimeStr.minutes }}</text>
          <text class="time-unit">{{ t('workerClock.unit.minute') }}</text>
        </view>
        <text class="time-separator">:</text>
        <view class="time-block">
          <text class="time-value">{{ hasEndedOvertime ? formattedLastOvertimeTimeStr.seconds : overtimeTimeStr.seconds }}</text>
          <text class="time-unit">{{ t('workerClock.unit.second') }}</text>
        </view>
      </view>
      <!-- 已结束时显示收入 -->
      <view class="overtime-earned" v-if="hasEndedOvertime && lastOvertimeType !== 'free'">
        <text class="earned-label">{{ t('workerClock.overtime.earned') }}</text>
        <text class="earned-value">¥{{ lastOvertimeEarned.toFixed(2) }}</text>
      </view>
      <!-- 未结束时显示结束按钮 -->
      <view class="overtime-end-btn" v-if="!hasEndedOvertime" @click="endOvertime">
        <text>{{ t('workerClock.action.endOvertime') }}</text>
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

    <!-- 结束加班 - 类型选择弹窗 -->
    <view class="overtime-popup" v-if="showOvertimeTypeSelect">
      <view class="popup-mask" @click="showOvertimeTypeSelect = false"></view>
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ t('workerClock.overtime.selectType') }}</text>
          <view class="popup-close" @click="showOvertimeTypeSelect = false">
            <text>×</text>
          </view>
        </view>

        <view class="overtime-option" @click="selectOvertimeType('free')">
          <view class="option-info">
            <text class="option-title">{{ t('workerClock.overtime.free') }}</text>
            <text class="option-desc">{{ t('workerClock.overtime.freeDesc') }}</text>
          </view>
          <text class="option-arrow">›</text>
        </view>

        <view class="overtime-option" @click="selectHourlyOvertime">
          <view class="option-info">
            <text class="option-title">{{ t('workerClock.overtime.hourly') }}</text>
            <text class="option-desc">{{ t('workerClock.overtime.hourlyDesc') }}</text>
          </view>
          <text class="option-arrow">›</text>
        </view>

        <view class="overtime-option multiplier-option">
          <view class="option-info">
            <text class="option-title">{{ t('workerClock.overtime.multiplier') }}</text>
          </view>
          <view class="multiplier-btns">
            <view class="multiplier-btn" @click="selectOvertimeType('multiplier', 1.5)">1.5x</view>
            <view class="multiplier-btn" @click="selectOvertimeType('multiplier', 2)">2x</view>
            <view class="multiplier-btn" @click="selectOvertimeType('multiplier', 3)">3x</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 结束加班汇总弹窗 -->
    <view class="overtime-popup" v-if="showOvertimeSummary">
      <view class="popup-mask" @click="showOvertimeSummary = false"></view>
      <view class="popup-content summary-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ t('workerClock.overtime.summary') }}</text>
        </view>

        <view class="summary-item">
          <text class="summary-label">{{ t('workerClock.overtime.type') }}</text>
          <text class="summary-value">{{ lastOvertimeTypeText }}</text>
        </view>

        <view class="summary-item">
          <text class="summary-label">{{ t('workerClock.overtime.duration') }}</text>
          <text class="summary-value">{{ formattedLastOvertimeDuration }}</text>
        </view>

        <view class="summary-item" v-if="lastOvertimeType !== 'free'">
          <text class="summary-label">{{ t('workerClock.overtime.earned') }}</text>
          <text class="summary-value highlight">¥{{ lastOvertimeEarned.toFixed(2) }}</text>
        </view>

        <view class="summary-btn" @click="confirmEndOvertime">
          <text>{{ t('common.confirm') }}</text>
        </view>
      </view>
    </view>

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
import { SolarDay, LegalHoliday } from 'tyme4ts'

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

// 加班状态
const hasEndedOvertime = ref(false) // 今天是否已结束加班
const overtimeType = ref<'free' | 'hourly' | 'multiplier'>('free')
const overtimeHourlyRate = ref(0)
const overtimeMultiplier = ref(1.5)
const showOvertimeTypeSelect = ref(false) // 结束时选择类型弹窗
const showOvertimeSummary = ref(false) // 汇总弹窗
const lastOvertimeDuration = ref(0)
const lastOvertimeEarned = ref(0)
const lastOvertimeType = ref<'free' | 'hourly' | 'multiplier'>('free')

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

// 下一个节假日（使用 tyme4ts 计算准确的法定假日）
const nextHoliday = computed(() => {
  const now = currentTime.value
  const year = now.getFullYear()

  // 使用 tyme4ts 获取今天的公历日
  const today = SolarDay.fromYmd(year, now.getMonth() + 1, now.getDate())

  // 从元旦开始遍历法定假日
  let holiday = LegalHoliday.fromYmd(year, 1, 1)

  while (holiday) {
    // 找到下一个休息日（非调休上班日）且在今天之后
    if (!holiday.isWork() && holiday.getDay().isAfter(today)) {
      const days = holiday.getDay().subtract(today)
      return { name: holiday.getName(), days }
    }
    holiday = holiday.next(1)
  }

  // 如果当年没找到，返回明年元旦
  return { name: t('workerClock.holidays.newYear'), days: 365 }
})

// 当前语录
const currentQuote = computed(() => WORKER_QUOTES[currentQuoteIndex.value])

// === 加班相关计算属性 ===

// 是否在加班时段（下班后、非周末）- 不考虑是否已结束
const isAfterWorkTime = computed(() => {
  if (isWeekend.value) return false
  const [endH, endM] = settings.value.endTime.split(':').map(Number)
  const currentMinutes = currentTime.value.getHours() * 60 + currentTime.value.getMinutes()
  return currentMinutes >= endH * 60 + endM
})

// 是否在加班中（下班后、非周末、今天未结束加班）
const isOvertimeTime = computed(() => {
  return isAfterWorkTime.value && !hasEndedOvertime.value
})

// 是否显示加班卡片（加班中 或 已结束但仍在下班后时段）
const showOvertimeCard = computed(() => {
  return isAfterWorkTime.value
})

// 加班时长（秒）- 从下班时间开始计算
const overtimeDuration = computed(() => {
  if (!isOvertimeTime.value) return 0
  const [endH, endM] = settings.value.endTime.split(':').map(Number)
  const now = currentTime.value
  const endTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM, 0)
  return Math.floor((now.getTime() - endTimeToday.getTime()) / 1000)
})

// 格式化加班时长
const overtimeTimeStr = computed(() => {
  const total = overtimeDuration.value
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
})

// 根据类型计算加班收入
const calculateOvertimeEarned = (duration: number, type: 'free' | 'hourly' | 'multiplier') => {
  if (type === 'free') return 0
  const hours = duration / 3600

  if (type === 'hourly') {
    return hours * overtimeHourlyRate.value
  } else {
    // 按倍数：基于日薪/8小时计算时薪
    const hourlyBase = settings.value.monthlySalary / 21.75 / 8
    return hours * hourlyBase * overtimeMultiplier.value
  }
}

// 结束加班时的类型文本
const lastOvertimeTypeText = computed(() => {
  if (lastOvertimeType.value === 'free') return t('workerClock.overtime.free')
  if (lastOvertimeType.value === 'hourly') return `${t('workerClock.overtime.hourly')} (¥${overtimeHourlyRate.value}/h)`
  return `${t('workerClock.overtime.multiplier')} (${overtimeMultiplier.value}x)`
})

// 格式化结束时的加班时长
const formattedLastOvertimeDuration = computed(() => {
  const total = lastOvertimeDuration.value
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 格式化结束时的加班时长（对象格式，用于卡片显示）
const formattedLastOvertimeTimeStr = computed(() => {
  const total = lastOvertimeDuration.value
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
})

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

// === 加班方法 ===

// 点击结束加班 - 显示类型选择
const endOvertime = () => {
  // 保存当前加班时长
  lastOvertimeDuration.value = overtimeDuration.value
  // 显示类型选择弹窗
  showOvertimeTypeSelect.value = true
}

// 选择加班类型
const selectOvertimeType = (type: 'free' | 'hourly' | 'multiplier', value?: number) => {
  overtimeType.value = type
  if (type === 'multiplier' && value) {
    overtimeMultiplier.value = value
  }
  lastOvertimeType.value = type
  // 计算收入
  lastOvertimeEarned.value = calculateOvertimeEarned(lastOvertimeDuration.value, type)
  // 关闭类型选择，显示汇总
  showOvertimeTypeSelect.value = false
  showOvertimeSummary.value = true
}

// 选择按时薪加班
const selectHourlyOvertime = () => {
  showOvertimeTypeSelect.value = false
  uni.showModal({
    title: t('workerClock.overtime.inputRate'),
    editable: true,
    placeholderText: t('workerClock.overtime.inputRatePlaceholder'),
    success: (res) => {
      if (res.confirm && res.content) {
        const rate = parseFloat(res.content)
        if (!isNaN(rate) && rate > 0) {
          overtimeHourlyRate.value = rate
          selectOvertimeType('hourly')
        } else {
          // 输入无效，重新显示选择
          showOvertimeTypeSelect.value = true
        }
      } else {
        // 取消了，重新显示选择
        showOvertimeTypeSelect.value = true
      }
    }
  })
}

// 确认结束加班
const confirmEndOvertime = () => {
  showOvertimeSummary.value = false
  hasEndedOvertime.value = true
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

// 加班相关样式
.overtime-card {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.overtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.overtime-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.overtime-type-tag {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

.overtime-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

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
}

.overtime-earned {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
}

.earned-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.earned-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  font-family: 'SF Mono', Monaco, monospace;
}

.overtime-end-btn {
  background: rgba(255, 255, 255, 0.3);
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-lg;
  text-align: center;

  text {
    color: #fff;
    font-size: 28rpx;
    font-weight: 500;
  }

  &:active {
    background: rgba(255, 255, 255, 0.4);
  }
}

// 加班弹窗
.overtime-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-card);
  border-radius: $radius-xl $radius-xl 0 0;
  padding: $spacing-lg;
  padding-bottom: calc($spacing-lg + $safe-bottom);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: var(--text-secondary);
}

.overtime-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  background: var(--bg-elevated);
  border-radius: $radius-md;
  margin-bottom: $spacing-sm;

  &:active {
    background: var(--bg-hover);
  }

  &.multiplier-option {
    flex-direction: column;
    align-items: stretch;
  }
}

.option-info {
  flex: 1;
}

.option-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.option-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.option-arrow {
  font-size: 32rpx;
  color: var(--text-placeholder);
}

.multiplier-btns {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

.multiplier-btn {
  flex: 1;
  padding: $spacing-sm;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border-radius: $radius-md;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;

  &:active {
    opacity: 0.9;
  }
}

// 汇总弹窗
.summary-content {
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid var(--border-light);

  &:last-of-type {
    border-bottom: none;
  }
}

.summary-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);

  &.highlight {
    font-size: 36rpx;
    font-weight: 700;
    color: #f5576c;
  }
}

.summary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-top: $spacing-lg;

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
  }
}

</style>
