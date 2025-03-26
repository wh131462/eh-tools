import React, {useEffect, useRef} from 'react';
import {View} from '@tarojs/components';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {updatePageTitle} from '@/i18n/utils';
import {Button, Dialog} from '@nutui/nutui-react-taro';
import './index.less';
import ColorPicker, {ColorPickerRef} from "@/components/ColorPicker";
import {addFavorite, removeFavorite, setColor, setFavorites, toggleFullscreen} from '@/store/slices/colorCardSlice';
import Taro from "@tarojs/taro";
import {useTranslation} from "@/i18n";

const ColorCardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation()
  const {language} = useAppSelector(state => state.app);
  const {color, favorites, isFullscreen} = useAppSelector(state => state.colorCard);
  const colorPickerRef = useRef<ColorPickerRef>(null);

  useEffect(() => {
    updatePageTitle(language, 'colorCard');
    // 从本地存储加载收藏的颜色
    const savedFavorites = Taro.getStorageSync('colorCardFavorites');
    if (savedFavorites) {
      dispatch(setFavorites(JSON.parse(savedFavorites)));
    }
    Taro.setNavigationBarColor({backgroundColor: color, frontColor: '#ffffff'});
  }, [language]);

  const handleColorChange = (newColor: string) => {
    dispatch(setColor(newColor));
    Taro.setNavigationBarColor({backgroundColor: newColor, frontColor: '#ffffff'});
  };


  const handleToggleFullscreen = () => {
    dispatch(toggleFullscreen());
  };

  const handleAddToFavorites = () => {
    if (!favorites.includes(color)) {
      dispatch(addFavorite(color));
      Taro.setStorageSync('colorCardFavorites', JSON.stringify([...favorites, color]));
    }
  };

  const handleRemoveFromFavorites = (colorToRemove: string) => {
    Dialog.open("remove", {
      title: t('info'),
      content: t('removeFromFavorites') + '?',
      confirmText: t('confirm'),
      cancelText: t('cancel'),
      onConfirm: () => {
        dispatch(removeFavorite(colorToRemove));
        const newFavorites = favorites.filter(c => c !== colorToRemove);
        Taro.setStorageSync('colorCardFavorites', JSON.stringify(newFavorites));
        Dialog.close('remove');
      },
      onCancel: () => {
        Dialog.close('remove');
      }
    })
  };

  return (
    <View className={`color-card-page ${isFullscreen ? 'fullscreen' : ''}`}>
      <View className='color-display' style={{backgroundColor: color}} onClick={handleToggleFullscreen}>
        <View className='color-value'>{color}</View>
      </View>

      <View className={`controls ${isFullscreen ? 'hidden' : ''}`}>
        <View className='color-button'><ColorPicker ref={colorPickerRef} value={color}
                                                    onChange={handleColorChange}></ColorPicker><View
          onClick={colorPickerRef.current?.openPicker}>{t('selectColor')}</View></View>
        <Button onClick={handleAddToFavorites}>{t('addToFavorites')}</Button>
      </View>

      <View className={`favorites ${isFullscreen ? 'hidden' : ''}`}>
        <View className='favorites-title'>{t('favorites')}</View>
        <View className='favorites-list'>
          {favorites.map((favoriteColor, index) => (
            <View
              key={index}
              className='favorite-item'
              style={{backgroundColor: favoriteColor}}
              onClick={() => handleColorChange(favoriteColor)}
              onLongPress={() => handleRemoveFromFavorites(favoriteColor)}
            >
              <View className='favorite-color-value'>{favoriteColor}</View>
            </View>
          ))}
        </View>
      </View>
      <Dialog id='remove'></Dialog>
    </View>
  );
};

export default ColorCardPage;
