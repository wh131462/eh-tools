<template>
  <view class="page wheel-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('luckyWheel.title')" />

    <!-- 转盘区域 -->
    <view class="wheel-section">
      <LuckyWheel
        v-if="currentItems.length"
        ref="luckyWheelRef"
        width="600rpx"
        height="600rpx"
        :blocks="blocks"
        :prizes="prizes"
        :buttons="buttons"
        :defaultConfig="defaultConfig"
        @start="onStart"
        @end="onEnd"
      />
      <view v-else class="empty-wheel">
        <text class="empty-text">{{ t('luckyWheel.switchConfig') }}</text>
      </view>
    </view>

    <!-- 配置切换 -->
    <view class="config-section">
      <view class="config-header">
        <text class="config-name">{{ currentConfig?.name || t('luckyWheel.selectConfig') }}</text>
        <view class="config-actions">
          <view class="action-btn" @click="goToList">
            {{ t('luckyWheel.switchConfig') }}
          </view>
          <view class="action-btn" @click="goToHistory">
            {{ t('luckyWheel.history') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 开始按钮 -->
    <view class="spin-section">
      <button
        class="spin-btn"
        :disabled="isSpinning || !currentItems.length"
        @click="handleSpin"
      >
        {{ isSpinning ? '...' : t('luckyWheel.spin') }}
      </button>
    </view>

    <!-- 结果弹窗 -->
    <view v-if="showResult" class="result-mask" @click="showResult = false">
      <view class="result-content" @click.stop>
        <view class="result-title">{{ t('luckyWheel.resultTitle') }}</view>
        <view class="result-value">{{ resultItem?.name }}</view>
        <button class="result-btn" @click="showResult = false">
          {{ t('common.confirm') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useWheelStore, useSettingsStore } from '@/store'
// @ts-ignore
import LuckyWheel from '@lucky-canvas/uni/lucky-wheel.vue'

const { t } = useI18n()
const wheelStore = useWheelStore()
const settingsStore = useSettingsStore()

// refs
const luckyWheelRef = ref()

// 状态
const isSpinning = ref(false)
const showResult = ref(false)
const resultItem = ref<{ name: string } | null>(null)

// 当前配置
const currentConfig = computed(() => wheelStore.getCurrentConfig())
const currentItems = computed(() => currentConfig.value?.items || [])

// LuckyWheel 配置 - 参照远程仓库样式
const blocks = computed(() => [
  { padding: '20rpx', background: '#FF6F00' },
  { padding: '20rpx', background: '#FFEE58' },
])

const prizes = computed(() =>
  currentItems.value.map(item => ({
    id: item.id,
    name: item.name,
    fonts: [{ text: item.name, fontColor: '#FFFFFF', top: '20rpx' }],
    background: item.color
  }))
)

const buttons = computed(() => [
  { radius: '20%', background: '#FFEE58' },
  {
    radius: '15%',
    background: '#FF6F00',
    pointer: true,
    fonts: [{ text: t('luckyWheel.spin'), fontColor: '#FFFFFF', top: '-20rpx' }]
  },
])

const defaultConfig = {
  gutter: 5,
  offsetDegree: 0,
  speed: 20,
  accelerationTime: 2500,
  decelerationTime: 2500,
}

// 根据概率选择
const selectByProbability = () => {
  const items = currentItems.value
  const totalProbability = items.reduce((sum, item) => sum + item.probability, 0)
  const random = Math.random() * totalProbability

  let cumulative = 0
  for (const item of items) {
    cumulative += item.probability
    if (random <= cumulative) {
      return item
    }
  }
  return items[items.length - 1]
}

// 点击转盘中心按钮触发
const onStart = () => {
  if (isSpinning.value || currentItems.value.length === 0) return
  handleSpin()
}

// 外部按钮触发旋转
const handleSpin = () => {
  if (isSpinning.value || currentItems.value.length === 0) return

  isSpinning.value = true
  luckyWheelRef.value?.play()

  // 根据概率选择结果
  const result = selectByProbability()
  const resultIndex = currentItems.value.findIndex(item => item.id === result.id)
  resultItem.value = result

  setTimeout(() => {
    luckyWheelRef.value?.stop(resultIndex)
  }, 1000)
}

// 抽奖结束回调
const onEnd = (prize: any) => {
  isSpinning.value = false
  showResult.value = true

  // 添加历史记录
  if (currentConfig.value) {
    wheelStore.addHistory({
      configId: currentConfig.value.id,
      configName: currentConfig.value.name,
      itemName: prize.name
    })
  }
}

// 跳转到列表
const goToList = () => {
  uni.navigateTo({
    url: '/pages/life/lucky-wheel/list/index'
  })
}

// 跳转到历史
const goToHistory = () => {
  uni.navigateTo({
    url: '/pages/life/lucky-wheel/history/index'
  })
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('luckyWheel.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.wheel-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  background-color: var(--bg-page);
}

// 转盘区域
.wheel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72rpx 0;
  background-color: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-neumorphic);
}

// 空状态
.empty-wheel {
  width: 600rpx;
  height: 600rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-sunken);
}

.empty-text {
  font-size: $font-size-md;
  color: var(--text-placeholder);
}

// 配置切换
.config-section {
  background-color: var(--bg-card);
  border-radius: 24rpx;
  padding: $spacing-md;
  box-shadow: var(--shadow-neumorphic);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-name {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
}

.config-actions {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  color: #ff416c;
  background-color: var(--bg-warning-light);
  border-radius: 44rpx;

  &:active {
    opacity: 0.7;
  }
}

// 开始按钮
.spin-section {
  margin-bottom: $spacing-md;
}

.spin-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  color: #FFFFFF;
  font-size: $font-size-lg;
  font-weight: 500;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 8rpx 16rpx rgba(255, 75, 43, 0.3);

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.9;
  }

  &[disabled] {
    opacity: 0.7;
    background: var(--bg-sunken);
    color: var(--text-placeholder);
    box-shadow: none;
  }
}

// 结果弹窗
.result-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.result-content {
  width: 80%;
  max-width: 600rpx;
  background-color: var(--bg-card);
  border-radius: 24rpx;
  padding: $spacing-xl;
  text-align: center;
  animation: resultPop 0.3s ease;
}

.result-title {
  font-size: $font-size-lg;
  color: var(--text-secondary);
  margin-bottom: $spacing-md;
}

.result-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #ff416c;
  margin-bottom: $spacing-xl;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.result-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  color: #FFFFFF;
  font-size: $font-size-md;
  border-radius: 44rpx;
  border: none;

  &::after {
    border: none;
  }
}

@keyframes resultPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
