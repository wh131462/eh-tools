import {View} from '@tarojs/components'
import {Input, Picker} from '@nutui/nutui-react-taro'
import {useState} from 'react'
import {useTranslation} from '@/i18n'
import './index.less'
import {usePageTitle} from "@/hooks/usePageTitle";
import {useAppSelector} from "@/store/hooks";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

interface UnitCategory {
  value: string
  text: string
  units: Array<{
    value: string
    text: string
    rate: number
  }>
}

function getUnitCategories(t: (key: string) => string): UnitCategory[] {
  return [
    {
      value: 'length',
      text: t('length'),
      units: [
        {value: 'km', text: t('kilometer'), rate: 1000},
        {value: 'm', text: t('meter'), rate: 1},
        {value: 'dm', text: t('decimeter'), rate: 0.1},
        {value: 'cm', text: t('centimeter'), rate: 0.01},
        {value: 'mm', text: t('millimeter'), rate: 0.001},
        {value: 'mile', text: t('mile'), rate: 1609.344},
        {value: 'yard', text: t('yard'), rate: 0.9144},
        {value: 'foot', text: t('foot'), rate: 0.3048},
        {value: 'inch', text: t('inch'), rate: 0.0254}
      ]
    },
    {
      value: 'area',
      text: t('area'),
      units: [
        {value: 'km2', text: t('squareKilometer'), rate: 1000000},
        {value: 'm2', text: t('squareMeter'), rate: 1},
        {value: 'dm2', text: t('squareDecimeter'), rate: 0.01},
        {value: 'cm2', text: t('squareCentimeter'), rate: 0.0001},
        {value: 'mm2', text: t('squareMillimeter'), rate: 0.000001},
        {value: 'ha', text: t('hectare'), rate: 10000},
        {value: 'acre', text: t('acre'), rate: 4046.856},
        {value: 'ft2', text: t('squareFoot'), rate: 0.092903}
      ]
    },
    {
      value: 'volume',
      text: t('volume'),
      units: [
        {value: 'm3', text: t('cubicMeter'), rate: 1000},
        {value: 'dm3', text: t('cubicDecimeter'), rate: 1},
        {value: 'cm3', text: t('cubicCentimeter'), rate: 0.001},
        {value: 'mm3', text: t('cubicMillimeter'), rate: 0.000001},
        {value: 'l', text: t('liter'), rate: 1},
        {value: 'ml', text: t('milliliter'), rate: 0.001},
        {value: 'gal', text: t('gallon'), rate: 3.78541},
        {value: 'ft3', text: t('cubicFoot'), rate: 28.3168}
      ]
    }
  ]
}

function UnitConverter() {
  const {t} = useTranslation()
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [fromUnitIndex, setFromUnitIndex] = useState(0)
  const [toUnitIndex, setToUnitIndex] = useState(1)
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState('')
  const [categoryVisible, setCategoryVisible] = useState(false)
  const [fromVisible, setFromVisible] = useState(false)
  const [toVisible, setToVisible] = useState(false)

  usePageTitle("unitConverter")
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["unitConverter"]
  });
  useShareTimeline(() => {
    return shares["unitConverter"]
  });
  const unitCategories = getUnitCategories(t)
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
      setResult(t('invalidInput'))
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
            title={t('unitCategory')}
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
            placeholder={t('pleaseInput')}
          /></View>
        <View className='input-group'>
          <View className='picker-value' onClick={() => setFromVisible(true)}>
            {currentCategory.units[fromUnitIndex].text}
          </View>
          <Picker
            title={t('selectUnit')}
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
            title={t('selectTargetUnit')}
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
