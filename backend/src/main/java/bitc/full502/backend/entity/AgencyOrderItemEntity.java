package bitc.full502.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import bitc.full502.backend.entity.ProductEntity;
import bitc.full502.backend.entity.AgencyOrderEntity;

/**
 * AgencyOrderItemEntity
 * ----------------------
 * 대리점 주문 상세 품목 엔티티
 * - 한 주문(AgencyOrderEntity)에 여러 상품(ProductEntity)이 들어갈 수 있음
 * - 각 품목별 수량, 단가, 총액 정보를 저장
 * - ProductEntity, AgencyOrderEntity와 연관관계 추가
 */

@Entity
@Table(name = "agencyorder_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgencyOrderItemEntity {

    /** Primary Key: 주문 상세 항목 고유 키 */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "oi_key")
    private int oiKey;

    /** 주문 FK */
    @Column(name = "or_key")
    private int orKey;

    /** 상품 FK */
    @Column(name = "pd_key")
    private int pdKey;

    /** 상품명 */
    @Column(name = "oi_products", length = 100)
    private String oiProducts;

    /** 단가 */
    @Column(name = "oi_price")
    private int oiPrice;

    /** 수량 */
    @Column(name = "oi_quantity")
    private int oiQuantity;

    /** 배송 여부 */
    @Column(name = "or_delivery")
    private Boolean orDelivery;

    /** 총액 */
    @Column(name = "oi_total", insertable = false, updatable = false)
    private int oiTotal;

    /** 상품 엔티티와 연관관계 (JPA) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pd_key", insertable = false, updatable = false)
    private ProductEntity product;

    /** 주문 엔티티와 연관관계 (JPA) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "or_key", insertable = false, updatable = false)
    @JsonIgnore
    private AgencyOrderEntity order;
}
