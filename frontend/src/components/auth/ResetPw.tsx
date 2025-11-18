import api from "../../api/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "./auth.module.css";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

interface FormData {
    userPw: string;
    confirmUserPw: string;
}

function ResetPw() {
    // URL 쿼리에서 토큰 받아오기
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    // 비밀번호 입력 상태 관리
    const [formData, setFormData] = useState<FormData>({
        userPw: "",
        confirmUserPw: "",
    });

    // 비밀번호 일치 여부 상태 (true, false, null)
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // input 값 변경 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 비밀번호와 확인란이 같은지 감지하는 효과
    useEffect(() => {
        if (formData.confirmUserPw === "") {
            setPwMatch(null); // 확인란 비어있으면 상태 초기화
        } else if (formData.userPw === formData.confirmUserPw) {
            setPwMatch(true); // 일치
        } else {
            setPwMatch(false); // 불일치
        }
    }, [formData.userPw, formData.confirmUserPw]);

    // 폼 제출 핸들러
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 비밀번호 불일치 시 경고 후 종료
        if (!pwMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 비밀번호 재설정 요청 보내기
            await api.post("/auth/resetPw", {
                token,
                newPassword: formData.userPw,
            });

            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
            navigate("/"); // 로그인 화면으로 이동
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
