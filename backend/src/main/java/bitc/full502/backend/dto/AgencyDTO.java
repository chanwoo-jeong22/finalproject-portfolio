package bitc.full502.backend.dto;

import bitc.full502.backend.entity.AgencyEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.crypto.password.PasswordEncoder;

@Data
@AllArgsConstructor
public class AgencyDTO {
    private Integer agKey;
    private Byte agCode;
    private String agName;
    private String agCeo;
    private String agId;
    private String agPw;
    private String agAddress;
    private String agZip;
    private String agPhone;
    private String agEmail;

    public AgencyEntity toEntity(PasswordEncoder encoder) {
        return AgencyEntity.builder()
                .agKey(this.agKey)
                .agCode(this.agCode != null ? this.agCode : 3)
                .agName(this.agName)
                .agCeo(this.agCeo)
                .agId(this.agId)
                .agPw(this.agPw != null ? encoder.encode(this.agPw) : null)
                .agAddress(this.agAddress)
                .agZip(this.agZip)
                .agPhone(this.agPhone)
                .agEmail(this.agEmail)
                .build();
    }

    // ✅ 기본 생성자 추가
    public AgencyDTO() {
    }
}
