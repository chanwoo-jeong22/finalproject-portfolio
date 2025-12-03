import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";
import type { RootState } from "../../store";

// NoticeData 타입 정의 (Notice 컴포넌트에서 기대하는 타입에 맞춤)
export interface NoticeData {
  ntKey: number;
  ntCategory: string;
  ntContent: string;
  // 필요 시 아래 주석 해제
  // ntCode?: number;
  // startDate?: string;
}

interface ScheduleItem {
  title: string;
}

interface LogisticState {
  notices: NoticeData[];
  schedulesByDate: Record<string, ScheduleItem[]>;
  loading: boolean;
  error: string | null;
}

const initialState: LogisticState = {
  notices: [],
  schedulesByDate: {},
  loading: false,
  error: null,
};

// 공지사항 조회 Thunk
export const fetchNotices = createAsyncThunk<
  NoticeData[],
  void,
  { rejectValue: string }
>("logistic/fetchNotices", async (_, thunkAPI) => {
  try {
    const response = await api.get("/notices", { params: { codes: [0, 2] } });
    const data = response.data?.data ?? response.data ?? [];
    // NoticeData 타입에 맞게 매핑
    return data.map((n: any) => ({
      ntKey: n.ntKey,
      ntCategory: n.ntCategory,
      ntContent: n.ntContent,
      // ntCode: n.ntCode,         // 필요하면 추가
      // startDate: n.startDate,   // 필요하면 추가
    }));
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "공지사항 불러오기 실패");
  }
});

// 일정표 조회 Thunk
export const fetchSchedules = createAsyncThunk<
  Record<string, ScheduleItem[]>,
  { from: string; to: string },
  { state: RootState; rejectValue: string }
>("logistic/fetchSchedules", async ({ from, to }, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  if (!token) return thunkAPI.rejectWithValue("토큰이 없습니다.");

  try {
    const response = await api.get("/agencyorder/schedule/mine", {
      params: { from, to },
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data?.data ?? response.data ?? [];
    const byDate: Record<string, ScheduleItem[]> = {};
    data.forEach((r: any) => {
      const iso = String(r.orReserve ?? r.or_reserve ?? "").slice(0, 10);
      if (!iso) return;
      const dateKey = iso.replace(/-/g, ".");
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push({ title: String(r.agName ?? r.ag_Name ?? "") });
    });
    return byDate;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "일정표 불러오기 실패");
  }
});

const logisticSlice = createSlice({
  name: "logistic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "공지사항 불러오기 실패";
      })

      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedulesByDate = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "일정표 불러오기 실패";
      });
  },
});

export default logisticSlice.reducer;
