import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";
import { RootState } from "../../store";

// 재고 Row 타입
export interface InventoryRow {
  id: number | string;
  type: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

// 조회 파라미터 타입
export interface InventoryQuery {
  pdNum?: string;
  pdProducts?: string;
  priceFrom?: string;
  priceTo?: string;
  stockFrom?: string;
  stockTo?: string;
}

// Thunk — 재고 목록 조회
export const fetchInventory = createAsyncThunk<
  InventoryRow[],      // 성공 시 payload 타입
  InventoryQuery,      // 파라미터 타입
  { state: RootState }
>("inventory/fetch", async (params, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const token = state.auth.token;

    const res = await api.get("/logisticproducts/mine", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    const raw = res.data;
    const list = raw?.data ?? raw?.content ?? (Array.isArray(raw) ? raw : []);

    const mapped: InventoryRow[] = list.map((r: any, i: number) => ({
      id: r.lpKey ?? r.pdKey ?? r.id ?? i + 1,
      type: r.lpType ?? r.pdCategory ?? "미등록",
      sku: r.pdNum ?? r.sku ?? "",
      name: r.pdProducts ?? r.productName ?? "",
      price: Number(r.lpPrice ?? r.pdPrice ?? r.price ?? 0),
      stock: Number(r.lpStock ?? r.pdStock ?? r.stock ?? 0),
    }));

    return mapped;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.status || "ERROR");
  }
});

interface InventoryState {
  rows: InventoryRow[];
  originalRows: InventoryRow[];
  loading: boolean;
  error: string | null;
  sortField: string;
  sortOrder: "asc" | "desc";
}

const initialState: InventoryState = {
  rows: [],
  originalRows: [],
  loading: false,
  error: null,
  sortField: "sku",
  sortOrder: "asc",
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    resetFilters(state) {
      state.rows = state.originalRows;
    },
    setRows(state, action: PayloadAction<InventoryRow[]>) {
      state.rows = action.payload;
    },
    setSort(state, action: PayloadAction<{ field: string; order: "asc" | "desc" }>) {
      state.sortField = action.payload.field;
      state.sortOrder = action.payload.order;
    },
  },
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

export const { setRows, resetFilters, setSort } = inventorySlice.actions;

export default inventorySlice.reducer;
