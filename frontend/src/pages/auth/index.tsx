import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/login/login.module.css";
import logo from "../../assets/img/logo.png";
import { useAppDispatch } from "../../redux/hooks";  // useAppSelector는 필요없어짐
import { login as loginThunk, reloadUserInfo } from "../../redux/slices/auth/auth-slice";

function Login() {
  const [sep, setSep] = useState<"head_office" | "agency" | "logistic">("head_office");
  const [userIdInput, setUserIdInput] = useState<string>("");
  const [userPw, setUserPw] = useState<string>("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userIdInput.trim() || !userPw.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const resultAction = await dispatch(
        loginThunk({ userId: userIdInput, userPassword: userPw, role: sep })
      );

      if (loginThunk.fulfilled.match(resultAction)) {
        // 로그인 API 응답에서 token, userId, role 직접 받아오기
        const { token, userId, role } = resultAction.payload;

        if (!token || !userId) {
          alert("토큰이나 사용자 ID가 없습니다.");
          return;
        }

        // 로그인 직후 사용자 상세정보를 서버에서 재조회하여 상태 업데이트
        await dispatch(reloadUserInfo({ token, role, userId })).unwrap();

        // 권한별 페이지 이동
        if (role === "head_office") navigate("/head");
        else if (role === "agency") navigate("/agency");
        else if (role === "logistic") navigate("/logistic");

      } else if (loginThunk.rejected.match(resultAction)) {
        alert(resultAction.payload || "로그인에 실패했습니다.");
      }
    } catch (err) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleSepChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSep(e.target.value as "head_office" | "agency" | "logistic");
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth_back}><div className={styles.back}></div></div>
      <div className={styles.login}>
        <div className={styles.logo}><img src={logo} alt="로고" /></div>
        <form onSubmit={handleLogin}>
          <div className={styles.login_radio}>
            <label>
              <input
                type="radio"
                name="sep"
                value="head_office"
                checked={sep === "head_office"}
                onChange={handleSepChange}
              />
              <span>본사</span>
            </label>
            <label>
              <input
                type="radio"
                name="sep"
                value="agency"
                checked={sep === "agency"}
                onChange={handleSepChange}
              />
              <span>대리점</span>
            </label>
            <label>
              <input
                type="radio"
                name="sep"
                value="logistic"
                checked={sep === "logistic"}
                onChange={handleSepChange}
              />
              <span>물류업체</span>
            </label>
          </div>

          <div className={styles.login_contents}>
            <div className={styles.contents}>
              <p>아이디</p>
              <input
                type="text"
                value={userIdInput}
                onChange={e => setUserIdInput(e.target.value)}
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

            <div className={styles.login_bottom}>
              <button className={styles.login_btn} type="submit">로그인</button>
              <Link to="/find-password" className={styles.link_pass}>비밀번호를 잊으셨나요?</Link>
              <Link to="/sign-up" className={styles.link_join}>회원가입</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
