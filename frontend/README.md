# Frontend - React (Vite)
Portfolio TypeScript Migration Version

## 📌 개요
이 프론트엔드는 대리점·본사·물류 간 발주 관리 시스템의  
**React 기반 사용자 화면(UI)** 을 담당하는 프로젝트입니다.

현재 JavaScript 기반으로 작성된 코드를  
**TypeScript + React 구조로 개선하는 리팩토링을 진행 중**입니다.

---

## 🛠 기술 스택
- React (Vite)
- JavaScript → TypeScript 마이그레이션 예정
- React Router
- Axios
- Context API
- CSS Module

---

## 🎯 주요 작업 목표 (Portfolio Version)
- 전체 `.jsx` → `.tsx` 변환
- 컴포넌트 단위 타입 정의 추가
- API 요청(Response) 타입 인터페이스 작성
- 재사용 가능한 UI 컴포넌트 정리
- 폴더 구조 리팩토링
- 불필요한 상태 관리 축소 및 Context 정리
- ESLint + Prettier 설정 강화

---

## 🖥 프론트엔드 주요 기능

### ▶ 대리점(Agency)
- 제품 목록 조회
- 발주 생성 / 수정 / 임시저장
- 발주 내역 확인
- 마이페이지 정보 수정

### ▶ 본사(Head)
- 전체 발주 목록 관리
- 대리점 현황 및 제품 관리
- 공지사항 UI 조회/등록

### ▶ 물류(Logistic)
- 발주 확인 및 처리
- 재고 확인 UI
- 배송 처리 화면

---

## 📂 현재 구조
src/
├─ api/                # Axios 기반 API 요청 정의
├─ components/
│  ├─ agency/          # 대리점 화면 UI
│  ├─ head/            # 본사 화면 UI
│  ├─ logistic/        # 물류 화면 UI
│  ├─ common/          # 재사용 UI 컴포넌트
│  └─ notice/          # 공지사항 UI
├─ context/            # AuthContext, UserContext 등
├─ layout/             # TopBar / SideBar 레이아웃
├─ main.tsx
└─ index.css

---

## 🧩 현재 문제점과 개선 방향

- JS 기반으로 인해 타입 안정성이 부족함  
  → API Response / props / state 타입을 명확히 정의하여 해결 예정

- 컴포넌트 폴더 구조가 명확하지 않음  
  → 역할별 폴더(agency/head/logistic/common)로 재정비 진행 중

- 중복되는 UI 코드 다수 존재  
  → 공통 컴포넌트화하여 재사용성 향상 예정

- 전역 상태 관리가 부족함  
  → Context API 구조 재정비 및 타입 적용 예정

---

## 🔧 마이그레이션 단계 계획
1. Vite에서 TypeScript 환경 설정
2. `.jsx` 파일을 하나씩 `.tsx` 로 변경
3. props / state / API 데이터 타입 정의
4. 에러 해결 및 컴포넌트 정리
5. UI/UX 개선 및 코드 구조화

---

## 🚀 실행 방법
```bash
npm install
npm run dev
