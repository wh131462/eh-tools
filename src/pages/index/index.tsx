import { View } from '@tarojs/components'
import { Grid } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useTranslation } from '@/i18n'
import { useEffect } from 'react'
import { updatePageTitle } from '@/i18n/utils'
import { useAppSelector } from '@/store/hooks'
import './index.less'
import Layout from "@/components/Layout";

function Index() {
  const { t } = useTranslation();
  const { language } = useAppSelector(state => state.app);

  useEffect(() => {
    updatePageTitle(language, 'tools');
  }, [language]);
  const tools = [
    { id: 'calendar', text: t('calendar'), path: '/pages/calendar/index' },
    { id: 'roulette', text: t('roulette'), path: '/pages/roulette/index/index' }
  ]

  const handleToolClick = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <Layout>
      <View className='index-page'>
        <Grid columns={2}>
          {tools.map(tool => (
            <Grid.Item key={tool.id} onClick={() => handleToolClick(tool.path)}>
              <View className='tool-item'>
                <View className='tool-name'>{tool.text}</View>
              </View>
            </Grid.Item>
          ))}
        </Grid>
      </View>
    </Layout>
  )
}

export default Index
