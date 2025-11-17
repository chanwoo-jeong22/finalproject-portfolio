import {useContext, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import style from "../logistic/Logistic_MenuBox.module.css";
import {AuthContext} from "../../context/AuthContext";

// JWT 디코딩 함수
function parseJwt(token) {
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload); // base64 디코딩
        return JSON.parse(payload);
    } catch (err) {
        console.error("JWT 파싱 실패:", err);
        return null;
    }
}

function TopBar() {
    const {token, logout} = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState({});
    const [userType, setUserType] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (userType === "agency") logout("agency");
        else if (userType === "logistic") logout("logistic");
        navigate("/");
    };

    useEffect(() => {
        if (!token) return;

        // JWT decode
        const payload = parseJwt(token);
        if (!payload?.role || !payload?.sub) return;

        setUserType(payload.role);

        const fetchUserInfo = async () => {
            try {
                const url =
                    payload.role === "agency"
                        ? `http://localhost:8080/api/agency/mypage/${payload.sub}`
                        : `http://localhost:8080/api/logistic/mypage/${payload.sub}`;

                const res = await fetch(url, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (!res.ok) return;

                const data = await res.json();
                // 상태가 바뀔 때만 setUserInfo
                setUserInfo(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
            } catch (err) {
                console.error("유저 정보 fetch 실패:", err);
            }
        };

        fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 빈 배열로 한 번만 실행

    const myPageLink =
        userType === "agency"
            ? "/mypageAgency"
            : userType === "logistic"
                ? "/mypageLogistic"
                : "/";

    const companyName =
        userType === "agency"
            ? userInfo.agName
            : userType === "logistic"
                ? userInfo.lgName
                : "회사 이름";

    const ownerName =
        userType === "agency"
            ? userInfo.agCeo
            : userType === "logistic"
                ? userInfo.lgCeo
                : "업주명";

    return (
        // 진경 수정
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
