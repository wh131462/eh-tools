import React, {useEffect, useState} from 'react';
import {Image, View} from '@tarojs/components';
import {Cell, Popup} from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import donateWechat from '@/assets/donate/微信赞赏.jpg';
import {useTranslation} from '@/i18n';
import './index.less';
import {copyToClipboard} from "@/utils/clipboard";
import {useAppSelector} from "@/store/hooks";
import {updatePageTitle} from "@/i18n/utils";

const AboutPage: React.FC = () => {
  const {t} = useTranslation();
  const {language} = useAppSelector(state => state.app);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    updatePageTitle(language, 'about');
  }, [language]);

  const appInfo = {
    name: 'EH Tools',
    version: '1.0.0',
    description: t('appDescriptionContent'),
    author: 'EternalHeart',
    github: 'https://github.com/wh131462/eh-tools'
  };

  return (
    <View className='about-page'>
      <Cell.Group>
        <Cell title={t('appName')} extra={appInfo.name}/>
        <Cell title={t('appVersion')} extra={appInfo.version}/>
        <Cell title={t('appDescription')} extra={appInfo.description}/>
        <Cell title={t('appAuthor')} extra={appInfo.author}/>
        <Cell title={t('appGithub')} extra={appInfo.github} onClick={() => {
          copyToClipboard(appInfo.github);
        }}/>
        <Cell title={t('appDonate')} extra={<View>&gt;</View>} onClick={() => setShowDonate(true)}/>
      </Cell.Group>
      <Popup visible={showDonate} onClose={() => setShowDonate(false)} style={{padding: '20px'}}>
        <View style={{textAlign: 'center'}}>
          <View style={{marginBottom: '12px', fontSize: '16px', fontWeight: 500}}>{t('appDonateTip')}</View>
          <Image
            src={donateWechat}
            style={{width: '200px', height: '200px'}}
            lazyLoad
            mode="aspectFit"
            onClick={() => {
              Taro.previewImage({
                current: donateWechat,
                urls: [donateWechat]
              });
            }}
          />
        </View>
      </Popup>
    </View>
  );
};

export default AboutPage;
