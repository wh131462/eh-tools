import Taro from '@tarojs/taro';
import {translations} from './translations';

/**
 * 根据当前语言和路由路径设置页面标题
 * @param language 当前语言
 * @param key
 */
export const updatePageTitle = (language: string, key: string) => {
  if (key) {
    const title = translations[language][key];
    if (title) {
      Taro.setNavigationBarTitle({title});
    }
    switch (key) {
      case 'tools':
      case 'profile':
        Taro.setTabBarItem({
          index: 0,
          text: translations[language].tools,
        });
        Taro.setTabBarItem({
          index: 1,
          text: translations[language].profile
        });
        break;
    }
  }
};
