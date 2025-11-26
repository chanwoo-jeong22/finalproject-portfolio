import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

// =========================
// 인증 관련
// =========================
import Login from "./pages/auth/index";
import SignUp from "./pages/auth/sign-up/index";
import FindPassword from "./pages/auth/find-password/index";
import ResetPassword from "./pages/auth/reset-password";
import MyPageHead from "./pages/head/mypage/index";
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

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    {/* 인증 */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/sing-up" element={<SignUp />} />
                    <Route path="/find-password" element={<FindPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/head/mypage" element={<MyPageHead />} />
                    <Route path="/agency/mypage" element={<MyPageAgency />} />
                    <Route path="/logistic/mypage" element={<MyPageLogistic />} />

                    {/* 본사 영역 */}
                    <Route path="/head/*" element={<HeadIndex />} />
                    <Route path="/agencyorder-popup/:orKey" element={<OrderDetail />} />

                    {/* 물류 영역 */}
                    <Route path="/logistic" element={<LogisticLayout />}>
                        <Route index element={<LogisticIndex />} />
                        <Route path="orderful-fillment" element={<OrderfulFillment />} />
                        <Route path="logistic-inventory" element={<LogisticInventory />} />
                    </Route>
                    <Route path="/logistic-orderdetail/:orKey" element={<LogisticOrderDetail />} />

                    {/* 대리점 영역 */}
                    <Route path="/agency" element={<AgencyLayout />}>
                        <Route index element={<Index />} />
                        <Route path="order-management" element={<OrderManagement />} />
                        <Route path="order-draft" element={<OrderDraft />} />
                        <Route path="order-status" element={<OrderStatus />} />
                        <Route path="inventory" element={<Inventory />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
