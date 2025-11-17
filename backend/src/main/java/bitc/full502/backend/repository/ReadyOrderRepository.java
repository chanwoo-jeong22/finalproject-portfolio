package bitc.full502.backend.repository;

import bitc.full502.backend.entity.ReadyOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;

public interface ReadyOrderRepository extends JpaRepository<ReadyOrderEntity, Long> {

    // 특정 agKey와 상태가 '임시'인 주문 조회
    List<ReadyOrderEntity> findByAgKeyAndRdStatus(int agKey, String rdStatus);

    // 상태가 '임시'인 모든 주문 조회
    List<ReadyOrderEntity> findByRdStatus(String rdStatus);

    void deleteByRdKeyIn(List<Integer> rdKeys);

    List<ReadyOrderEntity> findByRdKeyIn(List<Integer> rdKeys);

    long countByAgKeyAndRdStatusAndRdDate(int agKey, String rdStatus, Date rdDate);




}
