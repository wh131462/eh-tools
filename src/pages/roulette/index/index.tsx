import React, {useState} from 'react';
import {View} from '@tarojs/components';
import RouletteComponent from '@/components/Roulette';
import {Button, Cell, Checkbox, Popup, VirtualList} from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/store';
import {RouletteConfig, setCurrentConfig} from "@/store/slices/rouletteSlice";
import './index.less';

const RoulettePage: React.FC = () => {
  const dispatch = useDispatch();
  const currentConfig = useSelector((state: RootState) => state.roulette.currentConfig);
  const configs = useSelector((state: RootState) => state.roulette.configs);
  const [mode, setMode] = useState<'roulette' | 'slot'>('roulette');
  const [showPopup, setShowPopup] = useState(false);
  const [showChangePopup, setShowChangePopup] = useState(false);

  const toggleMode = () => {
    setMode(mode == "roulette" ? "slot" : "roulette")
  }
  const handleResult = (item: { id: string; name: string }) => {
    console.log('选中:', item);
  };

  const handleNavigateToConfig = () => {
    Taro.navigateTo({url: '/pages/roulette/config/index?id=' + currentConfig?.id});
    setShowPopup(false);
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

  return (
    <View className='roulette-page'>
      <View className='floating-button'>
        <Button
          type='primary'
          className='action-button'
          onClick={() => toggleMode()}
        >
          {mode === "roulette" ? "老虎机" : "大转盘"}
        </Button>

        <Button
          type='primary'
          className='action-button'
          onClick={() => setShowPopup(true)}
        >
          设置
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
            <View className="name">请选择或创建数据集</View>
          </View>
        )}
      </View>
      <View className='roulette'>
        {!showPopup && (
          <RouletteComponent
            mode={mode}
            onResult={handleResult}
          />
        )}
      </View>
      {/*设置 pop up*/}
      <Popup
        visible={showPopup}
        position='bottom'
        onClose={() => setShowPopup(false)}
      >
        <View className='popup-content'>
          <View className='current-dataset'>
            当前合集: {currentConfig?.name ?? "默认"}
            <Button type='primary' onClick={handleDatasetChange}>切换</Button>
          </View>
          <Button
            block
            type='primary'
            className='popup-button'
            onClick={handleNavigateToConfig}
          >
            配置合集
          </Button>

          <Button
            block
            type='primary'
            className='popup-button'
            onClick={handleNavigateToList}
          >
            合集列表
          </Button>

          <Button
            block
            type='primary'
            className='popup-button'
            onClick={handleNavigateToHistory}
          >
            选择历史
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
          <View className='title'>切换合集</View>
          <VirtualList
            itemHeight={80}
            containerHeight={300}
            list={configs}
            itemRender={(config: RouletteConfig, dataIndex: number, index: number) => (
              <Cell
                key={config.id}
                title={config.name + ` (${config.items.length}个选项)`}
                description={config.description}
                extra={<View><Checkbox
                  checked={config.id === currentConfig?.id}></Checkbox><View></View></View>}
                onClick={() => {
                  dispatch(setCurrentConfig(config));
                  setShowChangePopup(false);
                }}
              />
            )}
          />
        </View>
      </Popup>
    </View>
  );
};

export default RoulettePage;
