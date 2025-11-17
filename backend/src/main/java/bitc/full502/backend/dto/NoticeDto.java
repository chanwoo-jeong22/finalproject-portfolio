package bitc.full502.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class NoticeDto {
    private Integer ntKey;
    private Integer ntCode; // 0=전체, 1=본사, 2=물류, 3=대리점
    private String ntCategory;    // 전체, 주문, 출고, 배송, 제품현황
    private String ntContent;
    private LocalDate startDate;  // 노출 시작일
    private LocalDate endDate;    // 노출 종료일
}
