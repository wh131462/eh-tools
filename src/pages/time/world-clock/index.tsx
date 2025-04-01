import {View} from '@tarojs/components'
import {useEffect, useState} from 'react'
import {useTranslation} from '@/i18n'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'

interface TimeZone {
  id: string
  city: string
  name: string
  offset: number
}


function WorldClock() {
  const {t} = useTranslation()
  const timeZones: TimeZone[] = [
    {id: 'asia-shanghai', city: t('shanghai'), name: 'Asia/Shanghai', offset: 8},
    {id: 'america-new_york', city: t('newYork'), name: 'America/New_York', offset: -4},
    {id: 'europe-london', city: t('london'), name: 'Europe/London', offset: 1},
    {id: 'asia-tokyo', city: t('tokyo'), name: 'Asia/Tokyo', offset: 9},
    {id: 'australia-sydney', city: t('sydney'), name: 'Australia/Sydney', offset: 10},
    {id: 'europe-paris', city: t('paris'), name: 'Europe/Paris', offset: 2},
    {id: 'america-los_angeles', city: t('losAngeles'), name: 'America/Los_Angeles', offset: -7},
    {id: 'asia-dubai', city: t('dubai'), name: 'Asia/Dubai', offset: 4},
    {id: 'asia-singapore', city: t('singapore'), name: 'Asia/Singapore', offset: 8},
    {id: 'europe-moscow', city: t('moscow'), name: 'Europe/Moscow', offset: 3}
  ]
  const {language} = useAppSelector(state => state.app)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimeZones, setSelectedTimeZones] = useState<TimeZone[]>([
    timeZones[0], // 默认显示上海时间
  ])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    updatePageTitle(language, 'worldClock')
  }, [language])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date, offset: number): string => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (3600000 * offset))
    return localTime.toLocaleTimeString()
  }

  const formatDate = (date: Date, offset: number): string => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (3600000 * offset))
    return localTime.toLocaleDateString()
  }

  const addTimeZone = (timezone: TimeZone) => {
    if (!selectedTimeZones.find(tz => tz.id === timezone.id)) {
      setSelectedTimeZones([...selectedTimeZones, timezone])
    }
    setShowPicker(false)
  }

  const removeTimeZone = (timezoneId: string) => {
    setSelectedTimeZones(selectedTimeZones.filter(tz => tz.id !== timezoneId))
  }

  return (
    <View className='world-clock-page'>
      <View className='current-time'>
        <View className='time-display'>
          {formatTime(currentTime, timeZones[0].offset)}
        </View>
        <View className='date-display'>
          {formatDate(currentTime, timeZones[0].offset)}
        </View>
      </View>

      <View className='timezone-list'>
        {selectedTimeZones.map(timezone => (
          <View
            key={timezone.id}
            className='timezone-item'
            onClick={() => removeTimeZone(timezone.id)}
          >
            <View className='location-info'>
              <View className='city-name'>{timezone.city}</View>
              <View className='timezone-name'>{timezone.name}</View>
            </View>
            <View className='time-info'>
              <View className='time'>
                {formatTime(currentTime, timezone.offset)}
              </View>
              <View className='date'>
                {formatDate(currentTime, timezone.offset)}
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className='add-timezone' onClick={() => setShowPicker(true)}>
        +
      </View>

      {showPicker && (
        <View className='timezone-picker'>
          <View className='picker-header'>
            <View className='title'>{t('selectTimezone')}</View>
            <View className='close' onClick={() => setShowPicker(false)}>×</View>
          </View>
          <View className='picker-content'>
            {timeZones.map(timezone => (
              <View
                key={timezone.id}
                className='timezone-option'
                onClick={() => addTimeZone(timezone)}
              >
                {timezone.city} ({timezone.name})
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default WorldClock
