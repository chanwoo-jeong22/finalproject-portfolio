package bitc.full502.backend.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "agency")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer agKey;

    @Builder.Default
    @Column(nullable = false , name = "ag_code")
    private Byte agCode = 3;

    @Column(nullable = false , length = 100 , name = "ag_name")
    private String agName;

    @Column(nullable=false, length = 50 , name = "ag_ceo")
    private String agCeo;

    @Column(nullable=false, unique = true, length = 50 , name = "ag_id")
    private String agId;

    @Column(nullable = false , name = "ag_pw")
    private String agPw;

    @Column(name = "ag_address")
    private String agAddress;

    @Column(length = 20 , name = "ag_zip")
    private String agZip;

    @Column(length = 20 , name = "ag_phone")
    private String agPhone;

    @Column(length = 100 , name = "ag_email")
    private String agEmail;
}
