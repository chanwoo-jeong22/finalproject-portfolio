import api from "../../api/api";
import styles from "./auth.module.css";
import {useState} from "react";

function FindPw() {

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(""); // 이전 상태 초기화

    if (!userId || !email) {
      setStatus("noUser");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/findPw", { userId, email });
      // 백엔드가 { success: true/false, message: "" } 반환한다고 가정
      if (res.data.success) {
        setStatus("success");
      } else {
        setStatus("noUser");
      }
    } catch (error) {
      console.error("비밀번호 찾기 에러:", error);
      setStatus("fail");
    } finally {
      setLoading(false);
    }
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
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className={styles.contents}>
              <p>이메일</p>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.inco}>
              {status === "noUser" && (
                <span className={styles.red}>
                  입력하신 정보와 일치하는 계정을 찾을 수 없습니다.<br />
                  아이디와 이메일을 다시 확인해주세요.
                </span>
              )}
              {status === "fail" && (
                <span className={styles.red}>
                  메일 발송에 실패했습니다.<br />
                  잠시 후 다시 시도해주세요.
                </span>
              )}
              {status === "success" && (
                <span className={styles.green}>
                  입력하신 이메일로 비밀번호 재설정 링크를<br />
                  발송했습니다.<br />
                  메일함을 확인해주세요.<br />
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