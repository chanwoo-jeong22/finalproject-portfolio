import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";  // 공통 axios 인스턴스 import

interface UserInfo {
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  hdId: string | null;
  agId: string | null;
  lgId: string | null;
  userInfo: UserInfo;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  hdId: localStorage.getItem("hdId"),
  agId: localStorage.getItem("agId"),
  lgId: localStorage.getItem("lgId"),
  userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}"),
};

// 1) 로그인 Thunk
export const login = createAsyncThunk(
  "auth/login",
  async (
    { userId, userPassword, role }: { userId: string; userPassword: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const loginRes = await api.post("/login", {
        sep: role,
        loginId: userId,
        loginPw: userPassword,
      });

      const token = loginRes.data.token;
      const loggedUserId = loginRes.data.userId;

      let userInfo = {};

      return { token, userId: loggedUserId, role, userInfo };
    } catch (err) {
      return rejectWithValue("로그인 후 유저정보 불러오기 실패");
    }
  }
);

// 2) 유저 정보 재조회 Thunk (인자로 받도록 변경)
export const reloadUserInfo = createAsyncThunk(
  "auth/reloadUserInfo",
  async (
    { token, role, userId }: { token: string; role: string; userId: string },
    { rejectWithValue }
  ) => {
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

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3) 회원가입 Thunk
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/head/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.hdId = null;
      state.agId = null;
      state.lgId = null;
      state.userInfo = {};

      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
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

    builder.addCase(reloadUserInfo.fulfilled, (state, action) => {
      if (action.payload) {
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      }
    });

    builder.addCase(reloadUserInfo.rejected, (state) => {
      state.token = null;
      state.hdId = null;
      state.agId = null;
      state.lgId = null;
      state.userInfo = {};
      localStorage.clear();

      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
    });

    builder.addCase(signUp.fulfilled, (state) => {
      // 회원가입 성공 처리 가능
    });

    builder.addCase(signUp.rejected, (state, action) => {
      // 회원가입 실패 처리 가능
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
