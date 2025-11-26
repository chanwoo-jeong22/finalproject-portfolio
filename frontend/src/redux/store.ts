import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import agencyReducer from "./slices/agency-slice";
import passwordReducer from "./slices/password-slice";


export const store = configureStore({
  reducer: {
      auth: authReducer,
      agency: agencyReducer,
      password: passwordReducer,
  },
});

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
