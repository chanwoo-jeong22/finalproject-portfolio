import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";

export interface Order {
  orKey: number;
  orderNumber: string;
  agencyName: string;
  orStatus: string;
  displayStatus: string;
  orProducts: string;
  orQuantity: number;
  orPrice: number;
  orDate: string;
  orReserve: string;
}

export interface SearchParams {
  orderNo: string;
  productName: string;
  agency: string;
  status: string;
  orderDateFrom: string;
  orderDateTo: string;
  deliveryDateFrom: string;
  deliveryDateTo: string;
  quantityMin: string;
  quantityMax: string;
  totalMin: string;
  totalMax: string;
}

interface OrderCheckState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrderIds: number[];
  searchParams: SearchParams;
  sortField: keyof Order;
  sortOrder: "asc" | "desc";
}

const initialState: OrderCheckState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrderIds: [],
  searchParams: {
    orderNo: "",
    productName: "",
    agency: "",
    status: "",
    orderDateFrom: "",
    orderDateTo: "",
    deliveryDateFrom: "",
    deliveryDateTo: "",
    quantityMin: "",
    quantityMax: "",
    totalMin: "",
    totalMax: "",
  },
  sortField: "orKey",
  sortOrder: "desc",
};

// Async thunk: 주문 리스트 조회
export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { state: { ordercheck: OrderCheckState } }
>("ordercheck/fetchOrders", async (_, thunkAPI) => {
  const state = thunkAPI.getState().ordercheck;
  try {
    const response = await api.get("/agencyorder/search", { params: state.searchParams });
    // 서버에서 받은 데이터 가공
    const mappedOrders: Order[] = response.data.map((order: any) => ({
      ...order,
      displayStatus: order.orStatus === "배송 준비중" ? "승인 완료" : order.orStatus,
      agencyName: order.agencyName || "N/A",
      orPrice: order.orPrice ? Number(order.orPrice) : 0, 
    }));

    return mappedOrders;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch orders");
  }
});

// Async thunk: 주문 확정
export const confirmOrders = createAsyncThunk<void, number[], { state: { ordercheck: OrderCheckState } }>(
  "ordercheck/confirmOrders",
  async (orderIds, thunkAPI) => {
    try {
      await api.post("/agencyorder/confirm/order", { orderIds });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to confirm orders");
    }
  }
);

const orderCheckSlice = createSlice({
  name: "ordercheck",
  initialState,
  reducers: {
    setSearchParams(state, action: PayloadAction<Partial<SearchParams>>) {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    toggleSelectOrder(state, action: PayloadAction<number>) {
      if (state.selectedOrderIds.includes(action.payload)) {
        state.selectedOrderIds = state.selectedOrderIds.filter(id => id !== action.payload);
      } else {
        state.selectedOrderIds.push(action.payload);
      }
    },
    toggleSelectAll(state) {
      const selectableOrders = state.orders.filter(o => o.orStatus !== "배송 완료");
      if (state.selectedOrderIds.length === selectableOrders.length) {
        state.selectedOrderIds = [];
      } else {
        state.selectedOrderIds = selectableOrders.map(o => o.orKey);
      }
    },
    setSort(state, action: PayloadAction<{ field: keyof Order; order: "asc" | "desc" }>) {
      const { field, order } = action.payload;
      state.sortField = field;
      state.sortOrder = order;
      state.orders = [...state.orders].sort((a, b) => {
        if (a[field] < b[field]) return order === "asc" ? -1 : 1;
        if (a[field] > b[field]) return order === "asc" ? 1 : -1;
        return 0;
      });
    },
    clearSelected(state) {
      state.selectedOrderIds = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        // 기본 정렬 유지
        state.orders = [...state.orders].sort((a, b) => {
          if (a[state.sortField] < b[state.sortField]) return state.sortOrder === "asc" ? -1 : 1;
          if (a[state.sortField] > b[state.sortField]) return state.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(confirmOrders.fulfilled, (state) => {
        // 주문 확정 후 선택 목록 초기화
        state.selectedOrderIds = [];
      })
      .addCase(confirmOrders.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSearchParams, toggleSelectOrder, toggleSelectAll, setSort, clearSelected } = orderCheckSlice.actions;
export default orderCheckSlice.reducer;
