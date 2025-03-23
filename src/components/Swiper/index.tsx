import React from 'react';
import {Swiper} from '@nutui/nutui-react-taro';
import Advertisement from '@/components/Advertisement';
import './index.less';

export interface SwiperItem {
  id: string;
  type: 'content' | 'ad';
  image?: string;
  title?: string;
  adUnitId?: string;
}

interface SwiperProps {
  items: SwiperItem[];
  height?: number;
  autoPlay?: boolean;
  onItemClick?: (item: SwiperItem) => void;
}

const CustomSwiper: React.FC<SwiperProps> = ({
                                               items,
                                               height = 150,
                                               autoPlay = true,
                                               onItemClick
                                             }) => {
  const handleClick = (item: SwiperItem) => {
    onItemClick?.(item);
  };

  return (
    <Swiper
      height={height}
      autoPlay={autoPlay}
      indicator
      className="custom-swiper"
    >
      {items.map(item => (
        <Swiper.Item
          key={item.id}
          className="swiper-item"
        >
          {item.type === 'ad' && item.adUnitId ? (
            <Advertisement
              type="banner"
              unitId={item.adUnitId}
            />
          ) : (

            <div className="content-item" onClick={() => handleClick(item)}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title || ''}
                  className="content-image"
                />
              )}
              {item.title && (
                <div className="content-title">{item.title}</div>
              )}
            </div>
          )}
        </Swiper.Item>
      ))}
    </Swiper>
  );
};

export default CustomSwiper;
