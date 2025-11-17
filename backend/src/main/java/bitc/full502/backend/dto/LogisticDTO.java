package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LogisticDTO {
  private Integer lgKey;
  private Byte lgCode;
  private String lgName;
  private String lgCeo;
  private String lgPw;
  private String lgId;
  private String lgAddress;
  private String lgZip;
  private String lgPhone;
  private String lgEmail;
}
