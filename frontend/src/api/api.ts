import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/auth/auth-slice";

/**
 * 🔧 Axios 인스턴스 생성
 * - baseURL: 모든 요청 앞에 자동으로 붙는 기본 주소
 * - withCredentials: 쿠키가 필요한 경우 true (JWT 토큰 인증만 쓰면 false 가능)
 */
const api = axios.create({
  baseURL: "http://localhost:8080/api", // 백엔드 API 기본 경로
  // withCredentials: true, // 쿠키가 필요할 때 활성화 (여기선 JWT 토큰 방식이므로 주석 처리)
});

/**
 * 🚀 요청 인터셉터
 * - 모든 API 요청 전에 실행됨
 * - Redux store에서 현재 로그인 토큰을 꺼내서
 *   Authorization 헤더에 Bearer 토큰으로 자동 추가
 * - 요청마다 토큰을 수동으로 넣을 필요 없음
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    let token = state.auth.token;

      // Redux 상태에 토큰 없으면 localStorage에서 읽어오기 시도
      if (!token) {
          token = localStorage.getItem("token");
      }

      console.log("[api.ts] 요청 인터셉터 토큰:", token);

    // 개발 중 요청 토큰 로그 (배포 시에는 제거 권장)
    console.log("[api.ts] 요청 인터셉터 토큰:", token);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error) // 요청 에러가 있으면 그대로 reject
);

/**
 * 🚨 응답 인터셉터
 * - 모든 API 응답 후 실행됨
 * - 서버에서 401(Unauthorized) 또는 403(Forbidden) 응답이 오면
 *   자동으로 로그아웃 처리하고 로그인 페이지로 이동
 * - 토큰 만료 등 인증 문제 발생 시 사용자 강제 로그아웃용
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response, // 성공 응답은 그대로 반환
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // 인증 에러 시 Redux 로그아웃 액션 디스패치
      store.dispatch(logout());

      alert("인증이 만료되었습니다. 다시 로그인해주세요.");

      // 로그인 페이지로 강제 이동
      window.location.href = "/login";
    }

    return Promise.reject(error); // 그 외 에러는 그대로 reject
  }
);

/**
 * Notice API 관련 타입 및 함수 모음
 */
export interface NoticeUpdatePayload {
  ntCode: number;
  ntCategory: string;
  ntContent: string;
  startDate: string;
  endDate: string;
}

export const noticeApi = {
  /**
   * 공지사항 수정 API 호출
   * @param ntKey 공지사항 고유키
   * @param data 수정할 공지사항 데이터
   */
  updateNotice: (ntKey: number, data: NoticeUpdatePayload) =>
    api.put(`/notices/${ntKey}`, data),

  /**
   * 공지사항 삭제 API 호출
   * @param keys 삭제할 공지사항 키 배열
   */
  deleteNotices: (keys: number[]) =>
    api.delete(`/notices`, { data: keys }),
};

export default api;
