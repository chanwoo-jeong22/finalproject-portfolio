import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

// 비밀번호 관련 상태 타입 정의
interface PasswordState {
  // 비밀번호 찾기 API 요청 상태: idle, loading, succeeded, failed
  status: "idle" | "loading" | "succeeded" | "failed";
  // 비밀번호 찾기 실패 시 에러 메시지
  error: string | null;
  // 비밀번호 찾기 결과: noUser, fail, success, null
  result: "noUser" | "fail" | "success" | null;

  // 비밀번호 재설정 API 요청 상태
  resetStatus: "idle" | "loading" | "succeeded" | "failed";
  // 비밀번호 재설정 실패 시 에러 메시지
  resetError: string | null;
}

// 초기 상태 값
const initialState: PasswordState = {
  status: "idle",
  error: null,
  result: null,

  resetStatus: "idle",
  resetError: null,
};

/**
 * 비밀번호 찾기 API 요청 Thunk
 * - userId, email을 받아 API POST 요청
 * - 성공 시 { success: boolean } 형태 응답 기대
 * - 실패 시 에러 메시지를 rejectWithValue로 반환
 */
export const findPassword = createAsyncThunk<
  { success: boolean }, // 성공 응답 타입
  { userId: string; email: string }, // 요청 파라미터 타입
  { rejectValue: string } // 실패 시 reject 값 타입
>(
  "password/findPassword",
  async ({ userId, email }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/findPw", { userId, email });
      return response.data; // { success: true/false }
    } catch (error: string) {
      // 에러가 Error 인스턴스인지 체크 후 메시지 추출
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("비밀번호 찾기 실패");
    }
  }
);

/**
 * 비밀번호 재설정 API 요청 Thunk
 * - token과 newPassword를 받아 API POST 요청
 * - 성공 시 { success, message } 반환 기대
 * - 실패 시 에러 메시지를 rejectWithValue로 반환
 */
export const resetPassword = createAsyncThunk<
  { success: boolean; message: string }, // 서버 응답 타입
  { token: string; newPassword: string }, // 요청 파라미터 타입
  { rejectValue: string }
>(
  "password/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    if (!token) return rejectWithValue("유효하지 않은 토큰입니다.");

    try {
      const response = await api.post("/auth/resetPw", { token, newPassword });
      return response.data; // { success, message }
    } catch (error: string) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("비밀번호 재설정 실패");
    }
  }
);

const passwordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    /**
     * 상태 초기화 리듀서
     * - 비밀번호 찾기 및 재설정 상태를 idle로 초기화
     * - 에러 및 결과 값도 초기화
     */
    resetStatus(state) {
      state.status = "idle";
      state.error = null;
      state.result = null;
      state.resetStatus = "idle";
      state.resetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // findPassword thunk 상태 처리
      .addCase(findPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.result = null;
      })
      .addCase(findPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        // success가 true면 "success", 아니면 "noUser"
        state.result = action.payload.success ? "success" : "noUser";
      })
      .addCase(findPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "알 수 없는 오류";
        state.result = "fail";
      })

      // resetPassword thunk 상태 처리
      .addCase(resetPassword.pending, (state) => {
        state.resetStatus = "loading";
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetStatus = "succeeded";
        state.resetError = null;

        // 성공 여부에 따라 result와 에러 상태 설정
        if (action.payload.success) {
          state.result = "success";
        } else {
          state.result = "fail";
          state.resetError = action.payload.message || "알 수 없는 오류";
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetStatus = "failed";
        state.resetError = action.payload ?? "알 수 없는 오류";
        state.result = "fail";
      });
  },
});

export const { resetStatus } = passwordSlice.actions;
export default passwordSlice.reducer;
