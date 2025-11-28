import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AgencyState, LineItem } from "./types";
import { fetchAgencyProducts, saveDraft, confirmOrder } from "./thunks";

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

const agencySlice = createSlice({
    name: "agency",
    initialState,
    reducers: {
        toggleSelectForAdd(state, action: PayloadAction<string>) {
            const id = action.payload;
            if (state.selectedForAdd.includes(id)) {
                state.selectedForAdd = state.selectedForAdd.filter(x => x !== id);
            } else {
                state.selectedForAdd.push(id);
            }
        },
        toggleSelectAllForAdd(state) {
            if (state.selectedForAdd.length === state.lineItems.length) {
                state.selectedForAdd = [];
            } else {
                state.selectedForAdd = state.lineItems.map(item => item.id);
            }
        },
        toggleSelectRegistered(state, action: PayloadAction<string>) {
            const id = action.payload;
            if (state.selectedRegistered.includes(id)) {
                state.selectedRegistered = state.selectedRegistered.filter(x => x !== id);
            } else {
                state.selectedRegistered.push(id);
            }
        },
        toggleSelectAllRegistered(state) {
            if (state.selectedRegistered.length === state.registeredItems.length) {
                state.selectedRegistered = [];
            } else {
                state.selectedRegistered = state.registeredItems.map(item => item.id);
            }
        },
        addRegisteredItems(state, action: PayloadAction<LineItem[]>) {
            action.payload.forEach(item => {
                if (!state.registeredItems.find(ri => ri.id === item.id)) {
                    state.registeredItems.push(item);
                }
            });
            state.selectedForAdd = [];
        },
        updateRegisteredQty(state, action: PayloadAction<{ id: string; delta: number }>) {
            const { id, delta } = action.payload;
            const item = state.registeredItems.find(ri => ri.id === id);
            if (item) {
                item.qty = Math.max(1, item.qty + delta);
            }
        },
        deleteSelectedRegistered(state) {
            state.registeredItems = state.registeredItems.filter(
                item => !state.selectedRegistered.includes(item.id)
            );
            state.selectedRegistered = [];
        },
        setExpectedDate(state, action: PayloadAction<string>) {
            state.expectedDate = action.payload;
        },
    },
    extraReducers: (builder) => {
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
            const confirmedIds = action.meta.arg.items.map(i => i.pdKey);
            state.registeredItems = state.registeredItems.filter(
                item => !confirmedIds.includes(item.pdKey)
            );
            state.selectedRegistered = [];
            state.expectedDate = "";
            state.orders.push(action.payload);
        });
        builder.addCase(confirmOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "주문 확정 실패";
        });
    },
});

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
