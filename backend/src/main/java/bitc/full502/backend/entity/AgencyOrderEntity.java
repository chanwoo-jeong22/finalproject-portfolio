package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "agencyorder")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgencyOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "or_key")
    private int orKey;

    // 주문 대표 상품 (필수)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="pd_key", nullable = false)
    private ProductEntity product;

    // 배송 (nullable 허용 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="dv_key", nullable = true)
    private DeliveryEntity delivery;

    // 대리점 (필수)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="ag_key", nullable = false)
    private AgencyEntity agency;

    @Column(nullable = false , length = 50, name = "or_status")
    private String orStatus;

    @Column(nullable = false , length = 100 , name = "or_products")
    private String orProducts;

    @Column(nullable = false , name = "or_price")
    private int orPrice;

    @Column(nullable = false, name = "or_quantity")
    private int orQuantity;

    @Column(nullable = false , name = "or_total")
    private int orTotal;

    @Column(nullable = false, name = "or_date")
    private Date orDate;

    @Column(nullable = false , name = "or_reserve")
    private Date orReserve;

    @Column(nullable = false , length = 100 , name = "or_gu")
    private String orGu;

    @Column(nullable = false , length = 20, unique = true, name ="order_number")
    private String orderNumber;

    @Column(name = "dv_name")
    private String dvName;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgencyOrderItemEntity> items = new ArrayList<>();
}
