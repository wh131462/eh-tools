import React, { useState } from 'react';
import { View } from '@tarojs/components';
import {Popup, Input, Cell} from '@nutui/nutui-react-taro';
import './index.less';
import {useTranslation} from "@/i18n";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

const presetColors = [
  '#FF416C', '#FF4B2B', '#4CAF50', '#2196F3',
  '#9C27B0', '#FF9800', '#795548', '#607D8B',
  '#E91E63', '#009688', '#673AB7', '#3F51B5',
  '#FFEB3B', '#CDDC39', '#8BC34A', '#00BCD4'
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#FF416C',
  onChange
}) => {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onChange?.(color);
    setVisible(false);
  };

  const handleCustomColorChange = (color: any) => {
    console.log(color)
    // if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    //   handleColorChange(color);
    // }
  };

  return (
    <View className='color-picker-component'>
      <View
        className='color-preview'
        style={{ backgroundColor: currentColor }}
        onClick={() => setVisible(true)}
      />
      <Popup
        visible={visible}
        position='bottom'
        onClose={() => setVisible(false)}
        style={{ height: '40vh' }}
      >
        <View className='color-picker-popup'>
          <Cell title={t("预设颜色")}></Cell>
          <View className='preset-colors'>
            {presetColors.map((color) => (
              <View
                key={color}
                className='color-item'
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </View>
          <View className='custom-color'>
            <Cell title={t("颜色")} description={t("可输入指定颜色值,限制为#RRGGBB")}>
            </Cell>
            <View className='custom-color-input'>
              <View className='custom-color-preview' style={{ backgroundColor: currentColor }}></View>
              <Input
                type='text'
                placeholder='#RRGGBB'
                value={currentColor}
                onChange={handleCustomColorChange}
              />
            </View>
          </View>
        </View>
      </Popup>
    </View>
  );
};

export default ColorPicker;
