import { useState, ChangeEvent, FormEvent } from "react";
import api from "../../../api/api"; // axios 인스턴스
import headStyles from '../../../styles/head/head.module.css';

// 전역 타입 선언: 다음 우편번호 서비스 관련
declare global {
  interface Window {
    daum: {
      Postcode: {
        new (options: { oncomplete: (data: { address: string; zonecode: string }) => void }): { open: () => void };
      };
    };
  }
}

// 부모 컴포넌트에서 받는 props 타입
interface UserRegisterProps {
  onClose?: () => void; // 모달 닫기 함수 (옵션)
  onRegisterSuccess?: (user: {
    userKey: number;
    userId: string;
    userName: string;
    address: string;
    tel: string;
    type: "agency" | "logistic";
  }) => void;
  token?: string | null; // 인증 토큰 (옵션)
}

// 폼 상태 타입 정의
interface FormState {
  type: "대리점" | "물류업체";  // 라디오 버튼 선택 값
  userId: string;               // 업체명
  userName: string;             // 대표자명
  tel: string;                  // 전화번호
  loginId: string;              // 로그인 아이디
  userPw1: string;              // 비밀번호
  userPw2: string;              // 비밀번호 확인
  address1: string;             // 기본 주소 (우편번호 검색으로 자동 입력)
  address2: string;             // 상세 주소 (직접 입력)
  zip: string;                  // 우편번호
  email: string;                // 이메일
}

// 아이디 중복 검사 상태 타입
type IdCheckStatus = "available" | "unavailable" | null;
// 이메일 유효성 검사 결과 타입
type EmailValidStatus = boolean | null;

