package bitc.full502.backend.dto;

import bitc.full502.backend.entity.ReadyOrderEntity;
import lombok.*;

import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadyOrderDTO {
    private int rdKey;
    private int agKey;
    private int pdKey;
    private String rdStatus;
    private String rdProducts;
    private int rdQuantity;
    private int rdPrice;
    private int rdTotal;
    private Date rdDate;
    private Date rdReserve;
    private int rdPriceCurrent;
    private boolean rdPriceChanged;

    // DTO → Entity
    public ReadyOrderEntity toEntity() {
        return ReadyOrderEntity.builder()
                .rdKey(this.rdKey)
                .agKey(this.agKey)
                .pdKey(this.pdKey)
                .rdStatus(this.rdStatus)
                .rdProducts(this.rdProducts)
                .rdQuantity(this.rdQuantity)
                .rdPrice(this.rdPrice)
                .rdTotal(this.rdTotal)
                .rdDate(this.rdDate)
                .rdReserve(this.rdReserve)
                .rdPriceCurrent(this.rdPriceCurrent)
                .rdPriceChanged(this.rdPriceChanged)
                .build();
    }

    // Entity → DTO
    public static ReadyOrderDTO fromEntity(ReadyOrderEntity entity) {
        return ReadyOrderDTO.builder()
                .rdKey(entity.getRdKey())
                .agKey(entity.getAgKey())
                .pdKey(entity.getPdKey())
                .rdStatus(entity.getRdStatus())
                .rdProducts(entity.getRdProducts())
                .rdQuantity(entity.getRdQuantity())
                .rdPrice(entity.getRdPrice())
                .rdTotal(entity.getRdTotal())
                .rdDate(entity.getRdDate())
                .rdReserve(entity.getRdReserve())
                .rdPriceCurrent(entity.getRdPriceCurrent())
                .rdPriceChanged(entity.isRdPriceChanged())
                .build();
    }
}
