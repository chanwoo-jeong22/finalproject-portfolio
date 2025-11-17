package bitc.full502.backend.repository;

import bitc.full502.backend.entity.AgencyOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyOrderItemRepository extends JpaRepository<AgencyOrderItemEntity, Integer> {

    // 특정 주문(orKey) 조회
    @Query("SELECT i FROM AgencyOrderItemEntity i WHERE i.orKey = :orKey")
    List<AgencyOrderItemEntity> findItemsByOrKey(@Param("orKey") int orKey);

    // 대리점 기준 전체 조회
    @Query("SELECT i FROM AgencyOrderItemEntity i WHERE i.order.agency.agKey = :agencyId")
    List<AgencyOrderItemEntity> findAllByAgencyId(@Param("agencyId") int agencyId);
}
