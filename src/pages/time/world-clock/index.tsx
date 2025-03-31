import {View} from '@tarojs/components'
import {useState, useEffect} from 'react'
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

const timeZones: TimeZone[] = [
  {id: 'asia-shanghai', city: '上海', name: 'Asia/Shanghai', offset: 8},
  {id: 'america-new_york', city: '纽约', name: 'America/New_York', offset: -4},
  {id: 'europe-london', city: '伦敦', name: 'Europe/London', offset: 1},
  {id: 'asia-tokyo', city: '东京', name: 'Asia/Tokyo', offset: 9},
  {id: 'australia-sydney', city: '悉尼', name: 'Australia/Sydney', offset: 10},
  {id: 'europe-paris', city: '巴黎', name: 'Europe/Paris', offset: 2},
  {id: 'america-los_angeles', city: '洛杉矶', name: 'America/Los_Angeles', offset: -7},
  {id: 'asia-dubai', city: '迪拜', name: 'Asia/Dubai', offset: 4},
  {id: 'asia-singapore', city: '新加坡', name: 'Asia/Singapore', offset: 8},
  {id: 'europe-moscow', city: '莫斯科', name: 'Europe/Moscow', offset: 3}
]

function WorldClock() {
  const {t} = useTranslation()
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
            <View className='title'>选择时区</View>
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