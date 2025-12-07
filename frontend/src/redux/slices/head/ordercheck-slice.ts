import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* -------------------------
 * 주문(Order) 타입 정의
 * 서버에서 넘어오는 주문 데이터 형식
 * ------------------------- */
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

/* -------------------------
 * 검색 파라미터 타입 정의
 * ------------------------- */
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

/* -------------------------
 * Slice 전체 State 타입 정의
 * ------------------------- */
interface OrderCheckState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrderIds: number[];
  searchParams: SearchParams;
  sortField: keyof Order;
  sortOrder: "asc" | "desc";
}

/* -------------------------
 * 초기 상태값
 * ------------------------- */
const initialState: OrderCheckState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrderIds: [],
  searchParams: {
    orderNo: "",
    productName: "",
    agency: "",
    status: "승인 대기중",
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

/* =========================================================
 * ✔ AsyncThunk: 주문 리스트 조회
 * ========================================================= */
export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { state: { ordercheck: OrderCheckState } }
>("ordercheck/fetchOrders", async (_, thunkAPI) => {
  const state = thunkAPI.getState().ordercheck;

  try {
    // response.data 형식을 Order[]로 명확히 지정
    const response = await api.get<Order[]>("/agencyorder/search", {
      params: state.searchParams,
    });

    // 서버에서 받은 Order[]를 매핑하여 displayStatus 등 추가 처리
    const mappedOrders: Order[] = response.data.map((order) => ({
      ...order,
      displayStatus:
        order.orStatus === "배송 준비중" ? "승인 완료" : order.orStatus,
      agencyName: order.agencyName || "N/A",
      orPrice: Number(order.orPrice ?? 0),
    }));

    return mappedOrders;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
 * ✔ AsyncThunk: 주문 확정
 * ========================================================= */
export const confirmOrders = createAsyncThunk<
  void,
  number[],
  { state: { ordercheck: OrderCheckState } }
>("ordercheck/confirmOrders", async (orderIds, thunkAPI) => {
  try {
    await api.post("/agencyorder/confirm/order", { orderIds });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to confirm orders";
    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
 * ✔ Slice 정의
 * ========================================================= */
const orderCheckSlice = createSlice({
  name: "ordercheck",
  initialState,
  reducers: {
    // 검색 파라미터 업데이트
    setSearchParams(state, action: PayloadAction<Partial<SearchParams>>) {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },

    // 단일 선택 토글
    toggleSelectOrder(state, action: PayloadAction<number>) {
      if (state.selectedOrderIds.includes(action.payload)) {
        state.selectedOrderIds = state.selectedOrderIds.filter(
          (id) => id !== action.payload
        );
      } else {
        state.selectedOrderIds.push(action.payload);
      }
    },

    // 전체 선택 토글
    toggleSelectAll(state) {
      const selectableOrders = state.orders.filter(
        (o) => o.orStatus !== "배송 완료"
      );

      if (state.selectedOrderIds.length === selectableOrders.length) {
        state.selectedOrderIds = [];
      } else {
        state.selectedOrderIds = selectableOrders.map((o) => o.orKey);
      }
    },

    // 정렬 변경
    setSort(
      state,
      action: PayloadAction<{ field: keyof Order; order: "asc" | "desc" }>
    ) {
      const { field, order } = action.payload;
      state.sortField = field;
      state.sortOrder = order;

      state.orders = [...state.orders].sort((a, b) => {
        if (a[field] < b[field]) return order === "asc" ? -1 : 1;
        if (a[field] > b[field]) return order === "asc" ? 1 : -1;
        return 0;
      });
    },

    // 선택 초기화
    clearSelected(state) {
      state.selectedOrderIds = [];
    },
  },

  /* -------------------------
   * extraReducers
   * ------------------------- */
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;

        // 기존 정렬 유지 적용
        state.orders = [...state.orders].sort((a, b) => {
          if (a[state.sortField] < b[state.sortField])
            return state.sortOrder === "asc" ? -1 : 1;
          if (a[state.sortField] > b[state.sortField])
            return state.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(confirmOrders.fulfilled, (state) => {
        state.selectedOrderIds = [];
      })
      .addCase(confirmOrders.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchParams,
  toggleSelectOrder,
  toggleSelectAll,
  setSort,
  clearSelected,
} = orderCheckSlice.actions;

export default orderCheckSlice.reducer;
