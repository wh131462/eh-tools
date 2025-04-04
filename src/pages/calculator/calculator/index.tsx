import {View} from '@tarojs/components'
import {Button} from '@nutui/nutui-react-taro'
import {useState} from 'react'
import {useTranslation} from '@/i18n'
import {usePageTitle} from "@/hooks/usePageTitle";
import './index.less'
import {Parser} from 'expr-eval';
import {useAppSelector} from "@/store/hooks";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

type CalculatorMode = 'basic' | 'scientific' | 'programmer'

function Calculator() {
  const {t} = useTranslation()
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [lastResult, setLastResult] = useState('')
  const [mode, setMode] = useState<CalculatorMode>('basic')
  const [isRadians, setIsRadians] = useState(false)
  const [bitLength, setBitLength] = useState(32)
  usePageTitle('calculator');
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["calculator"]
  });
  useShareTimeline(() => {
    return shares["calculator"]
  });
  const formatDisplay = (value: string) => {
    if (mode === 'programmer') {
      let num = parseInt(value.split('.')[0], 10) || 0
      const mask = (1 << bitLength) - 1
      num = (num & mask) >>> 0
      return num.toString(2).padStart(bitLength, '0')
    }
    return value
  }

  const handleNumber = (num: string) => {
    if (mode === 'programmer' && !['0', '1'].includes(num)) return
    if (display === '0' || lastResult) {
      setDisplay(num)
      setLastResult('')
    } else {
      setDisplay(display + num)
    }
    setExpression(expression + num)
  }

  const handleOperator = (op: string) => {
    if (mode === 'programmer' && !['&', '|', '^', '~', '<<', '>>'].includes(op)) return

    if (lastResult) {
      setExpression(lastResult + op)
      setLastResult('')
    } else if (expression.length > 0) {
      const lastChar = expression[expression.length - 1]
      if ((op === '(' || op === '√(') && lastChar.match(/[0-9\)]/)) {
        setExpression(expression + '×' + op)
      } else if (['+-×÷&|^'].includes(lastChar)) {
        setExpression(expression.slice(0, -1) + op)
      } else {
        setExpression(expression + op)
      }
    } else if (op === '√(' || op === '~') {
      setExpression(op)
    } else if (!['(', '-', '~'].includes(op)) {
      return
    }
    setDisplay('0')
  }

  const handleDecimal = () => {
    if (mode === 'programmer') return
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
      parser.functions.sin = (n: number) => Math.sin(isRadians ? n : n * Math.PI / 180)
      parser.functions.cos = (n: number) => Math.cos(isRadians ? n : n * Math.PI / 180)
      parser.functions.tan = (n: number) => Math.tan(isRadians ? n : n * Math.PI / 180)
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

  const calculateProgrammer = (expr: string, bitLength: number): number => {
    expr = expr.replace(/&/g, ' & ')
      .replace(/\|/g, ' | ')
      .replace(/\^/g, ' ^ ')
      .replace(/<</g, ' << ')
      .replace(/>>/g, ' >> ')
      .replace(/~/g, '~')
      .replace(/(\d+)/g, (m) => parseInt(m, 2).toString())

    const parts = expr.split(/(<<|>>|[&|^])|(~)/).filter(p => p)
    let result = 0
    let currentOp = ''
    const mask = (1 << bitLength) - 1

    for (const part of parts) {
      if (['&', '|', '^', '<<', '>>', '~'].includes(part)) {
        currentOp = part
      } else {
        const num = part === '~' ? result : (parseInt(part, 10) & mask);
        switch (currentOp) {
          case '&':
            result &= num
            break
          case '|':
            result |= num
            break
          case '^':
            result ^= num
            break
          case '<<':
            result <<= num
            break
          case '>>':
            result >>= num
            break
          case '~':
            result = ~num
            break
          default:
            result = num
        }
        result = (result & mask) >>> 0
      }
    }
    return result
  }

  const calculateResult = () => {
    try {
      let result = 0
      switch (mode) {
        case 'basic':
          result = calculateBasic(expression)
          break
        case 'scientific':
          result = calculateScientific(expression)
          break
        case 'programmer':
          result = calculateProgrammer(expression, bitLength)
          break
      }

      const formattedResult = mode === 'programmer'
        ? result.toString(2).padStart(bitLength, '0')
        : Number.isInteger(result)
          ? result.toString()
          : result.toFixed(8).replace(/\.?0+$/, '')

      setDisplay(formattedResult)
      setLastResult(formattedResult)
      setExpression('')
    } catch (error) {
      setDisplay(t('invalidExpression'))
      setTimeout(() => setDisplay('0'), 2000)
      setExpression('')
    }
  }

  return (
    <View className='calculator'>
      <View className='mode-switch'>
        <Button size='small' onClick={() => setMode('basic')} type={mode === 'basic' ? 'primary' : 'default'}>
          {t('basic')}
        </Button>
        <Button size='small' onClick={() => setMode('scientific')} type={mode === 'scientific' ? 'primary' : 'default'}>
          {t('scientific')}
        </Button>
        <Button size='small' onClick={() => setMode('programmer')} type={mode === 'programmer' ? 'primary' : 'default'}>
          {t('programmer')}
        </Button>
        {mode === 'scientific' && (
          <Button size='small' onClick={() => setIsRadians(!isRadians)}>
            {isRadians ? 'RAD' : 'DEG'}
          </Button>
        )}
        {mode === 'programmer' && (
          <Button size='small' onClick={() => setBitLength(bitLength === 32 ? 64 : 32)}>
            {bitLength}-bit
          </Button>
        )}
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

        {mode === 'programmer' && (
          <View className='scientific-rows'>
            <View className='row'>
              <Button onClick={() => handleOperator('&')}>AND</Button>
              <Button onClick={() => handleOperator('|')}>OR</Button>
              <Button onClick={() => handleOperator('^')}>XOR</Button>
              <Button onClick={() => handleOperator('~')}>NOT</Button>
            </View>
            <View className='row'>
              <Button onClick={() => handleOperator('<<')}>SHL</Button>
              <Button onClick={() => handleOperator('>>')}>SHR</Button>
              <Button onClick={() => setBitLength(8)}>8-bit</Button>
              <Button onClick={() => setBitLength(16)}>16-bit</Button>
            </View>
          </View>
        )}

        <View className='row'>
          <Button onClick={handleClear}>{t('clear')}</Button>
          <Button onClick={handleDelete}>{t('delete')}</Button>
          {mode !== 'programmer' && <Button onClick={() => handleOperator('÷')}>÷</Button>}
          {mode === 'programmer' && <Button onClick={() => handleOperator('>>')}>&gt;&gt;</Button>}
        </View>

        <View className='row'>
          <Button onClick={() => handleNumber('7')} disabled={mode === 'programmer'}>7</Button>
          <Button onClick={() => handleNumber('8')} disabled={mode === 'programmer'}>8</Button>
          <Button onClick={() => handleNumber('9')} disabled={mode === 'programmer'}>9</Button>
          {mode !== 'programmer' && <Button onClick={() => handleOperator('×')}>×</Button>}
          {mode === 'programmer' && <Button onClick={() => handleOperator('<<')}> &lt;&lt; </Button>}
        </View>

        <View className='row'>
          <Button onClick={() => handleNumber('4')} disabled={mode === 'programmer'}>4</Button>
          <Button onClick={() => handleNumber('5')} disabled={mode === 'programmer'}>5</Button>
          <Button onClick={() => handleNumber('6')} disabled={mode === 'programmer'}>6</Button>
          <Button onClick={() => handleOperator('-')}>-</Button>
        </View>

        <View className='row'>
          <Button onClick={() => handleNumber('1')} disabled={mode === 'programmer' && display !== '0'}>1</Button>
          <Button onClick={() => handleNumber('2')} disabled={mode === 'programmer'}>2</Button>
          <Button onClick={() => handleNumber('3')} disabled={mode === 'programmer'}>3</Button>
          <Button onClick={() => handleOperator('+')}>+</Button>
        </View>

        <View className='row'>
          <Button onClick={() => handleNumber('0')}>0</Button>
          <Button onClick={handleDecimal} disabled={mode === 'programmer'}>.</Button>
          <Button onClick={calculateResult}>=</Button>
        </View>
      </View>
    </View>
  )
}

export default Calculator
