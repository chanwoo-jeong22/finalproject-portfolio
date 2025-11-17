package bitc.full502.backend.dto;

// 진경 : AgencyItemsDTO 파일 추가
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgencyItemsDTO {
    private Integer agKey;
    private String agName;
    private Byte agCode;
}
