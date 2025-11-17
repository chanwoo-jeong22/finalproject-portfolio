package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "head")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeadEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer hdKey;

  private String hdName;

  @Column(unique = true)
  private String hdId;

  private String hdPw;

  @Column(unique = true)
  private String hdEmail;

  private String hdPhone;

  private String hdAuth;

  @Builder.Default
  private Byte hdCode = 1;

  private String hdProfile;
}
