import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import RouletteComponent from '@/components/Roulette';
import Taro from "@tarojs/taro";
import './index.less';

const RoulettePage: React.FC = () => {
  const [items] = useState([
    { id: '1', name: '选项1' },
    { id: '2', name: '选项2' },
    { id: '3', name: '选项3' },
  ]);

  const handleResult = (item: { id: string; name: string }) => {
    console.log('选中:', item);
  };

  return (
    <View className='roulette-page'>
      <RouletteComponent
        items={items}
        onResult={handleResult}
      />
      <View className='action-buttons'>
        <Button
          type='primary'
          className='action-button'
          onClick={() => Taro.navigateTo({ url: '/pages/roulette/config/index' })}
        >
          配置转盘
        </Button>
        <Button
          type='primary'
          className='action-button'
          onClick={() => Taro.navigateTo({ url: '/pages/roulette/list/index' })}
        >
          转盘列表
        </Button>
        <Button
          type='primary'
          className='action-button'
          onClick={() => Taro.navigateTo({ url: '/pages/roulette/history/index' })}
        >
          历史记录
        </Button>
      </View>
    </View>
  );
};

export default RoulettePage;
