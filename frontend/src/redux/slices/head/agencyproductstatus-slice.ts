import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';  // 공통 axios 인스턴스, 토큰 자동 첨부됨

// 상품 타입 정의
interface Product {
  agName: string;
  pdNum: string;
  pdProducts: string;
  pdPrice: number | string;
  apStore: string;
  [key: string]: any;  // 기타 동적 속성 허용
}

// 슬라이스 상태 타입 정의
interface AgencyProductState {
  products: Product[];             // 전체 상품 목록
  filteredProducts: Product[];     // 화면에 보여줄 필터링된 목록
  sortField: keyof Product | '';  // 정렬 기준 필드명
  sortOrder: 'asc' | 'desc';       // 정렬 방향
  searchAgName: string;            // 업체명 검색어
  searchPdNum: string;             // 품번 검색어
  searchPdProducts: string;        // 제품명 검색어
  searchDateFrom: string;          // 입고일 검색 시작일
  searchDateTo: string;            // 입고일 검색 종료일
  searchPriceFrom: string;         // 가격 검색 시작값
  searchPriceTo: string;           // 가격 검색 종료값
  loading: boolean;                // 로딩 상태
  error: string | null;            // 에러 메시지
}

// 초기 상태
const initialState: AgencyProductState = {
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

// 본사용 API 호출 비동기 thunk
// 본사 권한 토큰을 가지고 /head/agencyproducts 경로 호출
export const fetchHeadProducts = createAsyncThunk<Product[]>(
  'agencyProduct/fetchHeadProducts',
  async (_, { rejectWithValue }) => {
    try {
      // 본사 API 경로로 호출
      const res = await api.get<Product[]>('/agencyproducts');
      return res.data;
    } catch (error: any) {
      // 에러 발생 시 에러 메시지 전달
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const agencyProductSlice = createSlice({
  name: 'agencyProduct',
  initialState,
  reducers: {
    // 정렬 필드 및 방향 설정
    setSortField(state, action: PayloadAction<keyof Product>) {
      if (state.sortField === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortOrder = 'asc';
      }

      // 필터링된 배열 정렬 적용
      state.filteredProducts = [...state.filteredProducts].sort((a, b) => {
        const field = state.sortField;
        if (!field) return 0;

        if (a[field] < b[field]) return state.sortOrder === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return state.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    },

    // 검색어 상태 변경 리듀서들
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

    // 필터 조건에 따라 상품 목록 필터링 적용
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchHeadProducts.rejected, (state, action) => {
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
} = agencyProductSlice.actions;

export default agencyProductSlice.reducer;
