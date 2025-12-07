import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";
import type { RootState } from "../../store";

// --------------------------------------------------
// 마이페이지 상태 타입 정의
// --------------------------------------------------
interface MyPageState {
  loading: boolean;
  error: string | null;
  data: {
    logisticName: string;
    userName: string;
    userId: string;
    address: string;
    addressDetail: string;
    phone: string;
    email: string;
  } | null;
  updateSuccess: boolean;
}

// 초기 상태
const initialState: MyPageState = {
  loading: false,
  error: null,
  data: null,
  updateSuccess: false,
};

// --------------------------------------------------
// JWT 토큰에서 sub(고유 ID) 추출 유틸 함수
// --------------------------------------------------
function parseJwt(token: string): string | null {
  try {
    const base64Payload = token.split(".")[1]; // JWT의 payload 부분
    const payload = atob(base64Payload);       // base64 decode
    const json = JSON.parse(payload);         // JSON 파싱
    return json.sub ?? null;                  // sub(로그인 사용자 ID)
  } catch {
    return null;
  }
}

// --------------------------------------------------
// Thunk: 유저 정보 조회
// --------------------------------------------------
export const fetchMyPageData = createAsyncThunk<
  MyPageState["data"],        // 성공 시 payload 타입
  void,                       // 전달 파라미터 없음
  { state: RootState; rejectValue: string }
>("mypage/fetchMyPageData", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  if (!token) return thunkAPI.rejectWithValue("토큰이 없습니다.");

  const lgId = parseJwt(token);
  if (!lgId) return thunkAPI.rejectWithValue("잘못된 토큰입니다.");

  try {
    const response = await api.get(`/logistic/mypage/${lgId}`);

    // response.data 타입을 string → 안전하게 변환
    const raw: string = response.data;

    if (!raw || typeof raw !== "object") {
      return thunkAPI.rejectWithValue("유효하지 않은 응답입니다.");
    }

    const data = raw as Record<string, string>;

    return {
      logisticName: (data.lgName as string) || "",
      userName: (data.lgCeo as string) || "",
      userId: (data.lgId as string) || lgId,
      address: (data.lgAddress as string) || "",
      addressDetail: (data.lgZip as string) || "",
      phone: (data.lgPhone as string) || "",
      email: (data.lgEmail as string) || "",
    };
  } catch (error) {
    const err = error as { message?: string };
    return thunkAPI.rejectWithValue(err.message ?? "유저 정보 불러오기 실패");
  }
});

// --------------------------------------------------
// Thunk: 유저 정보 수정
// --------------------------------------------------
export const updateMyPageData = createAsyncThunk<
  string,                    // 성공 시 서버 응답 메시지
  {
    userName: string;
    phone: string;
    email: string;
    password?: string;
  },
  { state: RootState; rejectValue: string }
>("mypage/updateMyPageData", async (updateData, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  if (!token) return thunkAPI.rejectWithValue("토큰이 없습니다.");

  const lgId = parseJwt(token);
  if (!lgId) return thunkAPI.rejectWithValue("잘못된 토큰입니다.");

  try {
    const bodyData: Record<string, string> = {
      lgCeo: updateData.userName,
      lgPhone: updateData.phone,
      lgEmail: updateData.email,
    };

    if (updateData.password) {
      bodyData.lgPw = updateData.password;
    }

    const response = await api.put(`/logistic/mypage/${lgId}`, bodyData);

    return (response.data as string) || "수정 성공";
  } catch (error) {
    const err = error as { message?: string };
    return thunkAPI.rejectWithValue(err.message ?? "수정 실패");
  }
});

// --------------------------------------------------
// Slice 정의
// --------------------------------------------------
const mypageSlice = createSlice({
  name: "mypage",
  initialState,
  reducers: {
    // 수정 성공 여부 초기화 (알림 닫을 때 사용)
    resetUpdateSuccess(state) {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- 유저 정보 조회 ---
      .addCase(fetchMyPageData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(fetchMyPageData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMyPageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "유저 정보 불러오기 실패";
      })

      // --- 유저 정보 업데이트 ---
      .addCase(updateMyPageData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateMyPageData.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(updateMyPageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "수정 실패";
        state.updateSuccess = false;
      });
  },
});

// slice export
export const { resetUpdateSuccess } = mypageSlice.actions;
export default mypageSlice.reducer;
