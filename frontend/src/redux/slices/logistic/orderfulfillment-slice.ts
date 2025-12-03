import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  items?: any[];
  [key: string]: any;
}

interface OrderFulfillmentState {
  isOpen: boolean;
  sheet: any | null;

  allOrders: OrderItem[];
  orders: OrderItem[];

  products: any[];
  agencies: any[];
  deliveries: any[];

  sortField: keyof OrderItem | "orderNumber";
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
    setSheet(state, action: PayloadAction<any | null>) {
      state.sheet = action.payload;
    },
    setAllOrders(state, action: PayloadAction<OrderItem[]>) {
      state.allOrders = action.payload;
    },
    setOrders(state, action: PayloadAction<OrderItem[]>) {
      state.orders = action.payload;
    },
    setProducts(state, action: PayloadAction<any[]>) {
      state.products = action.payload;
    },
    setAgencies(state, action: PayloadAction<any[]>) {
      state.agencies = action.payload;
    },
    setDeliveries(state, action: PayloadAction<any[]>) {
      state.deliveries = action.payload;
    },
    setSortField(state, action: PayloadAction<keyof OrderItem | "orderNumber">) {
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
      action: PayloadAction<{ field: keyof AgencyOrderForm; value: any }>
    ) {
      const { field, value } = action.payload;
      state.agencyorderForm[field] = value;
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
