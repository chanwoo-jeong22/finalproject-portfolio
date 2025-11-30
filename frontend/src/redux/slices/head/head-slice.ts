import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';  // 공통 axios 인스턴스 import

// 공지사항 타입
export interface NoticeType {
  ntKey: number;
  ntCode?: number;
  ntCategory?: string;
  ntContent?: string;
  startDate?: string;
  endDate?: string;
  atCreated?: string;
  at_created?: string;
  category2?: string;
  [key: string]: any;
}

// API 상대 경로
const API_URL = '/notices';

// 🟦 codes 배열을 받아서 호출하도록 변경
export const fetchNotices = createAsyncThunk<
  NoticeType[],
  number[]          // <-- 파라미터로 number[] 받음
>(
  'head/fetchNotices',
  async (codes) => {
    // 예: /notices?codes=1&codes=2&codes=3
    const response = await api.get<NoticeType[]>(API_URL, {
      params: { codes },
    });
    return response.data;
  }
);

interface HeadState {
  notices: NoticeType[];
  loading: boolean;
  error: string | null;
}

const initialState: HeadState = {
  notices: [],
  loading: false,
  error: null,
};

const headSlice = createSlice({
  name: 'head',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action: PayloadAction<NoticeType[]>) => {
        state.loading = false;
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notices';
      });
  },
});

export const { clearError } = headSlice.actions;
export default headSlice.reducer;
