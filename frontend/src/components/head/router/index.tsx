import { Routes, Route } from "react-router-dom";

// 페이지 컴포넌트들
import NoticeRegistration from "../../../pages/head/notice-registration/index";
import HeadMain from "../head-notice";
import AgencyLogisticsManagement from "../../../pages/head/agency-logistics-management/index";
import UserRegister from "../userregister/index";
import AgencyItems from "../../../pages/head/agency-items/index";
import ProductManagement from "../../../pages/head/product-management/index";
import AgencyProduct from "../../../pages/head/agency-product-status/index";
import LogisticProduct from "../../../pages/head/logistic-product-status/index";
import OrderCheck from "../../../pages/head/order-check/index";
import AgencyProductStatus from "../../../pages/head/agency-product-status/index";
import LogisticInbound from "../../../pages/head/logistic-inbound/index";
import ShippingStatus from "../../../pages/head/shipping-status/index";
import MyPageHead from "../../../pages/head/mypage/index";  // 경로는 상황에 맞게 조정


function Router() {
  return (
    <Routes>
      <Route index element={<HeadMain />} />
      <Route path="mypage" element={<MyPageHead />} />
      <Route path="ProductManagement" element={<ProductManagement />} />
      <Route path="AgencyProduct" element={<AgencyProduct />} />
      <Route path="LogisticProduct" element={<LogisticProduct />} />
      <Route path="OrderCheck" element={<OrderCheck />} />
      <Route path="ShippingStatus" element={<ShippingStatus />} />
      <Route path="AgencyProductStatus" element={<AgencyProductStatus />} />
      <Route path="AgencyItems" element={<AgencyItems />} />
      <Route path="LogisticInbound" element={<LogisticInbound />} />
      <Route path="NoticeRegistration" element={<NoticeRegistration />} />
      <Route path="UserRegister" element={<UserRegister />} />
      <Route path="AgencyLogisticsManagement" element={<AgencyLogisticsManagement />} />
    </Routes>
  );
}

export default Router;
