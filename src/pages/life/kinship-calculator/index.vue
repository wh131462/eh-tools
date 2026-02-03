<template>
  <view class="page kinship-calculator-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('kinshipCalculator.title')" />

    <!-- 副标题 -->
    <view class="subtitle">{{ t('kinshipCalculator.subtitle') }}</view>

    <!-- 性别选择 -->
    <view class="gender-section">
      <text class="section-label">{{ t('kinshipCalculator.iAm') }}</text>
      <view class="gender-buttons">
        <view
          class="gender-btn"
          :class="{ active: myGender === 'male' }"
          @click="myGender = 'male'"
        >
          {{ t('kinshipCalculator.male') }}
        </view>
        <view
          class="gender-btn"
          :class="{ active: myGender === 'female' }"
          @click="myGender = 'female'"
        >
          {{ t('kinshipCalculator.female') }}
        </view>
      </view>
    </view>

    <!-- 关系链显示 -->
    <view class="relation-chain-section">
      <view class="section-title">{{ t('kinshipCalculator.relationChain') }}</view>
      <view class="relation-chain">
        <text v-if="relationChain.length === 0" class="placeholder">
          {{ t('kinshipCalculator.selectRelation') }}
        </text>
        <text v-else class="chain-text">
          {{ t('kinshipCalculator.iAm') }}
          <text v-for="(rel, index) in relationChain" :key="index">
            {{ t('kinshipCalculator.hisHer') }}{{ getRelationName(rel) }}
          </text>
        </text>
      </view>
      <view v-if="relationChain.length > 0" class="chain-actions">
        <view class="action-btn backspace-btn" @click="removeLastRelation">
          <image src="/static/icons/arrow-left.svg" class="btn-icon" mode="aspectFit" />
          {{ t('kinshipCalculator.backspace') }}
        </view>
        <view class="action-btn reset-btn" @click="resetRelations">
          <image src="/static/icons/refresh.svg" class="btn-icon" mode="aspectFit" />
          {{ t('kinshipCalculator.reset') }}
        </view>
      </view>
    </view>

    <!-- 关系选择按钮 -->
    <view class="relations-section">
      <view v-for="category in relationCategories" :key="category.key" class="category-group">
        <view class="category-title">{{ t(`kinshipCalculator.category.${category.key}`) }}</view>
        <view class="relation-buttons">
          <view
            v-for="relation in category.relations"
            :key="relation"
            class="relation-btn"
            @click="addRelation(relation)"
          >
            {{ t(`kinshipCalculator.relation.${relation}`) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 计算结果 -->
    <view v-if="calculatedResult" class="result-section">
      <view class="result-title">{{ t('kinshipCalculator.result') }}</view>
      <view class="result-card">
        <view class="result-item">
          <text class="result-label">{{ t('kinshipCalculator.callHimHer') }}</text>
          <text class="result-value">{{ calculatedResult.callThem }}</text>
        </view>
        <view class="result-item">
          <text class="result-label">{{ t('kinshipCalculator.heSheCalls') }}</text>
          <text class="result-value">{{ calculatedResult.theyCallMe }}</text>
        </view>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="kinshipShareCanvas"
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

// 我的性别
const myGender = ref<'male' | 'female'>('male')

// 关系链
const relationChain = ref<string[]>([])

// 关系分类
const relationCategories = [
  {
    key: 'parent',
    relations: ['father', 'mother']
  },
  {
    key: 'spouse',
    relations: ['husband', 'wife']
  },
  {
    key: 'child',
    relations: ['son', 'daughter']
  },
  {
    key: 'sibling',
    relations: ['elderBrother', 'youngerBrother', 'elderSister', 'youngerSister']
  }
]

// 亲戚称呼数据库 (简化版)
const kinshipData: Record<string, { male: string; female: string }> = {
  // 父系
  'father': { male: '爸爸', female: '爸爸' },
  'mother': { male: '妈妈', female: '妈妈' },
  'father-father': { male: '爷爷', female: '爷爷' },
  'father-mother': { male: '奶奶', female: '奶奶' },
  'father-elderBrother': { male: '伯父', female: '伯父' },
  'father-elderBrother-son': { male: '堂兄', female: '堂兄' },
  'father-elderBrother-daughter': { male: '堂姐', female: '堂姐' },
  'father-youngerBrother': { male: '叔叔', female: '叔叔' },
  'father-youngerBrother-son': { male: '堂弟', female: '堂弟' },
  'father-youngerBrother-daughter': { male: '堂妹', female: '堂妹' },
  'father-elderSister': { male: '姑妈', female: '姑妈' },
  'father-elderSister-son': { male: '表兄', female: '表兄' },
  'father-elderSister-daughter': { male: '表姐', female: '表姐' },
  'father-youngerSister': { male: '姑姑', female: '姑姑' },
  'father-youngerSister-son': { male: '表弟', female: '表弟' },
  'father-youngerSister-daughter': { male: '表妹', female: '表妹' },

  // 母系
  'mother-father': { male: '外公', female: '外公' },
  'mother-mother': { male: '外婆', female: '外婆' },
  'mother-elderBrother': { male: '舅舅', female: '舅舅' },
  'mother-elderBrother-son': { male: '表兄', female: '表兄' },
  'mother-elderBrother-daughter': { male: '表姐', female: '表姐' },
  'mother-youngerBrother': { male: '舅舅', female: '舅舅' },
  'mother-youngerBrother-son': { male: '表弟', female: '表弟' },
  'mother-youngerBrother-daughter': { male: '表妹', female: '表妹' },
  'mother-elderSister': { male: '姨妈', female: '姨妈' },
  'mother-elderSister-son': { male: '表兄', female: '表兄' },
  'mother-elderSister-daughter': { male: '表姐', female: '表姐' },
  'mother-youngerSister': { male: '姨妈', female: '姨妈' },
  'mother-youngerSister-son': { male: '表弟', female: '表弟' },
  'mother-youngerSister-daughter': { male: '表妹', female: '表妹' },

  // 兄弟姐妹
  'elderBrother': { male: '哥哥', female: '哥哥' },
  'youngerBrother': { male: '弟弟', female: '弟弟' },
  'elderSister': { male: '姐姐', female: '姐姐' },
  'youngerSister': { male: '妹妹', female: '妹妹' },
  'elderBrother-son': { male: '侄子', female: '侄子' },
  'elderBrother-daughter': { male: '侄女', female: '侄女' },
  'youngerBrother-son': { male: '侄子', female: '侄子' },
  'youngerBrother-daughter': { male: '侄女', female: '侄女' },
  'elderSister-son': { male: '外甥', female: '外甥' },
  'elderSister-daughter': { male: '外甥女', female: '外甥女' },
  'youngerSister-son': { male: '外甥', female: '外甥' },
  'youngerSister-daughter': { male: '外甥女', female: '外甥女' },

  // 配偶
  'husband': { male: '丈夫', female: '丈夫' },
  'wife': { male: '妻子', female: '妻子' },
  'husband-father': { male: '公公', female: '公公' },
  'husband-mother': { male: '婆婆', female: '婆婆' },
  'wife-father': { male: '岳父', female: '岳父' },
  'wife-mother': { male: '岳母', female: '岳母' },

  // 子女
  'son': { male: '儿子', female: '儿子' },
  'daughter': { male: '女儿', female: '女儿' },
  'son-son': { male: '孙子', female: '孙子' },
  'son-daughter': { male: '孙女', female: '孙女' },
  'daughter-son': { male: '外孙', female: '外孙' },
  'daughter-daughter': { male: '外孙女', female: '外孙女' }
}

// 反向称呼数据库 (对方称呼我)
const reverseKinshipData: Record<string, { male: string; female: string }> = {
  'father': { male: '儿子', female: '女儿' },
  'mother': { male: '儿子', female: '女儿' },
  'father-father': { male: '孙子', female: '孙女' },
  'father-mother': { male: '孙子', female: '孙女' },
  'father-elderBrother': { male: '侄子', female: '侄女' },
  'father-youngerBrother': { male: '侄子', female: '侄女' },
  'father-elderSister': { male: '侄子', female: '侄女' },
  'father-youngerSister': { male: '侄子', female: '侄女' },
  'mother-father': { male: '外孙', female: '外孙女' },
  'mother-mother': { male: '外孙', female: '外孙女' },
  'mother-elderBrother': { male: '外甥', female: '外甥女' },
  'mother-youngerBrother': { male: '外甥', female: '外甥女' },
  'mother-elderSister': { male: '外甥', female: '外甥女' },
  'mother-youngerSister': { male: '外甥', female: '外甥女' },
  'elderBrother': { male: '弟弟', female: '妹妹' },
  'youngerBrother': { male: '哥哥', female: '姐姐' },
  'elderSister': { male: '弟弟', female: '妹妹' },
  'youngerSister': { male: '哥哥', female: '姐姐' },
  'husband': { male: '妻子', female: '妻子' },
  'wife': { male: '丈夫', female: '丈夫' },
  'son': { male: '父亲', female: '母亲' },
  'daughter': { male: '父亲', female: '母亲' },
  'son-son': { male: '爷爷', female: '奶奶' },
  'son-daughter': { male: '爷爷', female: '奶奶' },
  'daughter-son': { male: '外公', female: '外婆' },
  'daughter-daughter': { male: '外公', female: '外婆' }
}

// 获取关系名称
function getRelationName(relation: string) {
  return t(`kinshipCalculator.relation.${relation}`)
}

// 添加关系
function addRelation(relation: string) {
  relationChain.value.push(relation)
}

// 删除最后一个关系
function removeLastRelation() {
  relationChain.value.pop()
}

// 重置关系链
function resetRelations() {
  relationChain.value = []
}

// 计算称呼结果
const calculatedResult = computed(() => {
  if (relationChain.value.length === 0) return null

  const chainKey = relationChain.value.join('-')
  const callThem = kinshipData[chainKey]?.[myGender.value] || t('kinshipCalculator.noResult')
  const theyCallMe = reverseKinshipData[chainKey]?.[myGender.value] || t('kinshipCalculator.noResult')

  return {
    callThem,
    theyCallMe
  }
})

// 工具分享图配置
const toolShareConfig = {
  toolName: t('kinshipCalculator.title'),
  category: 'life' as const,
  subtitle: t('kinshipCalculator.subtitle')
}

// 分享图 URL
const toolShareImageUrl = ref('')

function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

onShow(() => {
  settingsStore.initTheme()
})

// 配置分享 - 使用 computed 来确保 imageUrl 动态更新
onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('kinshipCalculator.title')}`,
    path: '/pages/life/kinship-calculator/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => {
  return { title: `EH Tools - ${t('kinshipCalculator.title')}` }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.kinship-calculator-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-top: 0;
  box-sizing: border-box;
}

.subtitle {
  font-size: $font-size-md;
  color: var(--text-secondary);
  text-align: center;
  margin: $spacing-md 0 $spacing-lg;
}

.gender-section {
  background: var(--bg-card);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  margin-bottom: $spacing-lg;
}

.section-label {
  font-size: $font-size-md;
  color: var(--text-regular);
  margin-bottom: $spacing-md;
  display: block;
}

.gender-buttons {
  display: flex;
  gap: $spacing-md;
}

.gender-btn {
  flex: 1;
  height: 80rpx;
  background: var(--bg-elevated);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-lg;
  color: var(--text-regular);
  transition: all $transition-normal;
  box-shadow: var(--shadow-neumorphic-sm);

  &.active {
    background: var(--gradient-kinship);
    color: #fff;
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.98);
  }

  &:active {
    transform: scale(0.96);
  }
}

.relation-chain-section {
  background: var(--bg-card);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.relation-chain {
  min-height: 80rpx;
  background: var(--bg-elevated);
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.placeholder {
  font-size: $font-size-sm;
  color: var(--text-placeholder);
}

.chain-text {
  font-size: $font-size-md;
  color: var(--text-primary);
  line-height: 1.6;
}

.chain-actions {
  display: flex;
  gap: $spacing-md;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  background: var(--bg-elevated);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: var(--text-regular);
  transition: all $transition-normal;

  &:active {
    background: var(--bg-sunken);
    transform: scale(0.98);
  }
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
}

.relations-section {
  margin-bottom: $spacing-lg;
}

.category-group {
  background: var(--bg-card);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  margin-bottom: $spacing-md;
}

.category-title {
  font-size: $font-size-sm;
  color: var(--text-secondary);
  margin-bottom: $spacing-md;
}

.relation-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.relation-btn {
  height: 80rpx;
  background: var(--bg-elevated);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
  color: var(--text-regular);
  transition: all $transition-normal;
  box-shadow: var(--shadow-neumorphic-sm);

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.96);
  }
}

.result-section {
  background: var(--bg-card);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: var(--shadow-neumorphic-sm);
  margin-bottom: $spacing-lg;
}

.result-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
  text-align: center;
}

.result-card {
  background: var(--bg-elevated);
  border-radius: $radius-md;
  padding: $spacing-lg;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid var(--border-light);
  }
}

.result-label {
  font-size: $font-size-md;
  color: var(--text-secondary);
}

.result-value {
  font-size: $font-size-xl;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
