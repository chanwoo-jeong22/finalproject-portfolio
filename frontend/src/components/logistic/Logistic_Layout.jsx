import { Outlet } from "react-router-dom";
import TopBar from "../Layout/TopBar.jsx";
import style from "./Logistic_MenuBox.module.css";
import Logistic_SideBar from "./Logistic_SideBar.jsx";

function Logistic_Layout() {
    return (
        <>
            {/*진경 수정*/}
            <div className={style.wrap}>
                <Logistic_SideBar />
                <div className={style.container}>
                    <TopBar />
                    <div className={style.lg_main}>
                        <div className={style.content}>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Logistic_Layout;