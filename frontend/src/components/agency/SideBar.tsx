import { Link, NavLink } from "react-router-dom";
import style from "../../styles/agency/menu-box.module.css";

function SideBar() {
    return (
        <aside className={style.sidebar}>
            {/* 로고 */}
            <div className={style.logo}>
                <Link to="/agency">
                    <img src="/src/assets/logo.png" alt="LOGO" />
                </Link>
            </div>

            {/* 네비게이션 메뉴 */}
            <nav>
                <NavLink
                    to="/agency/order-management"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    주문 관리
                </NavLink>

                <NavLink
                    to="/agency/inventory"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    재고 현황
                </NavLink>

                <NavLink
                    to="/agency/order-draft"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    주문 임시저장
                </NavLink>

                <NavLink
                    to="/agency/order-status"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    주문 현황
                </NavLink>
            </nav>
        </aside>
    );
}

export default SideBar;
