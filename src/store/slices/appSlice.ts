import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import {shares} from "@/store/constants/shares";

interface AppState {
  language: string;
  isDarkMode: boolean;
  shares: Record<string, Record<'title' | 'path', string>>
}

const initialState: AppState = {
  language: Taro.getStorageSync('app_language') || 'zh',
  isDarkMode: Taro.getStorageSync('theme_mode') === 'dark',
  shares: shares
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      Taro.setStorageSync('app_language', action.payload);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      Taro.setStorageSync('theme_mode', action.payload ? 'dark' : 'light');
    },
  },
});

export const {setLanguage, setDarkMode} = appSlice.actions;
export default appSlice.reducer;
