package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Data;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AgencyOrderItemDTO {
    private int oiKey;
    private int orKey;
    private int pdKey;
    private String pdNum;
    private String pdCategory;
    private String oiProducts;
    private int oiQuantity;
    private int oiPrice;
    private int oiTotal;
    private String agName;
    private String agPhone;
}
