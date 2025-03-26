import React, {useEffect} from 'react';
import {View} from '@tarojs/components';
import {useAppSelector} from '@/store/hooks';
import Game2048 from '@/components/Game2048';
import {updatePageTitle} from "@/i18n/utils";

const Game2048GamePage: React.FC = () => {
  const {language} = useAppSelector(state => state.app);

  useEffect(() => {
    updatePageTitle(language, 'game2048');
  }, [language]);

  return (
    <View className='game2048-game-page'>
      <Game2048/>
    </View>
  );
};

export default Game2048GamePage;
