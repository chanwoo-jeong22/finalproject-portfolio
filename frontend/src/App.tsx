import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// =========================
// 인증 관련
// =========================
import Login from "./components/auth/Login";
import Join from "./components/auth/Join";
import FindPw from "./components/auth/FindPw";
import ResetPw from "./components/auth/ResetPw.js";
import MyPageOffice from "./components/auth/MyPageOffice.js";``
import MyPageAgency from "./components/auth/MyPageAgency.js";
import MyPageLogistic from "./components/auth/MyPageLogistic.js";

// =========================
// 본사 영역
// =========================
import HeadIndex from "./components/headOffice/HeadIndex.jsx";
import OrderDetail from "./components/headOffice/OrderDetail.jsx";

// =========================
// 물류 영역
// =========================
import Logistic_Layout from "./components/logistic/Logistic_Layout.jsx";
import Logistic_Main from "./components/logistic/Logistic_Main.jsx";
import Logistic_Orders from "./components/logistic/Logistic_Orders.jsx";
import Logistic_Stock from "./components/logistic/Logistic_Stock.jsx";
import Logistic_Order_Detail from "./components/logistic/Logistic_Order_Detail.jsx";

// =========================
// 대리점 영역
// =========================
import AgencyIndexPage from "./components/Agency/AgencyIndexPage.js";
import AgencyOrders from "./components/Agency/Orders.jsx"; // 이름 충돌 방지
import OrdersDraft from "./components/Agency/OrdersDraft.jsx";
import OrderStatus from "./components/Agency/OrderStatus.jsx";
import InventoryManagement from "./components/Agency/InventoryManagement.jsx";
import AgencyLayout from "./components/Agency/AgencyLayout.js";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ========================= Index/인증/로그인 ========================= */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/findPw" element={<FindPw />} />
          <Route path="/resetPw" element={<ResetPw />} />
          <Route path="/mypageOffice" element={<MyPageOffice />} />
          <Route path="/mypageAgency" element={<MyPageAgency />} />
          <Route path="/mypageLogistic" element={<MyPageLogistic />} />

                {/* ========================= 본사 영역 ========================= */}
                <Route path="/head/*" element={<HeadIndex />}></Route>
                <Route path="/agencyorder-popup/:orKey" element={<OrderDetail />} />

                {/* ========================= 물류 영역 ========================= */}
                <Route path="/logistic" element={<Logistic_Layout />}>
                    <Route index element={<Logistic_Main />} />
                    <Route path="Logistic_Orders" element={<Logistic_Orders />} />
                    <Route path="Logistic_Stock" element={<Logistic_Stock />} />
                </Route>
                <Route path="/order-detail/:orKey" element={<Logistic_Order_Detail />} />

          {/* ========================= 대리점 영역 (Layout 없이) ========================= */}

          <Route path="/agency" element={<AgencyLayout />}>
            <Route index element={<AgencyIndexPage />} />   {/* 기본: 대시보드 */}

            <Route path="orders" element={<AgencyOrders />} />
            <Route path="orders-draft" element={<OrdersDraft />} />
            <Route path="order-status" element={<OrderStatus />} />
            <Route path="inventory-management" element={<InventoryManagement />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
