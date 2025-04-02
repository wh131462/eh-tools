import {useEffect, useState} from 'react'
import {useTranslation} from '@/i18n'
import './index.less'
import {View} from "@tarojs/components";
import {Input} from "@nutui/nutui-react-taro";
import {usePageTitle} from "@/hooks/usePageTitle";

interface BMIResult {
  bmi: number
  category: string
  advice: string
}

function BMICalculator() {
  const {t} = useTranslation()
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<BMIResult | null>(null)
  usePageTitle('bmi');

  const calculateBMI = () => {
    const heightInM = parseFloat(height) / 100
    const weightInKg = parseFloat(weight)
    console.log(heightInM, weightInKg)
    if (isNaN(heightInM) || isNaN(weightInKg) || heightInM <= 0 || weightInKg <= 0) {
      return null
    }

    const bmi = weightInKg / (heightInM * heightInM)
    let category = ''
    let advice = ''

    if (bmi < 18.5) {
      category = t('underweight')
      advice = t('underweightAdvice')
    } else if (bmi < 24) {
      category = t('normal')
      advice = t('normalAdvice')
    } else if (bmi < 28) {
      category = t('overweight')
      advice = t('overweightAdvice')
    } else if (bmi < 32) {
      category = t('obese')
      advice = t('obeseAdvice')
    } else {
      category = t('severelyObese')
      advice = t('severelyObeseAdvice')
    }

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      advice
    }
  }

  const handleCalculate = () => {
    const result = calculateBMI()
    setResult(result)
  }

  const handleHeightChange = (val: string) => {
    setHeight(val)
  }

  const handleWeightChange = (val: string) => {
    setWeight(val)
  }

  useEffect(() => {
    if (height && weight) {
      handleCalculate()
    }
  }, [height, weight])

  return (
    <View className='bmi-calculator'>
      <View className='input-section'>
        <View className='input-group'>
          <View className='label'>{t('height')} ({t('heightUnit')})</View>
          <Input
            className='input'
            type='digit'
            value={height}
            onChange={handleHeightChange}
            placeholder={t('pleaseInput') + t('height')}
          />
        </View>

        <View className='input-group'>
          <View className='label'>{t('weight')} ({t('weightUnit')})</View>
          <Input
            className='input'
            type='digit'
            value={weight}
            onChange={handleWeightChange}
            placeholder={t('pleaseInput') + t('weight')}
          />
        </View>
      </View>

      {result && (
        <View className='result-section'>
          <View className='bmi-result'>
            <View className='value'>{result.bmi}</View>
            <View className='label'>{t('bmiIndex')}</View>
          </View>

          <View className='category-section'>
            <View className='category'>{result.category}</View>
            <View className='advice'>{result.advice}</View>
          </View>

          <View className='reference'>
            <View className='title'>{t('bmiReference')}</View>
            <View className='standard-item'>
              <View className='range'>{'<18.5'}</View>
              <View className='desc'>{t('underweight')}</View>
            </View>
            <View className='standard-item'>
              <View className='range'>18.5-23.9</View>
              <View className='desc'>{t('normal')}</View>
            </View>
            <View className='standard-item'>
              <View className='range'>24.0-27.9</View>
              <View className='desc'>{t('overweight')}</View>
            </View>
            <View className='standard-item'>
              <View className='range'>28.0-31.9</View>
              <View className='desc'>{t('obese')}</View>
            </View>
            <View className='standard-item'>
              <View className='range'>{'>32.0'}</View>
              <View className='desc'>{t('severelyObese')}</View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default BMICalculator
