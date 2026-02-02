<template>
  <view class="page config-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('luckyWheel.config.title')" />

    <!-- 基本信息 -->
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">{{ t('luckyWheel.config.name') }}</view>
        <input
          class="form-input"
          type="text"
          :placeholder="t('luckyWheel.config.namePlaceholder')"
          v-model="form.name"
        />
      </view>
      <view class="form-item">
        <view class="form-label">{{ t('luckyWheel.config.description') }}</view>
        <input
          class="form-input"
          type="text"
          :placeholder="t('luckyWheel.config.descriptionPlaceholder')"
          v-model="form.description"
        />
      </view>
    </view>

    <!-- 项目列表 -->
    <view class="items-section">
      <view class="section-header">
        <text class="section-title">{{ t('luckyWheel.config.items') }}</text>
        <text class="item-count">{{ form.items.length }}</text>
      </view>

      <view
        v-for="(item, index) in form.items"
        :key="item.id"
        class="item-row"
      >
        <view
          class="item-color"
          :style="{ backgroundColor: item.color }"
          @click="pickColor(index)"
        ></view>
        <input
          class="item-name"
          type="text"
          :placeholder="t('luckyWheel.config.itemNamePlaceholder')"
          v-model="item.name"
        />
        <view class="item-delete" @click="removeItem(index)">
          <text>-</text>
        </view>
      </view>

      <view class="add-item" @click="addItem">
        <text class="add-icon">+</text>
        <text class="add-text">{{ t('luckyWheel.config.addItem') }}</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="action-section">
      <button class="save-btn" @click="saveConfig">
        {{ t('luckyWheel.config.saveConfig') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { useWheelStore, useSettingsStore } from '@/store'
import { showToast } from '@/utils'
import type { WheelConfig, WheelItem } from '@/types'

const { t } = useI18n()
const wheelStore = useWheelStore()
const settingsStore = useSettingsStore()

// 预设颜色
const presetColors = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
  '#FF9F43', '#6A89CC', '#82CCDD', '#B8E994',
  '#FF5252', '#1890FF', '#52C41A', '#FAAD14'
]

// 表单数据
const form = reactive<{
  id: string
  name: string
  description: string
  items: WheelItem[]
}>({
  id: '',
  name: '',
  description: '',
  items: []
})

// 是否编辑模式
const isEdit = ref(false)

// 生成随机ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

// 获取随机颜色
const getRandomColor = () => presetColors[Math.floor(Math.random() * presetColors.length)]

// 添加项目
const addItem = () => {
  form.items.push({
    id: generateId(),
    name: '',
    color: getRandomColor(),
    probability: 100 / (form.items.length + 1)
  })
  updateProbabilities()
}

// 移除项目
const removeItem = (index: number) => {
  form.items.splice(index, 1)
  updateProbabilities()
}

// 更新概率（平均分配）
const updateProbabilities = () => {
  const count = form.items.length
  if (count > 0) {
    const probability = 100 / count
    form.items.forEach(item => {
      item.probability = probability
    })
  }
}

// 选择颜色
const pickColor = (index: number) => {
  // 简单的颜色轮换
  const currentColor = form.items[index].color
  const currentIndex = presetColors.indexOf(currentColor)
  const nextIndex = (currentIndex + 1) % presetColors.length
  form.items[index].color = presetColors[nextIndex]
}

// 保存配置
const saveConfig = () => {
  // 验证
  if (!form.name.trim()) {
    showToast(t('luckyWheel.config.nameRequired'))
    return
  }

  if (form.items.length < 2) {
    showToast(t('luckyWheel.config.itemsRequired'))
    return
  }

  // 检查项目名称
  for (const item of form.items) {
    if (!item.name.trim()) {
      showToast(t('luckyWheel.config.itemNameRequired'))
      return
    }
  }

  const config: WheelConfig = {
    id: form.id || generateId(),
    name: form.name.trim(),
    description: form.description.trim(),
    items: form.items,
    createdAt: isEdit.value ? 0 : Date.now(),
    updatedAt: Date.now()
  }

  if (isEdit.value) {
    wheelStore.updateConfig(config)
  } else {
    wheelStore.addConfig(config)
    wheelStore.setCurrentConfig(config.id)
  }

  showToast(t('common.saveSuccess'))

  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

// 初始化
onMounted(() => {
  // 检查是否有编辑参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const configId = currentPage?.options?.id

  if (configId) {
    const config = wheelStore.configs.find(c => c.id === configId)
    if (config) {
      isEdit.value = true
      form.id = config.id
      form.name = config.name
      form.description = config.description
      form.items = JSON.parse(JSON.stringify(config.items))
    }
  } else {
    // 新建时添加默认项目
    addItem()
    addItem()
  }
})

onShow(() => {
  uni.setNavigationBarTitle({
    title: isEdit.value ? t('luckyWheel.config.title') : t('luckyWheel.createConfig')
  })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.config-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 200rpx;
  box-sizing: border-box;
}

// 表单区域
.form-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.form-item {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-xs;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  box-sizing: border-box;
}

// 项目列表
.items-section {
  background-color: var(--bg-card);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: var(--text-primary);
}

.item-count {
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
  color: var(--text-secondary);
}

.item-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-color {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;

  &:active {
    opacity: 0.7;
  }
}

.item-name {
  flex: 1;
  height: 64rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-md;
  color: var(--text-primary);
  background-color: var(--bg-page);
  border-radius: $radius-sm;
}

.item-delete {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  color: var(--error);
  background-color: rgba(255, 77, 79, 0.1);
  border-radius: $radius-sm;
  flex-shrink: 0;

  &:active {
    opacity: 0.7;
  }
}

.add-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  margin-top: $spacing-md;
  background-color: var(--bg-page);
  border-radius: $radius-sm;
  border: 2rpx dashed var(--border-light);

  &:active {
    background-color: var(--bg-hover);
  }
}

.add-icon {
  font-size: $font-size-lg;
  color: var(--primary);
  margin-right: $spacing-xs;
}

.add-text {
  font-size: $font-size-sm;
  color: var(--primary);
}

// 保存按钮
.action-section {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: var(--bg-page);
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background-color: var(--primary);
  color: #FFFFFF;
  font-size: $font-size-md;
  border-radius: $radius-sm;
  border: none;

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
