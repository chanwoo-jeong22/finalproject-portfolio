package bitc.full502.backend.Scheduler;

import bitc.full502.backend.entity.AgencyOrderEntity;
import bitc.full502.backend.repository.AgencyOrderRepository;
import bitc.full502.backend.service.AgencyOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AgencyOrderScheduler {

    private final AgencyOrderRepository orderRepository;
    private final AgencyOrderService orderService;

    @Scheduled(fixedDelay = 1000 * 30) // 30초마다 실행
    @Transactional
    public void autoCompleteDeliveryScheduler() {

        System.out.println("Auto complete delivery scheduler 실행");

        // fetch join 해서 items 함께 가져오기
        List<AgencyOrderEntity> inTransitOrders = orderRepository.findByOrStatusWithItems("배송중");

        for (AgencyOrderEntity order : inTransitOrders) {
            try {
                orderService.autoCompleteDelivery(order.getOrKey());
                System.out.println("주문 자동완료 처리됨: " + order.getOrKey());
            } catch (Exception e) {
                System.err.println("자동완료 실패: " + order.getOrKey() + " / " + e.getMessage());
            }
        }
    }
}
