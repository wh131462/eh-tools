<template>
  <view class="page calculator-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('calculator.title')" />

    <!-- 显示区域 -->
    <view class="display-section">
      <view class="expression">{{ expression || '0' }}</view>
      <view class="result">{{ displayValue }}</view>
    </view>

    <!-- 模式切换 -->
    <view class="mode-switch">
      <view
        class="mode-btn"
        :class="{ active: !isScientific }"
        @click="isScientific = false"
      >
        {{ t('calculator.basic') }}
      </view>
      <view
        class="mode-btn"
        :class="{ active: isScientific }"
        @click="isScientific = true"
      >
        {{ t('calculator.scientific') }}
      </view>
    </view>

    <!-- 科学模式额外按钮 -->
    <view v-if="isScientific" class="scientific-keys">
      <view class="key-row">
        <view class="key func" @click="inputFunc('sin')">sin</view>
        <view class="key func" @click="inputFunc('cos')">cos</view>
        <view class="key func" @click="inputFunc('tan')">tan</view>
        <view class="key func" @click="inputFunc('sqrt')">√</view>
      </view>
      <view class="key-row">
        <view class="key func" @click="inputChar('(')">(</view>
        <view class="key func" @click="inputChar(')')">)</view>
        <view class="key func" @click="inputPower">x²</view>
        <view class="key func" @click="inputPi">π</view>
      </view>
    </view>

    <!-- 基础键盘 -->
    <view class="basic-keys">
      <view class="key-row">
        <view class="key clear" @click="clear">C</view>
        <view class="key delete" @click="deleteLast">DEL</view>
        <view class="key operator" @click="inputOperator('÷')">÷</view>
      </view>
      <view class="key-row">
        <view class="key number" @click="inputChar('7')">7</view>
        <view class="key number" @click="inputChar('8')">8</view>
        <view class="key number" @click="inputChar('9')">9</view>
        <view class="key operator" @click="inputOperator('×')">×</view>
      </view>
      <view class="key-row">
        <view class="key number" @click="inputChar('4')">4</view>
        <view class="key number" @click="inputChar('5')">5</view>
        <view class="key number" @click="inputChar('6')">6</view>
        <view class="key operator" @click="inputOperator('-')">-</view>
      </view>
      <view class="key-row">
        <view class="key number" @click="inputChar('1')">1</view>
        <view class="key number" @click="inputChar('2')">2</view>
        <view class="key number" @click="inputChar('3')">3</view>
        <view class="key operator" @click="inputOperator('+')">+</view>
      </view>
      <view class="key-row">
        <view class="key number zero" @click="inputChar('0')">0</view>
        <view class="key number" @click="inputDot">.</view>
        <view class="key equal" @click="calculate">=</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow } from '@dcloudio/uni-app'
import { Parser } from 'expr-eval'
import { useSettingsStore } from '@/store'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 状态
const expression = ref('')
const displayValue = ref('0')
const isScientific = ref(false)
const hasError = ref(false)

// 运算符列表
const operators = ['+', '-', '×', '÷']

// 输入字符
const inputChar = (char: string) => {
  if (hasError.value) {
    expression.value = ''
    hasError.value = false
  }
  expression.value += char
  displayValue.value = expression.value
}

// 输入运算符
const inputOperator = (op: string) => {
  if (hasError.value) {
    expression.value = ''
    hasError.value = false
  }

  const lastChar = expression.value.slice(-1)

  // 如果最后一个字符是运算符，替换它
  if (operators.includes(lastChar)) {
    expression.value = expression.value.slice(0, -1) + op
  } else if (expression.value) {
    expression.value += op
  }

  displayValue.value = expression.value
}

