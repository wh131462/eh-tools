import Taro from '@tarojs/taro';
import { translations } from './translations';

/**
 * 根据当前语言设置tabBar文本
 * @param language 当前语言
 */
export const updateTabBarText = (language: string) => {
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const tabBarPages = ['/pages/index/index', '/pages/profile/index'];
  
  if (currentPage && tabBarPages.includes('/' + currentPage.route)) {
    Taro.setTabBarItem({
      index: 0,
      text: translations[language].tools
    });
    Taro.setTabBarItem({
      index: 1,
      text: translations[language].profile
    });
  }
};

/**
 * 根据当前语言和路由路径设置页面标题
 * @param language 当前语言
 * @param path 当前路由路径
 */
export const updatePageTitle = (language: string, path: string) => {
  const pathToKey: { [key: string]: string } = {
    '/pages/index/index': 'tools',
    '/pages/profile/index': 'profile',
    '/pages/setting/index': 'setting',
    '/pages/about/index': 'about',
    '/pages/calendar/index': 'calendar',
    '/pages/roulette/index/index': 'roulette',
    '/pages/roulette/config/index': 'roulette',
    '/pages/roulette/list/index': 'roulette',
    '/pages/roulette/history/index': 'roulette'
  };
  
  const key = pathToKey[path];
  if (key) {
    const title = translations[language][key];
    if (title) {
      Taro.setNavigationBarTitle({ title });
    }
  }
};