import {Image, View} from '@tarojs/components'
import {Grid} from '@nutui/nutui-react-taro'
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro'
import {useTranslation} from '@/i18n'
import {useEffect} from 'react'
import {updatePageTitle, updateTabBarText} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import CustomSwiper, {SwiperItem} from '@/components/Swiper'
import calendarIcon from '@/assets/icons/calendar.png'
import rouletteIcon from '@/assets/icons/star.png'
import colorCardIcon from '@/assets/icons/color-card.png'
import timeIcon from '@/assets/icons/time.png'
import calculatorIcon from '@/assets/icons/calculator.png'
import textIcon from '@/assets/icons/text.png'
import devIcon from '@/assets/icons/dev.png'
import imageIcon from '@/assets/icons/image.png'
import './index.less'

import releaseBanner from '@/assets/banner/release.jpg'

function Index() {
  const {t} = useTranslation();
  const {language} = useAppSelector(state => state.app);
  useEffect(() => {
    updatePageTitle(language, 'tools');
    updateTabBarText(language)
  }, [language]);

  useShareAppMessage(() => {
    return {
      title: 'EH工具库,为你提供好用的工具',
      path: '/pages/index/index',
      imageUrl: '/assets/shares/toolsShare.png'
    };
  });

  useShareTimeline(() => {
    return {
      title: 'EH工具库,为你提供好用的工具',
      imageUrl: '/assets/shares/toolsShare.png'
    };
  });
  const banners: SwiperItem[] = [
    {id: '1', type: 'content', image: releaseBanner, title: 'EH工具发布'},
    // {id: '2', type: 'ad', adUnitId: 'adunit-8f71700fb343c1c4'}
  ]

  const tools = [
    {
      id: 'time',
      title: t('timeTools'),
      tools: [
        {id: 'countdown', text: t('countdown'), path: '/pages/time/countdown/index', icon: timeIcon},
        {id: 'timeDiff', text: t('timeDiff'), path: '/pages/time/diff/index', icon: timeIcon},
        {id: 'worldClock', text: t('worldClock'), path: '/pages/time/world-clock/index', icon: timeIcon}
      ]
    },
    {
      id: 'calculator',
      title: t('calculatorTools'),
      tools: [
        {id: 'mortgage', text: t('mortgage'), path: '/pages/calculator/mortgage/index', icon: calculatorIcon},
        {
          id: 'unitConverter',
          text: t('unitConverter'),
          path: '/pages/calculator/unit-converter/index',
          icon: calculatorIcon
        },
        {id: 'bmi', text: t('bmi'), path: '/pages/calculator/bmi/index', icon: calculatorIcon}
      ]
    },
    {
      id: 'text',
      title: t('textTools'),
      tools: [
        {id: 'qrcode', text: t('qrcode'), path: '/pages/text/qrcode/index', icon: textIcon},
        {id: 'crypto', text: t('crypto'), path: '/pages/text/crypto/index', icon: textIcon},
      ]
    },
    {
      id: 'life',
      title: t('lifeTools'),
      tools: [
        {id: 'calendar', text: t('calendar'), path: '/pages/calendar/index', icon: calendarIcon},
        {id: 'roulette', text: t('roulette'), path: '/pages/roulette/index/index', icon: rouletteIcon},
      ]
    },
    {
      id: 'dev',
      title: t('devTools'),
      tools: [
        {id: 'regex', text: t('regex'), path: '/pages/dev/regex/index', icon: devIcon},
        {id: 'json', text: t('json'), path: '/pages/dev/json/index', icon: devIcon},
        {id: 'colorCard', text: t('colorCard'), path: '/pages/color-card/index', icon: colorCardIcon}
      ]
    },
    {
      id: 'image',
      title: t('imageTools'),
      tools: [
        {id: 'compress', text: t('imageCompress'), path: '/pages/image/compress/index', icon: imageIcon},
        {id: 'convert', text: t('imageConvert'), path: '/pages/image/convert/index', icon: imageIcon},
        {id: 'filter', text: t('imageFilter'), path: '/pages/image/filter/index', icon: imageIcon}
      ]
    }
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
        <View className='section-description'>{t("toolsDescription")}</View>
        {tools.map(category => (
          <View key={category.id} className='tool-category'>
            <View className='category-title'>{category.title}</View>
            <Grid columns={3}>
              {category.tools.map(tool => (
                <Grid.Item key={tool.id} onClick={() => handleToolClick(tool.path)}>
                  <View className='tool-item'>
                    <Image className='tool-icon' src={tool.icon}/>
                    <View className='tool-name'>{tool.text}</View>
                  </View>
                </Grid.Item>
              ))}
            </Grid>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
