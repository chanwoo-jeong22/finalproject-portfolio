package bitc.full502.backend.repository;

import bitc.full502.backend.entity.AgencyOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GraphRepository extends JpaRepository<AgencyOrderEntity, Integer> {

    @Query("SELECT FUNCTION('DATE_FORMAT', o.orDate, '%Y-%m') as month, " +
            "o.agency.agAddress as region, " +
            "o.agency.agName as agName, " +
            "COUNT(CASE WHEN o.orStatus IN ('승인 완료', '배송 준비중') THEN 1 END) AS orderCnt, " +
            "COUNT(CASE WHEN o.orStatus IN ('배송중', '배송완료') THEN 1 END) AS statusCnt " +
            "FROM AgencyOrderEntity o " +
            "GROUP BY FUNCTION('DATE_FORMAT', o.orDate, '%Y-%m'), o.agency.agAddress, o.agency.agName " +
            "ORDER BY FUNCTION('DATE_FORMAT', o.orDate, '%Y-%m') ASC")
    List<Object[]> getMonthlyGraphData();
}

