import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api"; // axios 인스턴스

// 데이터 타입 정의
export interface HeadGraphDataType {
  month: string; // "YYYY-MM"
  order: number;
  status: number;
  region?: string;
  agName?: string;
}

// 대리점 타입 (간략히 필요 데이터만)
export interface AgencyType {
  agAddress?: string;
  agName?: string;
  region?: string;
}

interface HeadGraphState {
  data: HeadGraphDataType[];
  allAgencies: AgencyType[];
  loadingData: boolean;
  loadingAgencies: boolean;
  errorData: string | null;
  errorAgencies: string | null;
}

const initialState: HeadGraphState = {
  data: [],
  allAgencies: [],
  loadingData: false,
  loadingAgencies: false,
  errorData: null,
  errorAgencies: null,
};

// 월별 주문/출고 데이터 조회 thunk
export const fetchMonthlyData = createAsyncThunk<
  HeadGraphDataType[],
  void,
  { rejectValue: string }
>("headGraph/fetchMonthlyData", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<HeadGraphDataType[]>("/dashboard/monthly");
    // 서버 응답 전처리 (월 포맷 등)
    const formatted = response.data.map((d) => {
      let month = d.month;
      if (month && /^\d{4}-\d{1}$/.test(month)) {
        const [y, m] = month.split("-");
        month = `${y}-${m.padStart(2, "0")}`;
      }
      return {
        ...d,
        month,
        order: Number(d.order),
        status: Number(d.status),
      };
    });
    return formatted;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch monthly data");
  }
});

// 대리점 목록 조회 thunk
export const fetchAgencies = createAsyncThunk<
  AgencyType[],
  void,
  { rejectValue: string }
>("headGraph/fetchAgencies", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<AgencyType[]>("/dashboard/agencies");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch agencies");
  }
});


const headGraphSlice = createSlice({
  name: "headGraph",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 월별 데이터
      .addCase(fetchMonthlyData.pending, (state) => {
        state.loadingData = true;
        state.errorData = null;
      })
      .addCase(
        fetchMonthlyData.fulfilled,
        (state, action: PayloadAction<HeadGraphDataType[]>) => {
          state.loadingData = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchMonthlyData.rejected, (state, action) => {
        state.loadingData = false;
        state.errorData = action.payload || "Error fetching monthly data";
      })

      // 대리점 목록
      .addCase(fetchAgencies.pending, (state) => {
        state.loadingAgencies = true;
        state.errorAgencies = null;
      })
      .addCase(
        fetchAgencies.fulfilled,
        (state, action: PayloadAction<AgencyType[]>) => {
          state.loadingAgencies = false;
          state.allAgencies = action.payload;
        }
      )
      .addCase(fetchAgencies.rejected, (state, action) => {
        state.loadingAgencies = false;
        state.errorAgencies = action.payload || "Error fetching agencies";
      });
  },
});

export default headGraphSlice.reducer;
