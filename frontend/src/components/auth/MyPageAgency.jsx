import styles from "./auth.module.css";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

// JWT 디코딩 함수
function parseJwt(token) {
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

function MyPageAgency() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [pwMatch, setPwMatch] = useState(null);

  // 데이터 불러오기
  useEffect(() => {
    if (!token) return;

    const payload = parseJwt(token);
    const agIdFromToken = payload?.sub;
    if (!agIdFromToken) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/agency/mypage/${agIdFromToken}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("데이터 fetch 실패");

        const data = await res.json();
        console.log(data);

        setFormData({
          agencyName: data.agName || "",
          userName: data.agCeo || "",
          userId: data.agId || agIdFromToken,
          userPw: "",
          confirmUserPw: "",
          address: data.agAddress || "",
          addressDetail: data.agZip || "",
          phone: data.agPhone || "",
          email: data.agEmail || "",
        });
      } catch (err) {
        console.error("fetch 실패:", err);
      }
    };

    fetchData();
  }, [token]);

  // 비밀번호 일치 확인
  useEffect(() => {
    if (!formData.confirmUserPw) setPwMatch(null);
    else setPwMatch(formData.userPw === formData.confirmUserPw);
  }, [formData.userPw, formData.confirmUserPw]);

  // 폼 데이터 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.userPw && !pwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const payload = parseJwt(token);
      const agIdFromToken = payload?.sub;

      // 백엔드 DTO 구조에 맞게 매핑
      const bodyData = {
        agCeo: formData.userName,
        agPhone: formData.phone,
        agEmail: formData.email,
      };
      if (formData.userPw) bodyData.agPw = formData.userPw;

      const res = await fetch(`http://localhost:8080/api/agency/mypage/${agIdFromToken}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("수정 실패");

      const data = await res.text(); // 문자열 그대로 받기
      alert(data); // "수정 완료" 알림
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
          <button type="submit" className={styles.my_btn}>수정 완료</button>
        </form>
      </div>
    </div>
  );
}

export default MyPageAgency;