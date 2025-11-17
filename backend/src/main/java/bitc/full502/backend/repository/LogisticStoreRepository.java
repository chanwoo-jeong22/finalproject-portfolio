package bitc.full502.backend.repository;

import bitc.full502.backend.entity.LogisticStoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LogisticStoreRepository extends JpaRepository<LogisticStoreEntity, Integer> {

    @Query("""
    SELECT ls FROM LogisticStoreEntity ls
    JOIN FETCH ls.product p
    JOIN FETCH ls.logistic l
    JOIN FETCH ls.logisticProduct lp
    WHERE (:companyName IS NULL OR l.lgName LIKE %:companyName%)
      AND (:productNum IS NULL OR p.pdNum LIKE %:productNum%)
      AND (:productName IS NULL OR p.pdProducts LIKE %:productName%)
      AND (:priceMin IS NULL OR p.pdPrice >= :priceMin)
      AND (:priceMax IS NULL OR p.pdPrice <= :priceMax)
      AND (:stockMin IS NULL OR lp.stock >= :stockMin)
      AND (:stockMax IS NULL OR lp.stock <= :stockMax)
    ORDER BY l.lgName, p.pdProducts
    """)
    List<LogisticStoreEntity> searchStores(
            @Param("companyName") String companyName,
            @Param("productNum") String productNum,
            @Param("productName") String productName,
            @Param("priceMin") Integer priceMin,
            @Param("priceMax") Integer priceMax,
            @Param("stockMin") Integer stockMin,
            @Param("stockMax") Integer stockMax
    );
}
