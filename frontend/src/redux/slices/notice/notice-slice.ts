import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { noticeApi, NoticeUpdatePayload } from "../../../api/api"; // api.ts 경로 맞게 조정

// 상태에 저장할 공지 상세 타입 (필요에 따라 확장 가능)
export interface NoticeDetail {
  ntKey: number;
  ntCode?: number;
  ntCategory?: string;
  ntContent?: string;
  startDate?: string;
  endDate?: string;
  atCreated?: string;
  at_created?: string;
  category2?: string;
}

// 슬라이스 상태 타입
interface NoticeState {
  noticeDetail: NoticeDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: NoticeState = {
  noticeDetail: null,
  loading: false,
  error: null,
};

// 수정 API thunk
export const updateNotice = createAsyncThunk<
  NoticeDetail, // 성공 반환 타입
  { ntKey: number; data: NoticeUpdatePayload }, // 파라미터 타입
  { rejectValue: string }
>("notice/updateNotice", async ({ ntKey, data }, { rejectWithValue }) => {
  try {
    const response = await noticeApi.updateNotice(ntKey, data);
    return response.data as NoticeDetail;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// 삭제 API thunk
export const deleteNotices = createAsyncThunk<
  number[], // 성공 반환 타입 (삭제된 키 배열)
  number[], // 파라미터 타입 (삭제할 키 배열)
  { rejectValue: string }
>("notice/deleteNotices", async (keys, { rejectWithValue }) => {
  try {
    await noticeApi.deleteNotices(keys);
    return keys;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const noticeSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {
    // 필요 시 상태 리셋 등 추가 가능
    setNoticeDetail(state, action: PayloadAction<NoticeDetail | null>) {
      state.noticeDetail = action.payload;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // updateNotice
      .addCase(updateNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.noticeDetail = action.payload;
      })
      .addCase(updateNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "공지사항 수정 실패";
      })
      // deleteNotices
      .addCase(deleteNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotices.fulfilled, (state) => {
        state.loading = false;
        state.noticeDetail = null;
      })
      .addCase(deleteNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "공지사항 삭제 실패";
      });
  },
});

export const { setNoticeDetail, clearError } = noticeSlice.actions;

export default noticeSlice.reducer;
