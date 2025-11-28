import { useState, ChangeEvent, FormEvent } from "react";
import api from "../../../api/api"; // axios 인스턴스
import headStyles from '../../../styles/head/head.module.css';

declare global {
  interface Window {
    daum: {
      Postcode: any;
    };
  }
}

interface UserRegisterProps {
  onClose?: () => void;
  onRegisterSuccess?: (user: {
    userKey: number;
    userId: string;
    userName: string;
    address: string;
    tel: string;
    type: "agency" | "logistic";
  }) => void;
}

interface FormState {
  type: "대리점" | "물류업체";
  userId: string;
  userName: string;
  tel: string;
  loginId: string;
  userPw1: string;
  userPw2: string;
  address1: string;
  address2: string;
  zip: string;
  email: string;
}

type IdCheckStatus = "available" | "unavailable" | null;
type EmailValidStatus = boolean | null;

function UserRegister({
  onClose = () => {},
  onRegisterSuccess = () => {},
}: UserRegisterProps) {
  const [form, setForm] = useState<FormState>({
    type: "대리점",
    userId: "",
    userName: "",
    tel: "",
    loginId: "",
    userPw1: "",
    userPw2: "",
    address1: "",
    address2: "",
    zip: "",
    email: ""
  });

  const [idCheckStatus, setIdCheckStatus] = useState<IdCheckStatus>(null);
  const [emailValid, setEmailValid] = useState<EmailValidStatus>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 아이디 중복 확인
  const handleCheckId = async () => {
    if (!form.loginId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const res = await api.get<boolean>(`/users/check-id`, { params: { loginId: form.loginId } });
      setIdCheckStatus(res.data ? "unavailable" : "available");
    } catch (err) {
      console.error(err);
      alert("아이디 중복 확인 실패");
    }
  };

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!form.email.trim()) {
      setEmailValid(false);
      return;
    }

    try {
      const res = await api.get<{ valid: boolean }>(`/users/check-email`, { params: { email: form.email } });
      setEmailValid(res.data.valid);
      if (!res.data.valid) {
        alert("이미 등록된 이메일입니다.");
      }
    } catch (err) {
      console.error(err);
      alert("이메일 중복 확인 실패");
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 필수 입력 체크
    for (const key in form) {
      if ((form as any)[key].trim() === "") {
        alert("모든 항목을 입력해주세요.");
        return;
      }
    }

    // 비밀번호 일치 확인
    if (form.userPw1 !== form.userPw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 업체명 중복 체크
      const companyRes = await api.get<boolean>("/users/check-company", { params: { userId: form.userId } });
      if (companyRes.data) {
        alert("이미 등록된 업체명입니다.");
        return;
      }

      // 아이디 중복 체크
      if (idCheckStatus === "unavailable") {
        alert("이미 사용 중인 아이디입니다.");
        return;
      }

      // 이메일 중복 체크
      if (emailValid === false) {
        alert("이미 등록된 이메일입니다.");
        return;
      }

      const fullAddress = `${form.address1} ${form.address2}`;

      // payload 생성
      let payload: Record<string, any> = {};
      let apiUrl = "";

      if (form.type === "대리점") {
        payload = {
          agName: form.userId,
          agCeo: form.userName,
          agId: form.loginId,
          agPw: form.userPw1,
          agAddress: fullAddress,
          agZip: form.zip,
          agPhone: form.tel,
          agEmail: form.email,
        };
        apiUrl = "/agency/register";
      } else {
        payload = {
          lgName: form.userId,
          lgCeo: form.userName,
          lgId: form.loginId,
          lgPw: form.userPw1,
          lgAddress: fullAddress,
          lgZip: form.zip,
          lgPhone: form.tel,
          lgEmail: form.email,
        };
        apiUrl = "/logistic/register";
      }

      const res = await api.post(apiUrl, payload);

      if (res.status === 200) {
        alert("업체 등록이 완료되었습니다.");

        onRegisterSuccess({
          userKey: Date.now(),
          userId: form.userId,
          userName: form.userName,
          address: fullAddress,
          tel: form.tel,
          type: form.type === "대리점" ? "agency" : "logistic",
        });

        setForm({
          type: "대리점",
          userId: "",
          userName: "",
          tel: "",
          loginId: "",
          userPw1: "",
          userPw2: "",
          address1: "",
          address2: "",
          zip: "",
          email: "",
        });
        setIdCheckStatus(null);
        setEmailValid(null);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("회원가입 실패");
    }
  };

  // 주소 검색 (다음 주소 API)
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data: { address: string; zonecode: string }) {
        setForm(prev => ({
          ...prev,
          address1: data.address,
          zip: data.zonecode,
        }));
      },
    }).open();
  };

  const pwTouched = form.userPw2.length > 0;
  const isPwMatch = form.userPw1 === form.userPw2 && pwTouched;

  return (
    <div className={headStyles.inner}>
      <h2 className={headStyles.joinTitle}>업체 등록</h2>
      <form className={headStyles.joinFrm} onSubmit={handleSubmit}>
        {/* 라디오 버튼 */}
        <div className={headStyles.radioBtnGroup} role="group" aria-label="업체 선택">
          <input
            type="radio"
            className={headStyles.btnCheck}
            name="type"
            id="store"
            value="대리점"
            checked={form.type === "대리점"}
            onChange={handleChange}
          />
          <label className={`${headStyles.btn} ${headStyles.store}`} htmlFor="store">
            대리점
          </label>

          <input
            type="radio"
            className={headStyles.btnCheck}
            name="type"
            id="logistics"
            value="물류업체"
            checked={form.type === "물류업체"}
            onChange={handleChange}
          />
          <label className={`${headStyles.btn} ${headStyles.logistics}`} htmlFor="logistics">
            물류 업체
          </label>
        </div>

        <div className={headStyles.inputArea}>
          <ul>
            <li>
              <label htmlFor="user-id">업체명</label>
              <input type="text" id="user-id" name="userId" value={form.userId} onChange={handleChange} />
            </li>

            <li className={headStyles.flexHalf}>
              <p>
                <label htmlFor="user-name">대표자명</label>
                <input type="text" id="user-name" name="userName" value={form.userName} onChange={handleChange} />
              </p>
              <p>
                <label htmlFor="tel">전화번호</label>
                <input type="text" id="tel" name="tel" value={form.tel} onChange={handleChange} />
              </p>
            </li>

            <li>
              <label htmlFor="login-id">아이디</label>
              <p className={headStyles.flex}>
                <input type="text" id="login-id" name="loginId" value={form.loginId} onChange={handleChange} />
                <button type="button" className={headStyles.btnConfirm} onClick={handleCheckId}>
                  중복확인
                </button>
              </p>
              {idCheckStatus === "available" && <p className={`${headStyles.infor} ${headStyles.green}`}>* 사용 가능한 아이디입니다.</p>}
              {idCheckStatus === "unavailable" && <p className={`${headStyles.infor} ${headStyles.red}`}>* 사용할 수 없는 아이디입니다.</p>}
            </li>

            <li>
              <div className={headStyles.flexHalf}>
                <p>
                  <label htmlFor="user-pw1">비밀번호</label>
                  <input type="password" id="user-pw1" name="userPw1" value={form.userPw1} onChange={handleChange} />
                </p>
                <p>
                  <label htmlFor="user-pw2">비밀번호 확인</label>
                  <input type="password" id="user-pw2" name="userPw2" value={form.userPw2} onChange={handleChange} />
                </p>
              </div>

              {pwTouched && isPwMatch && <p className={`${headStyles.infor} ${headStyles.green}`}>* 비밀번호가 일치합니다.</p>}
              {pwTouched && !isPwMatch && <p className={`${headStyles.infor} ${headStyles.red}`}>* 비밀번호가 일치하지 않습니다.</p>}
            </li>

            <li>
              <label htmlFor="address1">주소</label>
              <p className={`${headStyles.flex} ${headStyles.addr}`}>
                <input type="text" id="address1" name="address1" value={form.address1} readOnly />
                <button type="button" className={headStyles.btnAddr} onClick={handleAddressSearch}>
                  주소검색
                </button>
              </p>
              <input type="text" id="address2" name="address2" placeholder="상세주소" value={form.address2} onChange={handleChange} />
              <p className={headStyles.zipzip}>우편번호: {form.zip}</p>
            </li>

            <li>
              <label htmlFor="email">이메일</label>
              <input type="text" id="email" name="email" value={form.email} onChange={handleChange} onBlur={handleCheckEmail} />
            </li>
          </ul>
        </div>

        <p className={headStyles.essential}>* 모든 사항은 필수입니다.</p>

        <div className={headStyles.joinBtnArea}>
          <button type="submit" className={headStyles.btnJoin}>
            가입하기
          </button>
          <button type="button" className={headStyles.btnJoinCancel} onClick={onClose}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserRegister;
