import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../redux/store";
import { reloadUserInfo } from "../../../redux/slices/auth/auth-slice";
import api from "../../../api/api";
import styles from "../../../styles/login/login.module.css";
import user from "../../../assets/img/user.png";
import { useNavigate } from "react-router-dom";

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

function MyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux에서 인증 정보, 유저 정보 가져오기
  const token = useSelector((state: RootState) => state.auth.token);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [loading, setLoading] = useState(true);
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

  const [pwMatch, setPwMatch] = useState<boolean | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // userInfo가 바뀔 때 formData 초기화
  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      setFormData({
        position: userInfo.hdAuth || "",
        userName: userInfo.hdName || "",
        userId: userInfo.hdId || "",
        userPw: "",
        confirmUserPw: "",
        phone: userInfo.hdPhone || "",
        email: userInfo.hdEmail || "",
        profile: null,
      });

      if (userInfo.hdProfile) {
        setPreview(`http://localhost:8080${userInfo.hdProfile}`);
      } else {
        setPreview(null);
      }

      setLoading(false);
    }
  }, [userInfo]);

  // 컴포넌트 첫 마운트 시, 유저 정보 재조회
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    dispatch(reloadUserInfo())
      .unwrap()
      .catch(() => {
        // reloadUserInfo 실패 시는 slice에서 로그아웃 처리함
      });
  }, [dispatch, token, navigate]);

  // 비밀번호 확인 체크
  useEffect(() => {
    if (!formData.confirmUserPw) setPwMatch(null);
    else setPwMatch(formData.userPw === formData.confirmUserPw);
  }, [formData.userPw, formData.confirmUserPw]);

  // 입력값 변경 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 파일 변경 핸들러
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profile: file }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // 이메일 중복 체크
  const checkEmail = async () => {
    if (!formData.email.trim()) return;
    try {
      const res = await api.get("/head/checkEmail", {
        params: { hd_email: formData.email },
      });
      if (!res.data.valid) alert("이미 등록된 이메일입니다.");
    } catch (err) {
      alert("이메일 중복 체크 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { position, userName, userPw, phone, email } = formData;

    if (!position || !userName || !phone || !email) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (userPw && !pwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 서버에 보낼 FormData 생성
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
      if (!userInfo.hdId) throw new Error("유저 ID 정보가 없습니다.");

      await api.put(`/head/mypage/${userInfo.hdId}`, sendData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("회원 정보가 수정되었습니다.");
      navigate("/head");
    } catch (err: any) {
      alert("수정 실패: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className={styles.auth}>
      <div className={styles.auth_back}>
        <div className={styles.back}></div>
      </div>
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

export default MyPage;
