import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/login/login.module.css";

import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import api from "../../../api/api";  // axios 인스턴스

// 폼 데이터 타입
interface FormData {
    agencyName: string;
    userName: string;
    userId: string;
    userPw: string;
    confirmUserPw: string;
    address: string;
    addressDetail: string;
    phone: string;
    email: string;
}

function MyPageAgency() {
    const navigate = useNavigate();

    // Redux 로그인 정보 가져오기 (auth-slice 기반)
    const token = useSelector((state: RootState) => state.auth.token);
    const agId = useSelector((state: RootState) => state.auth.agId);

    // form state
    const [formData, setFormData] = useState<FormData>({
        agencyName: "",
        userName: "",
        userId: "",
        userPw: "",
        confirmUserPw: "",
        address: "",
        addressDetail: "",
        phone: "",
        email: "",
    });

    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // 마이페이지 정보 GET
   // 대리점 마이페이지 정보 불러오기
useEffect(() => {
    if (!token || !agId) return; // Redux에서 로그인 정보가 없으면 중단

    const fetchData = async () => {
        try {
            const res = await api.get(`/agency/mypage/${agId}`);
            const data = res.data;

            setFormData({
                agencyName: data.agName ?? "",
                userName: data.agCeo ?? "",
                userId: data.agId ?? agId, // Redux의 agId를 사용
                userPw: "",
                confirmUserPw: "",
                address: data.agAddress ?? "",
                addressDetail: data.agZip ?? "",
                phone: data.agPhone ?? "",
                email: data.agEmail ?? "",
            });
        } catch (err) {
            console.error("마이페이지 조회 실패:", err);
        }
    };

    fetchData();
}, [token, agId]);

// 비밀번호 일치 체크
useEffect(() => {
    if (!formData.confirmUserPw) setPwMatch(null);
    else setPwMatch(formData.userPw === formData.confirmUserPw);
}, [formData.userPw, formData.confirmUserPw]);

// input handler
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
};

// 수정 실행
const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 비밀번호 불일치 방지
    if (formData.userPw && !pwMatch) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    try {
        const bodyData: {
            agCeo: string;
            agPhone: string;
            agEmail: string;
            agPw?: string;
        } = {
            agCeo: formData.userName,
            agPhone: formData.phone,
            agEmail: formData.email,
        };

        // 비밀번호 입력된 경우만 포함
        if (formData.userPw) {
            bodyData.agPw = formData.userPw;
        }

        // Redux 기반: agId 사용
        const res = await api.put(`/agency/mypage/${agId}`, bodyData);

        alert(res.data);
        navigate("/agency");
    } catch (err) {
        console.error("수정 실패:", err);
        alert("수정 중 오류가 발생했습니다.");
    }
};

    return (
        <div className={styles.auth}>
            <div className={styles.auth_back}><div className={styles.back}></div></div>
            <div className={styles.mypage}>
                <h2 className={styles.title}>My Page</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.contents_box}>

                        {/* LEFT */}
                        <div className={styles.left}>
                            <div className={styles.contents}>
                                <p>대리점명</p>
                                <input type="text" name="agencyName" value={formData.agencyName} readOnly />
                            </div>

                            <div className={styles.contents}>
                                <p>이름</p>
                                <input type="text" name="userName" value={formData.userName} onChange={handleChange} />
                            </div>

                            <div className={styles.contents}>
                                <p>아이디</p>
                                <input type="text" name="userId" value={formData.userId} readOnly />
                            </div>
                        </div>

                        {/* RIGHT */}
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
                                            pwMatch ? (
                                                <span className={styles.green}>비밀번호가 일치합니다.</span>
                                            ) : (
                                                <span className={styles.red}>비밀번호가 일치하지 않습니다.</span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={styles.my_btn}>수정 완료</button>
                </form>
            </div>
        </div>
    );
}

export default MyPageAgency;
