import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/api';

export interface StatusItem {
  orKey: number;
  orderNumber: string;
  agName: string;
  orStatus: string;
  dvName: string;
  dvPhone: string;
  orDate: string;
  orReserve: string;
  
}

export interface Filters {
  orderDateStart: string;
  orderDateEnd: string;
  reserveDateStart: string;
  reserveDateEnd: string;
  status: string;
  orderNumber: string;
  agency: string;
  deliveryName: string;
  phone: string;
}

interface StatusState {
  statusList: StatusItem[];
  filteredList: StatusItem[];
  sortKey: keyof StatusItem;
  sortOrder: 'asc' | 'desc';
  filters: Filters;
  loading: boolean;
  error: string | null;
}

const initialState: StatusState = {
  statusList: [],
  filteredList: [],
  sortKey: 'orKey',
  sortOrder: 'desc',
  filters: {
    orderDateStart: '',
    orderDateEnd: '',
    reserveDateStart: '',
    reserveDateEnd: '',
    status: '',
    orderNumber: '',
    agency: '',
    deliveryName: '',
    phone: ''
  },
  loading: false,
  error: null,
};

// API 호출용 thunk
export const fetchStatusList = createAsyncThunk<
  StatusItem[],
  void,
  { rejectValue: string }
>(
  'status/fetchStatusList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/status');
      return response.data as StatusItem[];
    } catch (error: string) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch');
    }
  }
);


const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setSortKey(state, action: PayloadAction<keyof StatusItem>) {
      if (state.sortKey === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = action.payload;
        state.sortOrder = 'asc';
      }
    },
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    filterList(state) {
      const f = state.filters;
      state.filteredList = state.statusList.filter(item => {
        return (
          (!f.orderDateStart || item.orDate >= f.orderDateStart) &&
          (!f.orderDateEnd || item.orDate <= f.orderDateEnd) &&
          (!f.reserveDateStart || item.orReserve >= f.reserveDateStart) &&
          (!f.reserveDateEnd || item.orReserve <= f.reserveDateEnd) &&
          (!f.status ||
            (f.status === '1' && item.orStatus.includes('배송 준비중')) ||
            (f.status === '2' && item.orStatus.includes('배송 중')) ||
            (f.status === '3' && item.orStatus.includes('배송 완료'))) &&
          (!f.orderNumber || item.orderNumber.toString().includes(f.orderNumber)) &&
          (!f.agency || item.agName.includes(f.agency)) &&
          (!f.deliveryName || item.dvName.includes(f.deliveryName)) &&
          (!f.phone || item.dvPhone.includes(f.phone))
        );
      });
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStatusList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusList.fulfilled, (state, action: PayloadAction<StatusItem[]>) => {
        state.loading = false;
        state.statusList = action.payload;
        state.filteredList = action.payload;
      })
      .addCase(fetchStatusList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSortKey, setFilters, filterList } = statusSlice.actions;

export default statusSlice.reducer;
