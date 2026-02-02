<template>
  <view class="page bmi-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('bmi.title')" />

    <!-- 输入区域 -->
    <view class="input-section">
      <view class="input-item">
        <view class="input-label">{{ t('bmi.height') }} ({{ t('bmi.unit.cm') }})</view>
        <input
          class="input-field"
          type="digit"
          :placeholder="'160'"
          v-model="height"
        />
      </view>
      <view class="input-item">
        <view class="input-label">{{ t('bmi.weight') }} ({{ t('bmi.unit.kg') }})</view>
        <input
          class="input-field"
          type="digit"
          :placeholder="'60'"
          v-model="weight"
        />
      </view>
    </view>

    <!-- 结果显示 -->
    <view v-if="bmiResult" class="result-section">
      <view class="bmi-value" :style="{ color: bmiResult.color }">
        {{ bmiResult.value }}
      </view>
      <view class="bmi-category" :style="{ color: bmiResult.color }">
        {{ bmiResult.category }}
      </view>
      <view class="bmi-suggestion">
        {{ bmiResult.suggestion }}
      </view>

      <!-- BMI 指示条 -->
      <view class="bmi-indicator">
        <view class="indicator-bar">
          <view class="indicator-section underweight"></view>
          <view class="indicator-section normal"></view>
          <view class="indicator-section overweight"></view>
          <view class="indicator-section obese"></view>
          <view class="indicator-section severely-obese"></view>
        </view>
        <view
          class="indicator-pointer"
          :style="{ left: bmiResult.position + '%' }"
        >
          ▼
        </view>
        <view class="indicator-labels">
          <text>18.5</text>
          <text>24</text>
          <text>28</text>
          <text>32</text>
        </view>
      </view>
    </view>

    <!-- 参考标准 -->
    <view class="reference-section">
      <view class="section-title">{{ t('bmi.reference') }}</view>
      <view class="reference-table">
        <view class="table-header">
          <text class="col-range">BMI</text>
          <text class="col-category">{{ t('bmi.category') }}</text>
          <text class="col-suggestion">{{ t('bmi.suggestion') }}</text>
        </view>
        <view
          v-for="item in referenceData"
          :key="item.range"
          class="table-row"
          :class="{ active: bmiResult && item.key === bmiResult.key }"
        >
          <text class="col-range">{{ item.range }}</text>
          <text class="col-category" :style="{ color: item.color }">{{ item.category }}</text>
          <text class="col-suggestion">{{ item.suggestion }}</text>
        </view>
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

// 输入值
const height = ref('')
const weight = ref('')

// BMI 分类数据
const getBmiCategories = () => [
  {
    key: 'underweight',
    min: 0,
    max: 18.5,
    range: '< 18.5',
    category: t('bmi.categories.underweight'),
    suggestion: t('bmi.suggestions.underweight'),
    color: '#1890FF'
  },
  {
    key: 'normal',
    min: 18.5,
    max: 24,
    range: '18.5 - 23.9',
    category: t('bmi.categories.normal'),
    suggestion: t('bmi.suggestions.normal'),
    color: '#52C41A'
  },
  {
    key: 'overweight',
    min: 24,
    max: 28,
    range: '24.0 - 27.9',
    category: t('bmi.categories.overweight'),
    suggestion: t('bmi.suggestions.overweight'),
    color: '#FAAD14'
  },
  {
    key: 'obese',
    min: 28,
    max: 32,
    range: '28.0 - 31.9',
    category: t('bmi.categories.obese'),
    suggestion: t('bmi.suggestions.obese'),
    color: '#FF7A45'
  },
  {
    key: 'severelyObese',
    min: 32,
    max: 100,
    range: '≥ 32.0',
    category: t('bmi.categories.severelyObese'),
    suggestion: t('bmi.suggestions.severelyObese'),
    color: '#FF4D4F'
  }
]

// 参考数据
const referenceData = computed(() => getBmiCategories())

// 计算 BMI 结果
const bmiResult = computed(() => {
  const h = parseFloat(height.value)
  const w = parseFloat(weight.value)

  if (!h || !w || h <= 0 || w <= 0) {
    return null
  }

  // BMI = 体重(kg) / 身高(m)²
  const heightInMeters = h / 100
  const bmi = w / (heightInMeters * heightInMeters)
  const bmiValue = parseFloat(bmi.toFixed(1))

  // 查找分类
  const categories = getBmiCategories()
  let category = categories[categories.length - 1]

  for (const cat of categories) {
    if (bmiValue < cat.max) {
      category = cat
      break
    }
  }

  // 计算指示器位置 (0-100%)
  let position = 0
  if (bmiValue < 18.5) {
    position = (bmiValue / 18.5) * 20
  } else if (bmiValue < 24) {
    position = 20 + ((bmiValue - 18.5) / 5.5) * 20
  } else if (bmiValue < 28) {
    position = 40 + ((bmiValue - 24) / 4) * 20
  } else if (bmiValue < 32) {
    position = 60 + ((bmiValue - 28) / 4) * 20
  } else {
    position = Math.min(80 + ((bmiValue - 32) / 8) * 20, 100)
  }

  return {
    value: bmiValue,
    key: category.key,
    category: category.category,
    suggestion: category.suggestion,
    color: category.color,
    position
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('bmi.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.bmi-page {
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
  height: 88rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-lg;
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
  text-align: center;
}

.bmi-value {
  font-size: 96rpx;
  font-weight: bold;
  line-height: 1.2;
}

.bmi-category {
  font-size: $font-size-xl;
  font-weight: 500;
  margin-bottom: $spacing-sm;
}

.bmi-suggestion {
  font-size: $font-size-md;
  color: var(--text-secondary);
  margin-bottom: $spacing-lg;
}

// BMI 指示条
.bmi-indicator {
  position: relative;
  padding-top: $spacing-lg;
}

.indicator-bar {
  display: flex;
  height: 16rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.indicator-section {
  flex: 1;

  &.underweight {
    background-color: #1890FF;
  }

  &.normal {
    background-color: #52C41A;
  }

  &.overweight {
    background-color: #FAAD14;
  }

  &.obese {
    background-color: #FF7A45;
  }

  &.severely-obese {
    background-color: #FF4D4F;
  }
}

.indicator-pointer {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 24rpx;
  color: var(--text-primary);
  transition: left 0.3s ease;
}

.indicator-labels {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-xs;
  padding: 0 15%;
  font-size: $font-size-xs;
  color: var(--text-placeholder);
}

// 参考标准
.reference-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.reference-table {
  font-size: $font-size-sm;
}

.table-header {
  display: flex;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);
  color: var(--text-secondary);
  font-weight: 500;
}

.table-row {
  display: flex;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid var(--border-light);
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background-color: rgba(24, 144, 255, 0.05);
    border-radius: $radius-sm;
  }
}

.col-range {
  width: 25%;
  color: var(--text-primary);
}

.col-category {
  width: 25%;
  font-weight: 500;
}

.col-suggestion {
  flex: 1;
  color: var(--text-secondary);
}
</style>
