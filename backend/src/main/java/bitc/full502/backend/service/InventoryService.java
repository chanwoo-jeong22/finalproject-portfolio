package bitc.full502.backend.service;

import bitc.full502.backend.dto.InventoryDTO;
import bitc.full502.backend.entity.AgencyOrderItemEntity;
import bitc.full502.backend.repository.AgencyOrderItemRepository;
import bitc.full502.backend.repository.AgencyProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final AgencyProductRepository agencyProductRepository;

    public List<InventoryDTO> getAgencyInventory(int agencyId) {
        return agencyProductRepository.findByAgency_AgKey(agencyId).stream()
                // product 기준으로 중복 제거
                .collect(Collectors.toMap(
                        p -> p.getProduct().getPdKey(), // key: product id
                        p -> p,                        // value: entity
                        (existing, replacement) -> existing // 중복 발생 시 첫 번째 유지
                ))
                .values()
                .stream()
                .map(p -> new InventoryDTO(
                        p.getProduct().getPdKey(),
                        p.getProduct().getPdNum(),
                        p.getProduct().getPdProducts(),
                        p.getStock(),
                        p.getApStore() != null ? p.getApStore().toString() : null
                ))
                .collect(Collectors.toList());
    }
}


