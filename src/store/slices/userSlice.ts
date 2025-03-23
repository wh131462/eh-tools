import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';

interface UserInfo {
  avatar: string;
  nickname: string;
  isLogin: boolean;
}

interface UserState {
  userInfo: UserInfo;
}

const initialState: UserState = {
  userInfo: Taro.getStorageSync('user_info') || {
    avatar: 'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
    nickname: '',
    isLogin: false
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      Taro.setStorageSync('user_info', action.payload);
    },
    clearUserInfo: (state) => {
      state.userInfo = {
        avatar: 'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
        nickname: '',
        isLogin: false
      };
      Taro.removeStorageSync('user_info');
    }
  }
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;