import React, {useState} from 'react';
import {View} from '@tarojs/components';
import RouletteComponent from '@/components/Roulette';
import {Button, Cell, Checkbox, Dialog, Popup, VirtualList} from "@nutui/nutui-react-taro";
import Taro, {useDidShow, useShareAppMessage, useShareTimeline} from "@tarojs/taro";
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/store';
import {RouletteConfig, setCurrentConfig} from "@/store/slices/rouletteSlice";
import './index.less';
import {useTranslation} from "@/i18n";
import {copyToClipboard} from "@/utils/clipboard";
import {usePageTitle} from "@/hooks/usePageTitle";

const RoulettePage: React.FC = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation()
  const currentConfig = useSelector((state: RootState) => state.roulette.currentConfig);
  const configs = useSelector((state: RootState) => state.roulette.configs);
  const [mode, setMode] = useState<'roulette' | 'slot'>('roulette');
  const [showPopup, setShowPopup] = useState(false);
  const [showChangePopup, setShowChangePopup] = useState(false);
  usePageTitle("roulette")

  useShareAppMessage(() => {
    return {
      title: '大转盘,不确定的时候来一下',
      path: '/pages/roulette/index/index',
      imageUrl: '/assets/shares/rouletteShare.png'
    };
  });

  useShareTimeline(() => {
    return {
      title: '大转盘,不确定的时候来一下',
      path: '/pages/roulette/index/index',
    };
  });

  const toggleMode = () => {
    setMode(mode == "roulette" ? "slot" : "roulette")
  }
  const handleResult = (item: { id: string; name: string }) => {
    console.log('选中:', item);
    Dialog.open('selected', {
      title: t('info'),
      content: `${t('rouletteChoiceTip')} ${item.name}`,
      closeOnOverlayClick: true,
      confirmText: t('confirm'),
      cancelText: t('copy'),
      onConfirm: () => {
        Dialog.close('selected');
      },
      onCancel: () => {
        console.log('onCancel');
        copyToClipboard(item.name, t).then(() => {
          Taro.showToast({title: `${t('copy')}${t('success')}!`, icon: "success"})
        })
        Dialog.close('selected');
      }
    });
  };

  const handleNavigateToConfig = () => {
    Taro.navigateTo({url: '/pages/roulette/config/index?id=' + currentConfig?.id});
    setShowPopup(false);
    setShowChangePopup(false);
  };

  const handleNavigateToList = () => {
    Taro.navigateTo({url: '/pages/roulette/list/index?id=' + currentConfig?.id});
    setShowPopup(false);
  };

  const handleNavigateToHistory = () => {
    Taro.navigateTo({url: '/pages/roulette/history/index?id=' + currentConfig?.id});
    setShowPopup(false);
  };

  const handleDatasetChange = () => {
    setShowChangePopup(true);
  }

  const [key, setKey] = useState(0);
  useDidShow(() => {
    if (currentConfig) {
      setKey(key + 1);
    }
  })

  return (
    <View className='roulette-page'>
      <View className='floating-button'>
        <Button
          type='primary'
          className='action-button'
          onClick={() => toggleMode()}
        >
          {mode === "roulette" ? t('slotMachine') : t('roulette')}
        </Button>

        <Button
          type='primary'
          className='action-button'
          onClick={() => setShowPopup(true)}
        >
          {t('setting')}
        </Button>
      </View>
      <View className='dataset'>
        {currentConfig ? (
          <View className='current-dataset-info'>
            <View className='name'>{currentConfig.name}</View>
            <View className='description'>{currentConfig.description}</View>
          </View>
        ) : (
          <View className='no-dataset' onClick={handleNavigateToConfig}>
            <View className="name">+ {t('rouletteCreate')}</View>
          </View>
        )}
      </View>
      <View className='roulette'>
        <RouletteComponent
          key={key}
          mode={mode}
          onResult={handleResult}
        />
        <Dialog id='selected'></Dialog>
      </View>
      {/*设置 pop up*/}
      <Popup
        visible={showPopup}
        position='bottom'
        onClose={() => setShowPopup(false)}
      >
        <View className='popup-content'>
          <View className='current-dataset'>
            {t('rouletteCurrent')}: {currentConfig?.name ?? t('default')}
            <Button type='primary' onClick={handleDatasetChange}>{t('change')}</Button>
          </View>
          <Button
            block
            type='primary'
            className='popup-button'
            onClick={handleNavigateToConfig}
          >
            {t('rouletteSetConfig')}
          </Button>

          <Button
            block
            type='primary'
            className='popup-button'
            onClick={handleNavigateToList}
          >
            {t('rouletteConfigList')}
          </Button>

          <Button
            block
            type='primary'
            className='popup-button'
            onClick={handleNavigateToHistory}
          >
            {t('rouletteChoiceHistory')}
          </Button>
        </View>
      </Popup>
      {/*切换pop up*/}
      <Popup
        visible={showChangePopup}
        position='bottom'
        onClose={() => setShowChangePopup(false)}
      >
        <View className='dataset-list'>
          <View className='title'>{t('change') + t('Roulette')}</View>
          {!configs?.length ?
            <View className='no-dataset'>
              <Button type='primary' onClick={handleNavigateToConfig}>+ {t('rouletteCreate')}</Button>
            </View> :
            <VirtualList
              itemHeight={80}
              containerHeight={300}
              list={configs}
              itemRender={(config: RouletteConfig, dataIndex: number, index: number) => (
                <Cell
                  key={config.id}
                  title={config.name + ` (${config.items.length}${t('ge') + t('item')})`}
                  description={config.description}
                  extra={<View><Checkbox
                    checked={config.id === currentConfig?.id}></Checkbox><View></View></View>}
                  onClick={() => {
                    dispatch(setCurrentConfig(config));
                    setShowPopup(false);
                    setShowChangePopup(false);
                  }}
                />
              )}
            />}

        </View>
      </Popup>
    </View>
  );
};

export default RoulettePage;
