import {Button, Input, Textarea, View} from '@tarojs/components'
import {useDispatch, useSelector} from 'react-redux'
import Layout from '@/components/Layout'
import {setAlgorithm, setKey, setMode, setResult, setText} from '@/store/slices/cryptoSlice'
import Taro from '@tarojs/taro'
import CryptoJS from 'crypto-js'
import {useState} from "react"
import "./index.less"
import {usePageTitle} from "@/hooks/usePageTitle";
import {useTranslation} from "@/i18n";
import {copyToClipboard} from "@/utils/clipboard";
import {decode, encode} from 'js-base64';

const algorithms = [
  {id: 'base64', name: 'Base64'},
  {id: 'aes', name: 'AES'},
  {id: 'des', name: 'DES'}
]

export default function Crypto() {
  const {t} = useTranslation()
  const [processing, setProcessing] = useState(false)

  usePageTitle("crypto")

  const dispatch = useDispatch()
  const {text, result, algorithm, key, mode} = useSelector((state: any) => state.crypto)

  const handleProcess = async () => {
    if (!text) {
      Taro.showToast({title: t("cryptoInputTips"), icon: 'none'})
      return
    }

    try {
      setProcessing(true)
      let processedText = ''

      // 密钥校验
      if (algorithm === 'aes') {
        if (!key || (key.length !== 16 && key.length !== 24 && key.length !== 32)) {
          throw new Error(t("cryptoErrorAES"))
        }
      }
      if (algorithm === 'des' && (!key || key.length !== 8)) {
        throw new Error(t("cryptoErrorDES"))
      }

      if (algorithm === 'base64') {
        processedText = mode === 'encrypt'
          ? encode(text)  // 编码
          : decode(text)  // 解码
      } else if (algorithm === 'aes') {
        const keyUtf8 = CryptoJS.enc.Utf8.parse(key)
        const textUtf8 = CryptoJS.enc.Utf8.parse(text)

        if (mode === 'encrypt') {
          const encrypted = CryptoJS.AES.encrypt(textUtf8, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          })
          processedText = encrypted.toString()
        } else {
          const decrypted = CryptoJS.AES.decrypt(text, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          })
          processedText = decrypted.toString(CryptoJS.enc.Utf8)
        }
      } else if (algorithm === 'des') {
        const keyUtf8 = CryptoJS.enc.Utf8.parse(key)
        const textUtf8 = CryptoJS.enc.Utf8.parse(text)

        if (mode === 'encrypt') {
          const encrypted = CryptoJS.DES.encrypt(textUtf8, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          })
          processedText = encrypted.toString()
        } else {
          const decrypted = CryptoJS.DES.decrypt(text, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          })
          processedText = decrypted.toString(CryptoJS.enc.Utf8)
        }
      }

      dispatch(setResult(processedText))
    } catch (error) {
      console.error('详细错误:', error)
      Taro.showToast({
        title: `${t("cryptoHandleFailed")}: ${error.message}`,
        icon: 'none',
        duration: 3000
      })
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
            🛡️ {t("cryptoEncode")}
          </Button>
          <Button
            className={`switch-btn ${mode === 'decrypt' ? 'active' : ''}`}
            onClick={() => dispatch(setMode('decrypt'))}
          >
            🔓 {t("cryptoDecode")}
          </Button>
        </View>

        {/* 算法选择 */}
        <View className='algorithm-selector'>
          <View className='section-title'>🔐 {t('cryptoAlgorithm')}</View>
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
              placeholder={'🔑 ' + t("cryptoInputKeyTips")}
              value={key}
              onInput={e => dispatch(setKey(e.detail.value))}
            />
          </View>
        )}

        {/* 文本输入 */}
        <Textarea
          className='input-field text-area'
          placeholder={mode === 'encrypt' ? '📝 ' + t("cryptoInputEncodeContentTips") : '📝 ' + t('cryptoInputDecodeContentTips')}
          value={text}
          onInput={e => dispatch(setText(e.detail.value))}
        />

        {/* 操作按钮 */}
        <Button
          className={`process-btn ${processing ? 'processing' : ''}`}
          onClick={handleProcess}
          disabled={processing}
        >
          {processing ? '⏳ ' + t("cryptoProcessing") + '...' : mode === 'encrypt' ? '🚀 ' + t("cryptoStartEncrypt") : '🚀 ' + t("cryptoStartDecrypt")}
        </Button>

        {/* 结果展示 */}
        {result && (
          <View className='result-container'>
            <View className='section-title'>📤 {t('cryptoHandleResult')}</View>
            <View className='result-content'>{result}</View>
            <Button
              className='copy-btn'
              onClick={() => {
                copyToClipboard(result, t)
              }}
            >
              📋 {t("cryptoCopyResult")}
            </Button>
          </View>
        )}
      </View>
    </Layout>
  )
}
