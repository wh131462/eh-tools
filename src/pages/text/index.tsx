import {View} from '@tarojs/components'
import {useAppSelector} from '@/store/hooks'
import Layout from '@/components/Layout'
import Taro from "@tarojs/taro";
import {useEffect} from "react";
import {updatePageTitle} from "@/i18n/utils";

const tools = [
  {
    id: 'qrcode',
    name: '二维码工具',
    desc: '生成/扫描二维码',
    path: '/pages/text/qrcode/index'
  },
  {
    id: 'crypto',
    name: '文本加密',
    desc: '加密/解密文本',
    path: '/pages/text/crypto/index'
  },
  {
    id: 'markdown',
    name: 'Markdown预览',
    desc: '实时预览Markdown文本',
    path: '/pages/text/markdown/index'
  }
]

export default function TextTools() {
  const {language} = useAppSelector(state => state.app);
  useEffect(() => {
    updatePageTitle(language, '文本工具');
  }, [language]);

  return (
    <Layout>
      <View className='grid grid-cols-2 gap-4 p-4'>
        {tools.map(tool => (
          <View
            key={tool.id}
            className='flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow'
            onClick={() => Taro.navigateTo({url: tool.path})}
          >
            <View className='text-lg font-medium'>{tool.name}</View>
            <View className='text-sm text-gray-500 mt-2'>{tool.desc}</View>
          </View>
        ))}
      </View>
    </Layout>
  )
}
