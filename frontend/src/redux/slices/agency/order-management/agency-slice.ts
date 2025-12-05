import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AgencyState, Draft, LineItem, Order } from "./types";
import {
  fetchAgencyProducts,
  saveDraft,
  confirmOrder,
  deleteOrders,
  fetchAgencyOrders,
  fetchDrafts,
  deleteDrafts,
} from "./thunks";

const initialState: AgencyState = {
  orders: [],
  drafts: [],
  lineItems: [],
  registeredItems: [],
  selectedForAdd: [],
  selectedRegistered: [],
  // 추가: draft 선택 상태
  selectedDrafts: [],
  expectedDate: "",
  loading: false,
  error: null,
};

const agencySlice = createSlice({
  name: "agency",
  initialState,
  reducers: {
    // 기존 리듀서들...
    toggleSelectForAdd(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedForAdd.includes(id)) {
        state.selectedForAdd = state.selectedForAdd.filter((x) => x !== id);
      } else {
        state.selectedForAdd.push(id);
      }
    },
    toggleSelectAllForAdd(state) {
      if (state.selectedForAdd.length === state.lineItems.length) {
        state.selectedForAdd = [];
      } else {
        state.selectedForAdd = state.lineItems.map((item) => item.id);
      }
    },
    clearSelectForAdd(state) {
      state.selectedForAdd = [];
    },
    toggleSelectRegistered(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedRegistered.includes(id)) {
        state.selectedRegistered = state.selectedRegistered.filter((x) => x !== id);
      } else {
        state.selectedRegistered.push(id);
      }
    },
    toggleSelectAllRegistered(state) {
      if (state.selectedRegistered.length === state.registeredItems.length) {
        state.selectedRegistered = [];
      } else {
        state.selectedRegistered = state.registeredItems.map((item) => item.id);
      }
    },
    addRegisteredItems(state, action: PayloadAction<LineItem[]>) {
      action.payload.forEach((item) => {
        if (!state.registeredItems.find((ri) => ri.id === item.id)) {
          state.registeredItems.push(item);
        }
      });
      state.selectedForAdd = [];
    },
    updateRegisteredQty(state, action: PayloadAction<{ id: string; delta: number }>) {
      const { id, delta } = action.payload;
      const item = state.registeredItems.find((ri) => ri.id === id);
      if (item) {
        item.qty = Math.max(1, item.qty + delta);
      }
    },
    deleteSelectedRegistered(state) {
      state.registeredItems = state.registeredItems.filter(
        (item) => !state.selectedRegistered.includes(item.id)
      );
      state.selectedRegistered = [];
    },

    // 도착 예정일 설정
    setExpectedDate(state, action: PayloadAction<string>) {
      state.expectedDate = action.payload;
    },

    // ----------- 여기에 draft 관련 리듀서 추가 -----------

    // draft 개별 선택 토글
    toggleSelectDraft(state, action: PayloadAction<number>) {
      const id = action.payload;
      if (state.selectedDrafts.includes(id)) {
        state.selectedDrafts = state.selectedDrafts.filter((x) => x !== id);
      } else {
        state.selectedDrafts.push(id);
      }
    },

    // draft 전체 선택/해제 토글
    toggleSelectAllDrafts(state) {
      if (state.selectedDrafts.length === state.drafts.length) {
        state.selectedDrafts = [];
      } else {
        state.selectedDrafts = state.drafts.map((item) => item.rdKey);
      }
    },

    // draft 수량 증가
    incrementDraftQty(state, action: PayloadAction<number>) {
      const id = action.payload;
      const draft = state.drafts.find((d) => d.rdKey === id);
      if (draft) {
        draft.rdQuantity += 1;
        draft.rdTotal = draft.rdQuantity * draft.rdPrice;
      }
    },

    // draft 수량 감소 (최소 1)
    decrementDraftQty(state, action: PayloadAction<number>) {
      const id = action.payload;
      const draft = state.drafts.find((d) => d.rdKey === id);
      if (draft) {
        draft.rdQuantity = Math.max(1, draft.rdQuantity - 1);
        draft.rdTotal = draft.rdQuantity * draft.rdPrice;
      }
    },

    // draft 선택 초기화
    clearSelectDrafts(state) {
      state.selectedDrafts = [];
    },
  },
  extraReducers: (builder) => {
    // 기존 extraReducers 유지...

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

    builder.addCase(saveDraft.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(saveDraft.fulfilled, (state, action) => {
      state.loading = false;
      state.drafts = [...state.drafts, ...action.payload];
      state.selectedForAdd = [];
    });
    builder.addCase(saveDraft.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "임시 저장 실패";
    });

    builder.addCase(confirmOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(confirmOrder.fulfilled, (state, action) => {
      state.loading = false;
      const confirmedIds = action.meta.arg.items.map((i) => i.pdKey);
      state.registeredItems = state.registeredItems.filter(
        (item) => !confirmedIds.includes(item.pdKey)
      );
      state.selectedRegistered = [];
      state.expectedDate = "";
      state.orders.push(action.payload);
    });
    builder.addCase(confirmOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "주문 확정 실패";
    });

    // 삭제 thunk (기존)
    builder.addCase(deleteOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteOrders.fulfilled, (state, action) => {
      state.loading = false;
      const deletedIds = action.payload;
      state.orders = state.orders.filter((order) => !deletedIds.includes(order.orKey));
    });
    builder.addCase(deleteOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "주문 삭제 실패";
    });

    builder.addCase(fetchAgencyOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAgencyOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchAgencyOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "주문 목록 불러오기 실패";
    });

    // --------- draft 관련 extraReducers 추가 ---------
    builder.addCase(fetchDrafts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDrafts.fulfilled, (state, action) => {
      state.loading = false;
      state.drafts = action.payload;
      state.selectedDrafts = [];
    });
    builder.addCase(fetchDrafts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "임시 저장 목록 불러오기 실패";
    });

    builder.addCase(deleteDrafts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteDrafts.fulfilled, (state, action) => {
      state.loading = false;
      const deletedIds = action.payload;
      state.drafts = state.drafts.filter((draft) => !deletedIds.includes(draft.rdKey));
      state.selectedDrafts = [];
    });
    builder.addCase(deleteDrafts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "임시 저장 삭제 실패";
    });
  },
});

export const {
  toggleSelectForAdd,
  toggleSelectAllForAdd,
  clearSelectForAdd,
  toggleSelectRegistered,
  toggleSelectAllRegistered,
  addRegisteredItems,
  updateRegisteredQty,
  deleteSelectedRegistered,
  setExpectedDate,

  // draft 액션들
  toggleSelectDraft,
  toggleSelectAllDrafts,
  incrementDraftQty,
  decrementDraftQty,
  clearSelectDrafts,
} = agencySlice.actions;

export default agencySlice.reducer;
