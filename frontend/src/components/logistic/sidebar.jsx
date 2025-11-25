
import { Link, NavLink } from "react-router-dom";
import style from "../../styles/logistic/logistic-menubox.module.css";

function LogisticSideBar() {
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
                    to="/logistic/orderful-fillment"
                    className={({ isActive }) =>
                        [style.centeritem, isActive ? style.active : ""].join(" ")
                    }
                >
                    주문 관리(출고)
                </NavLink>


                <NavLink
                    to="/logistic/logistic-inventory"
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

export default LogisticSideBar;
