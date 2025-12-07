import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";
import type { RootState } from "../../store";

/* ---------------------------
 * 📌 공지사항 타입 정의
 * --------------------------- */
export interface NoticeData {
  ntKey: number;
  ntCategory: string;
  ntContent: string;
}

/* ---------------------------
 * 📌 일정표 아이템 타입 정의
 * --------------------------- */
interface ScheduleItem {
  title: string;
}

/* ---------------------------
 * 📌 AxiosError 형태 타입
 * --------------------------- */
interface AxiosErrorShape {
  response?: {
    data?: unknown;
  };
}

/* ---------------------------
 * 📌 Slice State 타입
 * --------------------------- */
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

/* ----------------------------------------------------
 * 🔥 타입가드: 에러가 AxiosError 형태인지 판별
 * ---------------------------------------------------- */
function isAxiosError(error: unknown): error is AxiosErrorShape {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as Record<string, unknown>).response === "object"
  );
}

/* ----------------------------------------------------
 * 🔥 공지사항 목록 GET
 * ---------------------------------------------------- */
export const fetchNotices = createAsyncThunk<
  NoticeData[],
  void,
  { rejectValue: string }
>("logistic/fetchNotices", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/notices", { params: { codes: [0, 2] } });
    const list: unknown = response.data?.data ?? response.data ?? [];

    // 안전한 매핑을 위해 unknown 배열 검사
    if (!Array.isArray(list)) return [];

    return list
      .filter((n): n is Record<string, unknown> => typeof n === "object" && n !== null)
      .map((n) => ({
        ntKey: Number(n.ntKey ?? 0),
        ntCategory: String(n.ntCategory ?? ""),
        ntContent: String(n.ntContent ?? ""),
      }));
  } catch (error) {
    let message = "공지사항 불러오기 실패";

    // Error 객체인 경우
    if (error instanceof Error) {
      message = error.message;
    }
    // AxiosError 형태인 경우
    else if (isAxiosError(error)) {
      const data = error.response?.data;
      if (typeof data === "string") message = data;
      else if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
      ) {
        message = (data as { message: string }).message;
      }
    }

    return rejectWithValue(message);
  }
});

/* ----------------------------------------------------
 * 🔥 일정표 GET
 * ---------------------------------------------------- */
export const fetchSchedules = createAsyncThunk<
  Record<string, ScheduleItem[]>,
  { from: string; to: string },
  { state: RootState; rejectValue: string }
>("logistic/fetchSchedules", async ({ from, to }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue("토큰이 없습니다.");

  try {
    const response = await api.get("/agencyorder/schedule/mine", {
      params: { from, to },
      headers: { Authorization: `Bearer ${token}` },
    });

    const rawList: unknown = response.data?.data ?? response.data ?? [];

    // unknown → safe array check
    if (!Array.isArray(rawList)) return {};

    const schedules: Record<string, ScheduleItem[]> = {};

    rawList
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .forEach((r) => {
        // 날짜 필드 통합 처리
        const rawDate = String(r.orReserve ?? r.or_reserve ?? "");
        const iso = rawDate.slice(0, 10); // YYYY-MM-DD

        if (!iso) return;

        const key = iso.replace(/-/g, ".");
        if (!schedules[key]) schedules[key] = [];

        schedules[key].push({
          title: String(r.agName ?? r.ag_Name ?? ""),
        });
      });

    return schedules;
  } catch (error) {
    let message = "일정표 불러오기 실패";

    // Error 객체
    if (error instanceof Error) {
      message = error.message;
    }
    // AxiosError 형태
    else if (isAxiosError(error)) {
      const data = error.response?.data;

      if (typeof data === "string") message = data;
      else if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
      ) {
        message = (data as { message: string }).message;
      }
    }

    return rejectWithValue(message);
  }
});

/* ----------------------------------------------------
 * 📌 Slice 본문
 * ---------------------------------------------------- */
const logisticSlice = createSlice({
  name: "logistic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 공지사항
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

      // 일정표
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
