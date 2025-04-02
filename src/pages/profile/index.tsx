import {Text, View} from '@tarojs/components'
import {Avatar, Cell} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import {useTranslation} from '@/i18n'
import {useAppSelector} from '@/store/hooks'
import './index.less'
import {usePageTitle} from "@/hooks/usePageTitle";

function Profile() {
  const {t} = useTranslation();
  const {userInfo} = useAppSelector(state => state.user);

  usePageTitle("profile")

  const handleAvatarClick = () => {
    Taro.navigateTo({url: '/pages/profile/info/index'});
  }

  const getYearRange = (startYear: number) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: currentYear - startYear + 1}, (_, index) => startYear + index);
    return years.join('-');
  }
  return (
    <View className='profile-page'>
      <View className='user-info' onClick={handleAvatarClick}>
        <Avatar size='large' src={userInfo.avatar}/>
        {userInfo.isLogin && <View className='user-nickname'>{userInfo.nickname}</View> ||
          <View className='user-nickname' onClick={handleAvatarClick}>{t('login')}</View>}
      </View>

      <View className='settings'>
        <Cell title={t('setting')} onClick={() => Taro.navigateTo({url: '/pages/setting/index'})}/>
        <Cell title={t('about')} onClick={() => Taro.navigateTo({url: '/pages/about/index'})}/>
      </View>

      <View className='copyright'>
        <Text>Copyright © EternalHeart {getYearRange(2025)}</Text>
      </View>
    </View>
  )
}

export default Profile
