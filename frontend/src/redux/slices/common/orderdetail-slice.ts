import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api'; 

// 주문 아이템 타입
interface OrderItem {
  oiKey: number;
  pdNum: string;
  pdCategory: string;
  oiProducts: string;
  oiQuantity: number;
  oiPrice: number;
  oiTotal: number;
  [key: string]: any;
}

// 주문 정보 타입
interface OrderInfo {
  orKey: string;
  agencyName: string;
  orDate: string;
  orReserve: string;
  [key: string]: any;
}

// 슬라이스 상태 타입
interface OrderDetailState {
  items: OrderItem[];
  orderInfo: OrderInfo | null;
  loading: boolean;
  error: string | null;
  sortField: keyof OrderItem | '';
  sortOrder: 'asc' | 'desc';
}

// 초기 상태
const initialState: OrderDetailState = {
  items: [],
  orderInfo: null,
  loading: false,
  error: null,
  sortField: 'pdNum',
  sortOrder: 'desc',
};

// 비동기 thunk - 주문 아이템 불러오기
export const fetchOrderItems = createAsyncThunk<OrderItem[], { orKey: string; token: string }>(
  'orderDetail/fetchOrderItems',
  async ({ orKey, token }) => {
    const response = await api.get<OrderItem[]>(`/agencyorder/items/${orKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data ?? [];
  }
);

// 비동기 thunk - 주문 정보 불러오기
export const fetchOrderInfo = createAsyncThunk<OrderInfo, { orKey: string; token: string }>(
  'orderDetail/fetchOrderInfo',
  async ({ orKey, token }) => {
    const response = await api.get<OrderInfo>(`/agencyorder/${orKey}/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data ?? null;
  }
);

const orderDetailSlice = createSlice({
  name: 'orderDetail',
  initialState,
  reducers: {
    setSortField(state, action: PayloadAction<keyof OrderItem>) {
      if (state.sortField === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortOrder = 'asc';
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order items';
      })
      .addCase(fetchOrderInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.orderInfo = action.payload;
      })
      .addCase(fetchOrderInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order info';
      });
  },
});

export const { setSortField, clearError } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
