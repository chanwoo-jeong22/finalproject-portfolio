import { Routes, Route } from "react-router-dom";
import NoticeRegister from "./NoticeRegister.tsx";
import HeadMain from "./HeadMain.jsx";
import UserDelete from "./UserDelete.jsx";
import UserRegister from "./UserRegister.jsx";
import AgencyItems from "./AgencyItems.jsx";
import ProductEdit from "./ProductEdit.jsx";
import AgencyProduct from "./AgencyProduct.jsx";
import LogisticProduct from "./LogisticProduct.jsx";
import Order from "./Order.jsx";
import Status from "./Status.jsx";
import Inbound from "./Inbound.jsx";
import LogisticStore from "./LogisticStore.jsx";



function Router () {
  return (
    <Routes>
      <Route path="/" element={<HeadMain />} />
      <Route path="ProductEdit" element={<ProductEdit />} />
      <Route path="AgencyProduct" element={<AgencyProduct />} />
      <Route path="LogisticProduct" element={<LogisticProduct />} />
      <Route path="Order" element={<Order />} />
      <Route path="Status" element={<Status />} />
      <Route path="AgencyItems" element={<AgencyItems />} />
      <Route path="LogisticStore" element={<LogisticStore />} />
      <Route path="NoticeRegister" element={<NoticeRegister />} />
      <Route path="UserRegister" element={<UserRegister />} />
      <Route path="UserDelete" element={<UserDelete />} />
      <Route path="Inbound" element={<Inbound />} />
    </Routes>
  )
}

export default Router