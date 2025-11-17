package bitc.full502.backend.service;

import bitc.full502.backend.dto.AgencyOrderInfoDTO;
import bitc.full502.backend.dto.AgencyOrderItemDTO;
import bitc.full502.backend.entity.AgencyOrderItemEntity;
import bitc.full502.backend.entity.AgencyOrderEntity;
import bitc.full502.backend.repository.AgencyOrderItemRepository;
import bitc.full502.backend.repository.AgencyOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgencyOrderItemService {

    private final AgencyOrderItemRepository itemRepository;
    private final AgencyOrderRepository orderRepository;

    public AgencyOrderItemService(AgencyOrderRepository orderRepository,
                                  AgencyOrderItemRepository itemRepository) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
    }

    // 특정 주문(orKey) 아이템 조회
    public List<AgencyOrderItemDTO> getItemsByOrderKey(int orKey) {
        // 1️⃣ 주문 Entity 조회
        AgencyOrderEntity order = orderRepository.findById(orKey).orElse(null);

        // 2️⃣ 아이템 Entity 조회
        List<AgencyOrderItemEntity> items = itemRepository.findItemsByOrKey(orKey);

        // 3️⃣ Entity → DTO 변환
        return items.stream()
                .map(item -> toDto(item, order))
                .collect(Collectors.toList());
    }

    // Entity → DTO 변환
    private AgencyOrderItemDTO toDto(AgencyOrderItemEntity e, AgencyOrderEntity order) {
        AgencyOrderItemDTO dto = new AgencyOrderItemDTO();
        dto.setOiKey(e.getOiKey());
        dto.setOrKey(e.getOrKey());
        dto.setPdKey(e.getPdKey());
        dto.setOiProducts(e.getOiProducts());
        dto.setOiPrice(e.getOiPrice());
        dto.setOiQuantity(e.getOiQuantity());
        dto.setOiTotal(e.getOiTotal());
        dto.setPdNum(e.getProduct() != null ? e.getProduct().getPdNum() : "");
        if (order != null && order.getAgency() != null) {
            dto.setAgName(order.getAgency().getAgName());
            dto.setAgPhone(order.getAgency().getAgPhone());
        } else {
            dto.setAgName("");
            dto.setAgPhone("");
        }
        return dto;
    }

    public AgencyOrderInfoDTO getOrderInfo(int orKey) {
        AgencyOrderEntity order = orderRepository.findById(orKey)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orKey));

        return new AgencyOrderInfoDTO(
                order.getOrKey(),
                order.getAgency() != null ? order.getAgency().getAgName() : "",
                order.getOrDate() != null ? order.getOrDate().toLocalDate() : null,
                order.getOrReserve() != null ? order.getOrReserve().toLocalDate() : null
        );
    }
}
