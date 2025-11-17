package bitc.full502.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class DeliveryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dv_key")
    private int dvKey;

    @Column(nullable = false , length = 50, name ="dv_name")
    private String dvName;

    @Column(nullable = false , length = 20, name = "dv_car")
    private String dvCar;

    @Column(length = 20 , name = "dv_phone")
    private String dvPhone;

    @Column(nullable = false , length = 100 , name = "dv_status")
    private String dvStatus;

    @Column(nullable = false , name = "dv_delivery")
    private Boolean dvDelivery;
}
