// styles 임포트 (CSS 모듈)
import styles from "../../../styles/login/login.module.css";

// React 및 훅 관련 임포트
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

// React-router 훅 임포트
import { useSearchParams, useNavigate } from "react-router-dom";

// Redux hooks 및 thunk 액션 임포트
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { resetPassword, resetStatus as resetPasswordStatus } from "../../../redux/slices/password-slice";

/**
 * ResetPassword 컴포넌트 (비밀번호 재설정 페이지)
 * - URL 쿼리 토큰을 사용해 비밀번호 재설정 요청
 * - 비밀번호 입력과 확인란 상태를 로컬로 관리하고,
 *   요청 상태와 결과는 Redux에서 관리
 */
function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // URL 쿼리에서 토큰 추출
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux 상태 (비밀번호 재설정 요청 상태, 에러, 결과)
    const { status, error, result } = useAppSelector((state) => state.password);

    // 비밀번호 입력 상태 관리
    const [formData, setFormData] = useState<{ userPw: string; confirmUserPw: string }>({
        userPw: "",
        confirmUserPw: "",
    });

    // 비밀번호 일치 여부 상태 (true / false / null)
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // 컴포넌트 언마운트 시 redux 상태 초기화
    useEffect(() => {
        return () => {
            dispatch(resetPasswordStatus());
        };
    }, [dispatch]);

    // 비밀번호 확인란과 비교해 일치 여부 판단
    useEffect(() => {
        if (formData.confirmUserPw === "") {
            setPwMatch(null);
        } else if (formData.userPw === formData.confirmUserPw) {
            setPwMatch(true);
        } else {
            setPwMatch(false);
        }
    }, [formData.userPw, formData.confirmUserPw]);

    // 입력값 변경 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 폼 제출 핸들러 (Redux thunk dispatch)
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 비밀번호 일치 검증
        if (!pwMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!token) {
            alert("토큰이 유효하지 않습니다.");
            return;
        }

        // redux thunk 액션 dispatch
        dispatch(resetPassword({ token, newPassword: formData.userPw }));
    };

    // 비밀번호 재설정 성공 시 로그인 페이지로 이동
    useEffect(() => {
        if (result === "success") {
            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
            navigate("/");
        }
    }, [result, navigate]);

    // 에러 발생 시 alert 처리 (원한다면 별도 UI로 변경 가능)
    useEffect(() => {
        if (status === "failed" && error) {
            alert(`비밀번호 변경에 실패했습니다: ${error}`);
        }
    }, [status, error]);

    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}>
                <div className={styles.back}></div>
            </div>
            <div className={styles.find}>
                <h2 className={styles.title}>비밀번호 재설정</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.find_contents}>
                        {/* 비밀번호 입력 */}
                        <div className={styles.contents}>
                            <p>비밀번호</p>
                            <input
                                type="password"
                                name="userPw"
                                value={formData.userPw}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 비밀번호 확인 입력 */}
                        <div className={styles.contents}>
                            <p>비밀번호 확인</p>
                            <input
                                type="password"
                                name="confirmUserPw"
                                value={formData.confirmUserPw}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 비밀번호 일치/불일치 메시지 */}
                        <div className={styles.inco}>
                            {pwMatch === false && (
                                <span className={styles.red}>비밀번호가 일치하지 않습니다.</span>
                            )}
                            {pwMatch === true && (
                                <span className={styles.green}>비밀번호가 일치합니다.</span>
                            )}

                            {/* 요청 중 상태 표시 */}
                            {status === "loading" && <span>비밀번호 변경 중...</span>}

                            {/* 실패 시 에러 메시지 (추가 UI 선택 가능) */}
                            {status === "failed" && error && (
                                <span className={styles.red}>오류: {error}</span>
                            )}
                        </div>

                        {/* 제출 버튼, 요청 중 비활성화 */}
                        <button type="submit" disabled={status === "loading"}>
                            확인
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
