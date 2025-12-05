import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';

// 주문 아이템 타입 정의
interface OrderItem {
  oiKey: number;           // 주문 아이템 고유 키
  pdNum: string;           // 상품 번호
  pdCategory: string;      // 상품 카테고리
  oiProducts: string;      // 상품명
  oiQuantity: number;      // 수량
  oiPrice: number;         // 단가
  oiTotal: number;         // 총액
  // 추가적인 임의 필드도 받을 수 있음 (가급적 최소화 권장)
  [key: string]: unknown;
}

// 주문 정보 타입 정의
interface OrderInfo {
  orKey: string;           // 주문 키
  agencyName: string;      // 대리점명
  orDate: string;          // 주문 날짜
  orReserve: string;       // 예약 날짜
  [key: string]: unknown;
}

// 슬라이스 상태 타입 정의
interface OrderDetailState {
  items: OrderItem[];            // 주문 아이템 목록
  orderInfo: OrderInfo | null;   // 주문 기본 정보
  loading: boolean;              // 로딩 상태 플래그
  error: string | null;          // 에러 메시지
  sortField: keyof OrderItem | '';  // 정렬 대상 필드
  sortOrder: 'asc' | 'desc';     // 정렬 순서
}

// 초기 상태 값
const initialState: OrderDetailState = {
  items: [],
  orderInfo: null,
  loading: false,
  error: null,
  sortField: 'pdNum',
  sortOrder: 'desc',
};

// 주문 아이템 목록을 서버에서 불러오는 비동기 thunk
export const fetchOrderItems = createAsyncThunk<
  OrderItem[],
  { orKey: string; token: string }
>(
  'orderDetail/fetchOrderItems',
  async ({ orKey, token }) => {
    // API 호출: 주문 아이템 목록 조회
    const response = await api.get<OrderItem[]>(`/agencyorder/items/${orKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 데이터가 없으면 빈 배열 반환
    return response.data ?? [];
  }
);

// 주문 기본 정보를 서버에서 불러오는 비동기 thunk
export const fetchOrderInfo = createAsyncThunk<
  OrderInfo,
  { orKey: string; token: string }
>(
  'orderDetail/fetchOrderInfo',
  async ({ orKey, token }) => {
    // API 호출: 주문 기본 정보 조회
    const response = await api.get<OrderInfo>(`/agencyorder/${orKey}/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 데이터가 없으면 null 반환 (초기값에 맞춤)
    return response.data ?? null;
  }
);

const orderDetailSlice = createSlice({
  name: 'orderDetail',
  initialState,
  reducers: {
    /**
     * 정렬 필드를 설정하는 리듀서
     * - 동일 필드 클릭 시 정렬 순서 토글
     * - 다른 필드 클릭 시 정렬 필드 변경 및 오름차순 초기화
     */
    setSortField(state, action: PayloadAction<keyof OrderItem>) {
      if (state.sortField === action.payload) {
        // 같은 필드를 다시 클릭하면 정렬 방향 반전
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // 새로운 필드 선택 시 오름차순 초기화
        state.sortField = action.payload;
        state.sortOrder = 'asc';
      }
    },
    /**
     * 에러 메시지를 초기화하는 리듀서
     */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 주문 아이템 목록 조회 pending
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // 주문 아이템 목록 조회 성공
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      // 주문 아이템 목록 조회 실패
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch order items';
      })

      // 주문 기본 정보 조회 pending
      .addCase(fetchOrderInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // 주문 기본 정보 조회 성공
      .addCase(fetchOrderInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.orderInfo = action.payload;
      })
      // 주문 기본 정보 조회 실패
      .addCase(fetchOrderInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch order info';
      });
  },
});

export const { setSortField, clearError } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
