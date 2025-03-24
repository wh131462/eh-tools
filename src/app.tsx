import React, {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {store} from '@/store';
import {useAppSelector} from '@/store/hooks';
import {updatePageTitle, updateTabBarText} from '@/i18n/utils';
import Taro, {useDidShow} from '@tarojs/taro';
import Advertisement from '@/components/Advertisement';
import './app.less';


const AppContent: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const {language} = useAppSelector(state => state.app);
  const [showSplashAd, setShowSplashAd] = useState(false);
  // 初始化一次
  useDidShow(() => {
    updateTabBarText(language);
    updatePageTitle(language, 'tools');
  })

  useEffect(() => {
    const handleRouteChange = () => {
      const pages = Taro.getCurrentPages();
      const currentPage = pages[pages.length - 1];
      console.log(currentPage)
      if (currentPage && currentPage.route) {
        updatePageTitle(language, currentPage.route);
      }
    };


    Taro.eventCenter.on('routeChange', handleRouteChange);
    return () => {
      Taro.eventCenter.off('routeChange', handleRouteChange);
    };
  }, [language]);

  return (
    <>
      {showSplashAd && (
        <Advertisement
          type="splash"
          unitId="adunit-xxxxx" // 替换为实际的广告单元ID
          onClose={() => setShowSplashAd(false)}
          onError={() => setShowSplashAd(false)}
        />
      )}
      {children}
    </>
  );
};

const App: React.FC<{ children: React.ReactNode }> = ({children}) => {

  return (
    <Provider store={store}>
      <AppContent>{children}</AppContent>
    </Provider>
  );
};

export default App;
