import {View} from '@tarojs/components'
import {useState} from 'react'
import {useTranslation} from '@/i18n'
import './index.less'
import {DatePicker} from "@nutui/nutui-react-taro";
import {usePageTitle} from "@/hooks/usePageTitle";

function TimeDiff() {
  const {t} = useTranslation()
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [showStart, setShowStart] = useState(false)
  const [showEnd, setShowEnd] = useState(false)

  usePageTitle("timeDiff")

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
  const startDate = new Date(0, 0, 1)
  const endDate = new Date(2050, 10, 1)
  const handleStartTimeChange = (values, options) => {
    const date = values.slice(0, 3).join('-')
    const time = values.slice(3).join(':')
    setStartTime(new Date(`${date} ${time}`))
  }

  const handleEndTimeChange = (values, options) => {
    const date = values.slice(0, 3).join('-')
    const time = values.slice(3).join(':')
    setEndTime(new Date(`${date} ${time}`))
  }

  const quickOptions = [
    {
      label: t('oneWeekAgo'),
      setTime: () => {
        const now = new Date()
        setStartTime(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        setEndTime(now)
      }
    },
    {
      label: t('oneMonthAgo'),
      setTime: () => {
        const now = new Date()
        const lastMonth = new Date(now)
        lastMonth.setMonth(now.getMonth() - 1)
        setStartTime(lastMonth)
        setEndTime(now)
      }
    },
    {
      label: t('oneYearAgo'),
      setTime: () => {
        const now = new Date()
        const lastYear = new Date(now)
        lastYear.setFullYear(now.getFullYear() - 1)
        setStartTime(lastYear)
        setEndTime(now)
      }
    },
    {
      label: t('nextWeek'),
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
          <View className='input-label'>{t('startTime')}</View>
          <View className='time-picker' onClick={() => setShowStart(true)}>{formatDate(startTime)}</View>
          <DatePicker
            title={t('dateTimeSelect')}
            startDate={startDate}
            endDate={endDate}
            defaultValue={new Date()}
            visible={showStart}
            type="datetime"
            onClose={() => setShowStart(false)}
            onConfirm={(options, values) => handleStartTimeChange(values, options)}
          />
        </View>

        <View className='input-group'>
          <View className='input-label'>{t('endTime')}</View>
          <View className='time-picker' onClick={() => setShowEnd(true)}>{formatDate(endTime)}</View>
          <DatePicker
            title={t('dateTimeSelect')}
            startDate={startDate}
            endDate={endDate}
            defaultValue={new Date()}
            visible={showEnd}
            type="datetime"
            onClose={() => setShowEnd(false)}
            onConfirm={(options, values) => handleEndTimeChange(values, options)}
          />
        </View>
      </View>

      <View className='result-section'>
        <View className='result-title'>{t('timeDifference')}</View>
        <View className='result-item'>
          <View className='item-label'>{t('year')}</View>
          <View className='item-value'>{diff.years}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>{t('month')}</View>
          <View className='item-value'>{diff.months}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>{t('week')}</View>
          <View className='item-value'>{diff.weeks}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>{t('day')}</View>
          <View className='item-value'>{diff.days}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>{t('hour')}</View>
          <View className='item-value'>{diff.hours}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>{t('minute')}</View>
          <View className='item-value'>{diff.minutes}</View>
        </View>
        <View className='result-item'>
          <View className='item-label'>{t('second')}</View>
          <View className='item-value'>{diff.seconds}</View>
        </View>
      </View>

      <View className='quick-options'>
        <View className='options-title'>{t('quickOptions')}</View>
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
