import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import rouletteReducer from './slices/rouletteSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    roulette: rouletteReducer,
    user: userReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
