## Backend - 주문 관리 시스템

## 프로젝트 소개

본 프로젝트의 백엔드 부분으로, Spring Boot와 Java 17 기반 REST API 서버입니다.
주문 관리의 인증·인가, 비즈니스 로직, 데이터베이스 연동을 담당합니다.

## 폴더 구조
```plaintext
src/
├── main/
│   ├── java/bitc/full502/backend/
│   │   ├── config/        # 설정 관련 (보안, JWT 등)
│   │   ├── controller/    # API 요청 처리
│   │   ├── dto/           # 데이터 전송 객체
│   │   ├── entity/        # JPA 엔티티
│   │   ├── filter/        # JWT 필터
│   │   ├── repository/    # 데이터베이스 접근
│   │   ├── scheduler/     # 스케줄러
│   │   ├── security/      # JWTUtil
│   │   └── service/       # 비즈니스 로직
│   └── resources/
│       ├── application.properties  # 설정 파일
```

## 🛠 기술 스택

Core

Spring Boot 3.5.5

Java 17

Spring MVC (REST API)

Spring Security + JWT (인증·인가)

Spring Data JPA + Hibernate (DB 연동)

MySQL 8 (관계형 DB)


## 주요 기능 요약

사용자 인증 및 권한 관리 (JWT, Spring Security)

주문 생성, 승인, 출고, 배송 프로세스 처리

제품, 재고, 대리점, 계정 관리

이메일 기반 임시 비밀번호 발송 및 재설정 지원

공지사항 관리


## 개발 환경 실행 방법
```bash
cd backend 
./gradlew clean build       # 패키지 설치
./gradlew bootRun           # 개발 서버 실행
./gradlew test              # 테스트 실행

- 기본 서버 주소: http://localhost:8080

---