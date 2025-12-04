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
 * - userId, email을 받아서 API에 POST 요청
 * - 성공 시 { success: boolean } 형태의 응답을 반환
 * - 실패 시 에러 메시지 반환
 */
export const findPassword = createAsyncThunk<
    { success: boolean }, // 성공 응답 타입
    { userId: string; email: string }, // 파라미터 타입
    { rejectValue: string } // 실패 시 리젝트 값 타입
>(
    "password/findPassword",
    async ({ userId, email }, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/findPw", { userId, email });
            return response.data; // { success: true/false } 형태 기대
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "비밀번호 찾기 실패"
            );
        }
    }
);

/**
 * 비밀번호 재설정 API 요청 Thunk
 * - token과 newPassword를 받아서 API에 POST 요청
 * - 성공 시 void 반환 (에러 없으면 성공)
 * - 실패 시 에러 메시지 반환
 */
export const resetPassword = createAsyncThunk<
    { success: boolean; message: string },  // 서버 응답 타입에 맞춤
    { token: string; newPassword: string },
    { rejectValue: string }
>(
    "password/resetPassword",
    async ({ token, newPassword }, { rejectWithValue }) => {
        if (!token) return rejectWithValue("유효하지 않은 토큰입니다.");
        try {
            const response = await api.post("/auth/resetPw", { token, newPassword });
            return response.data; // { success, message } 반환
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "비밀번호 재설정 실패"
            );
        }
    }
);


const passwordSlice = createSlice({
    name: "password",
    initialState,
    reducers: {
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
                state.result = action.payload.success ? "success" : "noUser";
            })
            .addCase(findPassword.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "알 수 없는 오류";
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

                if (action.payload.success) {
                    state.result = "success";
                } else {
                    state.result = "fail";
                    state.resetError = action.payload.message || "알 수 없는 오류";
                }
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.resetStatus = "failed";
                state.resetError = action.payload || "알 수 없는 오류";
                state.result = "fail";
            });
    },
});

export const { resetStatus } = passwordSlice.actions;
export default passwordSlice.reducer;

