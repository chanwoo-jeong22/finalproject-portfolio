package bitc.full502.backend.repository;

import bitc.full502.backend.entity.LogisticEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface LogisticRepository extends JpaRepository<LogisticEntity, Integer> {
  boolean existsByLgId(String lg_id);
  boolean existsByLgEmail(String email);
  Optional<LogisticEntity> findByLgId(String lgId);
  Optional<LogisticEntity> findByLgIdAndLgEmail(String lgId, String lgEmail);
  void deleteByLgId(String lgId);
  boolean existsByLgName(String lgName);

  @Modifying
  @Transactional
  @Query(value = "INSERT INTO logisticproduct (lg_key, pd_key, stock) " +
      "SELECT :lgKey, p.pd_key, 0 FROM product p", nativeQuery = true)
  void initLogisticStock(@Param("lgKey") Integer lgKey);
}
