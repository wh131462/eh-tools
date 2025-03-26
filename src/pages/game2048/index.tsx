import React, {useEffect} from 'react';
import {View} from '@tarojs/components';
import {useAppSelector} from '@/store/hooks';
import {updatePageTitle} from "@/i18n/utils";
import {Button} from '@nutui/nutui-react-taro';
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro';
import "./index.less"

const Game2048Page: React.FC = () => {
  const {language} = useAppSelector(state => state.app);

  useEffect(() => {
    updatePageTitle(language, 'game2048');
  }, [language]);

  useShareAppMessage(() => {
    return {
      title: '游戏源码级教学!免费学~',
      path: '/pages/game2048/index',
      imageUrl: '/assets/shares/2048share.png'
    };
  });

  useShareTimeline(() => {
    return {
      title: '2048游戏源码教学，开始学习游戏开发！',
      imageUrl: '/assets/shares/2048share.png'
    };
  });

  const handlePreviewClick = () => {
    Taro.navigateTo({
      url: '/pages/game2048/game/index'
    });
  };

  return (
    <View className='game2048-page'>
      <View className='tutorial-section'>
        <View className='tutorial-title'>2048游戏实现教程</View>
        <View className='tutorial-content'>
          <View className='section'>
            <View className='section-title'>游戏概述</View>
            <View className='section-content'>
              <View>1. 经典的数字合并益智游戏，目标是获得2048数字方块</View>
              <View>2. 在4x4网格中通过上下左右滑动来合并相同数字</View>
              <View>3. 每次移动后会在空白位置随机生成2或4</View>
              <View>4. 当无法继续移动或达到2048时游戏结束</View>
            </View>
          </View>
          <View className='section'>
            <View className='section-title'>数据结构设计</View>
            <View className='section-content'>
              <View>1. 使用4x4二维数组表示游戏面板状态</View>
              <View>2. 每个格子存储数字值，0表示空白位置</View>
              <View>3. 使用TypeScript接口定义游戏状态类型</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `interface GameState {
  board: number[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

interface GameAction {
  type: 'MOVE' | 'RESET';
  direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}`}
                </pre>
              </View>
              <View>4. 实现深拷贝方法用于状态更新</View>
            </View>
          </View>
          <View className='section'>
            <View className='section-title'>核心算法实现</View>
            <View className='section-content'>
              <View>1. 移动算法：压缩数组去除空格</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `// 压缩数组，移除空格
const compress = (row: number[]): number[] => {
  return row.filter(cell => cell !== 0);
};

// 向左移动一行
const moveLeft = (row: number[]): number[] => {
  const compressed = compress(row);
  const merged = merge(compressed);
  return [...merged, ...Array(4 - merged.length).fill(0)];
}`}
                </pre>
              </View>
              <View>2. 合并算法：相邻相同数字相加</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `// 合并相邻相同数字
const merge = (row: number[]): number[] => {
  const result: number[] = [];
  for (let i = 0; i < row.length; i++) {
    if (row[i] === row[i + 1]) {
      result.push(row[i] * 2);
      i++;
    } else {
      result.push(row[i]);
    }
  }
  return result;
}`}
                </pre>
              </View>
              <View>3. 随机生成：获取空白位置列表</View>
              <View>4. 判定算法：检查是否可继续移动</View>
            </View>
          </View>
          <View className='section'>
            <View className='section-title'>状态管理</View>
            <View className='section-content'>
              <View>1. 使用Redux Toolkit管理游戏状态</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `// 游戏状态切片
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    moveBoard: (state, action) => {
      const { direction } = action.payload;
      const newBoard = moveInDirection(state.board, direction);
      if (boardChanged(state.board, newBoard)) {
        state.board = newBoard;
        state.board = addNewTile(state.board);
        state.gameOver = isGameOver(state.board);
      }
    },
    resetGame: (state) => {
      return { ...initialState };
    }
  }
});`}
                </pre>
              </View>
              <View>2. 实现撤销/重做功能的状态栈</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `// 状态历史管理
const MAX_HISTORY = 10;
const history: GameState[] = [];
const future: GameState[] = [];

const undo = () => {
  if (history.length > 0) {
    const previousState = history.pop();
    future.push(currentState);
    return previousState;
  }
  return null;
};`}
                </pre>
              </View>
              <View>3. 本地存储保存最高分记录</View>
              <View>4. 优化状态更新提升性能</View>
            </View>
          </View>
          <View className='section'>
            <View className='section-title'>交互体验</View>
            <View className='section-content'>
              <View>1. 支持触摸滑动和键盘操作</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  const direction = getSwipeDirection(deltaX, deltaY);
  if (direction) dispatch(moveBoard({ direction }));
}`}
                </pre>
              </View>
              <View>2. 添加移动和合并动画效果</View>
              <View className='code-block' data-language='typescript'>
                <pre>{
                  `// 动画效果实现
const animateTile = (tile: HTMLElement, from: Position, to: Position) => {
  const animation = tile.animate([
    { transform: \`translate(\${from.x}px, \${from.y}px)\` },
    { transform: \`translate(\${to.x}px, \${to.y}px)\` }
  ], {
    duration: 200,
    easing: 'ease-out'
  });
  return animation.finished;
}`}
                </pre>
              </View>
              <View>3. 实现响应式布局适配</View>
              <View>4. 优化触摸灵敏度和操作手感</View>
            </View>
          </View>
        </View>
        <Button type='primary' block onClick={handlePreviewClick}>预览效果</Button>
      </View>
    </View>
  );
};

export default Game2048Page;
