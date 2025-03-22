import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Cell } from '@nutui/nutui-react-taro';
import './index.less';

interface RouletteHistory {
  id: string;
  configName: string;
  selectedItem: {
    id: string;
    name: string;
  };
  timestamp: string;
}

const RouletteHistoryPage: React.FC = () => {
  const [history] = useState<RouletteHistory[]>([
    {
      id: '1',
      configName: '默认转盘',
      selectedItem: {
        id: '2',
        name: '选项2'
      },
      timestamp: '2024-01-01 12:00:00'
    }
  ]);

  return (
    <View className='roulette-history'>
      {history.map(record => (
        <Cell 
          key={record.id}
          title={record.selectedItem.name}
          description={`${record.configName} · ${record.timestamp}`}
        />
      ))}
    </View>
  );
};

export default RouletteHistoryPage;