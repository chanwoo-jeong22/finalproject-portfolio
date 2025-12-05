import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";
import type { RootState } from "../../store";

export interface NoticeData {
  ntKey: number;
  ntCategory: string;
  ntContent: string;
}

interface ScheduleItem {
  title: string;
}

interface LogisticState {
  notices: NoticeData[];
  schedulesByDate: Record<string, ScheduleItem[]>;
  noticesLoading: boolean;
  noticesError: string | null;
  schedulesLoading: boolean;
  schedulesError: string | null;
}

const initialState: LogisticState = {
  notices: [],
  schedulesByDate: {},
  noticesLoading: false,
  noticesError: null,
  schedulesLoading: false,
  schedulesError: null,
};

export const fetchNotices = createAsyncThunk<
  NoticeData[],
  void,
  { rejectValue: string }
>("logistic/fetchNotices", async (_, thunkAPI) => {
  try {
    const response = await api.get("/notices", { params: { codes: [0, 2] } });
    const data = response.data?.data ?? response.data ?? [];
    return data.map((n: any) => ({
      ntKey: n.ntKey,
      ntCategory: n.ntCategory,
      ntContent: n.ntContent,
    }));
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "공지사항 불러오기 실패");
  }
});

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
      // fetchNotices
      .addCase(fetchNotices.pending, (state) => {
        state.noticesLoading = true;
        state.noticesError = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.noticesLoading = false;
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.noticesLoading = false;
        state.noticesError = action.payload ?? "공지사항 불러오기 실패";
      })

      // fetchSchedules
      .addCase(fetchSchedules.pending, (state) => {
        state.schedulesLoading = true;
        state.schedulesError = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.schedulesLoading = false;
        state.schedulesByDate = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.schedulesLoading = false;
        state.schedulesError = action.payload ?? "일정표 불러오기 실패";
      });
  },
});

export default logisticSlice.reducer;
