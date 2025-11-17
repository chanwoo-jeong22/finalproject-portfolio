import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import api from "../../api/api";
import styles from "./auth.module.css";
import logo from '../../assets/img/logo.png';

/**
 * Login 컴포넌트
 * -----------------
 * 본사 / 대리점 / 물류업체 계정을 선택하여 로그인
 * 문제: 이전 코드에서 정의되지 않은 변수(userId)를 사용 -> ReferenceError 발생
 * 수정: useState로 선언한 userIdInput만 사용하고 중복 input 제거
 */
function Login() {
  // 계정 구분 (본사, 대리점, 물류업체)
  const [sep, setSep] = useState("head_office");

  // 입력값 상태
  const [userIdInput, setUserIdInput] = useState(""); // 아이디
  const [userPw, setUserPw] = useState("");           // 비밀번호

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!userIdInput.trim() || !userPw.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 로그인 API 요청
      const res = await api.post("/login", null, {
        params: { sep, loginId: userIdInput, loginPw: userPw }
      });

      // Context에 로그인 상태 저장
      login(res.data.token, res.data.userId, sep);

      // 로그인 후 페이지 이동
      if (sep === "head_office") navigate("/head");
      else if (sep === "agency") navigate("/agency");
      else if (sep === "logistic") navigate("/logistic");

    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert(err.response.data?.message || "아이디 또는 비밀번호가 잘못되었습니다.");
      } else {
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
      }
    }
  };

  return (
      <div className={styles.auth}>
        <div className={styles.auth_back}><div className={styles.back}></div></div>
        <div className={styles.login}>
          <div className={styles.logo}><img src={logo} alt="로고" /></div>
          <form onSubmit={handleLogin}>
            {/* 계정 구분 라디오 버튼 */}
            <div className={styles.login_radio}>
              <label>
                <input type="radio" name="sep" value="head_office" checked={sep==="head_office"} onChange={e => setSep(e.target.value)} />
                <span>본사</span>
              </label>
              <label>
                <input type="radio" name="sep" value="agency" checked={sep==="agency"} onChange={e => setSep(e.target.value)} />
                <span>대리점</span>
              </label>
              <label>
                <input type="radio" name="sep" value="logistic" checked={sep==="logistic"} onChange={e => setSep(e.target.value)} />
                <span>물류업체</span>
              </label>
            </div>

            {/* 로그인 입력 폼 */}
            <div className={styles.login_contents}>
              <div className={styles.contents}>
                <p>아이디</p>
                <input
                    type="text"
                    value={userIdInput}
                    onChange={e => setUserIdInput(e.target.value)} // userIdInput 사용
                />
              </div>
              <div className={styles.contents}>
                <p>비밀번호</p>
                <input
                    type="password"
                    value={userPw}
                    onChange={e => setUserPw(e.target.value)}
                />
              </div>

              {/* 버튼 영역 */}
              <div className={styles.login_bottom}>
                <button className={styles.login_btn} type="submit">로그인</button>
                <Link to="/findPw" className={styles.link_pass}>비밀번호를 잊으셨나요?</Link>
                <Link to="/join" className={styles.link_join}>회원가입</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
}

export default Login;
