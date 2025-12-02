package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgencyItemsListDTO {
    private Integer pdKey;
    private String pdCategory;
    private String pdNum;
    private String pdProducts;
    private String pdImage;
    private Integer pdPrice;

    private String agName;    // 업체명 추가
    private LocalDate apStore; // 입고일 추가

    public String getImageUrl() {
        if (this.pdImage == null || this.pdImage.isEmpty()) {
            return null;
        }
        return "/uploads/product/" + this.pdImage;
    }
}
