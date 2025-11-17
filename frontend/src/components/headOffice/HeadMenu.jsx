import { NavLink } from "react-router-dom"; // Link 대신 NavLink 임포트!
import layoutStyles from '../layout/layout.module.css';


function HeadMenu() {
  return (
    <nav>
      <div className={layoutStyles.nav_inner}>

        <ul className={layoutStyles.topMenu}>
          <li>
            <NavLink
              to="/head/ProductEdit"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              제품 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/Order"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              주문 확정
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/Status"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              출고 현황
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/AgencyProduct"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              대리점 제품 현황
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/LogisticProduct"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              물류업체 제품 현황
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/AgencyItems"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              대리점 취급 품목
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/LogisticStore"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              물류업체 입고
            </NavLink>
          </li>
        </ul>

        <ul className={layoutStyles.bottomMenu}>
          <li>
            <NavLink
              to="/head/NoticeRegister"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              공지사항 등록
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/head/UserDelete"
              className={({ isActive }) =>
                isActive ? `${layoutStyles.active} ${layoutStyles.menuActiveLink}` : undefined}>
              대리점 및 물류업체 관리
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default HeadMenu