// 输入小数点
const inputDot = () => {
  if (hasError.value) {
    expression.value = '0'
    hasError.value = false
  }

  // 获取当前数字
  const parts = expression.value.split(/[+\-×÷]/)
  const currentNumber = parts[parts.length - 1]

  // 如果当前数字已有小数点，不添加
  if (currentNumber.includes('.')) {
    return
  }

  // 如果表达式为空或最后是运算符，先添加0
  const lastChar = expression.value.slice(-1)
  if (!expression.value || operators.includes(lastChar)) {
    expression.value += '0'
  }

  expression.value += '.'
  displayValue.value = expression.value
}

// 输入函数
const inputFunc = (func: string) => {
  if (hasError.value) {
    expression.value = ''
    hasError.value = false
  }
  expression.value += func + '('
  displayValue.value = expression.value
}

// 输入平方
const inputPower = () => {
  if (hasError.value) {
    expression.value = ''
    hasError.value = false
  }
  expression.value += '^2'
  displayValue.value = expression.value
}

// 输入 π
const inputPi = () => {
  if (hasError.value) {
    expression.value = ''
    hasError.value = false
  }
  expression.value += 'π'
  displayValue.value = expression.value
}

// 清除
const clear = () => {
  expression.value = ''
  displayValue.value = '0'
  hasError.value = false
}

// 删除最后一个字符
const deleteLast = () => {
  if (hasError.value) {
    expression.value = ''
    displayValue.value = '0'
    hasError.value = false
    return
  }

  expression.value = expression.value.slice(0, -1)
  displayValue.value = expression.value || '0'
}

// 计算结果
const calculate = () => {
  if (!expression.value) return

  try {
    // 转换表达式
    let expr = expression.value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, String(Math.PI))

    // 创建解析器
    const parser = new Parser()

    // 添加自定义函数
    parser.functions.sqrt = Math.sqrt

    // 计算结果
    const result = parser.evaluate(expr)

    // 格式化结果
    if (typeof result === 'number') {
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result')
      }

      // 保留8位小数，去除末尾零
      const formatted = parseFloat(result.toFixed(8)).toString()
      displayValue.value = formatted
      expression.value = formatted
    }
  } catch (e) {
    displayValue.value = t('calculator.error')
    hasError.value = true

    // 2秒后清空
    setTimeout(() => {
      if (hasError.value) {
        clear()
      }
    }, 2000)
  }
}

onShow(() => {
  uni.setNavigationBarTitle({ title: t('calculator.title') })
  settingsStore.initTheme()
})
</script>

<style lang="scss" scoped>

.calculator-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-page);
}

// 显示区域
.display-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: $spacing-lg;
  background-color: var(--bg-card);
  min-height: 200rpx;
}

.expression {
  font-size: $font-size-md;
  color: var(--text-secondary);
  text-align: right;
  margin-bottom: $spacing-sm;
  word-break: break-all;
  min-height: 40rpx;
}

.result {
  font-size: 72rpx;
  font-weight: 300;
  color: var(--text-primary);
  text-align: right;
  word-break: break-all;
}

// 模式切换
.mode-switch {
  display: flex;
  padding: $spacing-sm;
  background-color: var(--bg-card);
  gap: $spacing-sm;
}

.mode-btn {
  flex: 1;
  height: 64rpx;
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

// 科学模式按键
.scientific-keys {
  padding: $spacing-sm;
  background-color: var(--bg-card);
}

// 基础按键
.basic-keys {
  padding: $spacing-sm;
  background-color: var(--bg-card);
}

.key-row {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }
}

.key {
  flex: 1;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.number {
  background-color: var(--bg-page);
  color: var(--text-primary);

  &.zero {
    flex: 2;
  }
}

.operator {
  background-color: var(--bg-primary-light);
  color: var(--primary);
}

.func {
  background-color: var(--bg-page);
  color: var(--text-secondary);
  font-size: $font-size-md;
}

.clear {
  background-color: rgba(255, 77, 79, 0.1);
  color: var(--error);
}

.delete {
  background-color: rgba(250, 173, 20, 0.1);
  color: var(--warning);
  font-size: $font-size-md;
}

.equal {
  background-color: var(--primary);
  color: #FFFFFF;
}
</style>
