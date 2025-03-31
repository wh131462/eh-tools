import {configureStore} from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import rouletteReducer from './slices/rouletteSlice';
import userReducer from './slices/userSlice';
import calendarReducer from './slices/calendarSlice';
import colorCardReducer from './slices/colorCardSlice';
import qrcodeReducer from "./slices/qrcodeSlice"
import cryptoReducer from "./slices/cryptoSlice"

export const store = configureStore({
  reducer: {
    app: appReducer,
    roulette: rouletteReducer,
    user: userReducer,
    calendar: calendarReducer,
    colorCard: colorCardReducer,
    qrcode: qrcodeReducer,
    crypto: cryptoReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
