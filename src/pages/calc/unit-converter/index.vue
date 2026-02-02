<template>
  <view class="page converter-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('unitConverter.title')" />

    <!-- 分类选择 -->
    <view class="category-section">
      <view class="category-label">{{ t('unitConverter.category') }}</view>
      <view class="category-tabs">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="{ active: currentCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </view>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-section">
      <view class="input-label">{{ t('unitConverter.inputValue') }}</view>
      <input
        class="input-field"
        type="digit"
        placeholder="0"
        v-model="inputValue"
      />
    </view>

    <!-- 单位选择 -->
    <view class="unit-section">
      <view class="unit-row">
        <view class="unit-label">{{ t('unitConverter.fromUnit') }}</view>
        <view class="unit-picker" @click="showFromPicker = true">
          <text>{{ currentFromUnit?.name || t('unitConverter.selectUnit') }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </view>

      <!-- 交换按钮 -->
      <view class="swap-btn" @click="swapUnits">
        ⇅
      </view>

      <view class="unit-row">
        <view class="unit-label">{{ t('unitConverter.toUnit') }}</view>
        <view class="unit-picker" @click="showToPicker = true">
          <text>{{ currentToUnit?.name || t('unitConverter.selectUnit') }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </view>
    </view>

    <!-- 结果显示 -->
    <view v-if="result !== null" class="result-section">
      <view class="result-label">{{ t('unitConverter.result') }}</view>
      <view class="result-value">{{ result }}</view>
      <view class="result-formula">
        {{ inputValue }} {{ currentFromUnit?.name }} = {{ result }} {{ currentToUnit?.name }}
      </view>
    </view>

    <!-- 源单位选择器 -->
    <view v-if="showFromPicker" class="picker-mask" @click="showFromPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">{{ t('unitConverter.fromUnit') }}</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view
            v-for="unit in currentUnits"
            :key="unit.id"
            class="picker-item"
            :class="{ active: fromUnit === unit.id }"
            @click="selectFromUnit(unit.id)"
          >
            <text>{{ unit.name }}</text>
            <text v-if="fromUnit === unit.id" class="check-icon">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 目标单位选择器 -->
    <view v-if="showToPicker" class="picker-mask" @click="showToPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">{{ t('unitConverter.toUnit') }}</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view
            v-for="unit in currentUnits"
            :key="unit.id"
            class="picker-item"
            :class="{ active: toUnit === unit.id }"
            @click="selectToUnit(unit.id)"
          >
            <text>{{ unit.name }}</text>
            <text v-if="toUnit === unit.id" class="check-icon">✓</text>
          </view>
        </scroll-view>
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

// 单位数据
interface Unit {
  id: string
  name: string
  rate: number
}

interface Category {
  id: string
  name: string
  units: Unit[]
}

// 单位换算率定义（基准分别为：米、平方米、升）
const lengthRates: Record<string, number> = {
  km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001,
  mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254
}
const areaRates: Record<string, number> = {
  km2: 1000000, m2: 1, dm2: 0.01, cm2: 0.0001, mm2: 0.000001,
  ha: 10000, acre: 4046.856, ft2: 0.092903
}
const volumeRates: Record<string, number> = {
  m3: 1000, dm3: 1, cm3: 0.001, mm3: 0.000001,
  L: 1, mL: 0.001, gal: 3.78541, ft3: 28.3168
}

const makeUnits = (rates: Record<string, number>): Unit[] =>
  Object.entries(rates).map(([id, rate]) => ({ id, name: t(`unitConverter.units.${id}`), rate }))

// 分类
const categories = computed<Category[]>(() => [
  { id: 'length', name: t('unitConverter.categories.length'), units: makeUnits(lengthRates) },
  { id: 'area', name: t('unitConverter.categories.area'), units: makeUnits(areaRates) },
  { id: 'volume', name: t('unitConverter.categories.volume'), units: makeUnits(volumeRates) }
])

// 状态
const currentCategory = ref('length')
const inputValue = ref('')
const fromUnit = ref('m')
const toUnit = ref('cm')
const showFromPicker = ref(false)
const showToPicker = ref(false)

// 当前分类的单位列表
const currentUnits = computed(() => {
  const cat = categories.value.find(c => c.id === currentCategory.value)
  return cat?.units || []
})

// 当前源单位
const currentFromUnit = computed(() => {
  return currentUnits.value.find(u => u.id === fromUnit.value)
})

// 当前目标单位
const currentToUnit = computed(() => {
  return currentUnits.value.find(u => u.id === toUnit.value)
})

// 计算结果
const result = computed(() => {
  const value = parseFloat(inputValue.value)
  if (isNaN(value) || !currentFromUnit.value || !currentToUnit.value) {
    return null
  }

  // 结果 = 输入值 × 源单位换算率 / 目标单位换算率
  const converted = value * currentFromUnit.value.rate / currentToUnit.value.rate
  return parseFloat(converted.toFixed(6)).toString()
})

// 选择分类
const selectCategory = (catId: string) => {
  currentCategory.value = catId
  // 重置单位
  const units = categories.value.find(c => c.id === catId)?.units || []
  if (units.length >= 2) {
    fromUnit.value = units[0].id
    toUnit.value = units[1].id
  }
  inputValue.value = ''
}

// 选择源单位
const selectFromUnit = (unitId: string) => {
  fromUnit.value = unitId
  showFromPicker.value = false
}

// 选择目标单位
const selectToUnit = (unitId: string) => {
  toUnit.value = unitId
  showToPicker.value = false
}

// 交换单位
const swapUnits = () => {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('unitConverter.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.converter-page {
  min-height: 100vh;
  padding: $spacing-md;
  box-sizing: border-box;
}

// 分类选择
.category-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.category-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.category-tabs {
  display: flex;
  gap: $spacing-sm;
}

.category-tab {
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

// 输入区域
.input-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.input-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.input-field {
  width: 100%;
  height: 88rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-xl;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  box-sizing: border-box;
}

// 单位选择
.unit-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.unit-row {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.unit-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.unit-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  padding: 0 $spacing-md;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  font-size: $font-size-md;
  color: var(--text-primary);

  &:active {
    background-color: var(--bg-hover);
  }
}

.picker-arrow {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
}

.swap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin: $spacing-sm auto;
  font-size: 40rpx;
  color: var(--primary);
  background-color: var(--bg-primary-light);
  border-radius: 50%;

  &:active {
    opacity: 0.7;
  }
}

// 结果显示
.result-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-lg;
  text-align: center;
}

.result-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-sm;
}

.result-value {
  font-size: 64rpx;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: $spacing-sm;
  word-break: break-all;
}

.result-formula {
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

// 选择器弹窗
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-bg);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.picker-content {
  width: 100%;
  max-height: 60vh;
  background-color: var(--bg-card);
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid var(--border-light);
}

.picker-title {
  font-size: $font-size-lg;
  font-weight: 500;
  color: var(--text-primary);
}

.picker-list {
  max-height: 50vh;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-md;
  color: var(--text-primary);

  &:active {
    background-color: var(--bg-hover);
  }

  &.active {
    color: var(--primary);
  }
}

.check-icon {
  color: var(--primary);
  font-size: $font-size-lg;
}
</style>
