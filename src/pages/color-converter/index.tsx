import {View} from '@tarojs/components'
import {useState} from 'react'
import Taro from '@tarojs/taro'
import {Input} from "@nutui/nutui-react-taro";

interface ColorState {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

const ColorConverter = () => {
  const [color, setColor] = useState<ColorState>({
    hex: '#000000',
    rgb: {r: 0, g: 0, b: 0},
    hsl: {h: 0, s: 0, l: 0}
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
    if (!/^#[0-9A-F]{6}$/i.test(value)) {
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
    if (isNaN(num) || num < 0 || num > 255) return

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
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }

  return (
    <View className='color-converter'>
      <View className='color-preview' style={{backgroundColor: color.hex}}/>

      <View className='input-group'>
        <View className='input-section'>
          <Input
            name='hex'
            type='text'
            placeholder='HEX:#000000'
            value={color.hex}
            onChange={handleHexChange}
          />
          <View className='copy-btn' onClick={() => handleCopy(color.hex)}>复制</View>
        </View>

        <View className='input-section'>
          <Input
            name='rgb-r'
            type='number'
            placeholder='R:0-255'
            value={color.rgb.r.toString()}
            onChange={(value) => handleRgbChange('r', value)}
          />
          <Input
            name='rgb-g'
            type='number'
            placeholder='G:0-255'
            value={color.rgb.g.toString()}
            onChange={(value) => handleRgbChange('g', value)}
          />
          <Input
            name='rgb-b'
            type='number'
            placeholder='B:0-255'
            value={color.rgb.b.toString()}
            onChange={(value) => handleRgbChange('b', value)}
          />
          <View
            className='copy-btn'
            onClick={() => handleCopy(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
          >
            复制
          </View>
        </View>

        <View className='input-section'>
          <View className='hsl-value'>
            HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
            <View
              className='copy-btn'
              onClick={() => handleCopy(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)}
            >
              复制
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ColorConverter
