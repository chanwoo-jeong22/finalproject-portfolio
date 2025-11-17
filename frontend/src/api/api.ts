import axios, { InternalAxiosRequestConfig } from "axios";

// ================== Axios 인스턴스 생성 ==================
// 기본 API 서버 주소와 쿠키 전송 허용 설정으로 axios 인스턴스 생성
const api = axios.create({
    baseURL: "http://localhost:8080/api", // API 기본 URL
    withCredentials: true, // 쿠키 포함 요청 허용 (인증 정보 전달용)
});

// ================== 요청 인터셉터 ==================
// 모든 요청이 서버로 가기 전에 실행됨
// 로컬 스토리지에서 JWT 토큰을 조회하여,
// 존재하면 Authorization 헤더에 'Bearer {token}' 형식으로 자동 추가
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error) // 요청 에러 시 Promise.reject로 에러 전파
);

// ================== 로그아웃 함수 ==================
// 로컬 스토리지에서 토큰 삭제 후,
// 로그인 페이지로 리다이렉트 처리
export const logout = (): void => {
    localStorage.removeItem("token");
    window.location.href = "/";
};

export default api;
