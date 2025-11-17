package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDTO {
    private int pdKey;          // 상품 키
    private String pdNum;       // 품번
    private String pdProducts;  // 제품명
    private int stock;          // 재고 수량 (예시)
    private String lastArrival; // 최근 입고일 (예시)
}
