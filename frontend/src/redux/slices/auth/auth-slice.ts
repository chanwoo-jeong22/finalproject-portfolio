import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api"; // 공통 axios 인스턴스 import

// 유저 정보 타입 정의 (본사, 대리점, 물류 계정 공통 포함)
interface UserInfo {
  hdAuth?: string;
  hdName?: string;
  hdId?: string;
  hdProfile?: string;
  hdPhone?: string;
  hdEmail?: string;

  agAddress: string;
  agCeo: string;
  agCode: number;
  agEmail: string;
  agId: string;
  agKey: number;
  agName: string;
  agPhone: string;
  agPw: string;
  agZip: string;

  // 물류
  lgName?: string;
  lgCeo?: string;
  lgId?: string;
}

// 인증 상태 타입 정의
interface AuthState {
  token: string | null;    // 인증 토큰 (JWT 등)
  hdId: string | null;     // 본사 계정명
  agId: string | null;     // 대리점 계정명
  lgId: string | null;     // 물류 계정명
  userInfo: UserInfo;      // 로그인한 사용자 정보
}

// 초기 상태 정의 (localStorage에서 읽어와서 초기화)
const initialState: AuthState = {
  token: localStorage.getItem("token"),
  hdId: localStorage.getItem("hdId"),
  agId: localStorage.getItem("agId"),
  lgId: localStorage.getItem("lgId"),
  userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}"),
};

/**
 * 1) 로그인 Thunk
 * - userId, userPassword, role(본사/대리점/물류) 입력 받아 로그인 API 호출
 * - 성공 시 토큰과 userInfo를 받아 상태에 저장
 */
export const login = createAsyncThunk<
  { token: string; userId: string; role: string; userInfo: UserInfo },
  { userId: string; userPassword: string; role: string },
  { rejectValue: string }
>(
  "auth/login",
  async (
    { userId, userPassword, role },
    { rejectWithValue }
  ) => {
    try {
      // 1) 로그인 요청
      const loginRes = await api.post("/login", {
        sep: role,
        loginId: userId,
        loginPw: userPassword,
      });

      const token: string = loginRes.data.token;
      const loggedUserId: string = loginRes.data.userId;

      // 2) 로그인 성공 시 role에 따라 userInfo 조회 URL 결정
      let url = "";
      if (role === "head_office") {
        url = `/head/mypage/${loggedUserId}`;
      } else if (role === "agency") {
        url = `/agency/mypage/${loggedUserId}`;
      } else if (role === "logistic") {
        url = `/logistic/mypage/${loggedUserId}`;
      } else {
        return rejectWithValue("Invalid role");
      }

      // 3) userInfo 조회 API 호출 (토큰 헤더 포함)
      const userInfoRes = await api.get<UserInfo>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userInfo: UserInfo = userInfoRes.data;

      // 반환값은 fulfilled 액션 payload로 사용됨
      return { token, userId: loggedUserId, role, userInfo };
    } catch (error: unknown) {
      // 에러 타입 체크 후 rejectWithValue로 에러 메시지 전달
      const message =
        error instanceof Error ? error.message : "로그인 실패";
      return rejectWithValue(message);
    }
  }
);

/**
 * 2) reloadUserInfo Thunk
 * - 기존 토큰, role, userId로 userInfo 새로 조회
 * - 토큰 만료 시 재로그인 처리 가능
 */
export const reloadUserInfo = createAsyncThunk<
  UserInfo,
  { token: string; role: string; userId: string },
  { rejectValue: string }
>(
  "auth/reloadUserInfo",
  async ({ token, role, userId }, { rejectWithValue }) => {
    if (!token || !role || !userId) {
      return rejectWithValue("Missing token, role, or userId");
    }

    try {
      let url = "";
      if (role === "head_office") {
        url = `/head/mypage/${userId}`;
      } else if (role === "agency") {
        url = `/agency/mypage/${userId}`;
      } else if (role === "logistic") {
        url = `/logistic/mypage/${userId}`;
      } else {
        return rejectWithValue("Invalid role");
      }

      const res = await api.get<UserInfo>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "유저 정보 조회 실패";
      return rejectWithValue(message);
    }
  }
);

/**
 * 3) 회원가입 Thunk
 * - FormData를 받아서 회원가입 API 호출 (multipart/form-data)
 */
export const signUp = createAsyncThunk<
  FormData,
  { rejectValue: string }
>(
  "auth/signUp",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/head/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "회원가입 실패";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * 로그아웃 처리
     * - 상태 초기화 및 localStorage 클리어
     */
    logout(state) {
      state.token = null;
      state.hdId = null;
      state.agId = null;
      state.lgId = null;
      state.userInfo = {} as UserInfo;

      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    // 로그인 성공 처리: 토큰, ID, userInfo 저장 및 localStorage 업데이트
    builder.addCase(login.fulfilled, (state, action) => {
      const { token, userId, role, userInfo } = action.payload;

      state.token = token;
      localStorage.setItem("token", token);

      // 역할별로 ID 저장
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

    // 유저 정보 재조회 성공 처리: 상태와 localStorage 업데이트
    builder.addCase(reloadUserInfo.fulfilled, (state, action) => {
      if (action.payload) {
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      }
    });

    // 유저 정보 재조회 실패 (예: 토큰 만료) 시 로그아웃 처리 및 경고창 표시
    builder.addCase(reloadUserInfo.rejected, (state) => {
      state.token = null;
      state.hdId = null;
      state.agId = null;
      state.lgId = null;
      state.userInfo = {} as UserInfo;
      localStorage.clear();

      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
    });

    // 회원가입 성공 시 처리 (필요시 추가 구현)
    builder.addCase(signUp.fulfilled, (state) => {
      // 예: 성공 메시지 저장 등
    });

    // 회원가입 실패 시 처리 (필요시 추가 구현)
    builder.addCase(signUp.rejected, (state, action) => {
      // 예: 실패 메시지 저장 등
    });
  },
});

// 액션 내보내기 (로그아웃)
export const { logout } = authSlice.actions;

// 리듀서 내보내기
export default authSlice.reducer;
