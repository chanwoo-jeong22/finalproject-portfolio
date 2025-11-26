import styles from "../../../styles/login/login.module.css";
import { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// JWT 페이로드 타입 정의 (필요한 항목만)
interface JwtPayload {
    sub?: string;
    [key: string]: any;
}

// 폼 데이터 타입 정의
interface FormData {
    logisticName: string;
    userName: string;
    userId: string;
    userPw: string;
    confirmUserPw: string;
    address: string;
    addressDetail: string;
    phone: string;
    email: string;
}

// JWT 토큰에서 payload 디코딩 함수
function parseJwt(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (err) {
        console.error("JWT 파싱 실패:", err);
        return null;
    }
}

function MyPageLogistic() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // 폼 상태 초기화
    const [formData, setFormData] = useState<FormData>({
        logisticName: "",
        userName: "",
        userId: "",
        userPw: "",
        confirmUserPw: "",
        address: "",
        addressDetail: "",
        phone: "",
        email: "",
    });

    // 비밀번호 일치 여부: true/false/null (null: 아직 확인 안함)
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // 토큰 있으면 로그인한 유저 정보 불러오기
    useEffect(() => {
        if (!token) return;

        const payload = parseJwt(token);
        const lgIdFromToken = payload?.sub;
        if (!lgIdFromToken) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/logistic/mypage/${lgIdFromToken}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("데이터 fetch 실패");

                const data = await res.json();

                setFormData({
                    logisticName: data.lgName || "",
                    userName: data.lgCeo || "",
                    userId: data.lgId || lgIdFromToken,
                    userPw: "",
                    confirmUserPw: "",
                    address: data.lgAddress || "",
                    addressDetail: data.lgZip || "",
                    phone: data.lgPhone || "",
                    email: data.lgEmail || "",
                });
            } catch (err) {
                console.error("fetch 실패:", err);
            }
        };

        fetchData();
    }, [token]);

    // 비밀번호 확인 칸 변경 시 비밀번호 일치 여부 판단
    useEffect(() => {
        if (!formData.confirmUserPw) setPwMatch(null);
        else setPwMatch(formData.userPw === formData.confirmUserPw);
    }, [formData.userPw, formData.confirmUserPw]);

    // 입력값 변경 시 상태 업데이트 (타입 지정)
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 폼 제출 처리 (타입 지정)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // 비밀번호를 입력했으면 일치 여부 확인
        if (formData.userPw && !pwMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const payload = parseJwt(token);
            const lgIdFromToken = payload?.sub;

            // 보낼 데이터 구성
            const bodyData: { lgCeo: string; lgPhone: string; lgEmail: string; lgPw?: string } = {
                lgCeo: formData.userName,
                lgPhone: formData.phone,
                lgEmail: formData.email,
            };

            if (formData.userPw) bodyData.lgPw = formData.userPw;

            const res = await fetch(`http://localhost:8080/api/logistic/mypage/${lgIdFromToken}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bodyData),
            });

            if (!res.ok) throw new Error("수정 실패");

            const msg = await res.text();
            alert(msg);
            navigate("/logistic");
        } catch (err) {
            console.error("수정 실패:", err);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}>
                <div className={styles.back}></div>
            </div>
            <div className={styles.mypage}>
                <h2 className={styles.title}>My Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.contents_box}>
                        <div className={styles.left}>
                            <div className={styles.contents}>
                                <p>업체명</p>
                                <input type="text" name="logisticName" value={formData.logisticName} readOnly />
                            </div>
                            <div className={styles.contents}>
                                <p>이름</p>
                                {/* 이름은 읽기전용으로 바꿔드렸어요 */}
                                <input type="text" name="userName" value={formData.userName} readOnly />
                            </div>
                            <div className={styles.contents}>
                                <p>아이디</p>
                                <input type="text" name="userId" value={formData.userId} readOnly />
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.contents}>
                                <p>전화번호</p>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>이메일</p>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>비밀번호</p>
                                <input type="password" name="userPw" value={formData.userPw} onChange={handleChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>비밀번호 확인</p>
                                <input type="password" name="confirmUserPw" value={formData.confirmUserPw} onChange={handleChange} />
                                <div className={styles.c_bot}>
                                    <div className={styles.inco}>
                                        {formData.confirmUserPw && (
                                            <>
                                                {pwMatch ? (
                                                    <span className={styles.green}>비밀번호가 일치합니다.</span>
                                                ) : (
                                                    <span className={styles.red}>비밀번호가 일치하지 않습니다.</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className={styles.my_btn}>
                        수정 완료
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MyPageLogistic;
