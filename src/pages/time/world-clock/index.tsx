import {View} from '@tarojs/components'
import {useEffect, useState} from 'react'
import {useTranslation} from '@/i18n'
import './index.less'
import {usePageTitle} from "@/hooks/usePageTitle";
import {formatDate} from "@/utils/date";
import {useAppSelector} from "@/store/hooks";
import Taro, {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimeZones, setSelectedTimeZones] = useState<TimeZone[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["worldClock"]
  });
  useShareTimeline(() => {
    return shares["worldClock"]
  });
  usePageTitle("worldClock")

  useEffect(() => {
    // 从本地存储加载已选择的时区
    const loadSelectedTimeZones = async () => {
      try {
        const savedTimeZones = await Taro.getStorage({ key: 'selectedTimeZones' })
        if (savedTimeZones.data && savedTimeZones.data.length > 0) {
          setSelectedTimeZones(savedTimeZones.data)
        } else {
          setSelectedTimeZones([timeZones[0]]) // 默认显示上海时间
        }
      } catch (error) {
        setSelectedTimeZones([timeZones[0]]) // 如果没有保存的数据，显示默认时区
      }
    }
    loadSelectedTimeZones()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDisplayTime = (date: Date, offset: number): string => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (3600000 * offset))
    return formatDate(localTime.valueOf(), "HH:mm:ss");
  }

  const formatDisplayDate = (date: Date, offset: number): string => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (3600000 * offset))
    return formatDate(localTime.valueOf(), "yyyy-MM-dd");
  }

  const addTimeZone = async (timezone: TimeZone) => {
    if (!selectedTimeZones.find(tz => tz.id === timezone.id)) {
      const newSelectedTimeZones = [...selectedTimeZones, timezone]
      setSelectedTimeZones(newSelectedTimeZones)
      try {
        await Taro.setStorage({
          key: 'selectedTimeZones',
          data: newSelectedTimeZones
        })
      } catch (error) {
        console.error('Failed to save timezone:', error)
      }
    }
    setShowPicker(false)
  }

  const removeTimeZone = async (timezoneId: string) => {
    const newSelectedTimeZones = selectedTimeZones.filter(tz => tz.id !== timezoneId)
    setSelectedTimeZones(newSelectedTimeZones)
    try {
      await Taro.setStorage({
        key: 'selectedTimeZones',
        data: newSelectedTimeZones
      })
    } catch (error) {
      console.error('Failed to save timezone:', error)
    }
  }

  return (
    <View className='world-clock-page'>
      <View className='current-time'>
        <View className='time-display'>
          {formatDisplayTime(currentTime, timeZones[0].offset)}
        </View>
        <View className='date-display'>
          {formatDisplayDate(currentTime, timeZones[0].offset)}
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
                {formatDisplayTime(currentTime, timezone.offset)}
              </View>
              <View className='date'>
                {formatDisplayDate(currentTime, timezone.offset)}
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
