import styles from "./auth.module.css";
import user from "../../assets/img/user.png";
import { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// JWT 토큰을 디코딩해서 payload 객체 리턴하는 함수
function parseJwt(token: string | null) {
    if (!token) return null;
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload); // base64 디코딩
        return JSON.parse(payload);
    } catch (err) {
        console.error("JWT 파싱 실패:", err);
        return null;
    }
}

// formData 상태 타입 선언
interface FormData {
    position: string;
    userName: string;
    userId: string;
    userPw: string;
    confirmUserPw: string;
    phone: string;
    email: string;
    profile: File | null;
}

function MyPageOffice() {
    // context에서 인증 토큰 받아옴
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // 로딩 상태 (유저 데이터 가져오는 중)
    const [loading, setLoading] = useState<boolean>(true);

    // 사용자 정보 상태
    const [formData, setFormData] = useState<FormData>({
        position: "",
        userName: "",
        userId: "",
        userPw: "",
        confirmUserPw: "",
        phone: "",
        email: "",
        profile: null,
    });

    // 비밀번호 일치 여부 상태 (true, false, null)
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // 프로필 이미지 미리보기 URL 상태
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        console.log("===== useEffect 시작 =====");
        console.log("context token:", token);

        if (!token) {
            setLoading(false);
            navigate("/"); // 토큰 없으면 로그인 페이지로
            return;
        }

        const payload = parseJwt(token);
        const hdId = payload?.sub; // JWT payload에서 사용자 ID 추출
        console.log("decoded hdId:", hdId);

        if (!hdId) {
            setLoading(false);
            alert("유효하지 않은 토큰입니다.");
            navigate("/");
            return;
        }

        // 사용자 정보 API 호출
        const fetchUserData = async () => {
            try {
                const url = `http://localhost:8080/api/head/mypage/${hdId}`;
                console.log("유저 데이터 요청 시작:", url);

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = res.data;
                console.log("유저 데이터 받아옴:", userData);

                // 받아온 데이터로 상태 초기화 (비밀번호는 빈값 유지)
                setFormData({
                    position: userData.hdAuth || "",
                    userName: userData.hdName || "",
                    userId: userData.hdId || "",
                    userPw: "",
                    confirmUserPw: "",
                    phone: userData.hdPhone || "",
                    email: userData.hdEmail || "",
                    profile: null,
                });

                // 프로필 이미지가 있으면 URL로 미리보기 설정
                if (userData.hdProfile) {
                    setPreview(`http://localhost:8080${userData.hdProfile}`);
                }
            } catch (err) {
                console.error("유저 데이터 불러오기 실패:", err);
                alert("유저 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, navigate]);

    // input 변경 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 프로필 이미지 선택 핸들러
    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, profile: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    // 비밀번호와 확인란 일치 여부 체크
    useEffect(() => {
        if (!formData.confirmUserPw) setPwMatch(null);
        else setPwMatch(formData.userPw === formData.confirmUserPw);
    }, [formData.userPw, formData.confirmUserPw]);

    // 이메일 중복 체크 함수
    const checkEmail = async () => {
        if (!formData.email.trim()) return;
        try {
            const res = await axios.get(`http://localhost:8080/api/head/checkEmail`, {
                params: { hd_email: formData.email },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.data.valid) alert("이미 등록된 이메일입니다.");
        } catch (err) {
            console.error("이메일 체크 실패:", err);
            alert("이메일 중복 체크 중 오류 발생");
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { position, userName, userPw, phone, email } = formData;

        // 필수 입력 체크
        if (!position || !userName || !phone || !email) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        // 비밀번호 입력 시 일치 여부 확인
        if (userPw && !pwMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 서버에 보낼 FormData 생성 (JSON + 프로필 파일)
        const sendData = new FormData();
        const jsonBlob = new Blob(
            [
                JSON.stringify({
                    hdName: userName,
                    hdPw: userPw || null,
                    hdEmail: email,
                    hdPhone: phone,
                    hdAuth: position,
                }),
            ],
            { type: "application/json" }
        );
        sendData.append("data", jsonBlob);
        if (formData.profile) sendData.append("profile", formData.profile);

        try {
            const payload = parseJwt(token);
            const hdId = payload?.sub;

            // 회원정보 수정 요청
            await axios.put(`http://localhost:8080/api/head/mypage/${hdId}`, sendData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("회원 정보가 수정되었습니다.");
            navigate("/head"); // 수정 후 대시보드 등으로 이동
        } catch (err: any) {
            console.error("회원정보 수정 실패:", err);
            alert("수정 실패: " + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div>로딩중...</div>;

    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}><div className={styles.back}></div></div>
            <div className={styles.join}>
                <h2 className={styles.title}>My Page</h2>
                <form onSubmit={handleSubmit}>
                    <select name="position" value={formData.position} onChange={handleChange}>
                        <option value="">직급을 선택해주세요</option>
                        <option value="사원">사원</option>
                        <option value="주임">주임</option>
                        <option value="대리">대리</option>
                        <option value="과장">과장</option>
                        <option value="차장">차장</option>
                        <option value="부장">부장</option>
                    </select>
                    <div className={styles.contents_box}>
                        <div className={styles.left}>
                            <div className={styles.profile}>
                                <div className={styles.pro_img}>
                                    <img src={preview || user} alt="profile" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="profileInput"
                                    style={{ display: "none" }}
                                    onChange={handleProfileChange}
                                />
                                <button
                                    type="button"
                                    className={styles.pro_btn}
                                    onClick={() => document.getElementById("profileInput")?.click()}
                                >
                                    프로필 수정
                                </button>
                            </div>
                            <div className={styles.contents}>
                                <p>이름</p>
                                <input name="userName" value={formData.userName} onChange={handleChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>아이디</p>
                                <input name="userId" value={formData.userId} readOnly />
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.contents}>
                                <p>비밀번호</p>
                                <input type="password" name="userPw" value={formData.userPw} onChange={handleChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>비밀번호 확인</p>
                                <input
                                    type="password"
                                    name="confirmUserPw"
                                    value={formData.confirmUserPw}
                                    onChange={handleChange}
                                />
                                <div className={styles.c_bot}>
                                    <div className={styles.inco}>
                                        {formData.confirmUserPw &&
                                            (pwMatch ? (
                                                <span className={styles.green}>비밀번호가 일치합니다.</span>
                                            ) : (
                                                <span className={styles.red}>비밀번호가 일치하지 않습니다.</span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.contents}>
                                <p>전화번호</p>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>이메일</p>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={checkEmail}
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className={styles.join_btn}>
                        수정 완료
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MyPageOffice;
