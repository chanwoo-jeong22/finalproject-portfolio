// src/main/java/bitc/full502/backend/dto/AgencyProductResponseDTO.java
package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgencyProductResponseDTO {
    private int pdKey;          // 제품 키
    private String pdNum;       // 품번
    private String pdProducts;  // 제품명
    private int pdPrice;        // 가격
    private boolean isSelected; // 프론트에서 선택 여부
    private int stock;          // 재고
    private LocalDate apStore;  // 입고일
}