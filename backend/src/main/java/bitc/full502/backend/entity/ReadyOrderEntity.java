package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Date;
import java.time.LocalDateTime;

@Entity
@Table(name = "ready")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadyOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rd_key")
    private int rdKey;

    @Column(name = "ag_key", nullable = false)
    private int agKey;

    @Column(name = "pd_key", nullable = false)
    private int pdKey;

    @Column(name = "rd_status", nullable = false, length = 50)
    private String rdStatus;

    @Column(name = "rd_products", nullable = false, length = 100)
    private String rdProducts;

    @Column(name = "rd_quantity", nullable = false)
    private int rdQuantity;

    @Column(name = "rd_price", nullable = false)
    private int rdPrice;

    @Column(name = "rd_total", nullable = false)
    private int rdTotal;

    @Column(name = "rd_date", nullable = false)
    private Date rdDate;

    @Column(name = "rd_reserve", nullable = false)
    private Date rdReserve;

    @Column(name = "rd_price_current", nullable = false)
    private int rdPriceCurrent;

    @Column(name = "rd_price_changed", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean rdPriceChanged;

    @CreationTimestamp
    @Column(name = "rd_created", updatable = false)
    private LocalDateTime rdCreated;

    @UpdateTimestamp
    @Column(name = "rd_updated")
    private LocalDateTime rdUpdated;
}
