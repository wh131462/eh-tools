import {Button, Image, Input, View} from '@tarojs/components'
import {useDispatch, useSelector} from 'react-redux'
import Layout from '@/components/Layout'
import {setContent, setGeneratedCode, setMode, setScannedCode} from '@/store/slices/qrcodeSlice'
import Taro from '@tarojs/taro'
import {useAppSelector} from "@/store/hooks";
import {useEffect} from "react";
import {updatePageTitle} from "@/i18n/utils";

export default function QRCode() {
  const {language} = useAppSelector(state => state.app);
  useEffect(() => {
    updatePageTitle(language, '二维码工具');
  }, [language]);
  const dispatch = useDispatch()
  const {content, generatedCode, scannedCode, mode} = useSelector((state: any) => state.qrcode)

  const handleGenerate = async () => {
    if (!content) {
      Taro.showToast({title: '请输入内容', icon: 'none'})
      return
    }
    try {
      // 调用二维码生成API
      const res = await Taro.request({
        url: 'https://api.qrserver.com/v1/create-qr-code/',
        method: 'GET',
        data: {
          data: content,
          size: '200x200'
        }
      })
      dispatch(setGeneratedCode(res.data))
    } catch (error) {
      Taro.showToast({title: '生成失败', icon: 'none'})
    }
  }

  const handleScan = async () => {
    try {
      const res = await Taro.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode']
      })
      dispatch(setScannedCode(res.result))
    } catch (error) {
      Taro.showToast({title: '扫描失败', icon: 'none'})
    }
  }

  return (
    <Layout>
      <View className='p-4'>
        <View className='flex justify-around mb-6'>
          <Button
            className={`flex-1 ${mode === 'generate' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => dispatch(setMode('generate'))}
          >
            生成二维码
          </Button>
          <Button
            className={`flex-1 ml-2 ${mode === 'scan' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => dispatch(setMode('scan'))}
          >
            扫描二维码
          </Button>
        </View>

        {mode === 'generate' ? (
          <View>
            <Input
              className='w-full p-2 border rounded'
              placeholder='请输入要生成二维码的内容'
              value={content}
              onInput={e => dispatch(setContent(e.detail.value))}
            />
            <Button className='mt-4 bg-blue-500 text-white' onClick={handleGenerate}>
              生成
            </Button>
            {generatedCode && (
              <View className='mt-4 flex justify-center'>
                <Image src={generatedCode} className='w-48 h-48'/>
              </View>
            )}
          </View>
        ) : (
          <View>
            <Button className='bg-blue-500 text-white' onClick={handleScan}>
              开始扫描
            </Button>
            {scannedCode && (
              <View className='mt-4'>
                <View className='font-medium'>扫描结果：</View>
                <View className='mt-2 p-2 bg-gray-100 rounded'>{scannedCode}</View>
              </View>
            )}
          </View>
        )}
      </View>
    </Layout>
  )
}
