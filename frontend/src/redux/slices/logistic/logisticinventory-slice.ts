import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";
import { RootState } from "../../store";

// --------------------------------------
// ❗ 재고 Row 타입
// --------------------------------------
export interface InventoryRow {
  id: number | string;
  type: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

// --------------------------------------
// ❗ 조회 파라미터 타입
// --------------------------------------
export interface InventoryQuery {
  pdNum?: string;
  pdProducts?: string;
  priceFrom?: string;
  priceTo?: string;
  stockFrom?: string;
  stockTo?: string;
}

// --------------------------------------
// Thunk — 재고 목록 조회
// --------------------------------------
export const fetchInventory = createAsyncThunk<
  InventoryRow[],      // 성공 시 payload 타입
  InventoryQuery,      // Thンク의 전달 파라미터 타입
  { state: RootState }
>("inventory/fetch", async (params, thunkAPI) => {
  try {
    // Redux 상태에서 token 읽기
    const state = thunkAPI.getState();
    const token = state.auth.token;

    // API 호출
    const res = await api.get("/logisticproducts/mine", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    // res.data 의 정체가 불명확하므로 string → 안전한 narrowing
    const raw: string = res.data;

    // raw가 객체인지 배열인지 안전하게 판별
    let list: string = [];

    if (raw && typeof raw === "object") {
      // raw.data 또는 raw.content 를 우선 사용
      const r = raw as Record<string, string>;
      list =
        r.data ??
        r.content ??
        (Array.isArray(raw) ? raw : []);
    }

    // list는 마지막에만 배열이라고 단언 (검증 완료 상태)
    const mapped: InventoryRow[] = (list as Array<Record<string, string>>).map(
      (r, i) => ({
        id: (r.lpKey ??
          r.pdKey ??
          r.id ??
          i + 1) as number | string,

        type: (r.lpType ??
          r.pdCategory ??
          "미등록") as string,

        sku: (r.pdNum ?? r.sku ?? "") as string,

        name: (r.pdProducts ??
          r.productName ??
          "") as string,

        price: Number(
          r.lpPrice ??
            r.pdPrice ??
            r.price ??
            0
        ),

        stock: Number(
          r.lpStock ??
            r.pdStock ??
            r.stock ??
            0
        ),
      })
    );

    return mapped;
  } catch (err) {
    const error = err as {
      response?: { status?: number };
    };

    return thunkAPI.rejectWithValue(
      error.response?.status ?? "ERROR"
    );
  }
});

// --------------------------------------
// Slice state 타입 정의
// --------------------------------------
interface InventoryState {
  rows: InventoryRow[];
  originalRows: InventoryRow[];
  loading: boolean;
  error: string | null;
  sortField: string;
  sortOrder: "asc" | "desc";
}

// --------------------------------------
// 초기 상태
// --------------------------------------
const initialState: InventoryState = {
  rows: [],
  originalRows: [],
  loading: false,
  error: null,
  sortField: "sku",
  sortOrder: "asc",
};

// --------------------------------------
// Slice 정의
// --------------------------------------
const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // 필터 초기화 → 원본 데이터로 복원
    resetFilters(state) {
      state.rows = state.originalRows;
    },

    // 테이블 데이터 외부에서 직접 세팅
    setRows(state, action: PayloadAction<InventoryRow[]>) {
      state.rows = action.payload;
    },

    // 정렬 필드/방향 설정
    setSort(
      state,
      action: PayloadAction<{ field: string; order: "asc" | "desc" }>
    ) {
      state.sortField = action.payload.field;
      state.sortOrder = action.payload.order;
    },
  },

  // 비동기 처리 상태 변화
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload;
        state.originalRows = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = "Request failed: " + action.payload;
      });
  },
});

// --------------------------------------
// 액션 + 리듀서 export
// --------------------------------------
export const { setRows, resetFilters, setSort } = inventorySlice.actions;
export default inventorySlice.reducer;
