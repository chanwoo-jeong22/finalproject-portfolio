package bitc.full502.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ConfirmOrderRequestDTO {
    private Integer agKey;
    private List<ReadyOrderDTO> items;
    private String reserveDate; // yyyy-MM-dd 형태
}
