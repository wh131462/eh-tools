import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ColorCardState {
  favorites: string[];
  color: string;
  isFullscreen: boolean;
}

const initialState: ColorCardState = {
  favorites: [],
  color: '#FF6B6B',
  isFullscreen: false
};

const colorCardSlice = createSlice({
  name: 'colorCard',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(color => color !== action.payload);
    },
    setColor: (state, action: PayloadAction<string>) => {
      state.color = action.payload;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
  },
});

export const {setFavorites, addFavorite, removeFavorite, setColor, toggleFullscreen} = colorCardSlice.actions;
export default colorCardSlice.reducer;