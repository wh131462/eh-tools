import {Text, View} from '@tarojs/components'
import {Avatar, Button, Cell} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import {useTranslation} from '@/i18n'
import {useEffect} from 'react'
import {updatePageTitle} from '@/i18n/utils'
import {useAppDispatch, useAppSelector} from '@/store/hooks'
import {setUserInfo} from '@/store/slices/userSlice'
import './index.less'

function Profile() {
  const {t} = useTranslation();
  const {language} = useAppSelector(state => state.app);
  const {userInfo} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    updatePageTitle(language, 'profile');
  }, [language]);

  const handleLogin = () => {
    Taro.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const {userInfo: wxUserInfo} = res;
        dispatch(setUserInfo({
          avatar: wxUserInfo.avatarUrl,
          nickname: wxUserInfo.nickName,
          isLogin: true
        }));
      },
      fail: (err) => {
        console.error('获取用户信息失败：', err);
        Taro.showToast({
          title: '获取用户信息失败',
          icon: 'error'
        });
      }
    });
  }

  const getYearRange = (startYear: number) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: currentYear - startYear + 1}, (_, index) => startYear + index);
    return years.join('-');
  }
  return (
    <View className='profile-page'>
      <View className='user-info'>
        <Avatar size='large' src={userInfo.avatar}/>
        <View className='user-nickname'>{userInfo.nickname}</View>
        {!userInfo.isLogin && (
          <Button type='primary' onClick={handleLogin}>{t('login')}</Button>
        )}
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
