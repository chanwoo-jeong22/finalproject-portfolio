import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

interface AuthContextType {
    token: string | null;
    logout?: () => void;
}

export const useApi = (): AxiosInstance => {
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error("AuthContext가 초기화되지 않았습니다.");
    }

    const { token, logout } = auth;

    // axios 인스턴스를 한 번만 생성하고, 토큰이 바뀌면 interceptors가 반영되도록 useMemo 사용
    const instance = useMemo(() => {
        const apiInstance = axios.create({
            baseURL: "http://localhost:8080",
            withCredentials: true,
        });

        apiInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        apiInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("token");
                    logout?.();
                    alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }
        );

        return apiInstance;
    }, [token, logout]);

    return instance;
};


// 일반 JS 등에서 쓸 수 있는 기본 axios 인스턴스
export const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
