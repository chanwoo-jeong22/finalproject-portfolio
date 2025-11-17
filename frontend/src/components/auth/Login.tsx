import { useState, useContext, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import styles from "./auth.module.css";
import logo from "../../assets/img/logo.png";

// 로그인 API 응답 타입 정의 (필요시 맞게 수정)
interface LoginResponse {
    token: string;
    userId: string;
}

/**
 * Login 컴포넌트
 * -----------------
 * 본사 / 대리점 / 물류업체 계정을 선택하여 로그인 처리하는 UI입니다.
 *
 * 타입스크립트를 적용하여 state, 이벤트, API 응답 타입을 명확히 합니다.
 */
function Login() {
    // 계정 구분 상태 (본사, 대리점, 물류업체)
    const [sep, setSep] = useState<"head_office" | "agency" | "logistic">("head_office");

    // 입력값 상태: 아이디, 비밀번호
    const [userIdInput, setUserIdInput] = useState<string>("");
    const [userPw, setUserPw] = useState<string>("");

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    // 로그인 처리 함수
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 입력값 검증: 공백 제거 후 검사
        if (!userIdInput.trim() || !userPw.trim()) {
            alert("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            // 로그인 API 호출
            const res = await api.post<LoginResponse>("/login", null, {
                params: { sep, loginId: userIdInput, loginPw: userPw },
            });

            // Context에 로그인 상태 저장 (토큰, 사용자ID, 권한)
            login(res.data.token, res.data.userId, sep);

            // 권한별 메인 페이지로 이동
            if (sep === "head_office") navigate("/head");
            else if (sep === "agency") navigate("/agency");
            else if (sep === "logistic") navigate("/logistic");

        } catch (err: any) {
            // 에러 처리: 401 Unauthorized인 경우 메시지 출력
            if (err.response && err.response.status === 401) {
                alert(err.response.data?.message || "아이디 또는 비밀번호가 잘못되었습니다.");
            } else {
                alert("아이디 또는 비밀번호가 잘못되었습니다.");
            }
        }
    };

    // 라디오 버튼 변경 핸들러 타입 명시
    const handleSepChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSep(e.target.value as "head_office" | "agency" | "logistic");
    };

    // JSX 반환
    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}><div className={styles.back}></div></div>
            <div className={styles.login}>
                <div className={styles.logo}><img src={logo} alt="로고" /></div>
                <form onSubmit={handleLogin}>
                    {/* 계정 구분 라디오 버튼 */}
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

                    {/* 로그인 입력 폼 */}
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
