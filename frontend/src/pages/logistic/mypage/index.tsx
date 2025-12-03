import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../../styles/login/login.module.css";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchMyPageData, updateMyPageData, resetUpdateSuccess } from "../../../redux/slices/logistic/mypage-slice";
import { useNavigate } from "react-router-dom";  // 추가


function MyPageLogistic() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [hasNavigated, setHasNavigated] = useState(false);
    const myPageState = useSelector((state: RootState) => state.mypage);
    const token = useSelector((state: RootState) => state.auth.token);

    // 로컬 비밀번호 상태
    const [userPw, setUserPw] = useState("");
    const [confirmUserPw, setConfirmUserPw] = useState("");
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // 폼 데이터 상태 (readonly 제외)
    const [formData, setFormData] = useState({
        logisticName: "",
        userName: "",
        userId: "",
        address: "",
        addressDetail: "",
        phone: "",
        email: "",
    });

    // 로딩/에러 간단 처리
    const { loading, error, data, updateSuccess } = myPageState;

    // 서버에서 데이터 불러오면 formData에 세팅
    useEffect(() => {
        if (data) {
            setFormData({
                logisticName: data.logisticName,
                userName: data.userName,
                userId: data.userId,
                address: data.address,
                addressDetail: data.addressDetail,
                phone: data.phone,
                email: data.email,
            });
        }
    }, [data]);

    useEffect(() => {
        if (updateSuccess && !hasNavigated) {
            alert("수정이 완료되었습니다.");
            dispatch(resetUpdateSuccess());
            navigate("/logistic");
            setHasNavigated(true);
        }
    }, [updateSuccess, hasNavigated, dispatch, navigate]);

    // 비밀번호 확인 상태 판단
    useEffect(() => {
        if (!confirmUserPw) setPwMatch(null);
        else setPwMatch(userPw === confirmUserPw);
    }, [userPw, confirmUserPw]);

    // 토큰 있고 데이터 없으면 불러오기
    useEffect(() => {
        if (token && !data && !loading) {
            dispatch(fetchMyPageData());
        }
    }, [token, data, loading, dispatch]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePwChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserPw(e.target.value);
    };

    const handleConfirmPwChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmUserPw(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (userPw && !pwMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        dispatch(
            updateMyPageData({
                userName: formData.userName,
                phone: formData.phone,
                email: formData.email,
                password: userPw || undefined,
            })
        );
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
                                <input type="password" name="userPw" value={userPw} onChange={handlePwChange} />
                            </div>
                            <div className={styles.contents}>
                                <p>비밀번호 확인</p>
                                <input type="password" name="confirmUserPw" value={confirmUserPw} onChange={handleConfirmPwChange} />
                                <div className={styles.c_bot}>
                                    <div className={styles.inco}>
                                        {confirmUserPw && (
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
                    <button type="submit" className={styles.my_btn} disabled={loading}>
                        {loading ? "로딩 중..." : "수정 완료"}
                    </button>
                    {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
                </form>
            </div>
        </div>
    );
}

export default MyPageLogistic;
