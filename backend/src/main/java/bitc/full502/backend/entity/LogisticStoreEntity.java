package bitc.full502.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "logisticstore")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LogisticStoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "st_key")
    private Integer stKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pd_key", nullable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lg_key", nullable = false)
    private LogisticEntity logistic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lp_key", nullable = false)
    private LogisticProductEntity logisticProduct;

    @Column(name = "st_store", nullable = false)
    private int stStore; // 입고 신청 수량

    // 입고일 추가
    @Column(name = "store_date", nullable = true)
    private LocalDateTime storeDate;

    // 입고 등록 시 자동 저장되도록 설정
    @PrePersist
    public void onStore() {
        if (this.storeDate == null) {
            this.storeDate = LocalDateTime.now();
        }
    }

    // Zero date 값 처리용 getter 오버라이드
    public LocalDateTime getStoreDate() {
        // Zero date 값이 있다면 null로 반환
        if (storeDate != null && storeDate.getYear() == 0) {
            return null;
        }
        return storeDate;
    }
}

