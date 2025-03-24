import {configureStore} from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import rouletteReducer from './slices/rouletteSlice';
import userReducer from './slices/userSlice';
import calendarReducer from './slices/calendarSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    roulette: rouletteReducer,
    user: userReducer,
    calendar: calendarReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
