import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";  // axios 인스턴스 import
import axios from "axios";        // thunk 내부 axios 호출용

// 유저 정보 인터페이스
interface UserInfo {
    [key: string]: any;
}

// 인증 상태를 담는 인터페이스
interface AuthState {
    token: string | null;  // 인증 토큰
    hdId: string | null;   // 본사(Head Office) ID
    agId: string | null;   // 대리점(Agency) ID
    lgId: string | null;   // 물류(Logistic) ID
    userInfo: UserInfo;    // 로그인한 유저 상세 정보
}

// 초기 상태, 로컬스토리지에서 초기값 불러오기
const initialState: AuthState = {
    token: localStorage.getItem("token"),
    hdId: localStorage.getItem("hdId"),
    agId: localStorage.getItem("agId"),
    lgId: localStorage.getItem("lgId"),
    userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}"),
};

/* -----------------------------------------------
    1) 로그인 처리 Thunk
    - 서버에 로그인 요청 후 토큰과 유저정보 받아 상태에 저장
    - agency, logistic 역할은 추가 정보를 API로 받아옴
------------------------------------------------*/
export const login = createAsyncThunk(
    "auth/login",
    async (
        { token, userId, role }: { token: string; userId: string; role: string },
        { rejectWithValue }
    ) => {
        try {
            let userInfo = {};

            // agency 또는 logistic이면 상세 정보 추가 요청
            if (role === "agency" || role === "logistic") {
                const type = role === "agency" ? "agency" : "logistic";
                const res = await axios.get(
                    `http://localhost:8080/api/${type}/mypage/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                userInfo = res.data;
            }

            // 로그인 성공 시 토큰, 유저ID, 역할, 상세 정보 반환
            return { token, userId, role, userInfo };
        } catch (err) {
            // 실패 시 rejectWithValue로 에러 메시지 전달
            return rejectWithValue("로그인 후 유저정보 불러오기 실패");
        }
    }
);

/* -----------------------------------------------
    2) 유저 정보 재조회 Thunk
    - 앱 새로고침 등으로 상태 초기화됐을 때 서버에서 유저정보 다시 불러오기
------------------------------------------------*/
export const reloadUserInfo = createAsyncThunk(
    "auth/reloadUserInfo",
    async (_, { getState }) => {
        const state = getState() as any;
        const { agId, lgId, token } = state.auth;

        // ID와 타입 결정 (agency 또는 logistic)
        const id = agId || lgId;
        const type = agId ? "agency" : lgId ? "logistic" : null;

        if (!id || !type || !token) return null;

        const res = await axios.get(
            `http://localhost:8080/api/${type}/mypage/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return res.data;  // 재조회된 유저정보 반환
    }
);

/* -----------------------------------------------
    3) 회원가입 처리 Thunk
    - 회원가입 폼 데이터를 서버에 전송
    - 성공/실패에 따른 처리 가능
------------------------------------------------*/
export const signUp = createAsyncThunk(
    "auth/signUp",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            // 'api'는 공통 axios 인스턴스 (Content-Type multipart/form-data 설정)
            const response = await api.post("/api/head/signup", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;  // 성공 시 응답 데이터 반환
        } catch (error: any) {
            // 실패 시 서버에서 받은 에러 메시지 또는 기본 메시지 반환
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

/* -----------------------------------------------
    4) Slice 생성
    - 상태, 리듀서, 액션 정의
------------------------------------------------*/
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // 로그아웃 액션: 상태 초기화, 로컬스토리지 삭제, 로그인 페이지로 이동
        logout(state) {
            state.token = null;
            state.hdId = null;
            state.agId = null;
            state.lgId = null;
            state.userInfo = {};

            localStorage.clear();
            window.location.href = "/login";
        },
    },

    extraReducers: (builder) => {
        // 로그인 성공 시 상태 업데이트 및 로컬스토리지 저장
        builder.addCase(login.fulfilled, (state, action) => {
            const { token, userId, role, userInfo } = action.payload;

            state.token = token;
            localStorage.setItem("token", token);

            if (role === "head_office") {
                state.hdId = userId;
                localStorage.setItem("hdId", userId);
            } else if (role === "agency") {
                state.agId = userId;
                localStorage.setItem("agId", userId);
            } else if (role === "logistic") {
                state.lgId = userId;
                localStorage.setItem("lgId", userId);
            }

            state.userInfo = userInfo;
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
        });

        // 유저정보 재조회 성공 시 상태 업데이트 및 저장
        builder.addCase(reloadUserInfo.fulfilled, (state, action) => {
            if (action.payload) {
                state.userInfo = action.payload;
                localStorage.setItem("userInfo", JSON.stringify(action.payload));
            }
        });

        // 회원가입 성공 시 처리 (필요 시 상태 변경 가능)
        builder.addCase(signUp.fulfilled, (state, action) => {
            // 예: state.signupSuccess = true; 등 상태 추가 가능
            // 현재는 별도 상태 없이 그냥 성공 처리로 둠
        });

        // 회원가입 실패 시 처리 (필요 시 에러 상태 저장 가능)
        builder.addCase(signUp.rejected, (state, action) => {
            // 예: state.signupError = action.payload;
        });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
