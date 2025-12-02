import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';

export interface Product {
  lpKey: number;
  lgName: string;
  pdNum: string;
  pdProducts: string;
  pdPrice: number;
  stock: number;
  lpStoreInput: number;
}

interface LogisticState {
  products: Product[];
  allProducts: Product[];
  loading: boolean;
  error: string | null;
  updatedKeys: number[];
}

const initialState: LogisticState = {
  products: [],
  allProducts: [],
  loading: false,
  error: null,
  updatedKeys: [],
};

// 비동기 thunk: 상품 리스트 조회
export const fetchProducts = createAsyncThunk(
  'logistic/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/logisticproducts');
      // 입고수량 초기화 필드 추가
      const dataWithStore = response.data.map((p: any) => ({
        ...p,
        lpStoreInput: 0,
      }));
      return dataWithStore;
    } catch (err) {
      return thunkAPI.rejectWithValue('데이터를 불러오는데 실패했습니다.');
    }
  }
);

// 개별 입고 등록
export const updateProductStock = createAsyncThunk<
  { lpKey: number; quantity: number },
  { lpKey: number; quantity: number },
  { rejectValue: string }
>(
  'logistic/updateProductStock',
  async ({ lpKey, quantity }, thunkAPI) => {
    try {
      await api.post(`/logistic-store/${lpKey}/update`, null, {
        params: { quantity },
      });
      return { lpKey, quantity };
    } catch (err) {
      return thunkAPI.rejectWithValue('입고 등록 중 오류가 발생했습니다.');
    }
  }
);

// 여러 개 입고 등록
export const bulkUpdateStock = createAsyncThunk<
  number[],
  void,
  { state: { logisticInbound: LogisticState }; rejectValue: string }
>(
  'logistic/bulkUpdateStock',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().logisticInbound;
    const updates = state.products.filter(p => p.lpStoreInput > 0);

    if (updates.length === 0) {
      return thunkAPI.rejectWithValue('입고할 수량을 입력하세요.');
    }

    try {
      await Promise.all(
        updates.map(p =>
          api.post(`/logistic-store/${p.lpKey}/update`, null, {
            params: { quantity: p.lpStoreInput },
          })
        )
      );
      return updates.map(p => p.lpKey);
    } catch (err) {
      return thunkAPI.rejectWithValue('일괄 입고 등록 중 오류가 발생했습니다.');
    }
  }
);


const logisticSlice = createSlice({
  name: 'logistic',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Product>>) {
      // 필터는 컴포넌트에서 구현, 상태로 따로 관리하려면 확장 가능
    },
    setProductLpStoreInput(
      state,
      action: PayloadAction<{ lpKey: number; lpStoreInput: number }>
    ) {
      state.products = state.products.map(item =>
        item.lpKey === action.payload.lpKey
          ? { ...item, lpStoreInput: action.payload.lpStoreInput }
          : item
      );
    },
    resetUpdatedKeys(state) {
      state.updatedKeys = [];
    },
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
      state.allProducts = action.payload;
    },
    setFilteredProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.allProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const { lpKey, quantity } = action.payload;
        state.products = state.products.map(item =>
          item.lpKey === lpKey
            ? { ...item, stock: item.stock + quantity, lpStoreInput: 0 }
            : item
        );
        state.updatedKeys = [lpKey];
      })
      .addCase(bulkUpdateStock.fulfilled, (state, action) => {
        const updatedKeys = action.payload;
        state.products = state.products.map(item => {
          const isUpdated = updatedKeys.includes(item.lpKey);
          if (isUpdated) {
            const updated = state.products.find(p => p.lpKey === item.lpKey);
            return {
              ...item,
              stock: item.stock + (updated?.lpStoreInput || 0),
              lpStoreInput: 0,
            };
          }
          return item;
        });
        state.updatedKeys = updatedKeys;
      });
  },
});

export const { setProductLpStoreInput, resetUpdatedKeys, setFilteredProducts } =
  logisticSlice.actions;

export default logisticSlice.reducer;
