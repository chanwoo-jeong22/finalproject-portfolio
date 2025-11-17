package bitc.full502.backend.dto;


import jakarta.persistence.*;
import lombok.Data;

@Data
public class DeliveryDTO {

    private int dvKey;

    private String dvName;

    private String dvCar;

    private String dvPhone;

    private String dvStatus;

    private Boolean dvDelivery;


}
