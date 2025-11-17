package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="pd_key")
    private int pdKey;

    @Column(nullable = false, length = 50 , name = "pd_category")
    private String pdCategory;

    @Column(nullable = false, length = 50 , name = "pd_num")
    private String pdNum;

    @Column(nullable = false, length = 100 , name = "pd_products")
    private String pdProducts;

    @Column(nullable = false , name = "pd_price")
    private int pdPrice;

    @Column(nullable = false, length = 500 , name = "pd_image")
    private String pdImage;

    // 제품 등록일 (자동 저장) : 진경 추가
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    public void onCreate() {
        this.createdDate = LocalDateTime.now();
    }
}
