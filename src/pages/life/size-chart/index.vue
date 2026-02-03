<template>
  <view class="page size-chart-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('sizeChart.title')" />

    <!-- 类别选择卡片 -->
    <view class="main-card">
      <view class="card-title">{{ t('sizeChart.selectCategory') }}</view>

      <!-- 类别选择 -->
      <view class="category-tabs">
        <view
          v-for="cat in categories"
          :key="cat.key"
          class="category-tab"
          :class="{ active: selectedCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          <image class="category-icon" :src="cat.icon" mode="aspectFit" />
          <text class="category-name">{{ t(`sizeChart.categories.${cat.key}`) }}</text>
        </view>
      </view>

      <!-- 性别选择（仅服装和鞋子显示） -->
      <view v-if="showGenderSelector" class="gender-selector">
        <view
          v-for="g in genders"
          :key="g.key"
          class="gender-option"
          :class="{ active: selectedGender === g.key }"
          @click="selectGender(g.key)"
        >
          <image class="gender-icon" :src="g.icon" mode="aspectFit" />
          <text class="gender-name">{{ t(`sizeChart.gender.${g.key}`) }}</text>
        </view>
      </view>
    </view>

    <!-- 尺码对照表 -->
    <view class="table-card">
      <view class="card-title">{{ currentTableTitle }}</view>

      <!-- 表格区域 -->
      <scroll-view class="table-scroll" scroll-x>
        <view class="size-table">
          <!-- 表头 -->
          <view class="table-row table-header">
            <view v-for="(header, index) in tableHeaders" :key="index" class="table-cell" :class="{ 'cell-first': index === 0 }">
              {{ header }}
            </view>
          </view>
          <!-- 数据行 -->
          <view v-for="(row, rowIndex) in tableData" :key="rowIndex" class="table-row" :class="{ 'row-alt': rowIndex % 2 === 1 }">
            <view v-for="(cell, cellIndex) in row" :key="cellIndex" class="table-cell" :class="{ 'cell-first': cellIndex === 0 }">
              {{ cell }}
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 温馨提示 -->
    <view class="tips-card">
      <view class="tips-title">
        <image class="tips-icon" src="/static/icons/size-chart/tip.svg" mode="aspectFit" />
        <text>{{ t('sizeChart.tips') }}</text>
      </view>
      <text class="tips-content">{{ t('sizeChart.tipContent') }}</text>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="sizeChartShareCanvas"
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

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 类别定义
const categories = [
  { key: 'clothing', icon: '/static/icons/size-chart/clothing.svg' },
  { key: 'shoes', icon: '/static/icons/size-chart/shoes.svg' },
  { key: 'kids', icon: '/static/icons/size-chart/kids.svg' },
  { key: 'ring', icon: '/static/icons/size-chart/ring.svg' }
]

// 性别定义
const genders = [
  { key: 'male', icon: '/static/icons/size-chart/male.svg' },
  { key: 'female', icon: '/static/icons/size-chart/female.svg' },
  { key: 'unisex', icon: '/static/icons/size-chart/unisex.svg' }
]

// 选中状态
const selectedCategory = ref<'clothing' | 'shoes' | 'kids' | 'ring'>('clothing')
const selectedGender = ref<'male' | 'female' | 'unisex'>('male')

// 是否显示性别选择器
const showGenderSelector = computed(() => {
  return selectedCategory.value === 'clothing' || selectedCategory.value === 'shoes'
})

// 当前表格标题
const currentTableTitle = computed(() => {
  return t(`sizeChart.${selectedCategory.value}.title`)
})

// 工具分享图配置
const toolShareConfig = {
  toolName: t('sizeChart.title'),
  category: 'life' as const,
  subtitle: t('sizeChart.subtitle')
}

// 分享图 URL
const toolShareImageUrl = ref('')

function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 选择类别
function selectCategory(cat: typeof selectedCategory.value) {
  selectedCategory.value = cat
  // 重置性别选择
  if (cat === 'kids' || cat === 'ring') {
    selectedGender.value = 'unisex'
  }
}

// 选择性别
function selectGender(gender: typeof selectedGender.value) {
  selectedGender.value = gender
}

// 表头数据
const tableHeaders = computed(() => {
  switch (selectedCategory.value) {
    case 'clothing':
      return ['尺码', 'CN', 'US', 'UK', 'EU', '胸围(cm)', '腰围(cm)', '身高(cm)']
    case 'shoes':
      return ['脚长(cm)', 'CN', 'US', 'UK', 'EU', 'JP']
    case 'kids':
      return ['年龄', '身高(cm)', '体重(kg)', 'CN', 'US', 'UK', 'EU']
    case 'ring':
      return ['周长(mm)', '直径(mm)', 'CN', 'US', 'UK', 'EU', 'JP']
    default:
      return []
  }
})

