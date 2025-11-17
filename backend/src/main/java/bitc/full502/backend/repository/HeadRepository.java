package bitc.full502.backend.repository;

import bitc.full502.backend.entity.HeadEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HeadRepository extends JpaRepository<HeadEntity, Integer> {
  boolean existsByHdId(String hdId);
  boolean existsByHdEmail(String hdEmail);
  Optional<HeadEntity> findByHdId(String hdId);
  Optional<HeadEntity> findByHdIdAndHdEmail(String hdId, String hdEmail);
}
