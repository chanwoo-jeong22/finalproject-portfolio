import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/auth/auth-slice";


 // Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

/*
 * 요청 인터셉터
 * - 그 외 요청은 Redux 또는 localStorage에서 토큰을 가져와 Authorization에 추가
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰이 필요 없는 공개 API
    const publicPaths = [
      "/login",
      "/auth/signup",
      "/users/check-id",
      "/users/check-email",
      "/auth/findPw",
      "/auth/resetPw",

    ];

    // 공개 API라면 Authorization 제거
    if (publicPaths.some((p) => config.url?.includes(p))) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      console.log("[PUBLIC API] 토큰 제외:", config.url);
      return config;
    }

    // 기존 토큰 로직 그대로 유지
    let token: string | null = store.getState().auth.token ?? null;

    if (!token) {
      token = localStorage.getItem("token");
      if (token) {
        console.log("[api.ts] 요청 인터셉터 - localStorage 토큰 사용", config.url);
      } else {
        console.log("[api.ts] 요청 인터셉터 - 토큰 없음", config.url);
      }
    } else {
      console.log("[api.ts] 요청 인터셉터 - redux store 토큰 사용", config.url);
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("config check....................", config);

    return config;
  },
  (error) => Promise.reject(error)
);


//  응답 인터셉터
//  - 401 / 403 발생 시 자동 로그아웃 처리
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        console.warn("[api.ts] 응답 인터셉터 - 인증 오류, 자동 로그아웃");
        store.dispatch(logout());
      }
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
