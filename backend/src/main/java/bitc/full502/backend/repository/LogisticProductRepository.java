package bitc.full502.backend.repository;

import bitc.full502.backend.entity.LogisticProductEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LogisticProductRepository extends JpaRepository<LogisticProductEntity, Integer> {

    // 재고 증가
    @Modifying
    @Transactional
    @Query("UPDATE LogisticProductEntity lp SET lp.stock = lp.stock + :quantity, lp.lpStore = CURRENT_DATE WHERE lp.lpKey = :lpKey")
    void increaseStock(@Param("lpKey") Integer lpKey, @Param("quantity") Integer quantity);


    @Modifying
    @Transactional
    @Query("""
UPDATE LogisticProductEntity lp
   SET lp.stock = lp.stock - :quantity
 WHERE lp.product.pdKey = :pdKey
   AND lp.logistic.lgKey = :lgKey
   AND lp.stock >= :quantity
""")
    int decreaseStockIfEnoughByPdAndLg(@Param("pdKey") Integer pdKey,
                                       @Param("lgKey") Integer lgKey,
                                       @Param("quantity") Integer quantity);


    @Query(value = """
        select 
          lp.lp_key,
          lg.lg_name,
          p.pd_num,
          p.pd_products,
          p.pd_category,
          p.pd_price   as lp_price,
          lp.stock     as lp_stock
        from logisticproduct lp
        join product  p  on p.pd_key = lp.pd_key
        join logistic lg on lg.lg_key = lp.lg_key
        where lg.lg_id = :loginId
        order by p.pd_num
    """, nativeQuery = true)
    List<Object[]> findMineByLoginId(@Param("loginId") String loginId);
}