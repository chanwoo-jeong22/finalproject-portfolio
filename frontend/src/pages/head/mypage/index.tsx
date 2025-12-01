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

  // Redux에서 인증 토큰과 역할별 userId (hdId, agId, lgId) 가져오기
  const token = useSelector((state: RootState) => state.auth.token);
  const hdId = useSelector((state: RootState) => state.auth.hdId);
  const agId = useSelector((state: RootState) => state.auth.agId);
  const lgId = useSelector((state: RootState) => state.auth.lgId);

  // 유저 상세 정보는 userInfo에서 가져와서 폼 초기화에 씀
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

  // userInfo가 바뀔 때마다 폼 데이터를 초기화
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

  // 컴포넌트 마운트 시 유저 정보를 다시 불러옴
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 역할과 userId를 token과 함께 reloadUserInfo 액션에 넘겨서 호출
    let userId: string | null = null;
    let role: string | null = null;

    if (hdId) {
      userId = hdId;
      role = "head_office";
    } else if (agId) {
      userId = agId;
      role = "agency";
    } else if (lgId) {
      userId = lgId;
      role = "logistic";
    }

    if (!userId || !role) {
      alert("유효하지 않은 사용자 정보입니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // thunk 호출 시 인자(token, userId, role)를 꼭 넘겨야 오류가 안남
    dispatch(reloadUserInfo({ token, userId, role }))
      .unwrap()
      .catch(() => {
        // reloadUserInfo 실패 시는 slice에서 로그아웃 처리함
      });
  }, [dispatch, token, hdId, agId, lgId, navigate]);

  // 비밀번호 일치 여부 체크
  useEffect(() => {
    if (!formData.confirmUserPw) setPwMatch(null);
    else setPwMatch(formData.userPw === formData.confirmUserPw);
  }, [formData.userPw, formData.confirmUserPw]);

  // 입력 폼 상태 업데이트 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 이미지 파일 선택 핸들러
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

  // 폼 제출 처리 핸들러
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

    // 서버 전송용 FormData 객체 생성 (jsonBlob과 프로필 이미지 포함)
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
      // userId는 Redux에서 역할별 id중 하나가 존재해야 함
      let userId = userInfo.hdId || userInfo.agId || userInfo.lgId;
      if (!userId) throw new Error("유저 ID 정보가 없습니다.");

      await api.put(`/head/mypage/${userId}`, sendData, {
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
