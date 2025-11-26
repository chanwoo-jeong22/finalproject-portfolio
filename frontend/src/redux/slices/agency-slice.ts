import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/api";

// --- 타입 정의 ---

// 대리점 품목 단위 (각 제품 단위 정보)
interface LineItem {
  id: string;
  pdKey: string; // 제품 고유키
  sku: string;   // 재고 관리 코드
  name: string;  // 제품명
  qty: number;   // 수량
  price: number; // 가격
}

// 주문 데이터 간략 구조
interface Order {
  orDate: string;          // 주문 날짜
  orderNumber?: string;    // 주문 번호 (선택적)
  items?: LineItem[];      // 주문된 품목 목록
  totalAmount?: number;    // 총 금액
  // 필요시 추가 필드 가능
}

// 임시 저장 드래프트 품목 정보
interface Draft {
  id: string;
  pdKey: string;
  qty: number;
  price: number;
  name: string;
}

// slice 상태 구조
interface AgencyState {
  orders: Order[];               // 확정된 주문 리스트
  drafts: Draft[];               // 임시 저장된 주문 리스트
  lineItems: LineItem[];         // 대리점이 취급하는 품목 목록
  registeredItems: LineItem[];   // 확정 전 저장된 주문 품목들
  selectedForAdd: string[];      // 추가할 품목 선택 체크박스 id 목록
  selectedRegistered: string[];  // 확정 주문 품목 선택 체크박스 id 목록
  expectedDate: string;          // 주문 확정 시 도착 예정일
  loading: boolean;              // API 요청 상태 로딩 플래그
  error: string | null;          // 에러 메시지 저장
}

// 초기 상태
const initialState: AgencyState = {
  orders: [],
  drafts: [],
  lineItems: [],
  registeredItems: [],
  selectedForAdd: [],
  selectedRegistered: [],
  expectedDate: "",
  loading: false,
  error: null,
};

// --- 비동기 Thunk 액션들 ---

// 1) 대리점 품목 목록 조회 (agencyId를 받아 API 호출)
export const fetchAgencyProducts = createAsyncThunk<
  LineItem[], // 반환 타입: 품목 배열
  string,     // 파라미터 타입: agencyId
  { rejectValue: string }
>("agency/fetchAgencyProducts", async (agencyId, thunkAPI) => {
  try {
    const response = await api.get(`/agency-items/${agencyId}/products`);
    // API 응답을 내부 LineItem 타입에 맞게 변환
    const normalized = response.data.map((p: any) => ({
      id: p.pdKey,
      pdKey: p.pdKey,
      sku: p.pdNum,
      name: p.pdProducts,
      qty: 1,
      price: p.pdPrice,
    }));
    return normalized;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "대리점 품목 불러오기 실패");
  }
});

// 2) 주문 목록 조회 (확정 주문 전체 조회)
export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "agency/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/agencyorder/full");
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "주문 목록 불러오기 실패");
    }
  }
);

// 3) 임시 저장 (draft) POST - 드래프트 목록 서버 저장
export const saveDraft = createAsyncThunk<Draft[], Draft[], { rejectValue: string }>(
  "agency/saveDraft",
  async (draftItems, thunkAPI) => {
    try {
      const response = await api.post("/agencyorder/draft", draftItems);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "임시 저장 실패");
    }
  }
);

// 4) 주문 확정 POST
interface ConfirmOrderPayload {
  agKey: string;
  items: {
    pdKey: string;
    rdQuantity: number;
    rdPrice: number;
    rdProducts: string;
  }[];
  reserveDate: string;
}
export const confirmOrder = createAsyncThunk<Order, ConfirmOrderPayload, { rejectValue: string }>(
  "agency/confirmOrder",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/agencyorder/confirm", payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "주문 확정 실패");
    }
  }
);

