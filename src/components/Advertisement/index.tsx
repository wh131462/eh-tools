import React, {useState} from 'react';
import Taro from '@tarojs/taro';
import {Ad, AdCustom, View} from '@tarojs/components';
import {useTranslation} from '@/i18n';
import AdAnalytics from '@/utils/analytics';
import './index.less';

interface AdProps {
  type: 'banner' | 'video' | 'splash';
  unitId: string;
  onClose?: () => void;
  onError?: (err: any) => void;
  onLoad?: () => void;
}

const Advertisement: React.FC<AdProps> = ({type, unitId, onClose, onError, onLoad}) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = (err: any) => {
    setIsLoading(false);
    setHasError(true);
    AdAnalytics.trackEvent({
      type,
      action: 'error',
      unitId,
      timestamp: Date.now(),
      error: err
    });
    onError?.(err);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    AdAnalytics.trackEvent({
      type,
      action: 'show',
      unitId,
      timestamp: Date.now()
    });
    onLoad?.();
  };

  const handleClose = () => {
    AdAnalytics.trackEvent({
      type,
      action: 'close',
      unitId,
      timestamp: Date.now()
    });
    onClose?.();
  };

  React.useEffect(() => {
    if (type === 'splash') {
      const splashAd = Taro.createInterstitialAd({
        adUnitId: unitId
      });

      splashAd.onLoad(handleLoad);
      splashAd.onError(handleError);
      splashAd.onClose(handleClose);

      splashAd.show().catch(handleError);

      return () => {
        splashAd.destroy();
      };
    }
  }, [type, unitId]);

  if (type === 'banner') {
    return (
      <View className='ad-container'>
        {isLoading && <View className='ad-status'>{t('adLoading')}</View>}
        {hasError && <View className='ad-status error'>{t('adError')}</View>}
        <Ad
          unitId={unitId}
          onError={handleError}
          onLoad={handleLoad}
        />
      </View>
    );
  }

  if (type === 'video') {
    return (
      <View className='ad-container'>
        {isLoading && <View className='ad-status'>{t('adLoading')}</View>}
        {hasError && <View className='ad-status error'>{t('adError')}</View>}
        <AdCustom
          unitId={unitId}
          onError={handleError}
          onLoad={handleLoad}
          onTouchEnd={handleClose}
        />
      </View>
    );
  }

  return null;
};

export default Advertisement;
