import {Button, Input, Textarea, View} from '@tarojs/components'
import {useDispatch, useSelector} from 'react-redux'
import Layout from '@/components/Layout'
import {setAlgorithm, setKey, setMode, setResult, setText} from '@/store/slices/cryptoSlice'
import Taro from '@tarojs/taro'
import CryptoJS from 'crypto-js'
import {useAppSelector} from "@/store/hooks";
import {useEffect} from "react";
import {updatePageTitle} from "@/i18n/utils";

const algorithms = [
  {id: 'base64', name: 'Base64'},
  {id: 'aes', name: 'AES'},
  {id: 'des', name: 'DES'}
]

export default function Crypto() {
  const {language} = useAppSelector(state => state.app);
  useEffect(() => {
    updatePageTitle(language, '文本加密');
  }, [language]);
  const dispatch = useDispatch()
  const {text, result, algorithm, key, mode} = useSelector((state: any) => state.crypto)

  const handleProcess = () => {
    if (!text) {
      Taro.showToast({title: '请输入文本', icon: 'none'})
      return
    }

    if ((algorithm === 'aes' || algorithm === 'des') && !key) {
      Taro.showToast({title: '请输入密钥', icon: 'none'})
      return
    }

    try {
      let processedText = ''
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
      Taro.showToast({title: '处理失败', icon: 'none'})
    }
  }

  return (
    <Layout>
      <View className='p-4'>
        <View className='flex justify-around mb-6'>
          <Button
            className={`flex-1 ${mode === 'encrypt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => dispatch(setMode('encrypt'))}
          >
            加密
          </Button>
          <Button
            className={`flex-1 ml-2 ${mode === 'decrypt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => dispatch(setMode('decrypt'))}
          >
            解密
          </Button>
        </View>

        <View className='mb-4'>
          <View className='mb-2'>加密算法：</View>
          <View className='flex flex-wrap gap-2'>
            {algorithms.map(algo => (
              <Button
                key={algo.id}
                className={`${algorithm === algo.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => dispatch(setAlgorithm(algo.id as any))}
              >
                {algo.name}
              </Button>
            ))}
          </View>
        </View>

        {(algorithm === 'aes' || algorithm === 'des') && (
          <View className='mb-4'>
            <Input
              className='w-full p-2 border rounded'
              placeholder='请输入密钥'
              value={key}
              onInput={e => dispatch(setKey(e.detail.value))}
            />
          </View>
        )}

        <Textarea
          className='w-full p-2 border rounded mb-4'
          placeholder={mode === 'encrypt' ? '请输入要加密的文本' : '请输入要解密的文本'}
          value={text}
          onInput={e => dispatch(setText(e.detail.value))}
        />

        <Button className='bg-blue-500 text-white mb-4' onClick={handleProcess}>
          {mode === 'encrypt' ? '加密' : '解密'}
        </Button>

        {result && (
          <View>
            <View className='font-medium mb-2'>结果：</View>
            <View className='p-2 bg-gray-100 rounded break-all'>{result}</View>
          </View>
        )}
      </View>
    </Layout>
  )
}
