import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// AuthContext의 값 타입 정의
interface UserInfo {
    [key: string]: any; // 유저 정보는 자유롭게 확장 가능
}

interface AuthContextType {
    hdId: string | null;
    agId: string | null;
    lgId: string | null;
    token: string | null;
    userInfo: UserInfo;
    login: (newToken: string, userId: string, role: string) => Promise<void>;
    logout: () => void;
}

// 초기값은 null로 설정 (사용 시 null 체크 필수)
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * JWT 토큰을 파싱해서 payload를 추출하는 함수
 * @param token JWT 토큰 문자열
 * @returns 파싱된 payload 객체 혹은 null (실패 시)
 */
function parseJwt(token: string | null): any | null {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload;
    } catch (err) {
        console.error("JWT 파싱 실패:", err);
        return null;
    }
}

// AuthProvider의 props 타입 (children은 ReactNode 타입)
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider 컴포넌트
 * 전역 인증 상태 관리용 Context Provider 역할 수행
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
    // 로컬스토리지에서 초기값 가져오기 (있으면 설정, 없으면 null)
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [hdId, setHdId] = useState<string | null>(() => localStorage.getItem("hdId"));
    const [agId, setAgId] = useState<string | null>(() => localStorage.getItem("agId"));
    const [lgId, setLgId] = useState<string | null>(() => localStorage.getItem("lgId"));

    // 유저 정보 상태, 초기값은 빈 객체
    const [userInfo, setUserInfo] = useState<UserInfo>(() => {
        const stored = localStorage.getItem("userInfo");
        if (stored && stored !== "undefined") {
            try {
                return JSON.parse(stored);
            } catch {
                return {};
            }
        }
        return {};
    });

    /**
     * 로그인 처리 함수
     * 토큰 및 유저ID, 역할에 따라 상태와 로컬스토리지에 저장하고,
     * 역할에 따라 유저 정보를 API에서 가져와 저장함
     * @param newToken 로그인 성공 후 받은 JWT 토큰
     * @param userId 로그인한 유저의 ID
     * @param role 사용자 역할 (head_office, agency, logistic)
     */
    const login = async (newToken: string, userId: string, role: string) => {
        try {
            setToken(newToken);
            localStorage.setItem("token", newToken);

            // 역할별 ID 상태 및 로컬스토리지 저장
            if (role === "head_office") {
                setHdId(userId);
                localStorage.setItem("hdId", userId);
            } else if (role === "agency") {
                setAgId(userId);
                localStorage.setItem("agId", userId);
            } else if (role === "logistic") {
                setLgId(userId);
                localStorage.setItem("lgId", userId);
            }

            // agency 또는 logistic 역할인 경우 유저 정보를 서버에서 받아 상태에 저장
            if (role === "agency" || role === "logistic") {
                const type = role === "agency" ? "agency" : "logistic";
                const res = await axios.get(`http://localhost:8080/api/${type}/mypage/${userId}`, {
                    headers: { Authorization: `Bearer ${newToken}` },
                });
                setUserInfo(res.data);
                localStorage.setItem("userInfo", JSON.stringify(res.data));
            }
        } catch (err) {
            console.error("로그인 직후 유저 정보 fetch 실패:", err);
        }
    };

    /**
     * 로그아웃 처리 함수
     * 상태와 로컬스토리지에서 인증 관련 정보 모두 삭제,
     * 로그아웃 후 로그인 페이지로 이동
     */
    const logout = () => {
        console.warn("로그아웃 실행: JWT 및 사용자 정보 초기화");
        setToken(null);
        setHdId(null);
        setAgId(null);
        setLgId(null);
        setUserInfo({});

        localStorage.removeItem("token");
        localStorage.removeItem("hdId");
        localStorage.removeItem("agId");
        localStorage.removeItem("lgId");
        localStorage.removeItem("userInfo");

        window.location.href = "/login";
    };

    /**
     * 새로고침 시에도 인증 정보를 유지하기 위해
     * agId 또는 lgId가 존재하고 토큰도 유효하며 유저 정보가 비어있으면
     * 서버에서 유저 정보를 다시 받아와 상태에 저장함
     */
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                if ((agId || lgId) && token && Object.keys(userInfo).length === 0) {
                    const type = agId ? "agency" : "logistic";
                    const id = agId || lgId;

                    const res = await axios.get(`http://localhost:8080/api/${type}/mypage/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserInfo(res.data);
                    localStorage.setItem("userInfo", JSON.stringify(res.data));
                }
            } catch (err) {
                console.error("유저 정보 fetch 실패:", err);
            }
        };
        fetchUserInfo();
    }, [agId, lgId, token]);

    // Context.Provider에 상태와 함수를 전달하여
    // 하위 컴포넌트들이 사용할 수 있게 함
    return (
        <AuthContext.Provider value={{ hdId, agId, lgId, token, userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
