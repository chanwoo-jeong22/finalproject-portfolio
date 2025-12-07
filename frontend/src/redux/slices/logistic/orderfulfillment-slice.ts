import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AgencyOrder } from "../../../types/entity";

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

export interface BasicInfo {
  id: number | string;
  name: string;
  [key: string]: unknown;
}

interface OrderFulfillmentState {
  isOpen: boolean;
  sheet: AgencyOrder | null;

  allOrders: AgencyOrder[];
  orders: AgencyOrder[];

  products: BasicInfo[];
  agencies: BasicInfo[];
  deliveries: BasicInfo[];

  sortField: keyof AgencyOrder | "orderNumber";
  sortOrder: "asc" | "desc";

  agencyorderForm: AgencyOrderForm;
}

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

const orderfulfillmentSlice = createSlice({
  name: "orderfulfillment",
  initialState,
  reducers: {
    setIsOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    setSheet(state, action: PayloadAction<AgencyOrder | null>) {
      state.sheet = action.payload;
    },
    setAllOrders(state, action: PayloadAction<AgencyOrder[]>) {
      state.allOrders = action.payload;
    },
    setOrders(state, action: PayloadAction<AgencyOrder[]>) {
      state.orders = action.payload;
    },
    setProducts(state, action: PayloadAction<BasicInfo[]>) {
      state.products = action.payload;
    },
    setAgencies(state, action: PayloadAction<BasicInfo[]>) {
      state.agencies = action.payload;
    },
    setDeliveries(state, action: PayloadAction<BasicInfo[]>) {
      state.deliveries = action.payload;
    },
    setSortField(state, action: PayloadAction<keyof AgencyOrder | "orderNumber">) {
      state.sortField = action.payload;
    },
    setSortOrder(state, action: PayloadAction<"asc" | "desc">) {
      state.sortOrder = action.payload;
    },
    setAgencyorderForm(state, action: PayloadAction<AgencyOrderForm>) {
      state.agencyorderForm = action.payload;
    },
    updateAgencyorderFormField(
      state,
      action: PayloadAction<{ field: keyof AgencyOrderForm; value: unknown }>
    ) {
      const { field, value } = action.payload;
      // 타입 안전을 위해 아래와 같이 타입 단언 권장
      state.agencyorderForm[field] = value as never;
    },
    resetAgencyorderForm(state) {
      state.agencyorderForm = { ...initialState.agencyorderForm };
    },
  },
});

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

export default orderfulfillmentSlice.reducer;
