package bitc.full502.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeadDTO {
  private String hdName;
  private String hdId;
  private String hdPw;
  private String hdEmail;
  private String hdPhone;
  private String hdAuth;
  private String hdProfile;
}
