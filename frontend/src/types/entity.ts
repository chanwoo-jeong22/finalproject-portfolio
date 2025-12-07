export interface AgencyOrder {
  orKey: string; // 주문자 id 
  orProducts: string; // 상품명
  orQuantity: number; // 주문 수량
  orDate: string;
  orReserve: string;
  orTotal: number; 
  orPrice: number; // 총 가격
  orStatus: string;
  orGu: string;
  orderNumber?: string;
  dvName: string | null;
}