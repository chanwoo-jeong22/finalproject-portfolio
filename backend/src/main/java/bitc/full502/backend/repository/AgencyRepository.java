package bitc.full502.backend.repository;

import bitc.full502.backend.entity.AgencyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AgencyRepository extends JpaRepository<AgencyEntity, Integer> {
  boolean existsByAgId(String ag_id);
  boolean existsByAgEmail(String email);
  Optional<AgencyEntity> findByAgId(String agId);
  Optional<AgencyEntity> findByAgIdAndAgEmail(String agId, String agEmail);
  void deleteByAgId(String agId);
  boolean existsByAgName(String agName);
}