function UserRegister({
  onClose = () => {},
  onRegisterSuccess = () => {},
  token = null,
}: UserRegisterProps) {
  // 폼 데이터 상태 관리
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

  // 아이디 중복 체크 상태 관리
  const [idCheckStatus, setIdCheckStatus] = useState<IdCheckStatus>(null);
  // 이메일 유효성 상태 관리
  const [emailValid, setEmailValid] = useState<EmailValidStatus>(null);

  // 모든 input 요소 공통 onChange 이벤트 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 아이디 중복 확인 요청 함수
  const handleCheckId = async () => {
    if (!form.loginId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      // /users/check-id?loginId=값 GET 요청, 서버에서 boolean 응답
      const res = await api.get<boolean>(`/users/check-id`, { params: { loginId: form.loginId } });
      // true면 이미 사용중 (unavailable), false면 사용 가능
      setIdCheckStatus(res.data ? "unavailable" : "available");
    } catch (err) {
      console.error(err);
      alert("아이디 중복 확인 실패");
    }
  };

  // 이메일 중복 및 유효성 검사 요청 함수
  const handleCheckEmail = async () => {
    if (!form.email.trim()) {
      setEmailValid(false);
      return;
    }

    try {
      // /users/check-email?email=값 GET 요청, { valid: boolean } 응답 예상
      const res = await api.get<{ valid: boolean }>(`/users/check-email`, { params: { email: form.email } });
      setEmailValid(res.data.valid);
      if (!res.data.valid) alert("이미 등록된 이메일입니다.");
    } catch (err) {
      console.error(err);
      alert("이메일 중복 확인 실패");
    }
  };

  // 폼 제출 처리 함수
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 모든 필수 입력 값 비어있는지 확인
    for (const key in form) {
      // TS에서 form[key]가 string이라고 단언
      if ((form[key as keyof FormState] as string).trim() === "") {
        alert("모든 항목을 입력해주세요.");
        return;
      }
    }

    // 비밀번호 일치 여부 확인
    if (form.userPw1 !== form.userPw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 업체명 중복 확인 API 요청
      const companyRes = await api.get<boolean>("/users/check-company", { params: { userId: form.userId } });
      if (companyRes.data) {
        alert("이미 등록된 업체명입니다.");
        return;
      }

      // 아이디 중복 여부 체크
      if (idCheckStatus === "unavailable") {
        alert("이미 사용 중인 아이디입니다.");
        return;
      }

      // 이메일 중복 여부 체크
      if (emailValid === false) {
        alert("이미 등록된 이메일입니다.");
        return;
      }

      // 주소 합치기 (기본주소 + 상세주소)
      const fullAddress = `${form.address1} ${form.address2}`;

      // API 요청에 사용할 데이터와 URL 초기화
      let payload: Record<string, string> = {};
      let apiUrl = "";

      // 업체 타입에 따른 분기 처리
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

      // API 요청 (POST), 헤더에 토큰 포함 (Bearer 인증)
      const res = await api.post(apiUrl, payload, {
      });

      if (res.status === 200) {
        alert("업체 등록이 완료되었습니다.");

        // 등록 성공 시 부모 콜백 함수 호출 (userKey는 임시로 현재 시간 사용)
        onRegisterSuccess({
          userKey: Date.now(),
          userId: form.userId,
          userName: form.userName,
          address: fullAddress,
          tel: form.tel,
          type: form.type === "대리점" ? "agency" : "logistic",
        });

        // 폼 초기화 및 상태 초기화
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

  // 다음 주소 검색 API 실행 함수
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

  // 비밀번호 확인 입력 여부와 일치 여부 상태 계산
  const pwTouched = form.userPw2.length > 0;
  const isPwMatch = form.userPw1 === form.userPw2 && pwTouched;

  return (
    <div className={headStyles.inner}>
      <h2 className={headStyles.joinTitle}>업체 등록</h2>
      <form className={headStyles.joinFrm} onSubmit={handleSubmit} noValidate>
        {/* 업체 타입 선택 라디오 버튼 그룹 */}
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

        {/* 입력 필드 영역 */}
        <div className={headStyles.inputArea}>
          <ul>
            <li>
              <label htmlFor="user-id">업체명</label>
              <input
                type="text"
                id="user-id"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                required
              />
            </li>

            <li className={headStyles.flexHalf}>
              <p>
                <label htmlFor="user-name">대표자명</label>
                <input
                  type="text"
                  id="user-name"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  required
                />
              </p>
              <p>
                <label htmlFor="tel">전화번호</label>
                <input
                  type="text"
                  id="tel"
                  name="tel"
                  value={form.tel}
                  onChange={handleChange}
                  required
                />
              </p>
            </li>

            <li>
              <label htmlFor="login-id">아이디</label>
              <p className={headStyles.flex}>
                <input
                  type="text"
                  id="login-id"
                  name="loginId"
                  value={form.loginId}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={headStyles.btnConfirm}
                  onClick={handleCheckId}
                  aria-label="아이디 중복 확인"
                >
                  중복확인
                </button>
              </p>
              {idCheckStatus === "available" && (
                <p className={`${headStyles.infor} ${headStyles.green}`}>
                  * 사용 가능한 아이디입니다.
                </p>
              )}
              {idCheckStatus === "unavailable" && (
                <p className={`${headStyles.infor} ${headStyles.red}`}>
                  * 사용할 수 없는 아이디입니다.
                </p>
              )}
            </li>

            <li>
              <div className={headStyles.flexHalf}>
                <p>
                  <label htmlFor="user-pw1">비밀번호</label>
                  <input
                    type="password"
                    id="user-pw1"
                    name="userPw1"
                    value={form.userPw1}
                    onChange={handleChange}
                    required
                  />
                </p>
                <p>
                  <label htmlFor="user-pw2">비밀번호 확인</label>
                  <input
                    type="password"
                    id="user-pw2"
                    name="userPw2"
                    value={form.userPw2}
                    onChange={handleChange}
                    required
                  />
                </p>
              </div>

              {pwTouched && isPwMatch && (
                <p className={`${headStyles.infor} ${headStyles.green}`}>
                  * 비밀번호가 일치합니다.
                </p>
              )}
              {pwTouched && !isPwMatch && (
                <p className={`${headStyles.infor} ${headStyles.red}`}>
                  * 비밀번호가 일치하지 않습니다.
                </p>
              )}
            </li>

            <li>
              <label htmlFor="address1">주소</label>
              <p className={`${headStyles.flex} ${headStyles.addr}`}>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={form.address1}
                  readOnly
                  aria-readonly="true"
                />
                <button
                  type="button"
                  className={headStyles.btnAddr}
                  onClick={handleAddressSearch}
                  aria-label="주소 검색"
                >
                  주소검색
                </button>
              </p>
              <input
                type="text"
                id="address2"
                name="address2"
                placeholder="상세주소"
                value={form.address2}
                onChange={handleChange}
                required
              />
              <p className={headStyles.zipzip}>우편번호: {form.zip}</p>
            </li>

            <li>
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleCheckEmail}
                required
              />
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
