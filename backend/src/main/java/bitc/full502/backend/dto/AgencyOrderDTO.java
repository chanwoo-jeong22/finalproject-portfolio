package bitc.full502.backend.dto;

import lombok.Data;

import java.sql.Date;
import java.util.List;

@Data
public class AgencyOrderDTO {
    private int orKey;
    private String orderNumber;
    private String orStatus;
    private String orProducts;
    private int orPrice;
    private int orQuantity;
    private int orTotal;
    private Date orDate;
    private Date orReserve;
    private String orGu;
    private String agName;
    private String pdProducts;
    private String dvName;

    private List<Item> items;

    private String agPhone;

    private String agAddress;


    @Data
    public static class Item {
        private int pdKey;   // 새로 추가
        private String name;     // 제품명
        private String sku;      // 품번
        private int quantity;    // 수량
        private int price;       // 단가
    }
}
