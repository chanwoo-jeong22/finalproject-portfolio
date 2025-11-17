import styles from "./auth.module.css";
import { useEffect, useState } from "react";
import user from '../../assets/img/user.png';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

function Join() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    position: "",
    userName: "",
    userId: "",
    userPw: "",
    confirmUserPw: "",
    phone: "",
    email: "",
    profile: null,
  });

  const [userIdValid, setUserIdValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [pwMatch, setPwMatch] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // 아이디 중복 확인
  const checkUserId = async () => {
    const id = formData.userId.trim();
    if (!id) {
      setUserIdValid("empty");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/users/check-id`, {
        params: { loginId: id }   // Controller @RequestParam 이름과 동일
      });
      setUserIdValid(res.data ? "duplicate" : "valid"); // true면 이미 존재
    } catch (err) {
      console.error(err);
      setUserIdValid("error");
    }
  };

// 이메일 중복 확인 (blur 시)
  const checkEmail = async () => {
    const email = formData.email.trim();
    if (!email) {
      setEmailValid(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/users/check-email`, {
        params: { email }   // Controller @RequestParam 이름과 동일
      });
      setEmailValid(res.data.valid); // valid: 중복 없으면 true
      if (!res.data.valid) alert("이미 등록된 이메일입니다.");
    } catch (err) {
      console.error(err);
      alert("이메일 중복 체크 실패");
    }
  };

  // 비밀번호 일치 확인
  useEffect(() => {
    if (!formData.confirmUserPw) {
      setPwMatch(null);
    } else if (formData.userPw === formData.confirmUserPw) {
      setPwMatch(true);
    } else {
      setPwMatch(false);
    }
  }, [formData.userPw, formData.confirmUserPw]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필수 입력 값 확인
    const { position, userName, userId, userPw, confirmUserPw, phone, email } = formData;
    if (!position || !userName || !userId || !userPw || !confirmUserPw || !phone || !email) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 비밀번호 일치 여부 확인
    if (!pwMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 아이디/이메일 중복 여부 확인
    if (userIdValid === "duplicate" || userIdValid === "empty") {
      alert(userIdValid === "duplicate" ? "이미 존재하는 아이디입니다." : "아이디를 입력해주세요.");
      return;
    }
    if (emailValid === false) {
      alert("이미 등록된 이메일입니다.");
      return;
    }

    // 폼 데이터 생성
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
      await axios.post(
          "http://localhost:8080/api/head/signup",
          sendData,
          { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("회원가입이 완료되었습니다.\n로그인 화면으로 이동합니다.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("회원가입 실패: " + (err.response?.data?.error || err.message));
    }
  };

  return (
      <div className={styles.auth}>
        <div className={styles.auth_back}><div className={styles.back}></div></div>
        <div className={styles.join}>
          <h2 className={styles.title}>회원가입</h2>
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
                  <button type="button" className={styles.pro_btn}
                          onClick={() => document.getElementById("profileInput").click()}>
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
                      onBlur={checkEmail}
                  />
                </div>
              </div>
            </div>

            <button className={styles.join_btn} type="submit">작성 완료</button>
          </form>
        </div>
      </div>
  );
}

export default Join;