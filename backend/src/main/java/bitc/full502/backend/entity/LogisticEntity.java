package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.*;

@Entity
@Table(name = "logistic")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "lg_key")
  private Integer lgKey;

  @Builder.Default
  @Column(name = "lg_code")
  private Byte lgCode = 2;

  @Column(name = "lg_name")
  private String lgName;

  @Column(name = "lg_ceo")
  private String lgCeo;

  @Column(name = "lg_id", unique = true)
  private String lgId;

  @Column(name = "lg_pw")
  private String lgPw;

  @Column(name = "lg_address")
  private String lgAddress;

  @Column(name = "lg_zip")
  private String lgZip;

  @Column(name = "lg_phone")
  private String lgPhone;

  @Column(name = "lg_email", unique = true)
  private String lgEmail;
}
