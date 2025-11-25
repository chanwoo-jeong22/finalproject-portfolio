import { Routes, Route } from "react-router-dom";
import NoticeRegistration from "../../../pages/head/notice-registration/index.js";
import HeadMain from "../head-notice.jsx";
import AgencyLogisticsManagement from "../../../pages/head/agency-logistics-management/index.jsx";
import UserRegister from "../userregister/index.jsx";
import AgencyItems from "../../../pages/head/agency-items/index.jsx";
import ProductManagement from "../../../pages/head/product-management/index.jsx";
import AgencyProduct from "../../../pages/head/agency-product-status/index.jsx";
import LogisticProduct from "../../../pages/head/logistic-product-status/index.jsx";
import OrderCheck from "../../../pages/head/order-check/index.jsx";
import AgencyProductStatus from "../../../pages/head/agency-product-status/index.jsx";
import LogisticInbound from "../../../pages/head/logistic-inbound/index.jsx";
import ShippingStatus from "../../../pages/head/shipping-status/index.jsx";




function Router () {
  return (
    <Routes>
      <Route path="/" element={<HeadMain />} />
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
  )
}

export default Router