package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "logisticproduct")
@Getter
@Setter
public class LogisticProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lp_key")
    private int lpKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "pd_key")
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "lg_key")
    private LogisticEntity logistic;

    @Column(name = "lp_store")
    private LocalDate lpStore;

    @Column(name = "lp_delivery")
    private LocalDate lpDelivery;

    @Column(nullable = false, name = "stock")
    private int stock;
}
