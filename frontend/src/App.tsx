import React, { useEffect,  useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Redux 관련
import { Provider, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./redux/store";
import { store } from "./redux/store";
import { reloadUserInfo } from "./redux/slices/auth/auth-slice";

// =========================
// 인증 관련 페이지들
// =========================
import Login from "./pages/auth/index";
import SignUp from "./pages/auth/sign-up/index";
import FindPassword from "./pages/auth/find-password/index";
import ResetPassword from "./pages/auth/reset-password";
import MyPageAgency from "./pages/agency/mypage/index";
import MyPageLogistic from "./pages/logistic/mypage/index";

// =========================
// 본사 영역
// =========================
import HeadIndex from "./pages/head";
import OrderDetail from "./components/common/order-detail";

// =========================
// 물류 영역
// =========================
import LogisticLayout from "./layouts/logistic-layout";
import LogisticIndex from "./pages/logistic/logistic-index";
import OrderfulFillment from "./pages/logistic/orderful-fillment/index";
import LogisticInventory from "./pages/logistic/logistic-inventory/index";
import LogisticOrderDetail from "./pages/logistic/logistic-orderdetail/index";

// =========================
// 대리점 영역
// =========================
import Index from "./pages/agency/index";
import OrderManagement from "./pages/agency/order-management";
import OrderDraft from "./pages/agency/order-draft/index";
import OrderStatus from "./pages/agency/order-status/index";
import Inventory from "./pages/agency/inventory/index";
import AgencyLayout from "./layouts/agency-layout";

/**
 * AppWithAuth 컴포넌트
 * - Redux store에서 토큰 상태를 읽고,
 * - 토큰이 있으면 reloadUserInfo 액션을 dispatch해
 *   서버에서 사용자 정보를 재조회합니다.
 * - 라우팅(React Router) 설정을 담당합니다.
 */
function AppWithAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.auth.token);
  const hdId = useSelector((state: RootState) => state.auth.hdId);
  const agId = useSelector((state: RootState) => state.auth.agId);
  const lgId = useSelector((state: RootState) => state.auth.lgId);

  useEffect(() => {
    if (token && hdId) {
      dispatch(reloadUserInfo({ token, userId: hdId, role: "head_office" }));
    } else if (token && agId) {
      dispatch(reloadUserInfo({ token, userId: agId, role: "agency" }));
    } else if (token && lgId) {
      dispatch(reloadUserInfo({ token, userId: lgId, role: "logistic" }));
    }
  }, [token, hdId, agId, lgId, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            인증 관련 라우트
        ========================= */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/agency/mypage" element={<MyPageAgency />} />
        <Route path="/logistic/mypage" element={<MyPageLogistic />} />

        {/* =========================
            본사 영역 라우트
        ========================= */}
        <Route path="/head/*" element={<HeadIndex />} />
        <Route path="/agencyorder-popup/:orKey" element={<OrderDetail />} />

        {/* =========================
            물류 영역 라우트
        ========================= */}
        <Route path="/logistic" element={<LogisticLayout />}>
          <Route index element={<LogisticIndex />} />
          <Route path="orderful-fillment" element={<OrderfulFillment />} />
          <Route path="logistic-inventory" element={<LogisticInventory />} />
        </Route>
        <Route path="/logistic-orderdetail/:orKey" element={<LogisticOrderDetail />} />

        {/* =========================
            대리점 영역 라우트
        ========================= */}
        <Route path="/agency" element={<AgencyLayout />}>
          <Route index element={<Index />} />
          <Route path="order-management" element={<OrderManagement />} />
          <Route path="order-draft" element={<OrderDraft />} />
          <Route path="order-status" element={<OrderStatus />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/**
 * 최상위 App 컴포넌트
 * - Redux Provider로 store 공급
 * - 인증 및 라우팅을 담당하는 AppWithAuth 렌더링
 */
function App() {
  return (
    <Provider store={store}>
      <AppWithAuth />
    </Provider>
  );
}

export default App;
