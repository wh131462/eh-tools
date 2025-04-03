import {Image, View} from '@tarojs/components'
import {Grid} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import {useTranslation} from '@/i18n'
import CustomSwiper, {SwiperItem} from '@/components/Swiper'
import calendarIcon from '@/assets/icons/calendar.png'
import rouletteIcon from '@/assets/icons/star.png'
import countDownIcon from '@/assets/icons/count-down.png'
import worldTimeIcon from '@/assets/icons/world-time.png'
import timeDiffIcon from '@/assets/icons/time-diff.png'
import calculatorIcon from '@/assets/icons/calculator.png'
import bmiIcon from '@/assets/icons/BMI.png'
import mortgageIcon from '@/assets/icons/mortgage.png'
import unitConverterIcon from '@/assets/icons/unit-converter.png'
import qrcodeIcon from '@/assets/icons/qr-code.png'
import encryptionIcon from '@/assets/icons/encryption.png'
import salaryIcon from '@/assets/icons/salary.png'
import colorCardIcon from '@/assets/icons/color-card.png'
import imageZipIcon from '@/assets/icons/image-zip.png'
import imageFilterIcon from '@/assets/icons/image-filter.png'
import './index.less'

import releaseBanner from '@/assets/banner/release.jpg'
import {usePageTitle} from "@/hooks/usePageTitle";

function Index() {
  const {t} = useTranslation();
  usePageTitle("tools")
  const banners: SwiperItem[] = [
    {id: '1', type: 'content', image: releaseBanner, title: 'EH工具发布'},
    // {id: '2', type: 'ad', adUnitId: 'adunit-8f71700fb343c1c4'}
  ]

  const tools = [
    {
      id: 'time',
      title: t('timeTools'),
      tools: [
        {id: 'calendar', text: t('calendar'), path: '/pages/calendar/index', icon: calendarIcon},
        {id: 'countdown', text: t('countdown'), path: '/pages/time/countdown/index', icon: countDownIcon},
        {id: 'timeDiff', text: t('timeDiff'), path: '/pages/time/diff/index', icon: timeDiffIcon},
        {id: 'worldClock', text: t('worldClock'), path: '/pages/time/world-clock/index', icon: worldTimeIcon}
      ]
    },
    {
      id: 'life',
      title: t('lifeTools'),
      tools: [
        {id: 'roulette', text: t('roulette'), path: '/pages/roulette/index/index', icon: rouletteIcon},
        {id: 'qrcode', text: t('qrcode'), path: '/pages/qrcode/index', icon: qrcodeIcon},
      ]
    },
    {
      id: 'calculator',
      title: t('calculatorTools'),
      tools: [
        {id: 'calculator', text: t('calculator'), path: '/pages/calculator/calculator/index', icon: calculatorIcon},
        {id: 'mortgage', text: t('mortgage'), path: '/pages/calculator/mortgage/index', icon: mortgageIcon},
        {
          id: 'unitConverter',
          text: t('unitConverter'),
          path: '/pages/calculator/unit-converter/index',
          icon: unitConverterIcon
        },
        {id: 'bmi', text: t('bmi'), path: '/pages/calculator/bmi/index', icon: bmiIcon},
        {
          id: 'laborSalaryCalculator',
          text: t('laborSalaryCalculator'),
          path: '/pages/calculator/labor-salary-calculator/index',
          icon: salaryIcon
        },
        {id: 'crypto', text: t('crypto'), path: '/pages/crypto/index', icon: encryptionIcon},
      ]
    },
    {
      id: 'art',
      title: t('artTools'),
      tools: [
        {id: 'compress', text: t('imageCompressor'), path: '/pages/image/compress/index', icon: imageZipIcon},
        {id: 'filter', text: t('imageFilter'), path: '/pages/image/filter/index', icon: imageFilterIcon},
        {id: 'colorCard', text: t('colorCard'), path: '/pages/color-card/index', icon: colorCardIcon},
        {id: 'colorConverter', text: t('colorConverter'), path: '/pages/color-converter/index', icon: colorCardIcon},
      ]
    },

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
