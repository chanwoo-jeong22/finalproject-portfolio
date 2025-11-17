import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

function parseJwt(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (err) {
    console.error("JWT 파싱 실패:", err);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [hdId, setHdId] = useState(() => localStorage.getItem("hdId"));
  const [agId, setAgId] = useState(() => localStorage.getItem("agId"));
  const [lgId, setLgId] = useState(() => localStorage.getItem("lgId"));
  const [userInfo, setUserInfo] = useState(() => {
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

  // ====================== 로그인 처리 ======================
  const login = async (newToken, userId, role) => {
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

      // ✅ 유저 정보 가져오기 (await 필수)
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

  // ====================== 로그아웃 처리 ======================
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

    // 필요하다면 페이지 리다이렉트
    window.location.href = "/login";
  };

  // ====================== 새로고침 시 유저 정보 복원 ======================
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

  return (
      <AuthContext.Provider value={{ hdId, agId, lgId, token, userInfo, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};
