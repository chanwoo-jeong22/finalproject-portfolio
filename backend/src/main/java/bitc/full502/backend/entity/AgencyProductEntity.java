package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "agencyproduct")
public class AgencyProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ap_key")
    private int apKey;

    @ManyToOne
    @JoinColumn(nullable = false, name = "ag_key")
    private AgencyEntity agency;

    @ManyToOne
    @JoinColumn(nullable = false, name = "pd_key")
    private ProductEntity product;

    @Column(nullable = false, name = "stock")
    private int stock;

    @Column(nullable = false, name = "ap_store")
    private LocalDate apStore;
}

