// 대리점 품목 단위 (각 제품 단위 정보)
export interface LineItem {
    id: string;     // 내부 고유 ID
    pdKey: string;  // 제품 고유키 (서버 기준)
    sku: string;    // 재고 관리 코드
    name: string;   // 제품명
    qty: number;    // 수량
    price: number;  // 가격
}

// OrderItem 타입은 LineItem과 동일하게 사용
export type OrderItem = LineItem;

// 주문 데이터 간략 구조
export interface Order {
    orKey: string;          // 주문 고유키
    orDate: string;         // 주문 날짜
    orderNumber?: string;   // 주문 번호 (선택적)
    items?: OrderItem[];    // 주문된 품목 목록
    totalAmount?: number;   // 총 금액
    orStatus?: string;      // 처리 상태
    orReserve?: string;     // 도착 예정일
    dvName?: string;        // 배송 기사 이름
}

// 임시 저장 드래프트 품목 정보
export interface Draft {
    id: string;
    pdKey: string;
    qty: number;
    price: number;
    name: string;
}

// 주문 확정 시 서버에 전송하는 개별 품목 타입
export interface ConfirmOrderItem {
    pdKey: string;
    rdQuantity: number;
    rdPrice: number;
    rdProducts: string;
}

// 주문 확정용 Payload 타입
export interface ConfirmOrderPayload {
    agKey: string;               // 대리점 키
    items: ConfirmOrderItem[];   // 주문 품목 목록 (서버가 요구하는 필드명 기준)
    reserveDate: string;         // 도착 예정일
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
