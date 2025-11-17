package bitc.full502.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LogisticProductDTO {
    private Integer lpKey;
    private String lgName;
    private String pdNum;
    private String pdProducts;
    private String pdCategory;
    private int pdPrice;
    private int stock;
    private LocalDate lpStore; // 최신 입고일 (입고등록날짜와 제품등록날짜 중 최신)
    private LocalDate lpDelivery;
}
