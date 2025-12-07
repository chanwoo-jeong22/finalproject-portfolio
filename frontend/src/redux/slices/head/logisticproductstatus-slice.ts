import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";

/** 물류 상품 타입 */
export interface LogisticProduct {
    lgName: string;
    pdNum: string;
    pdProducts: string;
    pdPrice: number;
    stock: number;
    lpStore: string;
}

/** AxiosError 형태 타입을 직접 정의  */
interface AxiosErrorShape {
    response?: {
        data?: unknown;
    };
}

/** Slice 상태 타입 */
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

// 🔥 물류 상품 GET
export const fetchLogisticProducts = createAsyncThunk<
    LogisticProduct[],
    void,
    { rejectValue: string }
>(
    "logisticProduct/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/logisticproducts");
            return response.data;
        } catch (err) {
            console.error("fetchLogisticProducts error:", err);

            let message = "데이터 로딩 실패";

            // 🔍 Error 객체인 경우
            if (err instanceof Error) {
                message = err.message;
            }
            // 🔍 AxiosError 형태 체크
            else if (isAxiosError(err)) {
                const data = err.response?.data;

                if (typeof data === "string") {
                    message = data;
                } else if (
                    typeof data === "object" &&
                    data !== null &&
                    "message" in data &&
                    typeof (data as { message: unknown }).message === "string"
                ) {
                    message = (data as { message: string }).message;
                }
            }

            return rejectWithValue(message);
        }
    }
);

function isAxiosError(error: unknown): error is AxiosErrorShape {
    return (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as Record<string, unknown>).response === "object"
    );
}

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
                state.error = action.payload ?? "에러 발생";
            });
    },
});

export default logisticProductSlice.reducer;
