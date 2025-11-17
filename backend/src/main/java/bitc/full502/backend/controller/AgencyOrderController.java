package bitc.full502.backend.controller;

import bitc.full502.backend.dto.*;
import bitc.full502.backend.entity.AgencyOrderEntity;
import bitc.full502.backend.repository.AgencyOrderRepository;
import bitc.full502.backend.service.AgencyOrderItemService;
import bitc.full502.backend.service.AgencyOrderService;
import bitc.full502.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agencyorder")
@RequiredArgsConstructor
public class AgencyOrderController {

    private final AgencyOrderService service;
    private final AgencyOrderItemService itemService;
    private final AgencyOrderRepository orderRepository;
    private final OrderService orderService;

    //============================================================
    // 1️⃣ 물류팀 테스트용 API (충돌 없는 경우 유지)
    //============================================================
    @GetMapping("/full")
    public List<AgencyOrderDTO> getAll() {
        return service.findAll();
    }

    @GetMapping("/full/{orKey}")
    public ResponseEntity<AgencyOrderDTO> getOneFull(@PathVariable int orKey) {
        AgencyOrderDTO dto = service.findFullById(orKey);
        return (dto != null) ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }


    @GetMapping("/full/mine")
    public List<AgencyOrderDTO> getMine(Authentication auth) {
        String loginId = (auth != null) ? auth.getName() : null;
        boolean isHQ = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HQ"));
        return service.findMineByLoginId(loginId, isHQ);
    }





    // 특정 대리점 주문 목록 조회 (상태 필터링 가능)
    @GetMapping
    public ResponseEntity<List<AgencyOrderEntity>> getOrders(
        @RequestParam int agencyId,
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(service.getOrders(agencyId, status));
    }

    // 주문 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("id") int id) {
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<OrderResponseDTO> getOrder(@RequestParam(required = false) Map<String, String> searchParams) {
        if (searchParams == null || searchParams.isEmpty()) {
            return service.getAllOrders();
        }
        return service.searchOrders(searchParams);
    }

    @PostMapping("/confirm/order")
    public void confirmOrder(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> orderIds = request.get("orderIds");
        service.confirmOrders(orderIds);
    }

    // 주문 아이템 조회
    @GetMapping("/items/{orKey}")
    public List<AgencyOrderItemDTO> getItems(@PathVariable int orKey) {
        return itemService.getItemsByOrderKey(orKey);
    }

    // 주문 상세 조회
    @GetMapping("/{orKey}/info")
    public AgencyOrderInfoDTO getOrderInfo(@PathVariable int orKey) {
        return itemService.getOrderInfo(orKey);
    }

    // 운전기사 포함 상태 업데이트
    @PutMapping("/{orKey}/status-with-driver")
    public ResponseEntity<Void> updateStatusWithDriver(
            @PathVariable int orKey,
            @RequestBody Map<String, Object> body) {

        String status = (String) body.get("status");
        String dvName = (String) body.get("dvName");
        Integer dvKey = body.get("dvKey") != null ? (Integer) body.get("dvKey") : null;

        if (dvName == null || dvName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // ✅ 상태와 기사명 업데이트 + 대리점 재고 증가
        service.updateOrderStatusWithDriver(orKey, status, dvName, dvKey);

        return ResponseEntity.ok().build();
    }


    // 대리점용: 기사 포함 주문 조회
    @GetMapping("/with-driver")
    public ResponseEntity<List<AgencyOrderDTO>> getOrdersWithDriver(
            @RequestParam int agencyId,
            @RequestParam(required = false) String status) {

        List<AgencyOrderDTO> orders = service.getOrdersWithDriver(agencyId, status);
        return ResponseEntity.ok(orders);
    }



    @GetMapping("/schedule")
    public List<AgencyOrderDTO> schedule(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "gu", required = false) String gu
    ) {
        return service.getSchedule(from, to, gu); // ← 변환 없음
    }

    @GetMapping("/schedule/mine")
    public List<AgencyOrderDTO> scheduleMine(
            Authentication auth,
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        String loginId = auth != null ? auth.getName() : null;
        boolean isHQ = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HQ"));
        if (isHQ) return service.getSchedule(from, to, null);
        String gu = service.resolveGuPrefixByLoginId(loginId);
        return service.getSchedule(from, to, gu);
    }

    @GetMapping("/android")
    public List<OrderDTO> getOrdersByAgency(@RequestParam int agKey) {
        return orderService.getOrdersByAgency(agKey);
    }

    @PostMapping("/orders/{agKey}")
    public ResponseEntity<String> registerOrders( @PathVariable int agKey,
                                                  @RequestBody List<OrderItemRequestDTO> items) {
        try {
            AgencyOrderEntity ao = service.createOrder(agKey, items);
            service.updateOrder(ao.getOrKey(), items);
            return ResponseEntity.ok("주문 등록 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("주문 등록 실패: " + e.getMessage());
        }
    }
}
