import {configureStore} from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import rouletteReducer from './slices/rouletteSlice';
import userReducer from './slices/userSlice';
import calendarReducer from './slices/calendarSlice';
import colorCardReducer from './slices/colorCardSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    roulette: rouletteReducer,
    user: userReducer,
    calendar: calendarReducer,
    colorCard: colorCardReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
