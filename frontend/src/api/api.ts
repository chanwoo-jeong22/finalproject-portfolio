import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/auth/auth-slice";

/**
 * Axios 인스턴스 생성
 */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  // withCredentials: true,
});

/**
 * 요청 인터셉터
 * - 로그인 요청(/login)에는 Authorization 헤더를 붙이지 않음
 * - 그 외 요청은 Redux state나 localStorage에서 토큰을 읽어 Authorization 헤더에 붙임
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url === "/login") {
      return config;
    }

    // Redux store에서 토큰 가져오기 (string | undefined)
    let token: string | null = store.getState().auth.token ?? null;

    // Redux에 토큰 없으면 localStorage에서 가져오기 (string | null)
    if (!token) {
      token = localStorage.getItem("token");
      if (token) {
        console.log("[api.ts] 요청 인터셉터 - localStorage에서 토큰 읽음", config.url);
      } else {
        console.log("[api.ts] 요청 인터셉터 - 토큰 없음", config.url);
      }
    } else {
      console.log("[api.ts] 요청 인터셉터 - redux store 토큰 사용", config.url);
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('config check....................', config);

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터
 * - 401 Unauthorized, 403 Forbidden 에러 시 자동 로그아웃 처리
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url ?? "";

      console.log("[api.ts] 응답 에러 발생:", status, url);

      // 인증 관련된 URL만 로그아웃 처리
      const authUrls = ["/login", "/auth", "/refresh", "/auth/verify"];

      const isAuthRequest = authUrls.some((path) => url.includes(path));

      // 🔥 인증 요청에서만 자동 로그아웃
      if (isAuthRequest && (status === 401 || status === 403)) {
        console.warn("[api.ts] 인증 요청 실패 → 자동 로그아웃");
        store.dispatch(logout());
      }

      // ❗ 일반 API는 실패해도 절대 로그아웃하지 않음
    }

    return Promise.reject(error);
  }
);


export interface NoticeUpdatePayload {
  ntCode: number;
  ntCategory: string;
  ntContent: string;
  startDate: string;
  endDate: string;
}

export const noticeApi = {
  updateNotice: (ntKey: number, data: NoticeUpdatePayload) =>
    api.put(`/notices/${ntKey}`, data),

  deleteNotices: (keys: number[]) =>
    api.delete(`/notices`, { data: keys }),
};

export default api;
