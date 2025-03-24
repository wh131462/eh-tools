import {Image, View} from '@tarojs/components'
import {Grid} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import {useTranslation} from '@/i18n'
import {useEffect} from 'react'
import {updatePageTitle, updateTabBarText} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import CustomSwiper, {SwiperItem} from '@/components/Swiper'
import calendarIcon from '@/assets/icons/calendar.png'
import rouletteIcon from '@/assets/icons/star.png'
import './index.less'

import releaseBanner from '@/assets/banner/release.jpg'

function Index() {
  const {t} = useTranslation();
  const {language} = useAppSelector(state => state.app);
  useEffect(() => {
    updatePageTitle(language, 'tools');
    updateTabBarText(language)
  }, [language]);

  const banners: SwiperItem[] = [
    {id: '1', type: 'content', image: releaseBanner, title: 'EH工具发布'},
    // {id: '2', type: 'ad', adUnitId: 'adunit-8f71700fb343c1c4'}
  ]

  const tools = [
    {id: 'calendar', text: t('calendar'), path: '/pages/calendar/index', icon: calendarIcon},
    {id: 'roulette', text: t('roulette'), path: '/pages/roulette/index/index', icon: rouletteIcon}
  ]

  const handleToolClick = (path: string) => {
    Taro.navigateTo({url: path})
  }

  return (
    <View className='index-page'>
      <View className='banner-section'>
        <CustomSwiper
          items={banners}
          height={150}
          autoPlay={true}
        />
      </View>

      <View className='tools-section'>
        <View className='section-title'>{t("tools")}</View>
        <Grid columns={2}>
          {tools.map(tool => (
            <Grid.Item key={tool.id} onClick={() => handleToolClick(tool.path)}>
              <View className='tool-item'>
                <Image className='tool-icon' src={tool.icon}/>
                <View className='tool-name'>{tool.text}</View>
              </View>
            </Grid.Item>
          ))}
        </Grid>
      </View>
    </View>
  )
}

export default Index
