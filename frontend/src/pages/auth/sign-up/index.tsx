import styles from "../../../styles/login/login.module.css";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import user from '../../../assets/img/user.png';
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../redux/hooks";
import { signUp as signUpThunk } from "../../../redux/slices/auth/auth-slice";
import api from "../../../api/api";

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

function SignUp() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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

    const [userIdValid, setUserIdValid] = useState<"empty" | "duplicate" | "valid" | "error" | null>(null);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFormData(prev => ({ ...prev, profile: file }));
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    };

    const checkUserId = async () => {
        const id = formData.userId.trim();
        if (!id) {
            setUserIdValid("empty");
            return;
        }
        try {
            const res = await api.get(`/users/check-id?loginId=${id}`);
            console.log("중복 체크 응답:", res.data);  // 이걸로 응답값 확인
            setUserIdValid(res.data ? "duplicate" : "valid");
        } catch (error) {
            setUserIdValid("error");
        }
    };

    const checkEmail = async () => {
        const email = formData.email.trim();
        if (!email) {
            setEmailValid(false);
            return;
        }
        try {
            const res = await api.get<{ valid: boolean }>(`/users/check-email?email=${email}`);
            setEmailValid(res.data.valid);
            if (!res.data.valid) alert("이미 등록된 이메일입니다.");
        } catch {
            alert("이메일 중복 체크 실패");
        }
    };

    useEffect(() => {
        setPwMatch(
            formData.confirmUserPw ? formData.userPw === formData.confirmUserPw : null
        );
    }, [formData.userPw, formData.confirmUserPw]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const { position, userName, userId, userPw, confirmUserPw, phone, email } = formData;

        if (!position || !userName || !userId || !userPw || !confirmUserPw || !phone || !email) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        if (!pwMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (userIdValid === "duplicate" || userIdValid === "empty") {
            alert(userIdValid === "duplicate" ? "이미 존재하는 아이디입니다." : "아이디를 입력해주세요.");
            return;
        }
        if (emailValid === false) {
            alert("이미 등록된 이메일입니다.");
            return;
        }

        const sendData = new FormData();
        const jsonBlob = new Blob([JSON.stringify({
            hdName: userName,
            hdId: userId,
            hdPw: userPw,
            hdEmail: email,
            hdPhone: phone,
            hdAuth: position
        })], { type: "application/json" });

        sendData.append("data", jsonBlob);
        if (formData.profile) sendData.append("profile", formData.profile);

        try {
            const resultAction = await dispatch(signUpThunk(sendData));
            if (signUpThunk.fulfilled.match(resultAction)) {
                alert("회원가입이 완료되었습니다.\n로그인 화면으로 이동합니다.");
                navigate("/");
            } else {
                alert("회원가입에 실패했습니다.");
            }
        } catch (error: any) {
            alert("회원가입 실패: " + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}><div className={styles.back}></div></div>
            <div className={styles.join}>
                <div
                    style={{
                        position: "relative",
                        marginBottom: "20px",
                        height: "32px",
                    }}
                >
                    <span
                        onClick={() => navigate("/")}
                        style={{
                            cursor: "pointer",
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            userSelect: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            color: "#000", // 검정색
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                navigate("/");
                            }
                        }}
                        aria-label="홈으로 이동"
                    >
                        {/* 좀 더 깔끔한 집 모양 SVG */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M3 9.5L12 3l9 6.5v11a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-11z" />
                        </svg>
                    </span>


                    {/* 비밀번호 찾기 텍스트 - 컨테이너 중앙에 */}
                    <h2
                        className={styles.title}
                        style={{
                            margin: 0,
                            lineHeight: "32px",
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                    >
                        회원가입
                    </h2>
                </div>

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
                                <button type="button" className={styles.pro_btn} onClick={() => document.getElementById("profileInput")?.click()}>
                                    프로필 등록
                                </button>
                            </div>

                            <div className={styles.contents}>
                                <p>이름</p>
                                <input type="text" name="userName" value={formData.userName} onChange={handleChange} />
                            </div>

                            <div className={styles.contents}>
                                <p>아이디</p>
                                <input type="text" name="userId" value={formData.userId} onChange={handleChange} />
                                <div className={styles.c_bot}>
                                    <div className={styles.inco}>
                                        {userIdValid === "empty" && <span className={styles.red}>아이디를 입력해주세요.</span>}
                                        {userIdValid === "duplicate" && <span className={styles.red}>이미 존재하는 아이디입니다.</span>}
                                        {userIdValid === "valid" && <span className={styles.green}>사용 가능한 아이디입니다.</span>}
                                        {userIdValid === "error" && <span className={styles.red}>아이디 확인 중 오류가 발생했습니다.</span>}
                                    </div>
                                    <button type="button" onClick={checkUserId}>중복확인</button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.right}>
                            <div className={styles.contents}>
                                <p>비밀번호</p>
                                <input type="password" name="userPw" value={formData.userPw} onChange={handleChange} />
                            </div>

                            <div className={styles.contents}>
                                <p>비밀번호 확인</p>
                                <input type="password" name="confirmUserPw" value={formData.confirmUserPw} onChange={handleChange} />
                                {pwMatch !== null && (
                                    <div className={styles.c_bot}>
                                        <div className={styles.inco}>
                                            <span className={pwMatch ? styles.green : styles.red}>
                                                {pwMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                                            </span>
                                        </div>
                                    </div>
                                )}
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
                                />
                                <div className={styles.c_bot}>
                                    <div className={styles.inco}>
                                        {emailValid === false && <span className={styles.red}>이미 등록된 이메일입니다.</span>}
                                        {emailValid === true && <span className={styles.green}>사용 가능한 이메일입니다.</span>}
                                    </div>
                                    <button type="button" onClick={checkEmail}>중복확인</button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <button className={styles.join_btn} type="submit">작성 완료</button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
