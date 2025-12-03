package bitc.full502.backend.repository;

import bitc.full502.backend.entity.AgencyOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AgencyOrderRepository extends JpaRepository<AgencyOrderEntity, Integer> {


    // 대리점 ID로 주문 조회
    List<AgencyOrderEntity> findByAgency_AgKey(int agencyId);

    // 2️⃣ 대리점 ID + 주문 상태 조회 (JPQL)
    @Query("SELECT ao FROM AgencyOrderEntity ao " +
            "WHERE ao.agency.agKey = :agKey " +
            "AND ao.orStatus = :status")
    List<AgencyOrderEntity> findByAgencyAndStatus(@Param("agKey") int agKey,
                                                  @Param("status") String status);

    // 3️⃣ 단순 상태 기준 조회
    @Query("SELECT ao FROM AgencyOrderEntity ao WHERE ao.orStatus = :status")
    List<AgencyOrderEntity> findByOrStatus(@Param("status") String status);

    // 4️⃣ 오늘 날짜 prefix로 시작하는 order_number 개수 조회
    long countByOrderNumberStartingWith(String todayPrefix);

    // 5️⃣ 스케줄 조회 (예약일 기준)
    @Query("""
        select o
        from AgencyOrderEntity o
        join fetch o.agency a
        where o.orReserve between :from and :to
            and (:gu is null or :gu = '' or substring(o.orGu, 1, 2) = :gu)
        order by o.orReserve asc, a.agName asc
    """)
    List<AgencyOrderEntity> findSchedule(@Param("from") LocalDate from,
                                         @Param("to") LocalDate to,
                                        @Param("gu")   String gu);
                                         

    // 6️⃣ 최대 orderNumber 조회 (패턴 기반)
    @Query("SELECT MAX(a.orderNumber) FROM AgencyOrderEntity a WHERE a.orderNumber LIKE :pattern")
    String findMaxOrderNumberLike(@Param("pattern") String pattern);

    @Query("""
    SELECT ao
    FROM AgencyOrderEntity ao
    JOIN LogisticEntity lg
      ON SUBSTRING(ao.orGu,1,2) = SUBSTRING(lg.lgName,1,2)
    WHERE lg.lgId = :loginId
    ORDER BY ao.orDate DESC, ao.orKey DESC
""")
    List<AgencyOrderEntity> findForLogisticByLoginId(@Param("loginId") String loginId);

    // 배송중 주문 + items fetch join
    @Query("SELECT ao FROM AgencyOrderEntity ao LEFT JOIN FETCH ao.items WHERE ao.orStatus = :status")
    List<AgencyOrderEntity> findByOrStatusWithItems(@Param("status") String status);

    @Query("SELECT max(ao.orderNumber) FROM AgencyOrderEntity AS ao")
    int findMaxOrderNumber();

    List<AgencyOrderEntity> findByAgencyAgKey(int agKey);

    // 대리점 본인 스케줄 조회 (ag_key 기준)
@Query("""
    select o
    from AgencyOrderEntity o
    join fetch o.agency a
    where o.orReserve between :from and :to
      and a.agKey = :agKey
    order by o.orReserve asc
""")
List<AgencyOrderEntity> findScheduleByAgKey(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("agKey") int agKey
);

}

