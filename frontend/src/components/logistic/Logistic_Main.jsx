
import Logistic_Notice from "./Logistic_Notice.jsx";
import style from "./Logistic_MenuBox.module.css";

function Logistic_Main() {
    return (
        // 진경 클래스 추가
        <div className={style.scroll_y}>
            <Logistic_Notice/>
        </div>
    );
}

export default Logistic_Main