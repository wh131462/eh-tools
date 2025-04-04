import {View} from '@tarojs/components'
import {useState} from 'react'
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro'
import {Button, Input} from "@nutui/nutui-react-taro"
import {useTranslation} from '@/i18n'
import "./index.less"
import {usePageTitle} from '@/hooks/usePageTitle'
import {useAppSelector} from "@/store/hooks";

interface ColorState {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

const ColorConverter = () => {
  const {t} = useTranslation();
  usePageTitle('colorConverter');
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["colorConverter"]
  });
  useShareTimeline(() => {
    return shares["colorConverter"]
  });
  const [color, setColor] = useState<ColorState>({
    hex: '#1890ff',  // 使用Ant Design主色
    rgb: {r: 24, g: 144, b: 255},
    hsl: {h: 209, s: 100, l: 55}
  })

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break
        case g:
          h = (b - r) / d + 2;
          break
        case b:
          h = (r - g) / d + 4;
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const handleHexChange = (value: string) => {
    value = value.toUpperCase()
    if (!/^#[0-9A-F]{6}$/i.test(value)) {
      Taro.showToast({
        title: t('invalidHexFormat'),
        icon: 'none',
        duration: 2000
      })
      return
    }

    const rgb = hexToRgb(value)
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setColor({hex: value, rgb, hsl})
    }
  }

  const handleRgbChange = (key: 'r' | 'g' | 'b', value: string | number) => {
    const num = parseInt(value.toString())
    if (isNaN(num) || num < 0 || num > 255) {
      Taro.showToast({
        title: t('invalidRgbValue'),
        icon: 'none',
        duration: 2000
      })
      return
    }

    const newRgb = {...color.rgb, [key]: num}
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    const hsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b)
    setColor({hex, rgb: newRgb, hsl})
  }

  const handleCopy = (value: string) => {
    Taro.setClipboardData({
      data: value,
      success: () => {
        Taro.showToast({
          title: t('success'),
          icon: 'success',
          duration: 1500
        })
      }
    })
  }

  return (
    <View className='color-converter'>
      <View className='color-card'>
        <View
          className='color-preview'
          style={{backgroundColor: color.hex}}
        >
          <View className='color-values'>
            <View>{color.hex}</View>
            <View>RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}</View>
            <View>HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</View>
          </View>
        </View>
      </View>

      <View className='input-group'>
        <View className='input-item ant-input-item'>
          <View className='input-label'>{t('hexValue')}</View>
          <View className='input-content'>
            <Input
              className='ant-input'
              placeholder='#1890FF'
              value={color.hex}
              onChange={handleHexChange}
            />
            <Button
              className='ant-btn-text'
              onClick={() => handleCopy(color.hex)}
            >
              {t('copy')}
            </Button>
          </View>
        </View>

        <View className='input-item ant-input-item'>
          <View className='input-label'>{t('rgbValue')}</View>
          <View className='rgb-inputs'>
            {['r', 'g', 'b'].map((channel) => (
              <View key={channel} className='input-content'>
                <View className='channel-label'>{channel.toUpperCase()}</View>
                <Input
                  className='ant-input'
                  type='number'
                  placeholder='0-255'
                  value={color.rgb[channel as keyof typeof color.rgb].toString()}
                  onChange={(value) => handleRgbChange(channel as 'r' | 'g' | 'b', value)}
                />
              </View>
            ))}
          </View>
          <Button
            className='ant-btn-text'
            onClick={() => handleCopy(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
          >
            {t("copy")} RGB
          </Button>
        </View>

        <View className='input-item ant-input-item'>
          <View className='input-label'>{t('hslValue')}</View>
          <View className='hsl-value'>
            <View className='hsl-text'>
              {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
            </View>
            <Button
              className='ant-btn-text'
              onClick={() => handleCopy(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)}
            >
              {t('copy')}
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ColorConverter
