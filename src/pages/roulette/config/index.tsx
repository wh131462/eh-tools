import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Form, Input, Button, Toast } from '@nutui/nutui-react-taro';
import './index.less';

interface RouletteItem {
  id: string;
  name: string;
  probability?: number;
}

const RouletteConfigPage: React.FC = () => {
  const [items, setItems] = useState<RouletteItem[]>([]);
  const [newItem, setNewItem] = useState<{ name: string; probability?: number }>({ name: '' });

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      Toast.show('请输入选项名称');
      return;
    }

    const item: RouletteItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      probability: newItem.probability
    };

    setItems([...items, item]);
    setNewItem({ name: '' });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSaveConfig = () => {
    if (items.length < 2) {
      Toast.show('至少需要2个选项');
      return;
    }

    // TODO: 保存配置到本地存储
    Toast.show('保存成功');
  };

  return (
    <View className='roulette-config'>
      <Form>
        <Form.Item label='选项名称'>
          <Input 
            value={newItem.name}
            onChange={(val) => setNewItem({ ...newItem, name: val })}
            placeholder='请输入选项名称'
          />
        </Form.Item>
        <Form.Item label='概率权重'>
          <Input 
            type='number'
            value={newItem.probability?.toString()}
            onChange={(val) => setNewItem({ ...newItem, probability: Number(val) })}
            placeholder='可选，默认平均概率'
          />
        </Form.Item>
        <Button block type='primary' onClick={handleAddItem}>添加选项</Button>
      </Form>

      <View className='items-list'>
        {items.map(item => (
          <View key={item.id} className='item'>
            <View className='item-content'>
              <View className='item-name'>{item.name}</View>
              {item.probability && (
                <View className='item-probability'>{item.probability}</View>
              )}
            </View>
            <Button 
              size='small'
              type='danger'
              onClick={() => handleDeleteItem(item.id)}
            >
              删除
            </Button>
          </View>
        ))}
      </View>

      {items.length > 0 && (
        <Button 
          block 
          type='success'
          className='save-button'
          onClick={handleSaveConfig}
        >
          保存配置
        </Button>
      )}
    </View>
  );
};

export default RouletteConfigPage;