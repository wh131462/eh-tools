import React from 'react';
import {View} from '@tarojs/components';
import {Cell} from '@nutui/nutui-react-taro';
import {useTranslation} from '@/i18n';
import './index.less';
import {copyToClipboard} from "@/utils/clipboard";

const AboutPage: React.FC = () => {
  const {t} = useTranslation();
  const appInfo = {
    name: 'EH Tools',
    version: '1.0.0',
    description: t('appDescriptionContent'),
    author: 'EternalHeart',
    github: 'https://github.com/wh131462/eh-tools'
  };

  return (
    <View className='about-page'>
      <Cell.Group title={t('appInfo')}>
        <Cell title={t('appName')} extra={appInfo.name}/>
        <Cell title={t('appVersion')} extra={appInfo.version}/>
        <Cell title={t('appDescription')} extra={appInfo.description}/>
        <Cell title={t('appAuthor')} extra={appInfo.author}/>
        <Cell title={t('appGithub')} extra={appInfo.github} onClick={() => {
          copyToClipboard(appInfo.github);
        }}/>
      </Cell.Group>
    </View>
  );
};

export default AboutPage;
