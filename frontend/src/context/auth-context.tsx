import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// 유저 정보 타입 (필요에 따라 확장 가능)
interface UserInfo {
    [key: string]: any;
}

// AuthContext에서 제공할 상태와 함수 타입 정의
interface AuthContextType {
    hdId: string | null;
    agId: string | null;
    lgId: string | null;
    token: string | null;
    userInfo: UserInfo;
    login: (token: string, userId: string, role: string) => Promise<void>;
    logout: () => void;
}

// 기본값 세팅 (null 또는 빈 함수)
export const AuthContext = createContext<AuthContextType>({
    hdId: null,
    agId: null,
    lgId: null,
    token: null,
    userInfo: {},
    login: async () => {},
    logout: () => {},
});

// AuthProvider 컴포넌트 타입 정의
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // 초기 상태는 localStorage에 저장된 값을 불러옴
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [hdId, setHdId] = useState<string | null>(() => localStorage.getItem("hdId"));
    const [agId, setAgId] = useState<string | null>(() => localStorage.getItem("agId"));
    const [lgId, setLgId] = useState<string | null>(() => localStorage.getItem("lgId"));

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

    // 로그인 함수: 토큰과 유저 정보 저장, 역할에 따른 ID 분리 관리
    const login = async (newToken: string, userId: string, role: string) => {
        try {
            setToken(newToken);
            localStorage.setItem("token", newToken);

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

            // agency 또는 logistic 일 때만 추가로 유저 정보 서버에서 받아 저장
            if (role === "agency" || role === "logistic") {
                const type = role === "agency" ? "agency" : "logistic";
                const res = await axios.get(`http://localhost:8080/api/${type}/mypage/${userId}`, {
                    headers: { Authorization: `Bearer ${newToken}` },
                });
                setUserInfo(res.data);
                localStorage.setItem("userInfo", JSON.stringify(res.data));
            }
        } catch (error) {
            console.error("로그인 후 유저 정보 불러오기 실패", error);
        }
    };

    // 로그아웃 함수: 상태 초기화 및 localStorage 삭제, 로그인 페이지로 이동
    const logout = () => {
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

    // 페이지 새로고침 시 userInfo가 비어있으면 서버에서 다시 받아서 세팅
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
            } catch (error) {
                console.error("유저 정보 재요청 실패", error);
            }
        };
        fetchUserInfo();
    }, [agId, lgId, token, userInfo]);

    return (
        <AuthContext.Provider value={{ hdId, agId, lgId, token, userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
