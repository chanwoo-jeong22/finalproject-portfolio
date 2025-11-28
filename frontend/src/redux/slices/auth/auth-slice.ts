import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";  // 공통 axios 인스턴스 import

// 유저 정보 인터페이스
interface UserInfo {
  [key: string]: any;
}

// 인증 상태 인터페이스
interface AuthState {
  token: string | null;  // JWT 토큰
  hdId: string | null;   // 본사 ID
  agId: string | null;   // 대리점 ID
  lgId: string | null;   // 물류 ID
  userInfo: UserInfo;    // 로그인 유저 상세 정보
}

// 초기 상태: 로컬스토리지에서 값 불러오기
const initialState: AuthState = {
  token: localStorage.getItem("token"),
  hdId: localStorage.getItem("hdId"),
  agId: localStorage.getItem("agId"),
  lgId: localStorage.getItem("lgId"),
  userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}"),
};

/* -----------------------------------------------
  1) 로그인 Thunk
  - 로그인 API 호출하여 토큰 및 유저정보 받기
  - agency/logistic 역할은 추가 API로 상세정보 받아옴
------------------------------------------------*/
export const login = createAsyncThunk(
  "auth/login",
  async (
    { userId, userPassword, role }: { userId: string; userPassword: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      // 로그인 요청 (api 인스턴스 사용, baseURL 포함)
      const loginRes = await api.post("/login", {
        sep: role,
        loginId: userId,
        loginPw: userPassword,
      });

      console.log("[login thunk] 로그인 응답 데이터:", loginRes.data);

      const token = loginRes.data.token;
      const loggedUserId = loginRes.data.userId;

      let userInfo = {};

      // agency 또는 logistic 역할일 경우 상세정보 추가 요청
      if (role === "agency" || role === "logistic") {
        const type = role === "agency" ? "agency" : "logistic";
        // api 인스턴스로 호출 시 인터셉터가 토큰 헤더 자동 추가
        const res = await api.get(`/${type}/mypage/${loggedUserId}`);
        userInfo = res.data;
      }

      return { token, userId: loggedUserId, role, userInfo };
    } catch (err) {
      return rejectWithValue("로그인 후 유저정보 불러오기 실패");
    }
  }
);

/* -----------------------------------------------
  2) 유저 정보 재조회 Thunk
  - 새로고침 등 상태 초기화 시 서버에서 다시 유저 정보 불러오기
  - 실패 시 rejectWithValue로 에러 반환
------------------------------------------------*/
export const reloadUserInfo = createAsyncThunk(
  "auth/reloadUserInfo",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any;
    console.log("[reloadUserInfo] 현재 auth 상태:", state.auth);
    const { agId, lgId, hdId, token } = state.auth;

    let id = null;
    let type = null;

    if (agId) {
      id = agId;
      type = "agency";
    } else if (lgId) {
      id = lgId;
      type = "logistic";
    } else if (hdId) {
      id = hdId;
      type = "head_office";  // 추가
    }

    if (!id || !type || !token) {
      console.log("[reloadUserInfo] id/type/token 중 하나가 없음:", { id, type, token });
      return rejectWithValue("Missing required auth info");
    }

    try {
      const res = await api.get(`/${type}/mypage/${id}`);
      console.log("[reloadUserInfo] 응답 데이터:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("[reloadUserInfo] API 호출 실패:", error.response?.status, error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


/* -----------------------------------------------
  3) 회원가입 Thunk
  - 회원가입 폼 전송
  - 성공/실패에 따른 처리
------------------------------------------------*/
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // 'api' 인스턴스 사용, multipart/form-data 설정
      const response = await api.post("/head/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/* -----------------------------------------------
  4) Slice 정의
------------------------------------------------*/
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 로그아웃: 상태 초기화, 로컬스토리지 비우기, 로그인 페이지 이동
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
    // 로그인 성공 시 상태 및 로컬스토리지 저장
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

    // 유저 정보 재조회 성공 시 상태 및 저장
    builder.addCase(reloadUserInfo.fulfilled, (state, action) => {
      if (action.payload) {
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      }
    });

    // 유저 정보 재조회 실패 시 (예: 토큰 만료)
    builder.addCase(reloadUserInfo.rejected, (state, action) => {
      // 인증 실패 처리: 상태 초기화 및 로컬스토리지 비우기
      state.token = null;
      state.hdId = null;
      state.agId = null;
      state.lgId = null;
      state.userInfo = {};

      localStorage.clear();

      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    });

    // 회원가입 성공 시 (필요시 상태 업데이트 가능)
    builder.addCase(signUp.fulfilled, (state, action) => {
      // 예: state.signupSuccess = true;
    });

    // 회원가입 실패 시 (필요시 에러 저장 가능)
    builder.addCase(signUp.rejected, (state, action) => {
      // 예: state.signupError = action.payload;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
