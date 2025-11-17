package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgencyOrderInfoDTO {
    private int orKey;
    private String agencyName;
    private LocalDate orDate;
    private LocalDate orReserve;
}

