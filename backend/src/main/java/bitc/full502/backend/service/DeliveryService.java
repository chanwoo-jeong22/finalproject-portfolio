package bitc.full502.backend.service;


import bitc.full502.backend.dto.AgencyDTO;
import bitc.full502.backend.dto.DeliveryDTO;
import bitc.full502.backend.entity.DeliveryEntity;
import bitc.full502.backend.repository.DeliveryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final DeliveryRepository repo;

    public List<DeliveryDTO> findAll() {
        return repo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DeliveryDTO findById(int id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

//    public List<DeliveryDTO> findAll() {
//        return repo.findAll().stream().map(e -> {
    private DeliveryDTO toDto(DeliveryEntity e) {
            DeliveryDTO dto = new DeliveryDTO();
            dto.setDvDelivery(e.getDvDelivery());
            dto.setDvCar(e.getDvCar());
            dto.setDvKey(e.getDvKey());
            dto.setDvName(e.getDvName());
            dto.setDvStatus(e.getDvStatus());
            dto.setDvPhone(e.getDvPhone());
            return dto;
    }

    @Transactional
    public void updateDriverStatus(int dvKey , String status, boolean on){
        repo.updateStatus(dvKey,status,on);
    }
}
