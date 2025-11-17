package bitc.full502.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticStoreDTO {
    private Integer stKey;
    private String companyName;
    private String productCode;
    private String productName;
    private Integer price;
    private Integer stock;
    private Integer stStore;
    private Integer lpKey; // 재고 증가용 키
    private LocalDateTime storeDate; // 입고일 추가
}
