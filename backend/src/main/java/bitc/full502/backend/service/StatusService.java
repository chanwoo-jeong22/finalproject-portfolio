package bitc.full502.backend.service;

import bitc.full502.backend.dto.StatusDTO;
import bitc.full502.backend.entity.AgencyOrderEntity;
import bitc.full502.backend.repository.AgencyOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final AgencyOrderRepository repository;

    public List<StatusDTO> findAllStatus() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StatusDTO convertToDTO(AgencyOrderEntity order) {
        return new StatusDTO(
                order.getOrKey(),
                order.getAgency().getAgName(),
                order.getOrStatus(),
                order.getDelivery().getDvName(),
                order.getDelivery().getDvPhone(),
                order.getOrDate().toLocalDate(),
                order.getOrReserve().toLocalDate(),
                order.getOrderNumber()
        );
    }
}
