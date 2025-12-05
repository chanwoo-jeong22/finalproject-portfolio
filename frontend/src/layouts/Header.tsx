import { useEffect, useState } from "react";
import api from "../api/api"; // axios 인스턴스
import { Link, useNavigate } from "react-router-dom";
import layoutStyles from "../styles/layout.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/slices/auth/auth-slice";

/**
 * JWT 토큰 페이로드 구조 타입 (payload는 다양한 키가 있을 수 있어서
 * 인덱스 시그니처도 포함)
 */
interface JwtPayload {
  sub?: string; // 사용자 식별 ID (subject)
  [key: string]: unknown; // 그 외 임의 키-값 쌍
}

/**
 * 사용자 정보 타입 - API에서 받아오는 데이터 형태에 맞춰서 정의
 */
interface UserInfo {
  hdProfile?: string | null; // 프로필 이미지 경로 (null일 수도 있음)
  hdAuth?: string;           // 직급 정보 (ex. "관리자", "직원" 등)
  hdName?: string;           // 사용자 이름
}

/**
 * JWT 토큰을 받아 페이로드 부분만 파싱해서 객체로 반환하는 함수
 * - 토큰이 없으면 null 반환
 * - 파싱 실패해도 null 반환
 */
function parseJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    // 토큰은 '헤더.페이로드.서명' 형태, 페이로드는 두번째 부분
    const base64Payload = token.split(".")[1];
    // atob로 디코딩 후 JSON 파싱
    const payloadJson = atob(base64Payload);
    return JSON.parse(payloadJson);
  } catch (err) {
    // 파싱 오류가 나면 콘솔에 기록하고 null 반환
    console.error("JWT 파싱 실패:", err);
    return null;
  }
}

/**
 * Header 컴포넌트 - 상단 헤더 UI 담당
 */
function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux에서 로그인 토큰 가져오기
  const token = useSelector((state: RootState) => state.auth.token);

  // API에서 가져온 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  /**
   * 토큰이 변경될 때마다 페이로드를 파싱해서 사용자 ID(hdId)를 추출
   * 그걸로 마이페이지 API 호출해서 사용자 정보 받아오기
   */
  useEffect(() => {
    if (!token) return; // 토큰 없으면 작업 안 함

    // 토큰 파싱
    const payload = parseJwt(token);
    const hdId = payload?.sub; // sub가 사용자 ID라고 가정

    if (hdId) {
      // 사용자 정보 API 호출
      api
        .get<UserInfo>(`/head/mypage/${hdId}`)
        .then((res) => setUserInfo(res.data))
        .catch((err) => {
          // 에러는 콘솔에만 기록 (UI에선 따로 처리하지 않음)
          console.error("유저 정보 가져오기 실패:", err);
        });
    }
  }, [token]);

  /**
   * 로그아웃 처리
   * - redux 상태에서 토큰 제거
   * - 메인 페이지로 이동
   */
  const handleLogout = () => {
    dispatch(logout()); // 토큰 삭제
    navigate("/");      // 루트 페이지로 이동
  };

  return (
    <header>
      <div className={layoutStyles.header_inner}>
        {/* 로고 영역 */}
        <h1 className={layoutStyles.logo}>
          <Link to={"/head"}>
            {/* 상대경로를 절대경로로 바꾸거나, 빌드시 리소스 경로가 올바른지 확인 필요 */}
            <img src="/src/assets/logo.png" alt="LOGO" />
          </Link>
        </h1>

        {/* 사용자 정보 및 메뉴 */}
        <ul>
          <li className={layoutStyles.user}>
            <span className={layoutStyles.userImg}>
              {/* 프로필 이미지가 있으면 표시, 없으면 기본 이미지 사용 */}
              {userInfo?.hdProfile ? (
                <img
                  src={`http://localhost:8080${userInfo.hdProfile}`}
                  alt="프로필"
                />
              ) : (
                <img
                  src="/src/assets/images/default.png"
                  alt="기본 프로필"
                />
              )}
            </span>

            {/* 사용자 직급과 이름 표시, 없으면 기본 텍스트 */}
            <span className={layoutStyles.userText}>
              <small>{userInfo?.hdAuth || "직급"}</small>{" "}
              {userInfo?.hdName || "사용자"}
            </span>
          </li>

          {/* 마이페이지 링크 */}
          <li className={layoutStyles.my}>
            <Link to={"/head/mypage"}>mypage</Link>
          </li>

          {/* 로그아웃 버튼 */}
          <li className={layoutStyles.log} onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
