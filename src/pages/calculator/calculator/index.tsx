import {View} from '@tarojs/components'
import {Button} from '@nutui/nutui-react-taro'
import {useState} from 'react'
import {useTranslation} from '@/i18n'
import {usePageTitle} from "@/hooks/usePageTitle";
import './index.less'
import {Parser} from 'expr-eval';
import {useAppSelector} from "@/store/hooks";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

type CalculatorMode = 'basic' | 'scientific'

function Calculator() {
  const {t} = useTranslation()
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [lastResult, setLastResult] = useState('')
  const [mode, setMode] = useState<CalculatorMode>('basic')
  usePageTitle('calculator');
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["calculator"]
  });
  useShareTimeline(() => {
    return shares["calculator"]
  });
  const formatDisplay = (value: string) => {
    return value
  }

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
      if (op === '√(') {
        setExpression('√(' + lastResult + ')')
      } else {
        setExpression(lastResult + op)
      }
      setLastResult('')
    } else if (expression.length > 0) {
      const lastChar = expression[expression.length - 1]
      if (op === '√(' && lastChar.match(/[0-9\)]/)) {
        setExpression('√(' + expression + ')')
      } else if ((op === '(' || op.startsWith('sin') || op.startsWith('cos') || op.startsWith('tan')) && lastChar.match(/[0-9\)]/)) {
        setExpression(expression + '×' + op)
      } else if (['+', '-', '×', '÷'].includes(lastChar)) {
        setExpression(expression.slice(0, -1) + op)
      } else {
        setExpression(expression + op)
      }
    } else {
      setExpression(op)
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

  const calculateBasic = (expr: string): number => {
    try {
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/')
      const parser = new Parser()
      return parser.parse(expr).evaluate({})
    } catch (e) {
      throw new Error(t('invalidExpression'))
    }
  }

  const calculateScientific = (expr: string): number => {
    try {
      const parser = new Parser()
      parser.functions.sin = (n: number) => Math.sin(n)
      parser.functions.cos = (n: number) => Math.cos(n)
      parser.functions.tan = (n: number) => Math.tan(n)
      parser.functions.sqrt = (n: number) => Math.sqrt(n)

      expr = expr.replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/√\(/g, 'sqrt(')
        .replace(/π/g, Math.PI.toString())
        .replace(/(\d+)²/g, '($1)^2')

      return parser.parse(expr).evaluate({})
    } catch (e) {
      throw new Error(t('invalidExpression'))
    }
  }

  const calculateResult = () => {
    try {
      let result: number = 0;
      switch (mode) {
        case 'basic':
          result = calculateBasic(expression);
          break;
        case 'scientific':
          result = calculateScientific(expression);
          break;
      }
      console.log("result:", result);

      const formattedResult = Number.isInteger(result)
        ? result.toString()
        : (Number(result)).toFixed(8).replace(/\.?0+$/, '');
      console.log("formattedResult:", result);

      setDisplay(formattedResult);
      setLastResult(formattedResult);
      setExpression('');
    } catch (error) {
      setDisplay(t('invalidExpression'));
      setTimeout(() => setDisplay('0'), 2000);
      setExpression('');
    }
  }


  return (
    <View className='calculator'>
      <View className='mode-switch'>
        <Button size='small' onClick={() => setMode('basic')} type={mode === 'basic' ? 'primary' : 'default'}>
          {t('basicMode')}
        </Button>
        <Button size='small' onClick={() => setMode('scientific')} type={mode === 'scientific' ? 'primary' : 'default'}>
          {t('scientificMode')}
        </Button>
      </View>

      <View className='display'>
        <View className='expression'>{expression || '0'}</View>
        <View className='result'>{formatDisplay(display)}</View>
      </View>

      <View className='keypad'>
        {mode === 'scientific' && (
          <View className='scientific-rows'>
            <View className='row'>
              <Button onClick={() => handleOperator('sin(')}>sin</Button>
              <Button onClick={() => handleOperator('cos(')}>cos</Button>
              <Button onClick={() => handleOperator('tan(')}>tan</Button>
              <Button onClick={() => handleOperator('√(')}>√</Button>
            </View>
            <View className='row'>
              <Button onClick={() => handleOperator('(')}>(</Button>
              <Button onClick={() => handleOperator(')')}>)</Button>
              <Button onClick={() => handleOperator('^2')}>x²</Button>
              <Button onClick={() => handleOperator('π')}>π</Button>
            </View>
          </View>
        )}

        <View className='row'>
          <Button onClick={handleClear}>{t('clear')}</Button>
          <Button onClick={handleDelete}>{t('delete')}</Button>
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
          <Button onClick={handleDecimal}>.</Button>
          <Button onClick={calculateResult}>=</Button>
        </View>
      </View>
    </View>
  )
}

export default Calculator