// 表格数据
const tableData = computed(() => {
  switch (selectedCategory.value) {
    case 'clothing':
      return selectedGender.value === 'female' ? clothingFemaleData : clothingMaleData
    case 'shoes':
      return selectedGender.value === 'female' ? shoesFemaleData : shoesMaleData
    case 'kids':
      return kidsData
    case 'ring':
      return ringData
    default:
      return []
  }
})

// 男士服装尺码数据
const clothingMaleData = [
  ['XS', '165/84A', 'XS', 'XS', '44', '84-88', '70-74', '165-170'],
  ['S', '170/88A', 'S', 'S', '46', '88-92', '74-78', '170-175'],
  ['M', '175/92A', 'M', 'M', '48', '92-96', '78-82', '175-180'],
  ['L', '180/96A', 'L', 'L', '50', '96-100', '82-86', '180-185'],
  ['XL', '185/100A', 'XL', 'XL', '52', '100-104', '86-90', '185-190'],
  ['XXL', '190/104A', 'XXL', 'XXL', '54', '104-108', '90-94', '190-195'],
  ['XXXL', '195/108A', 'XXXL', 'XXXL', '56', '108-112', '94-98', '195-200']
]

// 女士服装尺码数据
const clothingFemaleData = [
  ['XS', '155/76A', 'XS', '4', '32', '76-80', '58-62', '155-160'],
  ['S', '160/80A', 'S', '6', '34', '80-84', '62-66', '160-165'],
  ['M', '165/84A', 'M', '8', '36', '84-88', '66-70', '165-170'],
  ['L', '170/88A', 'L', '10', '38', '88-92', '70-74', '170-175'],
  ['XL', '175/92A', 'XL', '12', '40', '92-96', '74-78', '175-180'],
  ['XXL', '180/96A', 'XXL', '14', '42', '96-100', '78-82', '180-185']
]

// 男士鞋子尺码数据
const shoesMaleData = [
  ['24.5', '39', '6.5', '6', '39', '24.5'],
  ['25.0', '40', '7', '6.5', '40', '25'],
  ['25.5', '41', '7.5', '7', '41', '25.5'],
  ['26.0', '42', '8', '7.5', '42', '26'],
  ['26.5', '43', '8.5', '8', '43', '26.5'],
  ['27.0', '44', '9', '8.5', '44', '27'],
  ['27.5', '44', '9.5', '9', '44.5', '27.5'],
  ['28.0', '45', '10', '9.5', '45', '28'],
  ['28.5', '46', '10.5', '10', '46', '28.5'],
  ['29.0', '46', '11', '10.5', '46.5', '29']
]

// 女士鞋子尺码数据
const shoesFemaleData = [
  ['22.0', '34', '4', '2', '35', '22'],
  ['22.5', '35', '4.5', '2.5', '35.5', '22.5'],
  ['23.0', '36', '5', '3', '36', '23'],
  ['23.5', '37', '5.5', '3.5', '37', '23.5'],
  ['24.0', '38', '6', '4', '38', '24'],
  ['24.5', '39', '6.5', '4.5', '39', '24.5'],
  ['25.0', '40', '7', '5', '40', '25'],
  ['25.5', '41', '7.5', '5.5', '40.5', '25.5'],
  ['26.0', '42', '8', '6', '41', '26']
]

// 童装尺码数据
const kidsData = [
  ['0-3月', '59', '3-5', '59', '0-3M', '0-3M', '56'],
  ['3-6月', '66', '5-7', '66', '3-6M', '3-6M', '62'],
  ['6-9月', '73', '7-9', '73', '6-9M', '6-9M', '68'],
  ['9-12月', '80', '9-11', '80', '9-12M', '12-18M', '74'],
  ['1-2岁', '90', '11-13', '90', '2T', '18-24M', '86'],
  ['2-3岁', '100', '13-15', '100', '3T', '2-3Y', '92'],
  ['3-4岁', '110', '15-18', '110', '4T', '3-4Y', '104'],
  ['4-5岁', '120', '18-21', '120', '5', '4-5Y', '116'],
  ['5-6岁', '130', '21-25', '130', '6', '5-6Y', '122'],
  ['6-7岁', '140', '25-30', '140', '7', '6-7Y', '128'],
  ['8-9岁', '150', '30-35', '150', '8', '8-9Y', '140'],
  ['10-11岁', '160', '35-40', '160', '10', '10-11Y', '152']
]

