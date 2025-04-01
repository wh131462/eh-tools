import {Button, View} from '@tarojs/components'
import {useEffect, useState} from 'react'
import {useTranslation} from '@/i18n'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'
import {DatePicker, PickerOption} from "@nutui/nutui-react-taro";

function CountdownTimer() {
  const {t} = useTranslation()
  const {language} = useAppSelector(state => state.app)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [intervalId, setIntervalId] = useState<any>(null)

  useEffect(() => {
    updatePageTitle(language, 'countdown')
  }, [language])

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const startTimer = () => {
    if (!isRunning && totalSeconds > 0) {
      const id = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            clearInterval(id)
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setIntervalId(id)
      setIsRunning(true)
    }
  }

  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
      setIsRunning(false)
    }
  }

  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setIsRunning(false)
    setTotalSeconds(0)

  }

  const formatTime = (time: number): string => {
    const h = Math.floor(time / 3600)
    const m = Math.floor((time % 3600) / 60)
    const s = time % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const presetTimes = [
    {label: '1' + t('minute'), seconds: 60},
    {label: '3' + t('minute'), seconds: 180},
    {label: '5' + t('minute'), seconds: 300},
    {label: '10' + t('minute'), seconds: 600},
    {label: '15' + t('minute'), seconds: 900},
    {label: '30' + t('minute'), seconds: 1800},
  ]

  const setPresetTime = (seconds: number) => {
    setTotalSeconds(seconds)
  }
  const handleTimeSelect = (values: string[], options: PickerOption[]) => {
    const duration: number = values.reverse().reduce((dur, cur, idx) => {
      return dur + Number(cur) * Math.pow(60, idx)
    }, 0)
    setTotalSeconds(duration)
  }
  const [show, setShow] = useState(false)
  return (
    <View className='countdown-page'>
      <View className='timer-display' onClick={() => setShow(true)}>
        {formatTime(totalSeconds)}
      </View>
      <DatePicker
        title={t('timeSelect')}
        type="time"
        defaultValue={new Date("00:00:00")}
        visible={show}
        onClose={() => setShow(false)}
        onConfirm={(options, values) => handleTimeSelect(values as string[], options)}
      />

      <View className='timer-controls'>
        <Button
          className='control-button'
          type={isRunning ? 'warn' : 'primary'}
          onClick={isRunning ? pauseTimer : startTimer}
        >
          {isRunning ? t('pause') : t('start')}
        </Button>
        <Button
          className='control-button'
          onClick={resetTimer}
        >
          {t('reset')}
        </Button>
      </View>

      <View className='preset-times'>
        <View className='preset-title'>{t('presetTime')}</View>
        <View className='preset-grid'>
          {presetTimes.map(preset => (
            <View
              key={preset.seconds}
              className='preset-item'
              onClick={() => setPresetTime(preset.seconds)}
            >
              {preset.label}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default CountdownTimer
