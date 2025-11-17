import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // 인증 관련 컨텍스트 불러오기
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// AuthContext에 저장된 타입 정의 (타입스크립트용)
interface AuthContextType {
    token: string | null;         // JWT 토큰
    logout?: () => void;          // 로그아웃 함수 (선택적)
}

// =======================
// 훅 형태로 사용하는 Axios 인스턴스 생성 함수
// =======================
export const useApi = (): AxiosInstance => {
    // AuthContext에서 token과 logout 함수 가져오기
    const { token, logout } = useContext<AuthContextType>(AuthContext);

    // axios 인스턴스 생성 (기본 URL과 쿠키 전송 허용)
    const instance = axios.create({
        baseURL: "http://localhost:8080",  // API 서버 주소
        withCredentials: true,              // 쿠키 허용
    });

    // 요청 인터셉터 등록
    // 서버로 요청이 가기 전에 실행되어 토큰을 헤더에 자동 추가
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            // 토큰이 있고, headers가 존재하면 Authorization 헤더 추가
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;  // 수정한 config 객체 반환
        },
        (error: AxiosError) => Promise.reject(error)  // 요청 에러가 발생하면 거절
    );

    // 응답 인터셉터 등록
    // 서버 응답을 받거나 에러 발생 시 처리
    instance.interceptors.response.use(
        (response: AxiosResponse) => response, // 정상 응답은 그대로 반환
        (error: AxiosError) => {
            // 인증 관련 오류 처리 (401, 403)
            if (error.response?.status === 401 || error.response?.status === 403) {
                // 토큰 삭제 및 로그아웃 처리
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                logout?.();  // logout 함수가 있으면 실행
                alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                window.location.href = "/login"; // 로그인 페이지로 이동
            }
            return Promise.reject(error);  // 에러 다시 전달
        }
    );

    return instance;  // 설정된 axios 인스턴스 반환
};

// =======================
// 일반 JS에서 사용하는 axios 인스턴스
// =======================
export const api = axios.create({
    baseURL: "http://localhost:8080",  // 기본 API 서버 주소
    withCredentials: true,              // 쿠키 허용
});

// 요청 인터셉터
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");  // 로컬스토리지에서 토큰 꺼내기
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`; // 토큰이 있으면 헤더에 붙임
        }
        return config;  // 요청 설정 반환
    },
    (error: AxiosError) => Promise.reject(error)  // 요청 에러 시 거절
);

// 응답 인터셉터
api.interceptors.response.use(
    (response: AxiosResponse) => response,  // 정상 응답은 그대로 반환
    (error: AxiosError) => {
        // 401, 403 에러 발생 시 자동 로그아웃 처리
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("token");   // 토큰 삭제
            sessionStorage.removeItem("token"); // 세션스토리지 토큰 삭제
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            window.location.href = "/login";    // 로그인 페이지로 이동
        }
        return Promise.reject(error);  // 에러 다시 전달
    }
);
