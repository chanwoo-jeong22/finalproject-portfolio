import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth/auth-slice";
import agencyReducer from "./slices/agency";
import passwordReducer from "./slices/auth/password-slice";
import headReducer from "./slices/head/head-slice";
import headGraphReducer from "./slices/head/headgraph-slice";
import noticeReducer from "./slices/notice/notice-slice";
import statusReducer from './slices/head/headstatus-slice';
import orderDetailReducer from './slices/common/orderdetail-slice';
import agencyProductStatusReducer from './slices/head/agencyproductstatus-slice';






export const store = configureStore({
  reducer: {
    auth: authReducer,
    agency: agencyReducer,
    head: headReducer,
    password: passwordReducer,
    headGraph: headGraphReducer,
    notice: noticeReducer,
    status: statusReducer,
    orderDetail: orderDetailReducer,
    agencyProductStatus: agencyProductStatusReducer,


  },
});

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
