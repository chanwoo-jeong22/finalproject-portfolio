package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private int orKey;         // 주문 번호
    private int agKey;         // 대리점 키
    private String orDate;     // 주문일
    private String orStatus;   // 처리 상태
    private String orReserve;  // 도착 예정일
    private String dvName;     // 배송기사 이름
    private String dvPhone;    // 배송기사 전화번호
    private int orTotal;       // 총액
}
