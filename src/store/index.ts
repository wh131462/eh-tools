import {configureStore} from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import rouletteReducer from './slices/rouletteSlice';
import userReducer from './slices/userSlice';
import calendarReducer from './slices/calendarSlice';
import game2048Reducer from './slices/game2048Slice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    roulette: rouletteReducer,
    user: userReducer,
    calendar: calendarReducer,
    game2048: game2048Reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
