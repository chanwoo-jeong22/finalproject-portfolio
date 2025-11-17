package bitc.full502.backend.service;

import bitc.full502.backend.dto.OrderDTO;
import bitc.full502.backend.entity.AgencyOrderEntity;
import bitc.full502.backend.repository.AgencyOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final AgencyOrderRepository orderRepository;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public List<OrderDTO> getOrdersByAgency(int agKey) {
        List<AgencyOrderEntity> orders = orderRepository.findByAgencyAgKey(agKey);

        return orders.stream().map(order -> new OrderDTO(
                order.getOrKey(),
                order.getAgency().getAgKey(),
                dateFormat.format(order.getOrDate()),
                order.getOrStatus(),
                dateFormat.format(order.getOrReserve()),
                order.getDelivery() != null ? order.getDelivery().getDvName() : "",
                order.getDelivery() != null ? order.getDelivery().getDvPhone() : "",
                order.getOrTotal()
        )).collect(Collectors.toList());
    }
}
