import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Cell } from '@nutui/nutui-react-taro';
import './index.less';

interface RouletteConfig {
  id: string;
  name: string;
  items: Array<{ id: string; name: string; probability?: number }>;
  createTime: string;
}

const RouletteListPage: React.FC = () => {
  const [configs] = useState<RouletteConfig[]>([
    {
      id: '1',
      name: '默认转盘',
      items: [
        { id: '1', name: '选项1' },
        { id: '2', name: '选项2' },
        { id: '3', name: '选项3' },
      ],
      createTime: '2024-01-01 12:00:00'
    }
  ]);

  const handleSelectConfig = (config: RouletteConfig) => {
    // TODO: 选中配置后跳转到首页并应用配置
    console.log('选中配置:', config);
  };

  return (
    <View className='roulette-list'>
      {configs.map(config => (
        <Cell
          key={config.id}
          title={config.name}
          description={`${config.items.length}个选项 · ${config.createTime}`}
          onClick={() => handleSelectConfig(config)}
        />
      ))}
    </View>
  );
};

export default RouletteListPage;
