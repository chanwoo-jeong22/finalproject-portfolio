import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* -----------------------------
 * 인터페이스
 * ----------------------------- */
interface Driver {
  id: number | string;
  name: string;
  phone: string;
  car: string;
  delivery: boolean;
}

interface Item {
  id: number | string;
  pdNum: string;
  oiProducts: string;
  oiQuantity: number;
  oiPrice: number;
  oiTotal: number;
  stock?: string;
}

interface Header {
  orKey: string;
  orStatus: string;
  orProducts: string;
  orQuantity: string;
  orTotal: string;
  orPrice: string;
  orDate: string;
  orReserve: string;
  orGu: string;
  agName: string;
  pdProducts: string;
  dvName: string;
  pdNum: string;
  agPhone: string;
  agAddress: string;
}

interface OrderDetailState {
  header: Header | null;
  items: Item[];
  drivers: Driver[];
  driverName: string;
  driverPhone: string;
  driverCar: string;
  loading: boolean;
  error: string | null;
}

/* -----------------------------
 * 초기값
 * ----------------------------- */
const initialState: OrderDetailState = {
  header: null,
  items: [],
  drivers: [],
  driverName: "",
  driverPhone: "",
  driverCar: "",
  loading: false,
  error: null,
};

/* =============================================================
 * 1) 주문 상세 Fetch
 * ============================================================= */
export const fetchOrderDetail = createAsyncThunk(
  "orderDetail/fetch",
  async (orKey: string, { rejectWithValue }) => {
    try {
      // 1) 주문 헤더 조회
      const tryUrls = [
        `/agencyorder/${orKey}`,
        `/agencyorder/full/${orKey}`,
        `/agencyorder?id=${orKey}`,
      ];

      let headerData: any = null;
      for (const url of tryUrls) {
        try {
          const res = await api.get(url);
          const data = res.data?.data ?? res.data;

          if (data && Object.keys(data).length) {
            headerData = Array.isArray(data) ? data[0] : data;
            break;
          }
        } catch {}
      }
      if (!headerData) throw new Error("주문 헤더 데이터를 불러오지 못했습니다.");

      // 2) 품목 조회
      const tryItemUrls = [
        `/agencyorder/items/${orKey}`,
        `/agencyitems/${orKey}`,
        `/agencyorder/${orKey}/items`,
      ];

      let itemData: any[] = [];
      for (const url of tryItemUrls) {
        try {
          const res = await api.get(url);
          const data = res.data?.data ?? res.data ?? [];
          if (Array.isArray(data)) {
            itemData = data;
            break;
          }
        } catch {}
      }

      // 3) 기사 목록 조회
      const resDrivers = await api.get("/deliveries");
      const driverListRaw = resDrivers.data?.data ?? resDrivers.data ?? [];
      const driverList: Driver[] = driverListRaw.map((x: any, i: number) => ({
        id: x.dvKey ?? x.dv_key ?? i + 1,
        name: x.dvName ?? x.dv_name ?? "",
        phone: x.dvPhone ?? x.dv_phone ?? "",
        car: x.dvCar ?? x.dv_car ?? "",
        delivery: x.dvDelivery ?? x.dv_delivery ?? false,
      }));

      // 4) 매핑
      const mappedHeader: Header = {
        orKey: headerData.orKey ?? "",
        orStatus: headerData.orStatus ?? "",
        orProducts: headerData.orProducts ?? "",
        orQuantity: headerData.orQuantity ?? "",
        orTotal: headerData.orTotal ?? "",
        orPrice: headerData.orPrice ?? "",
        orDate: headerData.orDate ?? "",
        orReserve: headerData.orReserve ?? "",
        orGu: headerData.orGu ?? "",
        agName: headerData.agName ?? headerData.agencyName ?? "",
        pdProducts: headerData.pdProducts ?? "",
        dvName: headerData.dvName ?? "",
        pdNum: headerData.pdNum ?? "",
        agPhone: headerData.agPhone ?? "",
        agAddress: headerData.agAddress ?? "",
      };

      const mappedItems: Item[] = itemData.map((it: any, idx: number) => {
        const qty = Number(it.oiQuantity ?? 0);
        const price = Number(it.oiPrice ?? 0);
        const total = Number(it.oiTotal ?? price * qty);
        return {
          id: it.oiKey ?? idx + 1,
          pdNum: it.pdNum ?? "",
          oiProducts: it.oiProducts ?? "",
          oiQuantity: qty,
          oiPrice: price,
          oiTotal: total,
          stock: it.stock ?? "ok",
        };
      });

      return { header: mappedHeader, items: mappedItems, drivers: driverList };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/* =============================================================
 * 2) 출고 시작(배송중)
 * ============================================================= */
export const startDelivery = createAsyncThunk(
  "orderDetail/startDelivery",
  async (
    {
      orKey,
      driverId,
      driverName,
    }: { orKey: string; driverId: number | string; driverName: string },
    { rejectWithValue }
  ) => {
    try {
      // 주문 상태 변경 + 기사 배정
      await api.put(`/agencyorder/${orKey}/status-with-driver`, {
        status: "배송중",
        dvName: driverName,
        dvKey: driverId,
      });

      // 기사 상태 변경
      await api.put(`/deliveries/${driverId}/status`, null, {
        params: {
          status: "운행중",
          delivery: true,
        },
      });

      return { driverName };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

/* =============================================================
 * 3) 배송 완료
 * ============================================================= */
export const completeDelivery = createAsyncThunk(
  "orderDetail/completeDelivery",
  async ({ orKey, driverId }: { orKey: string; driverId: string | number }, { rejectWithValue }) => {
    try {
      await api.put(`/agencyorder/${orKey}/status`, {
        status: "배송완료",
      });

      await api.put(`/deliveries/${driverId}/status`, null, {
        params: {
          status: "대기중",
          delivery: false,
        },
      });

      return;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

/* -----------------------------
 * Slice
 * ----------------------------- */
const orderDetailSlice = createSlice({
  name: "orderDetail",
  initialState,
  reducers: {
    setDriverName(state, action: PayloadAction<string>) {
      state.driverName = action.payload;

      const sel = state.drivers.find((d) => d.name === action.payload);
      if (sel) {
        state.driverPhone = sel.phone;
        state.driverCar = sel.car;
      } else {
        state.driverPhone = "";
        state.driverCar = "";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- Fetch -------- */
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.header = action.payload.header;
        state.items = action.payload.items;
        state.drivers = action.payload.drivers;
        state.driverName = action.payload.header.dvName || "";

        const sel = state.drivers.find((d) => d.name === state.driverName);
        if (sel) {
          state.driverPhone = sel.phone;
          state.driverCar = sel.car;
        }
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* -------- 출고 시작 -------- */
      .addCase(startDelivery.pending, (state) => {
        state.loading = true;
      })
      .addCase(startDelivery.fulfilled, (state, action) => {
        state.loading = false;
        if (state.header) {
          state.header.orStatus = "배송중";
          state.header.dvName = action.payload.driverName;
        }
      })
      .addCase(startDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* -------- 배송 완료 -------- */
      .addCase(completeDelivery.fulfilled, (state) => {
        if (state.header) state.header.orStatus = "배송완료";
      });
  },
});

export const { setDriverName } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
