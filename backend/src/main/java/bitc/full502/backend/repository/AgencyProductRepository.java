package bitc.full502.backend.repository;

import bitc.full502.backend.entity.AgencyProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgencyProductRepository extends JpaRepository<AgencyProductEntity, Integer> {

    /**
     * 특정 대리점 취급 품목 조회
     * @param agencyId 대리점 PK
     * @return List<AgencyProductEntity>
     */
    List<AgencyProductEntity> findByAgency_AgKey(int agencyId);

    /**
     * 특정 대리점 + 상품 조회
     * @param agencyId 대리점 PK
     * @param pdKey 상품 PK
     * @return Optional<AgencyProductEntity>
     */
    List<AgencyProductEntity> findByAgency_AgKeyAndProduct_PdKey(int agencyId, int pdKey);
}

