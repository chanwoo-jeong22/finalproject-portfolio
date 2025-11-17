// src/main/java/bitc/full502/backend/dto/AgencyProductOrderRequestDTO.java
package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequestDTO {
    private int pdKey;      // 제품 키
    private int quantity;
    private int pdPrice;// 주문 수량
}