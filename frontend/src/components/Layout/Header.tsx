import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // tsx면 .ts 제거
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import layoutStyles from "./layout.module.css";

// JWT payload 타입 정의
interface JwtPayload {
    sub?: string;
    [key: string]: any;
}

// 유저 정보 타입 (받는 데이터 구조에 맞게 수정 가능)
interface UserInfo {
    hdProfile?: string | null;
    hdAuth?: string;
    hdName?: string;
}

function parseJwt(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (err) {
        console.error("JWT 파싱 실패:", err);
        return null;
    }
}

function Header() {
    const navigate = useNavigate();

    const { token, logout } = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (token) {
            const payload = parseJwt(token);
            const hdId = payload?.sub;

            if (hdId) {
                axios.get<UserInfo>(`http://localhost:8080/api/head/mypage/${hdId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(res => setUserInfo(res.data))
                    .catch(err => console.error("유저 정보 가져오기 실패:", err));
            }
        }
    }, [token]);

    const handleLogout = () => {
        logout(); // 인자 없이 호출
        navigate("/");
    };

    return (
        <header>
            <div className={layoutStyles.header_inner}>
                <h1 className={layoutStyles.logo}>
                    <Link to={"/head"}>
                        {/* 진경 수정 */}
                        <img src="/src/assets/logo.png" alt="LOGO" />
                    </Link>
                </h1>
                <ul>
                    <li className={layoutStyles.user}>
            <span className={layoutStyles.userImg}>
              {userInfo?.hdProfile ? (
                  <img
                      src={`http://localhost:8080${userInfo.hdProfile}`}
                      alt="프로필"
                  />
              ) : (
                  <img src="/src/assets/images/default.png" alt="기본 프로필" />
              )}
            </span>
                        <span className={layoutStyles.userText}>
              <small>{userInfo?.hdAuth || "직급"}</small>{" "}
                            {userInfo?.hdName || "사용자"}
            </span>
                    </li>
                    <li className={layoutStyles.my}>
                        <Link to={"/mypageOffice"}>mypage</Link>
                    </li>
                    <li className={layoutStyles.log} onClick={handleLogout}>Logout</li>
                </ul>
            </div>
        </header>
    );
}

export default Header;
