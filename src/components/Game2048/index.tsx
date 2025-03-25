import React, {useEffect, useState} from 'react';
import {ITouchEvent, View} from '@tarojs/components';
import {Button, Dialog} from '@nutui/nutui-react-taro';
import {useTranslation} from '@/i18n';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {addRecord, saveGameState} from '@/store/slices/game2048Slice';
import './index.less';
import Taro from "@tarojs/taro";

interface BoardState {
  grid: number[][];
  score: number;
  gameOver: boolean;
  history: Array<{ grid: number[][], score: number }>;
}

const Game2048: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const currentGame = useAppSelector(state => state.game2048.currentGame);
  const [board, setBoard] = useState<BoardState>(currentGame || {
    grid: Array(4).fill(null).map(() => Array(4).fill(0)),
    score: 0,
    gameOver: false,
    history: []
  });
  const [nickname, setNickname] = useState("")

  // 初始化游戏
  const initGame = () => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setBoard({
      grid: newGrid,
      score: 0,
      gameOver: false,
      history: []
    });
  };

  // 添加随机方块
  const addRandomTile = (grid: number[][]) => {
    const emptyCells: any[] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push({x: i, y: j});
        }
      }
    }
    if (emptyCells.length > 0) {
      const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (board.gameOver) return;

    const newGrid = JSON.parse(JSON.stringify(board.grid));
    let moved = false;
    let newScore = board.score;

    const moveAndMerge = (line: number[]) => {
      // 移除空格
      const filtered = line.filter(cell => cell !== 0);
      // 合并相同数字
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          newScore += filtered[i];
          filtered.splice(i + 1, 1);
          // 添加合并动画
          const cells = document.querySelectorAll('.grid-cell');
          cells.forEach(cell => {
            if (parseInt(cell.textContent || '0') === filtered[i]) {
              cell.animate([{transform: 'scale(1)'}, {transform: 'scale(1.2)'}, {transform: 'scale(1)'}])
              cell.addEventListener('animationend', () => {
              }, {once: true});
            }
          });
        }
      }
      // 补充空格
      while (filtered.length < 4) {
        filtered.push(0);
      }
      return filtered;
    };

    // 根据方向处理每一行/列
    if (direction === 'left' || direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const line = newGrid[i];
        const merged = moveAndMerge(direction === 'left' ? line : line.reverse());
        if (direction === 'right') merged.reverse();
        if (JSON.stringify(line) !== JSON.stringify(merged)) {
          moved = true;
        }
        newGrid[i] = merged;
      }
    } else {
      for (let j = 0; j < 4; j++) {
        const line = newGrid.map(row => row[j]);
        const merged = moveAndMerge(direction === 'up' ? line : line.reverse());
        if (direction === 'down') merged.reverse();
        if (JSON.stringify(line) !== JSON.stringify(merged)) {
          moved = true;
        }
        merged.forEach((val, i) => newGrid[i][j] = val);
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      const gameOver = isGameOver(newGrid);
      // 检查是否达成2048
      const has2048 = newGrid.some(row => row.some(cell => cell === 2048));
      if (has2048) {
        Dialog.open('record2048', {
          title: t('congratulations'),
          content: (
            <View>
              {t('reach2048')}
              <input
                type="text"
                placeholder={t('enterNickname')}
                onChange={(e) => setNickname(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </View>
          ),
          closeOnOverlayClick: false,
          confirmText: t('confirm'),
          onConfirm: () => {
            dispatch(addRecord({
              id: Date.now().toString(),
              score: newScore,
              nickname: nickname || t('anonymous'),
              timestamp: Date.now()
            }));
            Dialog.close('record2048');
          }
        });
      }
      setBoard(prevBoard => ({
        grid: newGrid,
        score: newScore,
        gameOver: gameOver,
        history: [...prevBoard.history, {grid: JSON.parse(JSON.stringify(prevBoard.grid)), score: prevBoard.score}]
      }));
    }
  };

  // 检查游戏是否结束
  const isGameOver = (grid: number[][]) => {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return false;
      }
    }
    // 检查是否可以合并
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
        if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
      }
    }
    return true;
  };

  // 触摸事件处理
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 20; // 降低最小滑动距离阈值，提高灵敏度
  const minSwipeSpeed = 0.3; // 最小滑动速度阈值（像素/毫秒）

  const handleTouchStart = (e: ITouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({x: touch.clientX, y: touch.clientY, time: Date.now()});
    setTouchMove(null);
  };

  const handleTouchMove = (e: ITouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchMove({x: touch.clientX, y: touch.clientY});
  };

  const handleTouchEnd = (e: ITouchEvent) => {
    const currentTime = Date.now();
    if (!touchStart || !touchMove) return;

    const deltaX = touchMove.x - touchStart.x;
    const deltaY = touchMove.y - touchStart.y;
    const deltaTime = currentTime - touchStart.time;
    const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance && speed >= minSwipeSpeed) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance && speed >= minSwipeSpeed) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
    setTouchMove(null);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          move('up');
          break;
        case 'ArrowDown':
          move('down');
          break;
        case 'ArrowLeft':
          move('left');
          break;
        case 'ArrowRight':
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board]);


  // 初始化游戏
  useEffect(() => {
    if (!currentGame) {
      initGame();
    }
  }, []);

  // 保存游戏状态
  useEffect(() => {
    if (board.grid.some(row => row.some(cell => cell !== 0))) {
      dispatch(saveGameState(board));
    }
  }, [board]);

  return (
    <View className='game-2048'>
      <View className='game-header'>
        <View className='score-container'>
          <View className='score-label'>{t('score')}</View>
          <View className='score-value'>{board.score}</View>
        </View>
        <View className='button-group'>
          <Button
            type='primary'
            onClick={() => {
              if (board.history.length > 0) {
                const lastState = board.history[board.history.length - 1];
                setBoard(prev => ({
                  ...prev,
                  grid: JSON.parse(JSON.stringify(lastState.grid)),
                  score: lastState.score,
                  history: prev.history.slice(0, -1)
                }));
              }
            }}
            disabled={board.history.length === 0}
          >
            {t('undo')}
          </Button>
          <Button type='primary' onClick={initGame}>
            {t('newGame')}
          </Button>
          <Button type='primary' onClick={() => Taro.navigateTo({url: '/pages/game2048/history/index'})}>
            {t('history')}
          </Button>
        </View>
      </View>
      <View className='game-grid' onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
        {board.grid.map((row, i) => (
          <View key={i} className='grid-row'>
            {row.map((cell, j) => (
              <View key={`${i}-${j}`} className={`grid-cell value-${cell}`}>
                {cell !== 0 && cell}
              </View>
            ))}
          </View>
        ))}
      </View>
      {board.gameOver && (
        <View className='game-over'>
          <View className='game-over-text'>{t('gameOver')}</View>
          <Button type='primary' onClick={initGame}>
            {t('tryAgain')}
          </Button>
        </View>
      )}
    </View>
  );
};

export default Game2048;
