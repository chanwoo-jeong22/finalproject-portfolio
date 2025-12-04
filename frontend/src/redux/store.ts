import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth/auth-slice";
import agencyReducer from "./slices/agency/order-management/agency-slice";
import passwordReducer from "./slices/auth/password-slice";
import headReducer from "./slices/head/head-slice";
import headGraphReducer from "./slices/head/headgraph-slice";
import noticeReducer from "./slices/notice/notice-slice";
import statusReducer from './slices/head/headstatus-slice';
import orderDetailReducer from './slices/common/orderdetail-slice';
import agencyProductStatusReducer from './slices/head/agencyproductstatus-slice';
import orderCheckReducer from "./slices/head/ordercheck-slice";
import logisticProductReducer from "./slices/head/logisticproductstatus-slice";
import logisticInboundReducer from './slices/head/logisticinbound-slice';
import logisticReducer from "./slices/logistic/logistic-slice";
import mypageReducer from "./slices/logistic/mypage-slice";
import orderFulfillmentReducer from "./slices/logistic/orderfulfillment-slice";
import orderdetailReducer from "./slices/logistic/orderdetail-slice";
import logisticInventoryReducer from "./slices/logistic/logisticinventory-slice";










export const store = configureStore({
  reducer: {
    auth: authReducer,
    agencyOrders: agencyReducer,
    head: headReducer,
    password: passwordReducer,
    headGraph: headGraphReducer,
    notice: noticeReducer,
    status: statusReducer,
    orderDetail: orderDetailReducer,
    agencyProductStatus: agencyProductStatusReducer,
    ordercheck: orderCheckReducer,
    headLogisticProduct: logisticProductReducer,
    logisticInbound: logisticInboundReducer,
    logistic: logisticReducer,
    mypage: mypageReducer,
    orderfulfillment: orderFulfillmentReducer,
    orderdetail: orderdetailReducer,
    logisticInventory: logisticInventoryReducer,



  },
});

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
