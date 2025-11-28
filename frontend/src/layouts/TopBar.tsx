import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "../styles/logistic/logistic-menubox.module.css";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { logout } from "../redux/slices/auth/auth-slice";

// JWT 디코딩 함수
function parseJwt(token: string | null): { role?: string; sub?: string } | null {
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (err) {
        console.error("JWT 파싱 실패:", err);
        return null;
    }
}

function TopBar() {
    const token = useAppSelector(state => state.auth.token);
    const userInfo = useAppSelector(state => state.auth.userInfo);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const payload = parseJwt(token);
    const userType = payload?.role === "agency" || payload?.role === "logistic"
        ? (payload.role as "agency" | "logistic")
        : null;

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const myPageLink =
        userType === "agency"
            ? "/agency/mypage"
            : userType === "logistic"
                ? "/logistic/mypage"
                : "/";

    const companyName =
        userType === "agency"
            ? userInfo.agName || "회사 이름"
            : userType === "logistic"
                ? userInfo.lgName || "회사 이름"
                : "회사 이름";

    const ownerName =
        userType === "agency"
            ? userInfo.agCeo || "업주명"
            : userType === "logistic"
                ? userInfo.lgCeo || "업주명"
                : "업주명";

    return (
        <header className={style.topbar}>
            <div className={style.topbarinner}>
                <div className={style.usermenu}>
                    <span className={style.username}>{ownerName}</span>
                    <Link to={myPageLink}>mypage</Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
                <span className={style.comname}>{companyName}</span>
            </div>
        </header>
    );
}

export default TopBar;
