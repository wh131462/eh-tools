import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RouletteConfigs} from "@/store/constants/rouletteConfigs";

export interface RouletteItem {
  id: string;
  name: string;
  color?: string;
  probability?: number;
}

export interface RouletteConfig {
  id: string;
  name: string;
  description?: string;
  items: RouletteItem[];
  createTime: number;
}

export interface RouletteHistory {
  id: string;
  configId: string;
  configName: string;
  selectedItem: RouletteItem;
  timestamp: number;
}

interface RouletteState {
  configs: RouletteConfig[];
  currentConfig: RouletteConfig | null;
  history: RouletteHistory[];
}

const initialState: RouletteState = {
  configs: RouletteConfigs,
  currentConfig: RouletteConfigs.at(0)!,
  history: []
};

export const rouletteSlice = createSlice({
  name: 'roulette',
  initialState,
  reducers: {
    setConfigs: (state, action: PayloadAction<RouletteConfig[]>) => {
      state.configs = action.payload;
      if (!state.currentConfig) {
        state.currentConfig = action.payload[0];
      }
    },
    deleteHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(record => record.id !== action.payload);
    },
    addConfig: (state, action: PayloadAction<RouletteConfig>) => {
      state.configs.push(action.payload);
    },
    updateConfig: (state, action: PayloadAction<RouletteConfig>) => {
      const index = state.configs.findIndex(config => config.id === action.payload.id);
      if (index !== -1) {
        state.configs[index] = action.payload;
        if (state.currentConfig?.id === action.payload.id) {
          state.currentConfig = action.payload;
        }
      } else {
        state.configs.push(action.payload)
        if (!state.currentConfig) {
          state.currentConfig = action.payload
        }
      }
    },
    deleteConfig: (state, action: PayloadAction<string>) => {
      state.configs = state.configs.filter(config => config.id !== action.payload);
      if (state.currentConfig?.id === action.payload) {
        state.currentConfig = null;
      }
    },
    setCurrentConfig: (state, action: PayloadAction<RouletteConfig | null>) => {
      state.currentConfig = action.payload;
    },
    addHistory: (state, action: PayloadAction<RouletteHistory>) => {
      state.history.unshift(action.payload);
      // 只保留最近100条记录
      if (state.history.length > 100) {
        state.history = state.history.slice(0, 100);
      }
    }
  }
});

export const {
  setConfigs,
  addConfig,
  updateConfig,
  deleteConfig,
  setCurrentConfig,
  addHistory,
  deleteHistory
} = rouletteSlice.actions;

export default rouletteSlice.reducer;
