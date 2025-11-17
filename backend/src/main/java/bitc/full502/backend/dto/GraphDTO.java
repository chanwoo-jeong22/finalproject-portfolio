package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphDTO {
    private String month;     // YYYY-MM
    private String region;    // 대리점 지역
    private String agName;     // 대리점명
    private int order;        // 주문 수량
    private int status;     // 출고 수량
}
