// src/api/axiosInstance.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";

// ===================== 훅 버전 =====================
export const useApi = () => {
    const { token, logout } = useContext(AuthContext);

    const instance = axios.create({
        baseURL: "http://localhost:8080",
        withCredentials: true,
    });

    // 요청 인터셉터
    instance.interceptors.request.use(
        (config) => {
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        },
        (error) => Promise.reject(error)
    );

    // ✅ 응답 인터셉터 추가
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            // JWT 관련 오류 코드 처리 (401 Unauthorized / 403 Forbidden)
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn("JWT가 만료되었거나 유효하지 않습니다. 자동 로그아웃 처리합니다.");
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                logout?.(); // AuthContext에 logout 함수 있으면 실행
                alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// ===================== 일반 JS용 인스턴스 =====================
export const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터 추가
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("JWT가 만료되었거나 유효하지 않습니다. 자동 로그아웃 처리합니다.");
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
