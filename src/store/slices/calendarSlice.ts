import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Schedule {
  id: string;
  date: number;
  title: string;
  description?: string;
  type: 'birthday' | 'event';
  isRecurring?: boolean;
}

interface CalendarState {
  schedules: Schedule[];
  selectedDate: string | null;
}

const initialState: CalendarState = {
  schedules: [],
  selectedDate: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addSchedule: (state, action: PayloadAction<Schedule>) => {
      state.schedules.push(action.payload);
    },
    removeSchedule: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload);
    },
    updateSchedule: (state, action: PayloadAction<Schedule>) => {
      const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id);
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
  },
});

export const {addSchedule, removeSchedule, updateSchedule, setSelectedDate} = calendarSlice.actions;
export default calendarSlice.reducer;
