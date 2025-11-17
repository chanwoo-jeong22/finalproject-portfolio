package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    // 이미지 URL 생성 메서드
    public String getImageUrl() {
        if (this.pdImage == null || this.pdImage.isEmpty()) {
            return null;
        }
        return "/uploads/product/" + this.pdImage;
    }
}