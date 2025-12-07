import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { noticeApi, NoticeUpdatePayload } from "../../../api/api"; 
// ↑ api.ts 경로는 프로젝트 구조에 맞게 이미 맞춰져 있음

/** ------------------------------------------------------------------
 *  공지 상세 데이터 타입
 *  - 서버에서 내려오는 값 기준 (optional 포함)
 *  - 필요 시 확장 가능
 * ------------------------------------------------------------------ */
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

/** ------------------------------------------------------------------
 *  Redux Slice 상태 타입
 * ------------------------------------------------------------------ */
interface NoticeState {
  /** 공지 상세 데이터 */
  noticeDetail: NoticeDetail | null;

  /** API 호출 중 표시 */
  loading: boolean;

  /** 오류 메시지 저장 */
  error: string | null;
}

/** ------------------------------------------------------------------
 *  초기 상태
 * ------------------------------------------------------------------ */
const initialState: NoticeState = {
  noticeDetail: null,
  loading: false,
  error: null,
};

/** ------------------------------------------------------------------
 *  공지 수정 Thunk
 *  - 성공 시 NoticeDetail 반환
 *  - 실패 시 rejectValue(string)에 에러 메시지 전달
 * ------------------------------------------------------------------ */
export const updateNotice = createAsyncThunk<
  NoticeDetail,                                    // 성공 반환 타입
  { ntKey: number; data: NoticeUpdatePayload },    // 호출 파라미터 타입
  { rejectValue: string }                          // rejectValue 타입
>("notice/updateNotice", async ({ ntKey, data }, { rejectWithValue }) => {
  try {
    const response = await noticeApi.updateNotice(ntKey, data);
    return response.data as NoticeDetail;
  } catch (err) {
    /** 
     * AxiosError 패턴 고려하여 response 접근
     */
    const error = err as { response?: { data?: { message?: string } }; message?: string };
    return rejectWithValue(error.response?.data?.message || error.message || "오류 발생");
  }
});

/** ------------------------------------------------------------------
 *  공지 삭제 Thunk
 *  - 성공 시 삭제된 ntKey 배열 그대로 반환
 * ------------------------------------------------------------------ */
export const deleteNotices = createAsyncThunk<
  number[],     // 성공 시 반환 타입
  number[],     // 파라미터 타입 (삭제할 공지 키 배열)
  { rejectValue: string }
>("notice/deleteNotices", async (keys, { rejectWithValue }) => {
  try {
    await noticeApi.deleteNotices(keys);
    return keys;
  } catch (err) {
    const error = err as { response?: { data?: { message?: string } }; message?: string };
    return rejectWithValue(error.response?.data?.message || error.message || "오류 발생");
  }
});

/** ------------------------------------------------------------------
 *  공지 Slice
 * ------------------------------------------------------------------ */
export const noticeSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {
    /** 공지 상세 데이터 수동 세팅 */
    setNoticeDetail(state, action: PayloadAction<NoticeDetail | null>) {
      state.noticeDetail = action.payload;
      state.error = null;
    },

    /** 오류 메시지 초기화 */
    clearError(state) {
      state.error = null;
    },
  },

  /** ------------------------------------------------------------------
   *  Thunk 처리 (비동기 상태 관리)
   * ------------------------------------------------------------------ */
  extraReducers: (builder) => {
    builder
      /** ------------------------------
       *  updateNotice 상태 변화
       * ------------------------------ */
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

      /** ------------------------------
       *  deleteNotices 상태 변화
       * ------------------------------ */
      .addCase(deleteNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotices.fulfilled, (state) => {
        state.loading = false;
        state.noticeDetail = null; // 삭제 후 상세 초기화
      })
      .addCase(deleteNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "공지사항 삭제 실패";
      });
  },
});

/** 액션 export */
export const { setNoticeDetail, clearError } = noticeSlice.actions;

/** 리듀서 export */
export default noticeSlice.reducer;
