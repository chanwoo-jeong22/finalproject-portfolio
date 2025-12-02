// src/redux/slices/agencyproductstatus-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';  // api 경로는 실제 위치에 맞게 조정
import type { RootState } from '../../store';

export interface Product {
  agName: string;
  pdNum: string;
  pdProducts: string;
  pdPrice: number | string;
  apStore: string;
  [key: string]: any;
}

interface AgencyProductStatusState {
  products: Product[];
  filteredProducts: Product[];
  sortField: keyof Product | '';
  sortOrder: 'asc' | 'desc';
  searchAgName: string;
  searchPdNum: string;
  searchPdProducts: string;
  searchDateFrom: string;
  searchDateTo: string;
  searchPriceFrom: string;
  searchPriceTo: string;
  loading: boolean;
  error: string | null;
}

const initialState: AgencyProductStatusState = {
  products: [],
  filteredProducts: [],
  sortField: 'agName',
  sortOrder: 'desc',
  searchAgName: '',
  searchPdNum: '',
  searchPdProducts: '',
  searchDateFrom: '',
  searchDateTo: '',
  searchPriceFrom: '',
  searchPriceTo: '',
  loading: false,
  error: null,
};

export const fetchAgencyProducts = createAsyncThunk<Product[], void, { state: RootState }>(
  'agencyProductStatus/fetchAgencyProducts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const res = await api.get<Product[]>(`/agency-items/products`);
      console.log("fetchAgencyProducts 응답 데이터 예시:", res.data[0]);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const agencyProductStatusSlice = createSlice({
  name: 'agencyProductStatus',
  initialState,
  reducers: {
    setSortField(state, action: PayloadAction<keyof Product>) {
      if (state.sortField === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortOrder = 'asc';
      }
      state.filteredProducts = [...state.filteredProducts].sort((a, b) => {
        const field = state.sortField;
        if (!field) return 0;
        if (a[field] < b[field]) return state.sortOrder === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return state.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    },
    setSearchAgName(state, action: PayloadAction<string>) {
      state.searchAgName = action.payload;
    },
    setSearchPdNum(state, action: PayloadAction<string>) {
      state.searchPdNum = action.payload;
    },
    setSearchPdProducts(state, action: PayloadAction<string>) {
      state.searchPdProducts = action.payload;
    },
    setSearchDateFrom(state, action: PayloadAction<string>) {
      state.searchDateFrom = action.payload;
    },
    setSearchDateTo(state, action: PayloadAction<string>) {
      state.searchDateTo = action.payload;
    },
    setSearchPriceFrom(state, action: PayloadAction<string>) {
      state.searchPriceFrom = action.payload;
    },
    setSearchPriceTo(state, action: PayloadAction<string>) {
      state.searchPriceTo = action.payload;
    },
    applyFilter(state) {
      let result = [...state.products];
      if (state.searchAgName) result = result.filter(p => p.agName.includes(state.searchAgName));
      if (state.searchPdNum) result = result.filter(p => p.pdNum.includes(state.searchPdNum));
      if (state.searchPdProducts) result = result.filter(p => p.pdProducts.includes(state.searchPdProducts));
      if (state.searchDateFrom) result = result.filter(p => p.apStore >= state.searchDateFrom);
      if (state.searchDateTo) result = result.filter(p => p.apStore <= state.searchDateTo);
      if (state.searchPriceFrom) result = result.filter(p => {
        const price = typeof p.pdPrice === 'string' ? parseInt(p.pdPrice.replace(/[^\d]/g, ''), 10) : p.pdPrice;
        return price >= parseInt(state.searchPriceFrom, 10);
      });
      if (state.searchPriceTo) result = result.filter(p => {
        const price = typeof p.pdPrice === 'string' ? parseInt(p.pdPrice.replace(/[^\d]/g, ''), 10) : p.pdPrice;
        return price <= parseInt(state.searchPriceTo, 10);
      });
      state.filteredProducts = result;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAgencyProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgencyProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchAgencyProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSortField,
  setSearchAgName,
  setSearchPdNum,
  setSearchPdProducts,
  setSearchDateFrom,
  setSearchDateTo,
  setSearchPriceFrom,
  setSearchPriceTo,
  applyFilter,
} = agencyProductStatusSlice.actions;

export default agencyProductStatusSlice.reducer;