// 戒指尺码数据
const ringData = [
  ['44.2', '14.1', '4', '3', 'F', '44', '4'],
  ['45.5', '14.5', '5', '3.5', 'G', '45', '5'],
  ['46.8', '14.9', '6', '4', 'H', '46', '6'],
  ['48.0', '15.3', '7', '4.5', 'I', '48', '7'],
  ['49.3', '15.7', '8', '5', 'J', '49', '8'],
  ['50.6', '16.1', '9', '5.5', 'K', '50', '9'],
  ['51.9', '16.5', '10', '6', 'L', '52', '10'],
  ['53.1', '16.9', '11', '6.5', 'M', '53', '11'],
  ['54.4', '17.3', '12', '7', 'N', '54', '12'],
  ['55.7', '17.7', '13', '7.5', 'O', '56', '13'],
  ['57.0', '18.1', '14', '8', 'P', '57', '14'],
  ['58.3', '18.5', '15', '8.5', 'Q', '58', '15'],
  ['59.5', '18.9', '16', '9', 'R', '59', '16'],
  ['60.8', '19.4', '17', '9.5', 'S', '60', '17'],
  ['62.1', '19.8', '18', '10', 'T', '62', '18']
]

// 生命周期
onShow(() => {
  settingsStore.initTheme()
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('sizeChart.title')}`,
    path: '/pages/life/size-chart/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => ({
  title: `EH Tools - ${t('sizeChart.title')}`
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.size-chart-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card,
.table-card,
.tips-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

// 类别选择
.category-tabs {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.category-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-sm;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-normal;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #a855f7 100%);
    box-shadow: var(--shadow-neumorphic-inset);

    .category-icon {
      filter: brightness(0) invert(1);
    }

    .category-name {
      color: #fff;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.category-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: $spacing-xs;
  flex-shrink: 0;
  // 使用滤镜将灰色图标调整为主题紫色
  filter: brightness(0) saturate(100%) invert(45%) sepia(60%) saturate(1500%) hue-rotate(220deg);
  transition: filter $transition-normal;
}

.category-name {
  font-size: 24rpx;
  color: var(--text-primary);
  font-weight: 500;
}

// 性别选择
.gender-selector {
  display: flex;
  gap: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1rpx solid var(--border-color);
}

.gender-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;
  box-shadow: var(--shadow-neumorphic-sm);
  transition: all $transition-normal;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #a855f7 100%);
    box-shadow: var(--shadow-neumorphic-inset);

    .gender-icon {
      filter: brightness(0) invert(1);
    }

    .gender-name {
      color: #fff;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.gender-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
  // 使用滤镜将灰色图标调整为主题紫色
  filter: brightness(0) saturate(100%) invert(45%) sepia(60%) saturate(1500%) hue-rotate(220deg);
  transition: filter $transition-normal;
}

.gender-name {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 500;
}

// 表格区域
.table-scroll {
  white-space: nowrap;
}

.size-table {
  display: inline-block;
  min-width: 100%;
}

.table-row {
  display: flex;
  min-width: max-content;

  &.table-header {
    background: linear-gradient(135deg, #667eea 0%, #a855f7 100%);
    border-radius: $radius-sm $radius-sm 0 0;

    .table-cell {
      color: #fff;
      font-weight: 600;
    }
  }

  &.row-alt {
    background-color: var(--bg-elevated);
  }
}

.table-cell {
  min-width: 120rpx;
  padding: $spacing-md $spacing-sm;
  font-size: 26rpx;
  color: var(--text-primary);
  text-align: center;
  border-bottom: 1rpx solid var(--border-color);
  flex-shrink: 0;

  &.cell-first {
    min-width: 140rpx;
    font-weight: 600;
    background-color: var(--bg-elevated);
    position: sticky;
    left: 0;
    z-index: 1;
  }
}

.table-header .table-cell.cell-first {
  background: linear-gradient(135deg, #667eea 0%, #a855f7 100%);
}

// 温馨提示
.tips-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
}

.tips-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-sm;
}

.tips-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  // 使用滤镜将灰色图标调整为主题紫色
  filter: brightness(0) saturate(100%) invert(45%) sepia(60%) saturate(1500%) hue-rotate(220deg);
  transition: filter $transition-normal;
}

.tips-content {
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.6;
}

.bottom-placeholder {
  height: calc($tabbar-height + $safe-bottom + $spacing-md);
}

// 暗黑模式适配
.theme-dark {
  .category-icon,
  .gender-icon,
  .tips-icon {
    // 暗黑模式下使用更亮的紫色
    filter: brightness(0) saturate(100%) invert(60%) sepia(50%) saturate(1200%) hue-rotate(220deg);
  }

  .category-tab.active .category-icon,
  .gender-option.active .gender-icon {
    filter: brightness(0) invert(1);
  }
}
</style>
