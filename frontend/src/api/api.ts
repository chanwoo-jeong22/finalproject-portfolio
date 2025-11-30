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

    let token = store.getState().auth.token || localStorage.getItem("token");

    console.log("[api.ts] 요청 인터셉터 - 토큰:", token);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('config check....................', config)

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
    // 정상 응답은 그대로 리턴
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        console.warn("[api.ts] 응답 인터셉터 - 인증 오류 발생, 자동 로그아웃 처리");

        // Redux store에 logout 액션 dispatch
        store.dispatch(logout());

        // localStorage token 등 데이터 클리어는 authSlice 내 logout 리듀서에서 처리
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
