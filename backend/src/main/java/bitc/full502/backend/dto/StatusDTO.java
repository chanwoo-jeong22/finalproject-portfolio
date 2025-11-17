package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class StatusDTO {
    private int orKey;
    private String agName;
    private String orStatus;
    private String dvName;
    private String dvPhone;
    private LocalDate orDate;
    private LocalDate orReserve;
    private String orderNumber;
}
