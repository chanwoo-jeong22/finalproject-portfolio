
import { Link, NavLink } from "react-router-dom";
import style from "./Logistic_MenuBox.module.css";

function Logistic_SideBar() {
    return (
        <aside className={style.sidebar}>
            <div className={style.logo}>
                <Link to="/logistic">
                    {/*진경 로고 이미지 추가*/}
                    <img src="/src/assets/logo.png" alt="LOGO" />
                </Link>
            </div>

            <nav>
                <NavLink
                    to="/logistic/Logistic_Orders"
                    className={({ isActive }) =>
                        [style.centeritem, isActive ? style.active : ""].join(" ")
                    }
                >
                    주문 관리(출고)
                </NavLink>


                <NavLink
                    to="/logistic/Logistic_Stock"
                    className={({ isActive }) =>
                        [style.centeritem, isActive ? style.active : ""].join(" ")
                    }
                >
                    재고 현황
                </NavLink>

            </nav>
        </aside>
    );
}

export default Logistic_SideBar;
