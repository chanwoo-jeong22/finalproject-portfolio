package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reset_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResetTokenEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "token_id")
  private Integer id;

  @Column(name = "user_type", nullable = false)
  private Byte userType; // 1=본사, 2=물류, 3=대리점

  @Column(name = "user_id", nullable = false)
  private Integer userId; // 해당 유저 PK

  @Column(name = "token", nullable = false, length = 500)
  private String token;

  @Column(name = "expire_at", nullable = false)
  private LocalDateTime expireAt;

  @Column(name = "used", nullable = false)
  private Boolean used = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();
}
