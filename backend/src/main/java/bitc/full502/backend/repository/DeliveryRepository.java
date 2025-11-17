package bitc.full502.backend.repository;

import bitc.full502.backend.entity.DeliveryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeliveryRepository  extends JpaRepository<DeliveryEntity, Integer> {

    @Modifying
    @Query("update DeliveryEntity d set d.dvStatus = :status, d.dvDelivery = :on where d.dvKey = :dvKey")
    int updateStatus(@Param("dvKey") int dvKey,
                     @Param("status") String status,
                     @Param("on") Boolean on);

}
