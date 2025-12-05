import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api'; 
import type { RootState } from '../../store';

/**
 * 상품 정보 타입 정의
 */
export interface Product {
  agName: string;            // 대리점 이름
  pdNum: string;             // 상품 번호 (SKU)
  pdProducts: string;        // 상품명
  pdPrice: number | string;  // 상품 가격 (숫자 또는 문자열)
  apStore: string;           // 입고 날짜 등 저장용 문자열
  [key: string]: unknown;    // 추가 필드 허용, 타입 안정성을 위해 unknown 권장
}

/**
 * 슬라이스 상태 타입 정의
 */
interface AgencyProductStatusState {
  products: Product[];            // 전체 상품 목록
  filteredProducts: Product[];    // 필터링된 상품 목록
  sortField: keyof Product | '';  // 정렬 기준 필드
  sortOrder: 'asc' | 'desc';      // 정렬 순서
  searchAgName: string;           // 대리점명 검색어
  searchPdNum: string;            // 상품 번호 검색어
  searchPdProducts: string;       // 상품명 검색어
  searchDateFrom: string;         // 입고일 시작 범위 (문자열)
  searchDateTo: string;           // 입고일 종료 범위 (문자열)
  searchPriceFrom: string;        // 가격 시작 범위 (문자열)
  searchPriceTo: string;          // 가격 종료 범위 (문자열)
  loading: boolean;               // 로딩 상태
  error: string | null;           // 에러 메시지
}

// 초기 상태 값
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

/**
 * Axios 에러 여부 타입 가드
 */
function isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  // 먼저 error가 object인지 확인하고, null이 아님을 체크
  if (typeof error !== 'object' || error === null) return false;

  // 이제 error는 object 타입으로 좁혀졌으므로 in 연산자 사용 가능
  if (!('response' in error)) return false;

  // response도 object 타입인지 체크
  const response = (error as Record<string, unknown>).response;
  if (typeof response !== 'object' || response === null) return false;

  // response.data가 있는지 확인
  return 'data' in response;
}


/**
 * 비동기 thunk: 대리점 상품 목록 API 호출
 * - 반환 타입은 Product 배열
 * - 실패 시 rejectWithValue로 에러 문자열 반환
 */
export const fetchAgencyProducts = createAsyncThunk<
  Product[],
  void,
  { state: RootState; rejectValue: string }
>(
  'agencyProductStatus/fetchAgencyProducts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Product[]>(`/agency-items/products`);
      console.log("fetchAgencyProducts 응답 데이터 예시:", res.data[0]);
      return res.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? JSON.stringify(error.response?.data) ?? '알 수 없는 에러'
        );
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('알 수 없는 에러');
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
        const aVal = a[field];
        const bVal = b[field];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return state.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        if (aStr < bStr) return state.sortOrder === 'asc' ? -1 : 1;
        if (aStr > bStr) return state.sortOrder === 'asc' ? 1 : -1;
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
      if (state.searchAgName) {
        result = result.filter((p) => p.agName.includes(state.searchAgName));
      }
      if (state.searchPdNum) {
        result = result.filter((p) => p.pdNum.includes(state.searchPdNum));
      }
      if (state.searchPdProducts) {
        result = result.filter((p) => p.pdProducts.includes(state.searchPdProducts));
      }
      if (state.searchDateFrom) {
        result = result.filter((p) => p.apStore >= state.searchDateFrom);
      }
      if (state.searchDateTo) {
        result = result.filter((p) => p.apStore <= state.searchDateTo);
      }
      if (state.searchPriceFrom) {
        const from = parseInt(state.searchPriceFrom, 10);
        if (!isNaN(from)) {
          result = result.filter((p) => {
            const price =
              typeof p.pdPrice === 'string'
                ? parseInt(p.pdPrice.replace(/[^\d]/g, ''), 10)
                : p.pdPrice;
            return price >= from;
          });
        }
      }
      if (state.searchPriceTo) {
        const to = parseInt(state.searchPriceTo, 10);
        if (!isNaN(to)) {
          result = result.filter((p) => {
            const price =
              typeof p.pdPrice === 'string'
                ? parseInt(p.pdPrice.replace(/[^\d]/g, ''), 10)
                : p.pdPrice;
            return price <= to;
          });
        }
      }
      state.filteredProducts = result;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgencyProducts.pending, (state) => {
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
