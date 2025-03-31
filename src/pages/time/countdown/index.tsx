import {View, Input, Button} from '@tarojs/components'
import {useState, useEffect} from 'react'
import {useTranslation} from '@/i18n'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'

function CountdownTimer() {
  const {t} = useTranslation()
  const {language} = useAppSelector(state => state.app)
  const [hours, setHours] = useState('00')
  const [minutes, setMinutes] = useState('00')
  const [seconds, setSeconds] = useState('00')
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null)

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
    setHours('00')
    setMinutes('00')
    setSeconds('00')
  }

  const handleTimeInput = () => {
    const h = parseInt(hours) || 0
    const m = parseInt(minutes) || 0
    const s = parseInt(seconds) || 0
    setTotalSeconds(h * 3600 + m * 60 + s)
  }

  const formatTime = (time: number): string => {
    const h = Math.floor(time / 3600)
    const m = Math.floor((time % 3600) / 60)
    const s = time % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const presetTimes = [
    {label: '1分钟', seconds: 60},
    {label: '3分钟', seconds: 180},
    {label: '5分钟', seconds: 300},
    {label: '10分钟', seconds: 600},
    {label: '15分钟', seconds: 900},
    {label: '30分钟', seconds: 1800},
  ]

  const setPresetTime = (seconds: number) => {
    setTotalSeconds(seconds)
    setHours(Math.floor(seconds / 3600).toString().padStart(2, '0'))
    setMinutes(Math.floor((seconds % 3600) / 60).toString().padStart(2, '0'))
    setSeconds((seconds % 60).toString().padStart(2, '0'))
  }

  return (
    <View className='countdown-page'>
      <View className='timer-display'>
        {formatTime(totalSeconds)}
      </View>

      <View className='time-input'>
        <View className='input-group'>
          <View className='input-label'>时</View>
          <Input
            className='input-field'
            type='number'
            value={hours}
            onInput={e => setHours(e.detail.value)}
            onBlur={handleTimeInput}
          />
        </View>
        <View className='input-group'>
          <View className='input-label'>分</View>
          <Input
            className='input-field'
            type='number'
            value={minutes}
            onInput={e => setMinutes(e.detail.value)}
            onBlur={handleTimeInput}
          />
        </View>
        <View className='input-group'>
          <View className='input-label'>秒</View>
          <Input
            className='input-field'
            type='number'
            value={seconds}
            onInput={e => setSeconds(e.detail.value)}
            onBlur={handleTimeInput}
          />
        </View>
      </View>

      <View className='timer-controls'>
        <Button
          className='control-button'
          type={isRunning ? 'default' : 'primary'}
          onClick={isRunning ? pauseTimer : startTimer}
        >
          {isRunning ? '暂停' : '开始'}
        </Button>
        <Button
          className='control-button'
          onClick={resetTimer}
        >
          重置
        </Button>
      </View>

      <View className='preset-times'>
        <View className='preset-title'>预设时间</View>
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