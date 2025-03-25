import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Game2048Record {
  id: string;
  score: number;
  nickname: string;
  timestamp: number;
}

interface Game2048State {
  records: Game2048Record[];
  currentGame: {
    grid: number[][];
    score: number;
    gameOver: boolean;
    history: Array<{ grid: number[][]; score: number }>;
  } | null;
}

const initialState: Game2048State = {
  records: [],
  currentGame: null
};

const game2048Slice = createSlice({
  name: 'game2048',
  initialState,
  reducers: {
    addRecord: (state, action: PayloadAction<Game2048Record>) => {
      state.records.push(action.payload);
      state.records.sort((a, b) => b.score - a.score);
    },
    deleteRecord: (state, action: PayloadAction<Game2048Record>) => {
      state.records.splice(state.records.findIndex(o => o.id == action.payload.id), 1)
    },
    clearRecords: (state) => {
      state.records = [];
    },
    saveGameState: (state, action: PayloadAction<{
      grid: number[][];
      score: number;
      gameOver: boolean;
      history: Array<{ grid: number[][]; score: number }>;
    }>) => {
      state.currentGame = action.payload;
    },
    clearGameState: (state) => {
      state.currentGame = null;
    }
  }
});

export const {addRecord, deleteRecord, clearRecords, saveGameState, clearGameState} = game2048Slice.actions;
export default game2048Slice.reducer;
