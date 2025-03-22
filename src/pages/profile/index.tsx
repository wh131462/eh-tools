import { View } from '@tarojs/components'
import { Avatar, Cell, Button } from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import { useTranslation } from '@/i18n'
import { useEffect } from 'react'
import { updatePageTitle } from '@/i18n/utils'
import { useAppSelector } from '@/store/hooks'
import './index.less'
import Layout from "@/components/Layout";

function Profile() {
  const { t } = useTranslation();
  const { language } = useAppSelector(state => state.app);
  useEffect(() => {
    updatePageTitle(language, 'profile');
  }, [language]);

  const userInfo = {
    avatar: 'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
    nickname: t('notLoggedIn'),
    isLogin: false
  }
  const handleLogin = () => {
    // TODO: 实现登录逻辑
    console.log('登录')
  }


  return (
      <Layout>
        <View className='profile-page'>
          <View className='user-info'>
            <Avatar size='large' src={userInfo.avatar} />
            <View className='user-nickname'>{userInfo.nickname}</View>
            {!userInfo.isLogin && (
              <Button type='primary' onClick={handleLogin}>{t('login')}</Button>
            )}
          </View>

          <View className='settings'>
            <Cell title={t('setting')} onClick={() => Taro.navigateTo({ url: '/pages/setting/index' })} />
            <Cell title={t('about')} onClick={() => Taro.navigateTo({ url: '/pages/about/index' })} />
          </View>
        </View>
      </Layout>
  )
}

export default Profile
