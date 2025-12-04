// styles 임포트 (CSS 모듈)
import styles from "../../../styles/login/login.module.css";

// React 및 훅 관련 임포트
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

// Redux 커스텀 훅 임포트 (타입 안전한 dispatch와 selector)
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

// password slice의 findPassword thunk와 상태 리셋 액션 임포트
import { findPassword, resetStatus } from "../../../redux/slices/auth/password-slice";
import { useNavigate } from "react-router-dom";


/**
 * FindPassword 컴포넌트
 * - 아이디와 이메일을 입력받아 비밀번호 재설정 요청을 보냄
 * - 요청 상태 및 결과는 Redux 상태에서 관리
 */
const FindPassword: React.FC = () => {
  // Redux dispatch 함수 (타입 보장)
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux 상태에서 password slice 관련 상태 가져오기
  const { status, error, result } = useAppSelector((state) => state.password);

  // 아이디와 이메일 입력값을 로컬 상태로 관리
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  /**
   * 컴포넌트 언마운트 시 상태 초기화
   * - 이전에 남아있는 결과나 에러를 없애기 위함
   */
  useEffect(() => {
    return () => {
      dispatch(resetStatus());
    };
  }, [dispatch]);

  // 아이디 입력값 변경 핸들러
  const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  // 이메일 입력값 변경 핸들러
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 폼 제출 시 실행되는 함수
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 빈 값 검증
    if (!userId.trim() || !email.trim()) {
      alert("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    // 비밀번호 찾기 요청을 위한 Redux thunk 액션 디스패치
    dispatch(findPassword({ userId, email }));
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth_back}>
        <div className={styles.back}></div>
      </div>

      <div className={styles.find}>
        <div
          style={{
            position: "relative",
            marginBottom: "20px",
            height: "32px",
          }}
        >
          {/* 홈 아이콘 - 왼쪽에 고정 */}
          <span
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              color: "#000", // 검정색
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/");
              }
            }}
            aria-label="홈으로 이동"
          >
            {/* 좀 더 깔끔한 집 모양 SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 9.5L12 3l9 6.5v11a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-11z" />
            </svg>
          </span>


          {/* 비밀번호 찾기 텍스트 - 컨테이너 중앙에 */}
          <h2
            className={styles.title}
            style={{
              margin: 0,
              lineHeight: "32px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            비밀번호 찾기
          </h2>
        </div>




        <form onSubmit={handleSubmit}>
          <div className={styles.find_contents}>

            {/* 아이디 입력 폼 */}
            <div className={styles.contents}>
              <p>아이디</p>
              <input
                type="text"
                name="userId"
                value={userId}
                onChange={handleUserIdChange}
                autoComplete="username"
              />
            </div>

            {/* 이메일 입력 폼 */}
            <div className={styles.contents}>
              <p>이메일</p>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
              />
            </div>

            {/* 요청 상태에 따른 메시지 표시 */}
            <div className={styles.inco}>
              {result === "noUser" && (
                <span className={styles.red}>
                  입력하신 정보와 일치하는 계정을 찾을 수 없습니다.
                  <br />
                  아이디와 이메일을 다시 확인해주세요.
                </span>
              )}
              {result === "fail" && (
                <span className={styles.red}>
                  메일 발송에 실패했습니다.
                  <br />
                  잠시 후 다시 시도해주세요.
                </span>
              )}
              {result === "success" && (
                <span className={styles.green}>
                  입력하신 이메일로 비밀번호 재설정 링크를
                  <br />
                  발송했습니다.
                  <br />
                  메일함을 확인해주세요.
                  <br />
                  (스팸메일함도 확인 부탁드립니다.)
                </span>
              )}

              {/* 로딩 중 표시 */}
              {status === "loading" && <span>메일 전송 중...</span>}

              {/* 에러 발생 시 메시지 */}
              {status === "failed" && error && (
                <span className={styles.red}>오류: {error}</span>
              )}
            </div>

            {/* 제출 버튼 - 요청 중엔 비활성화 */}
            <button type="submit" disabled={status === "loading"}>
              비밀번호 찾기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindPassword;
