import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";

export interface LogisticProduct {
    lgName: string;
    pdNum: string;
    pdProducts: string;
    pdPrice: number;
    stock: number;
    lpStore: string;
}

interface LogisticProductState {
    products: LogisticProduct[];
    loading: boolean;
    error: string | null;
}

const initialState: LogisticProductState = {
    products: [],
    loading: false,
    error: null,
};

// 🔥 물류 상품 목록 GET
export const fetchLogisticProducts = createAsyncThunk(
    "logisticProduct/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/logisticproducts");
            return response.data; // 백엔드가 배열로 보내고 있음
        } catch (err: any) {
            console.error("fetchLogisticProducts error:", err);
            return rejectWithValue(err.response?.data || "데이터 로딩 실패");
        }
    }
);

const logisticProductSlice = createSlice({
    name: "logisticProduct",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchLogisticProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchLogisticProducts.fulfilled,
                (state, action: PayloadAction<LogisticProduct[]>) => {
                    state.loading = false;
                    state.products = action.payload;
                }
            )
            .addCase(fetchLogisticProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default logisticProductSlice.reducer;
