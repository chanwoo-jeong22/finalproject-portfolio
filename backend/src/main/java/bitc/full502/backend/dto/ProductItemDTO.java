package bitc.full502.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ProductItemDTO {
    private String pdNum;
    private String pdProducts;
    private int stock;
    private LocalDate apStore;
    private Integer agKey;
}