# Frontend - 주문 관리 시스템

## 프로젝트 소개
- 본 프로젝트의 프론트엔드 부분으로, React와 TypeScript 기반 SPA입니다.  
Redux Toolkit과 React Router DOM을 사용하여 상태관리 및 라우팅을 처리하며,  
Bootstrap 5와 커스텀 CSS로 UI를 구성하였습니다.

---

## 기술 스택

### Core
- React 19  
- TypeScript  
- Redux Toolkit 2.x  
- React-Redux  
- React Router DOM 7.x  
- Axios (+ Custom axiosInstance)  
- Vite 7  

### UI / Style
- Bootstrap 5  
- React-Bootstrap  
- Custom CSS  

---

## 폴더 구조
```plaintext

src/
├── api/ # API 호출
├── assets/ # 이미지, 아이콘 등 정적 리소스
├── components/ # 공통 UI 컴포넌트
├── func/ # 기능별 컴포넌트 (예: 주문관리, 인증 등)
├── layouts/ # 레이아웃 컴포넌트
├── pages/ # 각 페이지 컴포넌트
├── redux/ # Redux 상태관리 관련 코드
├── styles/ # 전역 및 컴포넌트별 CSS
├── types/ # TypeScript 타입 정의
└── main.tsx # 앱 진입점
```
---

## 인증 구조 요약
- JWT 기반 로그인  
- Axios 인터셉터로 토큰 자동 첨부  
- 만료 시 자동 로그아웃 처리  
- Redux slice에서 사용자 유형별(role: HO, AG, LG) UI 제어  

---

## 주요 기능 요약
- 본사, 대리점, 물류 각각의 전용 화면 제공  
- 주문 생성, 승인, 출고, 배송 상태 관리 전체 흐름 렌더링  
- Redux 기반 전역 상태 관리  
- 모듈화된 API 계층 (api.ts)  
- 역할 기반 네비게이션 및 페이지 보호 (Route Guard)  

---

## 개발 환경 실행 방법
```bash
npm install       # 패키지 설치
npm run dev       # 개발 서버 실행

- 기본 서버 주소: http://localhost:5173

---



