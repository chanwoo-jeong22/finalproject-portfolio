import {Link, NavLink} from "react-router-dom";
import style from "../Agency/MenuBox.module.css";

function SideBar() {
    return (
        <aside className={style.sidebar}>
            {/* 로고 영역 */}
            <div className={style.logo}>
                {/*진경 추가*/}
                <Link to={"/agency"}>
                    <img src="/src/assets/logo.png" alt="LOGO" />
                </Link>
            </div>

            {/* 네비게이션 메뉴 */}
            <nav>
                {/* 주문 관리 페이지 */}
                <NavLink
                    to="/agency/orders"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    주문 관리
                </NavLink>

                {/* 재고 현황 페이지 */}
                <NavLink
                    to="/agency/inventory-management"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    재고 현황
                </NavLink>

                {/* 주문 임시저장 페이지 */}
                <NavLink
                    to="/agency/orders-draft"
                    className={({ isActive }) =>
                        isActive ? `${style.centeritem} ${style.activeMenu}` : style.centeritem
                    }
                >
                    주문 임시저장
                </NavLink>

                {/* 새로 추가: 주문 현황(OrderStatus) 페이지 */}
                <NavLink
                    to="/agency/order-status"  // Route 설정에서 이 경로로 OrderStatus 컴포넌트를 렌더링
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
