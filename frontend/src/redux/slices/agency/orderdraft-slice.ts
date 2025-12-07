import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderItemDetail {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface OrderItem {
  orKey: number | string;
  orDate: string;
  items: OrderItemDetail[];
  totalAmount: number;
  orderNumberUI: string;
}

interface OrderState {
  orders: OrderItem[];
}

const initialState: OrderState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<OrderItem>) {
      state.orders.push(action.payload);
    },
    setOrders(state, action: PayloadAction<OrderItem[]>) {
      state.orders = action.payload;
    },
  },
});

export const { addOrder, setOrders } = orderSlice.actions;
export default orderSlice.reducer;
