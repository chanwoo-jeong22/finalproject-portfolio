package bitc.full502.backend.dto;

import lombok.Data;

import java.sql.Date;

@Data
public class OrderResponseDTO {
    private int orKey;
    private String orStatus;
    private String orProducts;
    private int orPrice;
    private int orQuantity;
    private int orTotal;
    private Date orDate;
    private Date orReserve;
    private String orGu;
    private String orderNumber;

    private String agencyName;
    private String productName;
    private String deliveryStatus;
}
