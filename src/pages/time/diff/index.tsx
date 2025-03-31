import {View, Picker} from '@tarojs/components'
import {useState, useEffect} from 'react'
import {useTranslation} from '@/i18n'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'

function TimeDiff() {
  const {t} = useTranslation()
  const {language} = useAppSelector(state => state.app)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())

  useEffect(() => {
    updatePageTitle(language, 'timeDiff')
  }, [language])

  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 16).replace('T', ' ')
  }

  const calculateDiff = () => {
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffWeek = Math.floor(diffDay / 7)
    const diffMonth = (
      endTime.getMonth() +
      12 * endTime.getFullYear() -
      (startTime.getMonth() + 12 * startTime.getFullYear())
    )
    const diffYear = Math.floor(diffMonth / 12)

    return {
      years: diffYear,
      months: diffMonth % 12,
      weeks: diffWeek,
      days: diffDay % 7,
      hours: diffHour % 24,
      minutes: diffMin % 60,
      seconds: diffSec % 60
    }
  }

  const handleStartTimeChange = (e) => {
    setStartTime(new Date(e.detail.value.replace(' ', 'T')))
  }

  const handleEndTimeChange = (e) => {
    setEndTime(new Date(e.detail.value.replace(' ', 'T')))
  }

  const quickOptions = [
    {
      label: '一周前',
      setTime: () => {
        const now = new Date()
        setStartTime(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        setEndTime(now)
      }
    },
    {
      label: '一个月前',
      setTime: () => {
        const now = new Date()
        const lastMonth = new Date(now)
        lastMonth.setMonth(now.getMonth() - 1)
        setStartTime(lastMonth)
        setEndTime(now)
      }
    },
    {
      label: '一年前',
      setTime: () => {
        const now = new Date()
        const lastYear = new Date(now)
        lastYear.setFullYear(now.getFullYear() - 1)
        setStartTime(lastYear)
        setEndTime(now)
      }
    },
    {
      label: '下周',
      setTime: () => {
        const now = new Date()
        setStartTime(now)
        setEndTime(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
      }
    }
  ]

  const diff = calculateDiff()

  return (
    <View className='time-diff-page'>
      <View className='time-inputs'>
        <View className='input-group'>
          <View className='input-label'>开始时间</View>
          <Picker
            mode='datetime'
            value={formatDate(startTime)}
            onChange={handleStartTimeChange}
          >
            <View className='time-picker'>{formatDate(startTime)}</View>
          </Picker>
        </View>

        <View className='input-group'>
          <View className='input-label'>结束时间</View>
          <Picker
            mode='datetime'
            value={formatDate(endTime)}
            onChange={handleEndTimeChange}
          >
            <View className='time-picker'>{formatDate(endTime)}</View>
          </Picker>
        </View>
      </View>

      <View className='result-section'>
        <View className='result-title'>时间差</View>
        <View className='result-item'>
          <View className='item-label'>年</View>
          <View className='item-value'>{diff.years}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>月</View>
          <View className='item-value'>{diff.months}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>周</View>
          <View className='item-value'>{diff.weeks}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>天</View>
          <View className='item-value'>{diff.days}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>小时</View>
          <View className='item-value'>{diff.hours}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>分钟</View>
          <View className='item-value'>{diff.minutes}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>秒</View>
          <View className='item-value'>{diff.seconds}</View>
        </View>
      </View>

      <View className='quick-options'>
        <View className='options-title'>快速选项</View>
        <View className='options-grid'>
          {quickOptions.map((option, index) => (
            <View
              key={index}
              className='option-item'
              onClick={option.setTime}
            >
              {option.label}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default TimeDiff