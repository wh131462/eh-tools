import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {Cell, Picker, Switch} from '@nutui/nutui-react-taro';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setDarkMode, setLanguage} from '@/store/slices/appSlice';
import {useTranslation} from "@/i18n";
import './index.less';
import {updatePageTitle} from "@/i18n/utils";
import Taro from "@tarojs/taro";
import {usePageTitle} from "@/hooks/usePageTitle";

const SettingPage: React.FC = () => {
  const {t} = useTranslation()
  const dispatch = useAppDispatch();
  const {language, isDarkMode} = useAppSelector(state => state.app);
  const [visible, setVisible] = useState(false);
  const langList = [{
    text: "中文",
    value: "zh"
  },
    {
      text: "English",
      value: "en"
    }];

  usePageTitle("setting")

  const getLabel = (lang: string) => {
    return langList.find(o => o.value === lang)?.text ?? "未知语言";
  };

  const handleLanguageChange = (list: any, values: string[]) => {
    dispatch(setLanguage(values[0]));
    updatePageTitle(language, "setting")
  };

  const handleDarkMode = (value: boolean) => {
    dispatch(setDarkMode(value))
    Taro.showToast({title: "数据切换成功,但功能暂时无效!", icon: "none"})
  }

  return (
    <View className='setting'>
      <Cell.Group>
        <Cell title={t('settingLang')} onClick={() => setVisible(!visible)} extra={getLabel(language)}></Cell>
        <Picker
          title={t('settingLangPlaceholder')}
          visible={visible}
          options={langList}
          defaultValue={[language]}
          onConfirm={(list, values: string[]) => handleLanguageChange(list, values)}
          onClose={() => setVisible(false)}
        />
      </Cell.Group>
      <Cell title={t("settingDarkMode")} extra={<Switch
        checked={isDarkMode}
        onChange={(value) => handleDarkMode(value)}
      />}/>
    </View>
  );
};

export default SettingPage;
