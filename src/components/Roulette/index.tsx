import React, {useEffect, useState} from 'react';
import { View } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import './index.less';

interface RouletteProps {
  items: Array<{ id: string; name: string; probability?: number; color?: string }>;
  maxItems?: number;
  onResult?: (item: { id: string; name: string }) => void;
}

const RouletteComponent: React.FC<RouletteProps> = ({
  items = [],
  maxItems = 12,
  onResult
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);

  const [displayItems, setDisplayItems] = useState<typeof items>([]);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const limitedItems = items.slice(0, maxItems);
    setDisplayItems(limitedItems);
  }, [items, maxItems]);

  const handleSpin = () => {
    if (isSpinning || displayItems.length === 0) return;

    setIsSpinning(true);
    // 开始滚动名字
    const scrollInterval = setInterval(() => {
      setScrollIndex(prev => (prev + 1) % items.length);
    }, 100);

    // 随机选择一个项目
    const randomIndex = Math.floor(Math.random() * displayItems.length);
    const selected = displayItems[randomIndex];

    // 模拟旋转动画
    setTimeout(() => {
      clearInterval(scrollInterval);
      setIsSpinning(false);
      setSelectedItem(selected);
      onResult?.(selected);
    }, 3000);
  };

  return (
    <View className='roulette-component'>
      <View className={`roulette-wheel ${isSpinning ? 'spinning' : ''}`}>
        {displayItems.map((item, index) => {
          const angle = (360 / displayItems.length);
          const rotate = angle * index;
          const color = item.color || `hsl(${(360 / displayItems.length) * index}, 70%, 50%)`;
          return (
            <View
              key={item.id}
              className='roulette-item'
              style={{
                transform: `rotate(${rotate}deg)`,
                backgroundColor: color,
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                width: '50%',
                height: '50%',
                transformOrigin: '100% 50%'
              }}
            >
              <View className='item-text' style={{ transform: `rotate(${angle / 2}deg)` }}>
                {item.name}
              </View>
            </View>
          );
        })}
      </View>
      <View className='roulette-pointer' />
      <View className='scroll-list'>
        {isSpinning && (
          <View className='scroll-item'>{items[scrollIndex].name}</View>
        )}
      </View>
      <Button
        type='primary'
        className='spin-button'
        disabled={isSpinning || displayItems.length === 0}
        onClick={handleSpin}
      >
        {isSpinning ? '旋转中...' : '开始'}
      </Button>
      {selectedItem && (
        <View className='result'>
          选中: {selectedItem.name}
        </View>
      )}
    </View>
  );
};

export default RouletteComponent;
