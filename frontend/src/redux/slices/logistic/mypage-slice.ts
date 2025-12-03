import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";
import type { RootState } from "../../store";

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

const initialState: MyPageState = {
  loading: false,
  error: null,
  data: null,
  updateSuccess: false,
};

// 토큰에서 sub 추출 유틸
function parseJwt(token: string): string | null {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    const json = JSON.parse(payload);
    return json.sub ?? null;
  } catch {
    return null;
  }
}

// 유저 정보 조회 Thunk
export const fetchMyPageData = createAsyncThunk<
  MyPageState["data"],
  void,
  { state: RootState; rejectValue: string }
>("mypage/fetchMyPageData", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  if (!token) return thunkAPI.rejectWithValue("토큰이 없습니다.");

  const lgId = parseJwt(token);
  if (!lgId) return thunkAPI.rejectWithValue("잘못된 토큰입니다.");

  try {
    const response = await api.get(`/logistic/mypage/${lgId}`);
    const data = response.data;
    return {
      logisticName: data.lgName || "",
      userName: data.lgCeo || "",
      userId: data.lgId || lgId,
      address: data.lgAddress || "",
      addressDetail: data.lgZip || "",
      phone: data.lgPhone || "",
      email: data.lgEmail || "",
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "유저 정보 불러오기 실패");
  }
});

// 유저 정보 수정 Thunk
export const updateMyPageData = createAsyncThunk<
  string,
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
    const bodyData: any = {
      lgCeo: updateData.userName,
      lgPhone: updateData.phone,
      lgEmail: updateData.email,
    };
    if (updateData.password) bodyData.lgPw = updateData.password;

    const response = await api.put(`/logistic/mypage/${lgId}`, bodyData);
    return response.data || "수정 성공";
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "수정 실패");
  }
});

const mypageSlice = createSlice({
  name: "mypage",
  initialState,
  reducers: {
    resetUpdateSuccess(state) {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
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

      // update
      .addCase(updateMyPageData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateMyPageData.fulfilled, (state, action) => {
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

export const { resetUpdateSuccess } = mypageSlice.actions;
export default mypageSlice.reducer;
