import React, {useEffect, useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Dialog} from '@nutui/nutui-react-taro';
import './index.less';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {deleteConfig, RouletteConfig} from "@/store/slices/rouletteSlice";
import Taro from "@tarojs/taro";
import {formatDate} from "@/utils/date";
import {useAppSelector} from "@/store/hooks";
import {updatePageTitle} from "@/i18n/utils";
import {useTranslation} from "@/i18n";

const RouletteListPage: React.FC = () => {
  const dispatch = useDispatch()
  const {t} = useTranslation()
  const configs = useSelector((state: RootState) => state.roulette.configs);
  const [visible, setVisible] = useState(false)
  const {language} = useAppSelector(state => state.app);

  useEffect(() => {
    updatePageTitle(language, 'rouletteList');
  }, [language]);
  const handleNavigation = (config?: RouletteConfig) => {
    Taro.navigateTo({url: '/pages/roulette/config/index' + (config && `?id=${config?.id}` || '')});
  };

  return (
    <View className='roulette-list'>
      {configs.map(config => (
        <View><Cell
          key={config.id}
          title={
            <View>{config.name} ({config.items.length}{t('ge') + t('item')}) </View>
          }
          description={<View>
            <span>{config.description}</span>
            <span>{formatDate(config.createTime, 'yyyy-MM-dd HH:mm:ss')}</span>
          </View>}
          extra={<View><Button block type="primary"
                               onClick={(e) => {
                                 e.stopPropagation()
                                 setVisible(true)
                               }}>删除</Button>
          </View>}
          onClick={() => handleNavigation(config)}
        />
          <Dialog
            visible={visible}
            onClose={() => setVisible(false)}
            title={t("info")}
            content={t("rouletteListDeleteTip") + `[${config.name}]`}
            confirmText={t('confirm')}
            cancelText={t('cancel')}
            onCancel={() => setVisible(false)}
            onConfirm={() => {
              dispatch(deleteConfig(config.id))
            }}></Dialog></View>
      ))}

      {!configs.length && <View className='no-items'>{t('rouletteListNoItems')}</View>}
      <Button block type="primary" onClick={() => handleNavigation()}>{t('rouletteCreate')}</Button>
    </View>
  );
};

export default RouletteListPage;
