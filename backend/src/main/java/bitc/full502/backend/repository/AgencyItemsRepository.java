package bitc.full502.backend.repository;

import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.entity.AgencyProductEntity;
import bitc.full502.backend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyItemsRepository extends JpaRepository<AgencyProductEntity, Integer> {

    // 특정 대리점의 모든 제품 조회
    List<AgencyProductEntity> findByAgency(AgencyEntity agency);

    // 특정 대리점 + 여러 제품 조건으로 조회
    List<AgencyProductEntity> findByAgencyAndProductIn(AgencyEntity agency, List<ProductEntity> products);
}