// --- Slice 정의 ---
const agencySlice = createSlice({
  name: "agency",
  initialState,
  reducers: {
    // 체크박스 토글 (추가용)
    toggleSelectForAdd(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedForAdd.includes(id)) {
        state.selectedForAdd = state.selectedForAdd.filter((x) => x !== id);
      } else {
        state.selectedForAdd.push(id);
      }
    },
    // 전체 선택/해제 (추가용)
    toggleSelectAllForAdd(state) {
      if (state.selectedForAdd.length === state.lineItems.length) {
        state.selectedForAdd = [];
      } else {
        state.selectedForAdd = state.lineItems.map((item) => item.id);
      }
    },

    // 체크박스 토글 (확정용)
    toggleSelectRegistered(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedRegistered.includes(id)) {
        state.selectedRegistered = state.selectedRegistered.filter((x) => x !== id);
      } else {
        state.selectedRegistered.push(id);
      }
    },
    // 전체 선택/해제 (확정용)
    toggleSelectAllRegistered(state) {
      if (state.selectedRegistered.length === state.registeredItems.length) {
        state.selectedRegistered = [];
      } else {
        state.selectedRegistered = state.registeredItems.map((item) => item.id);
      }
    },

    // 주문 확정 전 저장된 주문 목록에 품목 추가 (중복 방지)
    addRegisteredItems(state, action: PayloadAction<LineItem[]>) {
      action.payload.forEach((item) => {
        if (!state.registeredItems.find((ri) => ri.id === item.id)) {
          state.registeredItems.push(item);
        }
      });
      // 추가용 체크박스 초기화
      state.selectedForAdd = [];
    },

    // 저장된 주문 품목 수량 변경 (증가 또는 감소)
    updateRegisteredQty(state, action: PayloadAction<{ id: string; delta: number }>) {
      const { id, delta } = action.payload;
      const item = state.registeredItems.find((ri) => ri.id === id);
      if (item) {
        item.qty = Math.max(1, item.qty + delta); // 최소 수량 1 유지
      }
    },

    // 선택된 확정 품목 삭제
    deleteSelectedRegistered(state) {
      state.registeredItems = state.registeredItems.filter(
        (item) => !state.selectedRegistered.includes(item.id)
      );
      // 선택 초기화
      state.selectedRegistered = [];
    },

    // 도착 예정일 설정
    setExpectedDate(state, action: PayloadAction<string>) {
      state.expectedDate = action.payload;
    },
  },

  // 비동기 액션 처리
  extraReducers: (builder) => {
    // 대리점 품목 조회 처리
    builder.addCase(fetchAgencyProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAgencyProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.lineItems = action.payload;
      state.selectedForAdd = [];
    });
    builder.addCase(fetchAgencyProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "대리점 품목 조회 실패";
    });

    // 주문 목록 조회 처리
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "주문 목록 조회 실패";
    });

    // 임시 저장 처리
    builder.addCase(saveDraft.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(saveDraft.fulfilled, (state, action) => {
      state.loading = false;
      // 기존 드래프트에 새로 저장된 드래프트 합침
      state.drafts = [...state.drafts, ...action.payload];
      state.selectedForAdd = [];
    });
    builder.addCase(saveDraft.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "임시 저장 실패";
    });

    // 주문 확정 처리
    builder.addCase(confirmOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(confirmOrder.fulfilled, (state, action) => {
      state.loading = false;
      // 확정된 품목은 등록된 목록에서 제거
      const confirmedIds = action.meta.arg.items.map((i) => i.pdKey);
      state.registeredItems = state.registeredItems.filter(
        (item) => !confirmedIds.includes(item.pdKey)
      );
      state.selectedRegistered = [];
      state.expectedDate = "";
      // 새 확정 주문을 orders 배열에 추가
      state.orders.push(action.payload);
    });
    builder.addCase(confirmOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "주문 확정 실패";
    });
  },
});

// 액션 내보내기
export const {
  toggleSelectForAdd,
  toggleSelectAllForAdd,
  toggleSelectRegistered,
  toggleSelectAllRegistered,
  addRegisteredItems,
  updateRegisteredQty,
  deleteSelectedRegistered,
  setExpectedDate,
} = agencySlice.actions;

export default agencySlice.reducer;
