
import LogisticNotice from "./logistic-notice.jsx";
import style from "../../styles/logistic/logistic-menubox.module.css";

function LogisticIndex() {
    return (
        // 진경 클래스 추가
        <div className={style.scroll_y}>
            <LogisticNotice/>
        </div>
    );
}

export default LogisticIndex