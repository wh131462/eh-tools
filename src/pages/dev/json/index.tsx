import {View} from '@tarojs/components'
import {useState} from 'react'
import Taro from '@tarojs/taro'
import {Button, TextArea} from "@nutui/nutui-react-taro";

const JsonFormatter = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const formatJson = (compress = false) => {
    if (!input.trim()) {
      Taro.showToast({
        title: '请输入JSON字符串',
        icon: 'error'
      })
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = compress
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
    } catch (err) {
      setError('无效的JSON格式')
      setOutput('')
    }
  }

  const handleCopy = () => {
    if (!output) {
      Taro.showToast({
        title: '没有可复制的内容',
        icon: 'error'
      })
      return
    }

    Taro.setClipboardData({
      data: output,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'error'
        })
      }
    })
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <View className='json-formatter'>
      <View className='input-section'>
        <TextArea
          value={input}
          onChange={setInput}
          maxLength={5000}
          placeholder='请输入JSON字符串'
        />
      </View>

      <View className='button-group'>
        <Button type='primary' onClick={() => formatJson(false)}>格式化</Button>
        <Button onClick={() => formatJson(true)}>压缩</Button>
        <Button onClick={handleCopy}>复制</Button>
        <Button onClick={handleClear}>清空</Button>
      </View>

      {error && (
        <View className='error-message'>{error}</View>
      )}

      {output && (
        <View className='output-section'>
          <TextArea
            value={output}
            onChange={() => {
            }}
            maxLength={5000}
            disabled
          />
        </View>
      )}
    </View>
  )
}

export default JsonFormatter
