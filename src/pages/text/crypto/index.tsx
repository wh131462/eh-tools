import {Button, Input, Textarea, View} from '@tarojs/components'
import {useDispatch, useSelector} from 'react-redux'
import Layout from '@/components/Layout'
import {setAlgorithm, setKey, setMode, setResult, setText} from '@/store/slices/cryptoSlice'
import Taro from '@tarojs/taro'
import CryptoJS from 'crypto-js'
import {useAppSelector} from "@/store/hooks"
import {useEffect, useState} from "react"
import {updatePageTitle} from "@/i18n/utils"
import "./index.less"

const algorithms = [
  {id: 'base64', name: 'Base64'},
  {id: 'aes', name: 'AES'},
  {id: 'des', name: 'DES'}
]

export default function Crypto() {
  const {language} = useAppSelector(state => state.app)
  const [processing, setProcessing] = useState(false)
  useEffect(() => {
    updatePageTitle(language, '文本加密')
  }, [language])

  const dispatch = useDispatch()
  const {text, result, algorithm, key, mode} = useSelector((state: any) => state.crypto)

  const handleProcess = async () => {
    if (!text) {
      Taro.showToast({title: '请输入文本', icon: 'none'})
      return
    }

    if ((algorithm === 'aes' || algorithm === 'des') && !key) {
      Taro.showToast({title: '请输入密钥', icon: 'none'})
      return
    }

    try {
      setProcessing(true)
      let processedText = ''

      // 模拟异步处理
      await new Promise(resolve => setTimeout(resolve, 300))

      if (algorithm === 'base64') {
        processedText = mode === 'encrypt'
          ? btoa(text)
          : atob(text)
      } else if (algorithm === 'aes') {
        processedText = mode === 'encrypt'
          ? CryptoJS.AES.encrypt(text, key).toString()
          : CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8)
      } else if (algorithm === 'des') {
        processedText = mode === 'encrypt'
          ? CryptoJS.DES.encrypt(text, key).toString()
          : CryptoJS.DES.decrypt(text, key).toString(CryptoJS.enc.Utf8)
      }

      dispatch(setResult(processedText))
    } catch (error) {
      Taro.showToast({title: '处理失败: ' + error.message, icon: 'none'})
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Layout>
      <View className='crypto-container'>
        {/* 模式切换 */}
        <View className='mode-switch'>
          <Button
            className={`switch-btn ${mode === 'encrypt' ? 'active' : ''}`}
            onClick={() => dispatch(setMode('encrypt'))}
          >
            🛡️ 加密
          </Button>
          <Button
            className={`switch-btn ${mode === 'decrypt' ? 'active' : ''}`}
            onClick={() => dispatch(setMode('decrypt'))}
          >
            🔓 解密
          </Button>
        </View>

        {/* 算法选择 */}
        <View className='algorithm-selector'>
          <View className='section-title'>🔐 加密算法</View>
          <View className='algorithm-buttons'>
            {algorithms.map(algo => (
              <Button
                key={algo.id}
                className={`algo-btn ${algorithm === algo.id ? 'active' : ''}`}
                onClick={() => dispatch(setAlgorithm(algo.id as any))}
              >
                {algo.name}
              </Button>
            ))}
          </View>
        </View>

        {/* 密钥输入 */}
        {(algorithm === 'aes' || algorithm === 'des') && (
          <View className='key-input'>
            <Input
              className='input-field'
              password
              placeholder='🔑 请输入密钥'
              value={key}
              onInput={e => dispatch(setKey(e.detail.value))}
            />
          </View>
        )}

        {/* 文本输入 */}
        <Textarea
          className='input-field text-area'
          placeholder={mode === 'encrypt' ? '📝 请输入要加密的文本' : '📝 请输入要解密的文本'}
          value={text}
          onInput={e => dispatch(setText(e.detail.value))}
        />

        {/* 操作按钮 */}
        <Button
          className={`process-btn ${processing ? 'processing' : ''}`}
          onClick={handleProcess}
          disabled={processing}
        >
          {processing ? '⏳ 处理中...' : mode === 'encrypt' ? '🚀 开始加密' : '🚀 开始解密'}
        </Button>

        {/* 结果展示 */}
        {result && (
          <View className='result-container'>
            <View className='section-title'>📤 处理结果</View>
            <View className='result-content'>{result}</View>
            <Button
              className='copy-btn'
              onClick={() => {
                Taro.setClipboardData({data: result})
                Taro.showToast({title: '已复制到剪贴板'})
              }}
            >
              📋 复制结果
            </Button>
          </View>
        )}
      </View>
    </Layout>
  )
}
