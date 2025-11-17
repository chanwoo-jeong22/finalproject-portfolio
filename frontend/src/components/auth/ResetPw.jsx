import api from "../../api/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "./auth.module.css";
import {useEffect, useState} from "react";

function ResetPw() {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userPw: "",
    confirmUserPw: "",
  });

  const [pwMatch, setPwMatch] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (formData.confirmUserPw === "") {
      setPwMatch(null);
    } else if (formData.userPw === formData.confirmUserPw) {
      setPwMatch(true);
    } else {
      setPwMatch(false);
    }
  }, [formData.userPw, formData.confirmUserPw]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await api.post("/auth/resetPw", {
        token,
        newPassword: formData.userPw,
      });

      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      navigate("/");
    } catch (error) {
      console.error("비밀번호 재설정 에러:", error);
      alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth_back}>
        <div className={styles.back}></div>
      </div>
      <div className={styles.find}>
        <h2 className={styles.title}>비밀번호 재설정</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.find_contents}>
            <div className={styles.contents}>
              <p>비밀번호</p>
              <input
                type="password"
                name="userPw"
                value={formData.userPw}
                onChange={handleChange}
              />
            </div>
            <div className={styles.contents}>
              <p>비밀번호 확인</p>
              <input
                type="password"
                name="confirmUserPw"
                value={formData.confirmUserPw}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inco}>
              {pwMatch === false && (
                <span className={styles.red}>비밀번호가 일치하지 않습니다.</span>
              )}
              {pwMatch === true && (
                <span className={styles.green}>비밀번호가 일치합니다.</span>
              )}
            </div>
            <button type="submit">확인</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPw;