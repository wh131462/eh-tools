import {View} from '@tarojs/components'
import {Input, Picker} from '@nutui/nutui-react-taro'
import {useEffect, useState} from 'react'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'

interface UnitCategory {
  value: string
  text: string
  units: Array<{
    value: string
    text: string
    rate: number
  }>
}

const unitCategories: UnitCategory[] = [
  {
    value: 'length',
    text: '长度',
    units: [
      {value: 'km', text: '千米', rate: 1000},
      {value: 'm', text: '米', rate: 1},
      {value: 'dm', text: '分米', rate: 0.1},
      {value: 'cm', text: '厘米', rate: 0.01},
      {value: 'mm', text: '毫米', rate: 0.001},
      {value: 'mile', text: '英里', rate: 1609.344},
      {value: 'yard', text: '码', rate: 0.9144},
      {value: 'foot', text: '英尺', rate: 0.3048},
      {value: 'inch', text: '英寸', rate: 0.0254}
    ]
  },
  {
    value: 'area',
    text: '面积',
    units: [
      {value: 'km2', text: '平方千米', rate: 1000000},
      {value: 'm2', text: '平方米', rate: 1},
      {value: 'dm2', text: '平方分米', rate: 0.01},
      {value: 'cm2', text: '平方厘米', rate: 0.0001},
      {value: 'mm2', text: '平方毫米', rate: 0.000001},
      {value: 'ha', text: '公顷', rate: 10000},
      {value: 'acre', text: '英亩', rate: 4046.856},
      {value: 'ft2', text: '平方英尺', rate: 0.092903}
    ]
  },
  {
    value: 'volume',
    text: '体积',
    units: [
      {value: 'm3', text: '立方米', rate: 1000},
      {value: 'dm3', text: '立方分米', rate: 1},
      {value: 'cm3', text: '立方厘米', rate: 0.001},
      {value: 'mm3', text: '立方毫米', rate: 0.000001},
      {value: 'l', text: '升', rate: 1},
      {value: 'ml', text: '毫升', rate: 0.001},
      {value: 'gal', text: '加仑', rate: 3.78541},
      {value: 'ft3', text: '立方英尺', rate: 28.3168}
    ]
  }
]

function UnitConverter() {
  const {language} = useAppSelector(state => state.app)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [fromUnitIndex, setFromUnitIndex] = useState(0)
  const [toUnitIndex, setToUnitIndex] = useState(1)
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState('')
  const [categoryVisible, setCategoryVisible] = useState(false)
  const [fromVisible, setFromVisible] = useState(false)
  const [toVisible, setToVisible] = useState(false)

  useEffect(() => {
    updatePageTitle(language, 'unitConverter')
  }, [language])

  const currentCategory = unitCategories[categoryIndex]

  const handleCategoryChange = (list, values: string[]) => {
    const index = unitCategories.findIndex(c => c.value === values[0])
    setCategoryIndex(index)
    setFromUnitIndex(0)
    setToUnitIndex(1)
    setResult('')
    setCategoryVisible(false)
  }

  const handleFromUnitChange = (list, values: string[]) => {
    const index = currentCategory.units.findIndex(u => u.value === values[0])
    setFromUnitIndex(index)
    calculateResult(inputValue, index, toUnitIndex)
    setFromVisible(false)
  }

  const handleToUnitChange = (list, values: string[]) => {
    const index = currentCategory.units.findIndex(u => u.value === values[0])
    setToUnitIndex(index)
    calculateResult(inputValue, fromUnitIndex, index)
    setToVisible(false)
  }

  const handleInputChange = (val: string) => {
    setInputValue(val)
    calculateResult(val, fromUnitIndex, toUnitIndex)
  }

  const calculateResult = (value: string, fromIndex: number, toIndex: number) => {
    if (!value) {
      setResult('')
      return
    }
    const number = parseFloat(value)
    if (isNaN(number)) {
      setResult('无效输入')
      return
    }

    const fromUnit = currentCategory.units[fromIndex]
    const toUnit = currentCategory.units[toIndex]
    const baseValue = number * fromUnit.rate
    const result = baseValue / toUnit.rate
    setResult(result.toFixed(6))
  }

  return (
    <View className='unit-converter'>
      <View className="converter-section">
        <View className='input-group'>
          <View className='picker-value' onClick={() => setCategoryVisible(true)}>
            {currentCategory.text}
          </View>
          <Picker
            title="单位类别"
            visible={categoryVisible}
            options={unitCategories}
            onConfirm={handleCategoryChange}
            onClose={() => setCategoryVisible(false)}
          />
        </View>
        <View className="input-group">
          <Input
            className="input"
            type='number'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='请输入数值'
          /></View>
        <View className='input-group'>
          <View className='picker-value' onClick={() => setFromVisible(true)}>
            {currentCategory.units[fromUnitIndex].text}
          </View>
          <Picker
            title="选择单位"
            visible={fromVisible}
            options={currentCategory.units}
            onConfirm={handleFromUnitChange}
            onClose={() => setFromVisible(false)}
          />
        </View>
        <View className='input-group'><View className="equals">=</View></View>
        <View className="input-group"><View className='result'>{result || '0'}</View></View>
        <View className='input-group'>
          <View className='picker-value' onClick={() => setToVisible(true)}>
            {currentCategory.units[toUnitIndex].text}
          </View>
          <Picker
            title="选择转化单位"
            visible={toVisible}
            options={currentCategory.units}
            onConfirm={handleToUnitChange}
            onClose={() => setToVisible(false)}
          />
        </View>
      </View>

    </View>
  )
}

export default UnitConverter
