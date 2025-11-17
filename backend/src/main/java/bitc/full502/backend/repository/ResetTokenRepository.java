package bitc.full502.backend.repository;

import bitc.full502.backend.entity.ResetTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResetTokenRepository extends JpaRepository<ResetTokenEntity, Integer> {
  Optional<ResetTokenEntity> findByTokenAndUsedFalse(String token);
}
