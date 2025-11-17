package bitc.full502.backend.dto;

import lombok.Data;

@Data
public class UserRegisterDTO {
  private String type;
  private String userId;
  private String userName;
  private String tel;
  private String loginId;
  private String userPw1;
  private String address;
  private String zip;
  private String email;
}
