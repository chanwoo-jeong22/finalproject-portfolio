package bitc.full502.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class AgencyProductDTO {
    private int pdKey;
    private String agName;
    private String pdNum;
    private String pdProducts;
    private int pdPrice;
    private LocalDate apStore;
    private int stock;
}
