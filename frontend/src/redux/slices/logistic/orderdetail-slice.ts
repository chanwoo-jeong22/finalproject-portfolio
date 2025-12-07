import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* -----------------------------
 * 인터페이스
 * ----------------------------- */

// 기사(드라이버) 데이터 타입
interface Driver {
  id: number | string;
  name: string;
  phone: string;
  car: string;
  delivery: boolean;
}

// 주문 품목(Item) 데이터 타입
interface Item {
  id: number | string;
  pdNum: string;
  oiProducts: string;
  oiQuantity: number;
  oiPrice: number;
  oiTotal: number;
  stock?: string;
}

// 주문 헤더(상단 정보) 타입
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

// 슬라이스 내부 상태 타입
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
      /* ---------------------- 주문 헤더 조회 ---------------------- */

      // 여러 URL을 시도하는 목록
      const tryUrls = [
        `/agencyorder/full/${orKey}`,
      ];

      // headerData 를 string → 안전한 객체로 좁히기
      let headerData: Record<string, string> | null = null;

      for (const url of tryUrls) {
        try {
          const res = await api.get(url);

          // 응답 데이터가 객체 or 배열로 올 수 있기 때문에 string 처리 → 좁히기
          const data: string = res.data?.data ?? res.data;

          if (data && typeof data === "object") {
            // 배열이면 첫 번째 요소, 아니면 객체 그대로 사용
            headerData = Array.isArray(data) ? (data[0] as Record<string, string>) : (data as Record<string, string>);
            break;
          }
        } catch {
          /* 다음 URL 시도 */
        }
      }

      if (!headerData) {
        throw new Error("주문 헤더 데이터를 불러오지 못했습니다.");
      }

      /* ---------------------- 품목 조회 ---------------------- */

      const tryItemUrls = [
        `/agencyorder/items/${orKey}`,
        `/agencyitems/${orKey}`,
        `/agencyorder/${orKey}/items`,
      ];

      let itemData: string[] = [];

      for (const url of tryItemUrls) {
        try {
          const res = await api.get(url);
          const data: string = res.data?.data ?? res.data ?? [];

          // 배열인지 확인 후 대입
          if (Array.isArray(data)) {
            itemData = data;
            break;
          }
        } catch {
          /* 다음 URL 시도 */
        }
      }

      /* ---------------------- 기사 목록 조회 ---------------------- */

      const resDrivers = await api.get("/deliveries");
      const driverListRaw: string = resDrivers.data?.data ?? resDrivers.data ?? [];

      // 배열인지 확인 후 map 실행
      const driverList: Driver[] = Array.isArray(driverListRaw)
        ? driverListRaw.map((x: string, i: number) => {
            const d = x as Record<string, string>;
            return {
              id: (d.dvKey ?? d.dv_key ?? i + 1) as number | string,
              name: (d.dvName ?? d.dv_name ?? "") as string,
              phone: (d.dvPhone ?? d.dv_phone ?? "") as string,
              car: (d.dvCar ?? d.dv_car ?? "") as string,
              delivery: (d.dvDelivery ?? d.dv_delivery ?? false) as boolean,
            };
          })
        : [];

      /* ---------------------- 헤더 매핑 ---------------------- */

      // headerData 는 Record<string, string> 타입이므로 안전하게 값 추출
      const h = headerData as Record<string, string>;

      const mappedHeader: Header = {
        orKey: (h.orKey ?? "") as string,
        orStatus: (h.orStatus ?? "") as string,
        orProducts: (h.orProducts ?? "") as string,
        orQuantity: (h.orQuantity ?? "") as string,
        orTotal: (h.orTotal ?? "") as string,
        orPrice: (h.orPrice ?? "") as string,
        orDate: (h.orDate ?? "") as string,
        orReserve: (h.orReserve ?? "") as string,
        orGu: (h.orGu ?? "") as string,
        agName: (h.agName ?? h.agencyName ?? "") as string,
        pdProducts: (h.pdProducts ?? "") as string,
        dvName: (h.dvName ?? "") as string,
        pdNum: (h.pdNum ?? "") as string,
        agPhone: (h.agPhone ?? "") as string,
        agAddress: (h.agAddress ?? "") as string,
      };

      /* ---------------------- 품목 매핑 ---------------------- */

      const mappedItems: Item[] = itemData.map((raw: string, idx: number) => {
        const it = raw as Record<string, string>;

        const qty = Number(it.oiQuantity ?? 0);
        const price = Number(it.oiPrice ?? 0);

        return {
          id: (it.oiKey ?? idx + 1) as number | string,
          pdNum: (it.pdNum ?? "") as string,
          oiProducts: (it.oiProducts ?? "") as string,
          oiQuantity: qty,
          oiPrice: price,
          oiTotal: Number(it.oiTotal ?? price * qty),
          stock: (it.stock ?? "ok") as string,
        };
      });

      return { header: mappedHeader, items: mappedItems, drivers: driverList };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "알 수 없는 오류 발생";
      return rejectWithValue(msg);
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
    } catch (error) {
      const msg = error instanceof Error ? error.message : "알 수 없는 오류 발생";
      return rejectWithValue(msg);
    }
  }
);

/* =============================================================
 * 3) 배송 완료
 * ============================================================= */
export const completeDelivery = createAsyncThunk(
  "orderDetail/completeDelivery",
  async (
    { orKey, driverId }: { orKey: string; driverId: string | number },
    { rejectWithValue }
  ) => {
    try {
      // 주문 상태를 배송완료로 변경
      await api.put(`/agencyorder/${orKey}/status`, {
        status: "배송완료",
      });

      // 기사 상태 변경
      await api.put(`/deliveries/${driverId}/status`, null, {
        params: {
          status: "대기중",
          delivery: false,
        },
      });

      return;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "알 수 없는 오류 발생";
      return rejectWithValue(msg);
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
    // 기사 선택 시 기사정보 자동세팅
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

        // 기사 자동 선택
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
        if (state.header) {
          state.header.orStatus = "배송완료";
        }
      });
  },
});

export const { setDriverName } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
