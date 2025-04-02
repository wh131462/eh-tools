import {View} from '@tarojs/components'
import {Avatar, Button, Cell, Input} from '@nutui/nutui-react-taro'
import Taro from '@tarojs/taro'
import {useTranslation} from '@/i18n'
import {useState} from 'react'
import {useAppDispatch, useAppSelector} from '@/store/hooks'
import {clearUserInfo, setUserInfo} from '@/store/slices/userSlice'
import './index.less'
import {usePageTitle} from "@/hooks/usePageTitle";

function ProfileInfo() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {userInfo} = useAppSelector(state => state.user);
  const [newUser, setNewUser] = useState({
    avatar: userInfo.avatar,
    nickname: userInfo.nickname,
    isLogin: userInfo.isLogin
  });
  const [isModified, setIsModified] = useState(false);

  usePageTitle("profile")


  const handleLogin = () => {
    if (!newUser.nickname) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'error'
      });
      return;
    }
    dispatch(setUserInfo({...newUser, isLogin: true}));
    Taro.showToast({
      title: '登录成功',
      icon: 'success'
    });
    Taro.navigateBack();
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          dispatch(clearUserInfo());
          setNewUser({
            avatar: 'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
            nickname: '',
            isLogin: false
          });
          Taro.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          Taro.navigateBack();
        }
      }
    });
  }

  const handleAvatarChoose = (e) => {
    const {avatarUrl} = e.detail;
    setNewUser({...newUser, avatar: avatarUrl});
    setIsModified(true);
  }

  const handleNicknameInput = (nickname) => {
    setNewUser({...newUser, nickname: nickname});
    setIsModified(true);
  }

  const handleUpdate = () => {
    dispatch(setUserInfo({...newUser, isLogin: true}));
    setIsModified(false);
    Taro.showToast({
      title: '更新成功',
      icon: 'success'
    });
  }

  return (
    <View className='profile-info-page'>
      <Cell title={t('avatar')} align='center'
            extra={
              <View>
                <Button className='avatar-input' openType='chooseAvatar' onChooseAvatar={handleAvatarChoose}>
                </Button>
                <Avatar size='small' src={newUser.avatar}/>
              </View>
            }>
      </Cell>
      <Cell title={t('nickname')}
            align='center'
            extra={
              <Input type='nickname'
                     className='user-nickname'
                     value={newUser.nickname}
                     placeholder='点击输入'
                     onChange={handleNicknameInput}
              />
            }>
      </Cell>
      <View className='actions'>
        {userInfo.isLogin && isModified && (
          <Button type='primary' block onClick={handleUpdate}
                  style={{marginBottom: '10px'}}>{t('confirmModify')}</Button>
        )}
        {!userInfo.isLogin ? (
          <Button type='primary' onClick={handleLogin}>{t('login')}</Button>
        ) : (
          <Button type='danger' block onClick={handleLogout}>{t('logout')}</Button>
        )}
      </View>
    </View>
  )
}

export default ProfileInfo
