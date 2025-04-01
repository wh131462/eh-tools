import {View} from '@tarojs/components'
import {Button, Switch} from '@nutui/nutui-react-taro'
import {useEffect, useState} from 'react'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import {useTranslation} from '@/i18n'
import './index.less'

function Calculator() {
  const {language} = useAppSelector(state => state.app)
  const {t} = useTranslation()
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [lastResult, setLastResult] = useState('')
  const [isScientific, setIsScientific] = useState(false)

  useEffect(() => {
    updatePageTitle(language, 'calculator')
  }, [language])

  const handleNumber = (num: string) => {
    if (display === '0' || lastResult) {
      setDisplay(num)
      setLastResult('')
    } else {
      setDisplay(display + num)
    }
    setExpression(expression + num)
  }

  const handleOperator = (op: string) => {
    if (lastResult) {
      setExpression(lastResult + op)
      setLastResult('')
    } else if (expression.length > 0) {
      const lastChar = expression[expression.length - 1]
      // 处理括号前有数字的情况
      if ((op === '(' || op === '√(') && lastChar >= '0' && lastChar <= '9') {
        setExpression(expression + '×' + op)
      } else if ('+-×÷'.includes(lastChar)) {
        setExpression(expression.slice(0, -1) + op)
      } else {
        setExpression(expression + op)
      }
    } else if (op === '√(') {
      setExpression(op)
    } else if (op !== '(' && op !== '-') {
      // 防止以非法运算符开头
      return
    }
    setDisplay('0')
  }

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.')
      setExpression(expression + '.')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setExpression('')
    setLastResult('')
  }

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
      setExpression(expression.slice(0, -1))
    } else {
      setDisplay('0')
      if (expression.length > 0) {
        setExpression(expression.slice(0, -1))
      }
    }
  }
  const calculate = (expression: string): number => {
    // 处理数字后直接跟括号的情况
    expression = expression.replace(/([0-9])\(/g, '$1*(');

    // 验证括号是否匹配
    let bracketCount = 0;
    for (let char of expression) {
      if (char === '(') bracketCount++;
      if (char === ')') bracketCount--;
      if (bracketCount < 0) throw new Error('括号不匹配');
    }
    if (bracketCount !== 0) throw new Error('括号不匹配');

    // 处理括号
    let maxIterations = 100; // 防止死循环
    while (expression.includes('(') && maxIterations > 0) {
      maxIterations--;
      const start = expression.lastIndexOf('(');
      let count = 1;
      let end = start + 1;
      while (count > 0 && end < expression.length) {
        if (expression[end] === '(') count++;
        if (expression[end] === ')') count--;
        end++;
      }
      if (count === 0) {
        const subExpr = expression.substring(start + 1, end - 1);
        const result = calculate(subExpr);
        // 检查括号后是否有数字，如果有则添加乘号
        const afterBracket = expression.substring(end);
        const needMultiply = afterBracket.length > 0 && afterBracket[0] >= '0' && afterBracket[0] <= '9';
        expression = expression.substring(0, start) + result + (needMultiply ? '*' : '') + expression.substring(end);
      }
    }

    // 处理开根号运算
    while (expression.includes('√')) {
      const start = expression.indexOf('√');
      const num = parseFloat(expression.substring(start + 1));
      if (!isNaN(num)) {
        const sqrtResult = Math.sqrt(num);
        expression = expression.substring(0, start) + sqrtResult + expression.substring(start + num.toString().length + 1);
      }
    }

    expression = expression.replace(/\s+/g, ''); // 移除所有空格
    const stack: any[] = [];
    let num = 0;
    let currentNumber = '';
    let prevOperator = '+'; // 上一个运算符

    for (let i = 0; i <= expression.length; i++) {
      const char = expression[i] || '+'; // 最后补一个运算符触发计算

      // 处理数字（包括小数和负数）
      if ((char >= '0' && char <= '9') || char === '.' ||
        (char === '-' && (i === 0 || '+-*/'.includes(expression[i - 1])))) {
        currentNumber += char;
      } else {
        // 将当前数字字符串转换为数值
        num = parseFloat(currentNumber) || 0;

        // 根据上一个运算符处理栈
        switch (prevOperator) {
          case '+':
            stack.push(num);
            break;
          case '-':
            stack.push(-num);
            break;
          case '*':
            stack.push(stack.pop() * num);
            break;
          case '/':
            stack.push(stack.pop() / num);
            break;
        }

        // 更新运算符并重置当前数字
        prevOperator = char;
        currentNumber = '';
      }
    }

    // 返回栈中所有元素之和
    return stack.reduce((acc, val) => acc + val, 0);
  }
  const calculateResult = () => {
    try {
      let evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/')
      const result = calculate(evalExpression)
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '')
      setDisplay(formattedResult)
      setLastResult(formattedResult)
      setExpression('')
    } catch (error) {
      console.log(error)
      setDisplay(t('invalidExpression'))
      setTimeout(() => setDisplay('0'), 2000)
      setExpression('')
    }
  }

  return (
    <View className='calculator'>
      <View className='mode-switch'>
        <Switch
          checked={isScientific}
          onChange={(value) => setIsScientific(value)}
        />
        <View className='mode-text'>{isScientific ? t('scientificMode') : t('basicMode')}</View>
      </View>
      <View className='display'>
        <View className='expression'>{expression || '0'}</View>
        <View className='result'>{display}</View>
      </View>

      <View className='keypad'>
        {isScientific && (
          <View className='row'>
            <Button onClick={() => handleOperator('(')}>(</Button>
            <Button onClick={() => handleOperator(')')}>)</Button>
            <Button onClick={() => handleOperator('^2')}>x²</Button>
            <Button onClick={() => handleOperator('√(')}>{t('sqrt')}</Button>
          </View>
        )}
        <View className='row'>
          <Button onClick={() => handleClear()}>{t('clear')}</Button>
          <Button onClick={() => handleDelete()}>{t('delete')}</Button>
          <Button onClick={() => handleOperator('÷')}>÷</Button>
        </View>
        <View className='row'>
          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button onClick={() => handleOperator('×')}>×</Button>
        </View>
        <View className='row'>
          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button onClick={() => handleOperator('-')}>-</Button>
        </View>
        <View className='row'>
          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button onClick={() => handleOperator('+')}>+</Button>
        </View>
        <View className='row'>
          <Button onClick={() => handleNumber('0')}>0</Button>
          <Button onClick={() => handleDecimal()}>.</Button>
          <Button onClick={() => calculateResult()}>=</Button>
        </View>
      </View>
    </View>
  )
}

export default Calculator
