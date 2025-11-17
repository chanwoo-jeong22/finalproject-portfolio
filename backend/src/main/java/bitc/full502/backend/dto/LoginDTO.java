package bitc.full502.backend.dto;

import lombok.Data;

@Data
public class LoginDTO {
  private String sep;
  private String loginId;
  private String loginPw;
}