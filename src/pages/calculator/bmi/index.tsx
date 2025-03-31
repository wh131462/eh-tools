import {useEffect, useState} from 'react'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'
import {View} from "@tarojs/components";
import {Input} from "@nutui/nutui-react-taro";

interface BMIResult {
  bmi: number
  category: string
  advice: string
}

function BMICalculator() {
  const {language} = useAppSelector(state => state.app)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<BMIResult | null>(null)

  useEffect(() => {
    updatePageTitle(language, 'bmiCalculator')
  }, [language])

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
      category = '体重过轻'
      advice = '建议适当增加营养摄入，保持均衡饮食，适量运动以增强体质。'
    } else if (bmi < 24) {
      category = '体重正常'
      advice = '恭喜！请继续保持健康的生活方式。'
    } else if (bmi < 28) {
      category = '超重'
      advice = '建议控制饮食摄入，增加运动量，逐步将体重降至正常范围。'
    } else if (bmi < 32) {
      category = '肥胖'
      advice = '需要注意控制饮食，规律运动，必要时请咨询医生或营养师。'
    } else {
      category = '重度肥胖'
      advice = '建议在医生指导下进行减重，注意饮食控制和适量运动。'
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
          <View className='label'>身高 (cm)</View>
          <Input
            className='input'
            type='digit'
            value={height}
            onChange={handleHeightChange}
            placeholder='请输入身高'
          />
        </View>

        <View className='input-group'>
          <View className='label'>体重 (kg)</View>
          <Input
            className='input'
            type='digit'
            value={weight}
            onChange={handleWeightChange}
            placeholder='请输入体重'
          />
        </View>
      </View>

      {result && (
        <View className='result-section'>
          <View className='bmi-result'>
            <View className='value'>{result.bmi}</View>
            <View className='label'>BMI 指数</View>
          </View>

          <View className='category-section'>
            <View className='category'>{result.category}</View>
            <View className='advice'>{result.advice}</View>
          </View>

          <View className='reference'>
            <View className='title'>BMI 参考标准</View>
            <View className='standard-item'>
              <View className='range'>{'<18.5'}</View>
              <View className='desc'>体重过轻</View>
            </View>
            <View className='standard-item'>
              <View className='range'>18.5-23.9</View>
              <View className='desc'>体重正常</View>
            </View>
            <View className='standard-item'>
              <View className='range'>24.0-27.9</View>
              <View className='desc'>超重</View>
            </View>
            <View className='standard-item'>
              <View className='range'>28.0-31.9</View>
              <View className='desc'>肥胖</View>
            </View>
            <View className='standard-item'>
              <View className='range'>{'>32.0'}</View>
              <View className='desc'>重度肥胖</View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default BMICalculator
