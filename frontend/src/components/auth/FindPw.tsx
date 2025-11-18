import api from "../../api/api";
import styles from "./auth.module.css";
import { useState, ChangeEvent, FormEvent } from "react";

function FindPw() {
    // 입력한 아이디 상태
    const [userId, setUserId] = useState<string>("");
    // 입력한 이메일 상태
    const [email, setEmail] = useState<string>("");
    // 처리 결과 상태 (noUser, fail, success, 또는 초기 "")
    const [status, setStatus] = useState<"noUser" | "fail" | "success" | "">("");
    // 로딩 중인지 여부
    const [loading, setLoading] = useState<boolean>(false);

    // 폼 제출 이벤트 핸들러
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 페이지 새로고침 막기
        setLoading(true);   // 로딩 시작
        setStatus("");      // 상태 초기화

        if (!userId || !email) {
            // 아이디 또는 이메일이 없으면 에러 상태 세팅 후 종료
            setStatus("noUser");
            setLoading(false);
            return;
        }

        try {
            // 백엔드에 비밀번호 찾기 요청
            const res = await api.post("/auth/findPw", { userId, email });
            // 성공 여부에 따라 상태 업데이트
            if (res.data.success) {
                setStatus("success");
            } else {
                setStatus("noUser");
            }
        } catch (error) {
            // 에러 발생 시 상태 fail로 세팅
            console.error("비밀번호 찾기 에러:", error);
            setStatus("fail");
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // 아이디 input 변경 핸들러
    const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserId(e.target.value);
    };

    // 이메일 input 변경 핸들러
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}>
                <div className={styles.back}></div>
            </div>
            <div className={styles.find}>
                <h2 className={styles.title}>비밀번호 찾기</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.find_contents}>
                        <div className={styles.contents}>
                            <p>아이디</p>
                            <input
                                type="text"
                                name="userId"
                                value={userId}
                                onChange={handleUserIdChange}
                            />
                        </div>
                        <div className={styles.contents}>
                            <p>이메일</p>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>
                        <div className={styles.inco}>
                            {status === "noUser" && (
                                <span className={styles.red}>
                  입력하신 정보와 일치하는 계정을 찾을 수 없습니다.
                  <br />
                  아이디와 이메일을 다시 확인해주세요.
                </span>
                            )}
                            {status === "fail" && (
                                <span className={styles.red}>
                  메일 발송에 실패했습니다.
                  <br />
                  잠시 후 다시 시도해주세요.
                </span>
                            )}
                            {status === "success" && (
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
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? "메일 전송 중..." : "비밀번호 찾기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FindPw;
