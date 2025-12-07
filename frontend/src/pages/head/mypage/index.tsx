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

interface HeadOfficeData {
  hdName: string;
  hdPw: string | null;
  hdEmail: string;
  hdPhone: string;
  hdAuth: string;
}

interface AgencyData {
  agName: string;
  agPw: string | null;
  agEmail: string;
  agPhone: string;
}

interface LogisticData {
  lgName: string;
  lgPw: string | null;
  lgEmail: string;
  lgPhone: string;
}

function MyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux에서 인증 관련 상태 조회
  const token = useSelector((state: RootState) => state.auth.token);
  const hdId = useSelector((state: RootState) => state.auth.hdId);
  const agId = useSelector((state: RootState) => state.auth.agId);
  const lgId = useSelector((state: RootState) => state.auth.lgId);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // 로딩 상태 관리
  const [loading, setLoading] = useState(true);

  // 폼 데이터 상태
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

  // 비밀번호 일치 여부 상태
  const [pwMatch, setPwMatch] = useState<boolean | null>(null);

  // 프로필 이미지 미리보기 URL 상태
  const [preview, setPreview] = useState<string | null>(null);

  /**
   * userInfo가 변경되면 폼 데이터 초기화 및 프로필 미리보기 세팅
   */
  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length > 0) {
      setFormData({
        position: userInfo.hdAuth || "",
        userName: userInfo.hdName || userInfo.agName || userInfo.lgName || "",
        userId: userInfo.hdId || userInfo.agId || userInfo.lgId || "",
        userPw: "",
        confirmUserPw: "",
        phone: userInfo.hdPhone || userInfo.agPhone || "",
        email: userInfo.hdEmail || userInfo.agEmail || "",
        profile: null,
      });

      // 프로필 이미지가 있으면 URL 세팅, 없으면 null
      if (userInfo.hdProfile) {
        setPreview(`http://localhost:8080${userInfo.hdProfile}`);
      } else {
        setPreview(null);
      }

      setLoading(false);
    }
  }, [userInfo]);

  /**
   * 로그인 상태와 사용자 정보를 새로고침하거나 토큰이 바뀔 때 한번만 실행하도록 함
   * 중복 호출을 막기 위해 hdId, agId, lgId를 의존성 배열에서 제거하고 token 기준으로만 호출
   */
  useEffect(() => {
    // 토큰 없으면 로그인 페이지로 이동
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 사용자 ID와 역할 결정
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

    // ID 또는 역할 없으면 로그인 재요청
    if (!userId || !role) {
      alert("유효하지 않은 사용자 정보입니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // 사용자 정보 재로딩
    dispatch(reloadUserInfo({ token, userId, role }))
      .unwrap()
      .catch(() => {
        // 실패 시 처리(로그아웃 등) - slice에서 처리함
      });

    // 의존성 배열: token, dispatch, navigate만 포함해 중복 호출 방지
  }, [dispatch, token, navigate]);

  /**
   * 비밀번호 일치 여부 확인
   * 비밀번호 확인 입력란이 비어있으면 null로 초기화
   */
  useEffect(() => {
    if (!formData.confirmUserPw) setPwMatch(null);
    else setPwMatch(formData.userPw === formData.confirmUserPw);
  }, [formData.userPw, formData.confirmUserPw]);

  // 폼 입력 값 변경 처리
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 이미지 선택 처리 및 미리보기 URL 생성
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profile: file }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // 이메일 중복 체크 (포커스 아웃 시 실행)
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

  // 폼 제출 처리 (회원 정보 수정)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { position, userName, userPw, phone, email } = formData;

    // 필수 항목 체크
    if (!position || !userName || !phone || !email) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 비밀번호 일치 여부 체크
    if (userPw && !pwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // FormData 생성 (파일 업로드 포함)
    const sendData = new FormData();

    let jsonData: HeadOfficeData | AgencyData | LogisticData;

    // 사용자 유형별 전송 데이터 구성
    if (hdId) {
      jsonData = {
        hdName: userName,
        hdPw: userPw || null,
        hdEmail: email,
        hdPhone: phone,
        hdAuth: position,
      };
    } else if (agId) {
      jsonData = {
        agName: userName,
        agPw: userPw || null,
        agEmail: email,
        agPhone: phone,
      };
    } else {
      // lgId인 경우
      jsonData = {
        lgName: userName,
        lgPw: userPw || null,
        lgEmail: email,
        lgPhone: phone,
      };
    }

    // JSON 데이터를 Blob으로 만들어 FormData에 첨부
    const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
    sendData.append("data", jsonBlob);

    // 프로필 이미지 파일이 있으면 첨부
    if (formData.profile) sendData.append("profile", formData.profile);

    try {
      let userId = hdId || agId || lgId;
      if (!userId) throw new Error("유저 ID 정보가 없습니다.");

      // URL 경로 결정 (사용자 타입별)
      let url = "";
      if (hdId) {
        url = `/head/mypage/${userId}`;
      } else if (agId) {
        url = `/agency/mypage/${userId}`;
      } else {
        url = `/logistic/mypage/${userId}`;
      }

      // PUT 요청 (multipart/form-data)
      await api.put(url, sendData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("회원 정보가 수정되었습니다.");
      navigate("/");
    } catch (err) {
      // 에러 처리
      if (err instanceof Error) {
        alert("수정 실패: " + err.message);
      } else {
        alert("수정 실패: 알 수 없는 오류가 발생했습니다.");
      }
      console.error(err);
    }
  };

  // 로딩 중일 때 표시
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
