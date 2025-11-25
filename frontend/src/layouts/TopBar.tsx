import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "../styles/logistic/logistic-menubox.module.css";
import { AuthContext } from "../context/auth-context";

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

interface AgencyUserInfo {
    agName?: string;
    agCeo?: string;
}

interface LogisticUserInfo {
    lgName?: string;
    lgCeo?: string;
}

type UserInfo = AgencyUserInfo & LogisticUserInfo & Record<string, any>;

function TopBar() {
    const { token, logout } = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState<UserInfo>({});
    const [userType, setUserType] = useState<"agency" | "logistic" | null>(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // AuthContext에 인자 없이 호출하도록 맞춰서 변경 필요
        navigate("/");
    };

    useEffect(() => {
        if (!token) return;

        const payload = parseJwt(token);
        if (!payload?.role || !payload?.sub) return;

        setUserType(payload.role as "agency" | "logistic");

        const fetchUserInfo = async () => {
            try {
                const url =
                    payload.role === "agency"
                        ? `http://localhost:8080/api/agency/mypage/${payload.sub}`
                        : `http://localhost:8080/api/logistic/mypage/${payload.sub}`;

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;

                const data = await res.json();
                setUserInfo(prev => (JSON.stringify(prev) !== JSON.stringify(data) ? data : prev));
            } catch (err) {
                console.error("유저 정보 fetch 실패:", err);
            }
        };

        fetchUserInfo();
    }, [token]);

    const myPageLink =
        userType === "agency"
            ? "/agency/mypage"
            : userType === "logistic"
                ? "/logistic/mypage"
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
