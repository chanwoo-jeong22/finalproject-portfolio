import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

// 요청 인터셉터 - redux store에서 토큰을 꺼내서 헤더에 넣기
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token; // redux auth slice 안에 token 저장했다고 가정
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 401/403 에러 시 처리 (로그아웃 등)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 토큰 제거, 로그아웃 처리 로직
      store.dispatch({ type: "auth/logout" }); // redux 로그아웃 액션 호출
      alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
