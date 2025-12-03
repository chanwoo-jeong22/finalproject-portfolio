// 대리점 품목 단위 (각 제품 단위 정보)
export interface LineItem {
  id: string;       // 내부 고유 ID (프론트 식별용)
  pdKey: string;    // 제품 고유키 (서버 기준)
  sku?: string;     // 재고 관리 코드 (필요하면 사용)
  name: string;     // 제품명
  qty: number;      // 수량
  price: number;    // 가격 (단가)
}

// 임시 저장 드래프트 품목 정보 (서버에서 받는 데이터, UI 용도)
export interface Draft {
  id: string;
  pdKey: string;
  qty: number;
  price: number;
  name: string;
  // 필요하면 백엔드 DTO 주요 필드 일부 추가 가능
}

// 임시 저장 API 요청용 타입 (서버에 보내는 데이터)
export interface DraftRequest {
  id: string;
  pdKey: string;
  qty: number;
  price: number;
  name: string;
  agKey: number;   // 대리점 키, 반드시 포함 (백엔드 요구)
}

// 백엔드 ReadyOrderDTO 타입 (임시 저장 API용)
export interface ReadyOrderDTO {
  rdKey?: number;         // 임시 저장 키 (옵션)
  agKey: number;          // 대리점 키
  pdKey: number;          // 제품 키
  rdStatus?: string;      // 상태 (옵션)
  rdProducts?: string;    // 제품명 (옵션)
  rdQuantity: number;     // 수량
  rdPrice: number;        // 단가
  rdTotal?: number;       // 총액 (옵션)
  rdDate?: string;        // 저장일 (ISO 문자열, 옵션)
  rdReserve?: string;     // 예약일 (옵션)
  rdPriceCurrent?: number; // 현재 단가 (옵션)
  rdPriceChanged?: boolean; // 단가 변경 여부 (옵션)
}

// 주문 데이터 간략 구조
export interface Order {
  orKey: string;            // 주문 고유키
  orDate: string;           // 주문 날짜 (ISO 문자열)
  orderNumber?: string;     // 주문 번호 (선택적)
  items?: LineItem[];       // 주문된 품목 목록 (LineItem과 동일하게 사용)
  totalAmount?: number;     // 총 금액
  orStatus?: string;        // 처리 상태
  orReserve?: string;       // 도착 예정일 (ISO 문자열)
  dvName?: string;          // 배송 기사 이름
  delivery?: any; 

}

// 주문 확정 시 서버에 전송하는 개별 품목 타입
export interface ConfirmOrderItem {
  pdKey: string;
  rdQuantity: number;
  rdPrice: number;
  rdProducts: string;  // 제품명
}

// 주문 확정용 Payload 타입
export interface ConfirmOrderPayload {
  agKey: string;                 // 대리점 키 (string or number, 백엔드에 맞게 통일하세요)
  items: ConfirmOrderItem[];     // 주문 품목 목록 (서버 필드명 준수)
  reserveDate: string;           // 도착 예정일 (ISO 문자열)
}

// 슬라이스 상태 구조
export interface AgencyState {
  orders: Order[];               // 확정된 주문 리스트
  drafts: Draft[];               // 임시 저장된 주문 리스트
  lineItems: LineItem[];         // 대리점 취급 품목 목록
  registeredItems: LineItem[];   // 확정 전 저장된 주문 품목들
  selectedForAdd: string[];      // 추가할 품목 선택 체크박스 id 목록
  selectedRegistered: string[];  // 확정 주문 품목 선택 체크박스 id 목록
  expectedDate: string;          // 주문 확정 시 도착 예정일
  loading: boolean;              // API 요청 상태 로딩 플래그
  error: string | null;          // 에러 메시지 저장
}
