import React, {useState} from 'react';
import {Provider} from 'react-redux';
import {store} from '@/store';
import Advertisement from '@/components/Advertisement';
import './app.less';


const AppContent: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [showSplashAd, setShowSplashAd] = useState(false);

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
