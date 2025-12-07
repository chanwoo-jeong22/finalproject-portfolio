import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** 개별 필터/검색용 주문 폼 타입 */
export interface AgencyOrderForm {
  orKey: string;
  orStatus: string;
  orProducts: string;
  orQuantity: string | number;
  orTotal: string | number;
  orPrice: string | number;
  orDate: string;
  orReserve: string;
  orGu: string;
  agName: string;
  pdProducts: string;
  dvName: string;
  pdNum: string;

  orDateStart: string;
  orDateEnd: string;
  reserveStart: string;
  reserveEnd: string;

  orTotalStart: string;
  orTotalEnd: string;
  orQuantityStart: string;
  orQuantityEnd: string;

  orderNumber?: string;
}

/** 상품/대리점/배송사 공통 타입 */
export interface BasicInfo {
  id: number | string;
  name: string;
  [key: string]: unknown;
}

/** 주문 아이템 타입 */
export interface OrderItem {
  orKey: string;
  orProducts: string;
  orQuantity: number;
  orDate: string;
  orReserve: string;
  orTotal: number;
  orPrice: number;
  orStatus: string;
  orGu: string;
  orderNumber?: string;

  /** 서버에서 내려오는 item 목록 */
  items?: Record<string, unknown>[];

  /** 기타 확장 필드 */
  [key: string]: unknown;
}

/** 전체 슬라이스 상태 타입 */
interface OrderFulfillmentState {
  isOpen: boolean;

  /** 선택된 sheet 데이터 → unknown으로 변경 */
  sheet: unknown | null;

  allOrders: OrderItem[];
  orders: OrderItem[];

  products: BasicInfo[];
  agencies: BasicInfo[];
  deliveries: BasicInfo[];

  sortField: keyof OrderItem | "orderNumber";
  sortOrder: "asc" | "desc";

  agencyorderForm: AgencyOrderForm;
}

/** 초기 상태 */
const initialState: OrderFulfillmentState = {
  isOpen: false,
  sheet: null,

  allOrders: [],
  orders: [],

  products: [],
  agencies: [],
  deliveries: [],

  sortField: "orDate",
  sortOrder: "desc",

  agencyorderForm: {
    orKey: "",
    orStatus: "",
    orProducts: "",
    orQuantity: "",
    orTotal: "",
    orPrice: "",
    orDate: "",
    orReserve: "",
    orGu: "",
    agName: "",
    pdProducts: "",
    dvName: "",
    pdNum: "",

    orDateStart: "",
    orDateEnd: "",
    reserveStart: "",
    reserveEnd: "",

    orTotalStart: "",
    orTotalEnd: "",
    orQuantityStart: "",
    orQuantityEnd: "",

    orderNumber: "",
  },
};

/** 메인 슬라이스 */
const orderfulfillmentSlice = createSlice({
  name: "orderfulfillment",
  initialState,
  reducers: {
    /** 모달 오픈/닫기 */
    setIsOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },

    /** 시트 데이터 선택 */
    setSheet(state, action: PayloadAction<unknown | null>) {
      state.sheet = action.payload;
    },

    /** 전체 주문 저장 */
    setAllOrders(state, action: PayloadAction<OrderItem[]>) {
      state.allOrders = action.payload;
    },

    /** 화면 표시용 주문 목록 저장 */
    setOrders(state, action: PayloadAction<OrderItem[]>) {
      state.orders = action.payload;
    },

    /** 상품 목록 저장 */
    setProducts(state, action: PayloadAction<BasicInfo[]>) {
      state.products = action.payload;
    },

    /** 대리점 목록 저장 */
    setAgencies(state, action: PayloadAction<BasicInfo[]>) {
      state.agencies = action.payload;
    },

    /** 배송업체 목록 저장 */
    setDeliveries(state, action: PayloadAction<BasicInfo[]>) {
      state.deliveries = action.payload;
    },

    /** 정렬 기준 변경 */
    setSortField(state, action: PayloadAction<keyof OrderItem | "orderNumber">) {
      state.sortField = action.payload;
    },

    /** 정렬 방향 변경 */
    setSortOrder(state, action: PayloadAction<"asc" | "desc">) {
      state.sortOrder = action.payload;
    },

    /** 전체 검색 폼 값 교체 */
    setAgencyorderForm(state, action: PayloadAction<AgencyOrderForm>) {
      state.agencyorderForm = action.payload;
    },

    /** 검색 폼 개별 필드 업데이트 */
    updateAgencyorderFormField(
      state,
      action: PayloadAction<{ field: keyof AgencyOrderForm; value: unknown }>
    ) {
      const { field, value } = action.payload;
      state.agencyorderForm[field] = value as never;
    },

    /** 검색 Form 초기화 */
    resetAgencyorderForm(state) {
      state.agencyorderForm = { ...initialState.agencyorderForm };
    },
  },
});

/** 액션 export */
export const {
  setIsOpen,
  setSheet,
  setAllOrders,
  setOrders,
  setProducts,
  setAgencies,
  setDeliveries,
  setSortField,
  setSortOrder,
  setAgencyorderForm,
  updateAgencyorderFormField,
  resetAgencyorderForm,
} = orderfulfillmentSlice.actions;

/** 리듀서 export */
export default orderfulfillmentSlice.reducer;
