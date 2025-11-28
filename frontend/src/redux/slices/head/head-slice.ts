import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';  // 공통 axios 인스턴스 import

// 공지사항 타입 (HeadMain과 동일하게 맞춤)
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

// API 주소 (환경에 맞게 수정)
const API_URL = '/notices';  // api 인스턴스에 baseURL 이미 있으므로 상대 경로로

// 비동기 thunk: 공지사항 목록 조회
export const fetchNotices = createAsyncThunk<NoticeType[], void>(
  'head/fetchNotices',
  async () => {
    const response = await api.get<NoticeType[]>(API_URL);
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
