import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "../../../styles/login/login.module.css";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { resetPassword, resetStatus as resetPasswordStatus } from "../../../redux/slices/auth/password-slice";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { resetStatus, resetError, result } = useAppSelector((state) => state.password);

  const [formData, setFormData] = useState<{ userPw: string; confirmUserPw: string }>({
    userPw: "",
    confirmUserPw: "",
  });

  const [pwMatch, setPwMatch] = useState<boolean | null>(null);

  // 컴포넌트 언마운트 시 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetPasswordStatus());
    };
  }, [dispatch]);

  // 비밀번호 일치 여부 체크
  useEffect(() => {
    if (formData.confirmUserPw === "") {
      setPwMatch(null);
    } else if (formData.userPw === formData.confirmUserPw) {
      setPwMatch(true);
    } else {
      setPwMatch(false);
    }
  }, [formData.userPw, formData.confirmUserPw]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!token) {
      alert("토큰이 유효하지 않습니다.");
      return;
    }

    dispatch(resetPassword({ token, newPassword: formData.userPw }));
  };

  // resetPassword 완료 시 처리
  useEffect(() => {
    if (resetStatus === "succeeded" && result === "success") {
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      navigate("/");
    }
  }, [resetStatus, result, navigate]);

  // 실패 시 에러 메시지 alert 띄우기
  useEffect(() => {
    if (resetStatus === "failed" && resetError) {
      alert(`비밀번호 변경에 실패했습니다: ${resetError}`);
    }
  }, [resetStatus, resetError]);

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
              {resetStatus === "loading" && <span>비밀번호 변경 중...</span>}
              {resetStatus === "failed" && resetError && (
                <span className={styles.red}>오류: {resetError}</span>
              )}
            </div>

            <button type="submit" disabled={resetStatus === "loading"}>
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
