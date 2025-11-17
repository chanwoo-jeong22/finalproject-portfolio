package bitc.full502.backend.repository;

import bitc.full502.backend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {
    long countByPdCategory(String pdCategory);
}
