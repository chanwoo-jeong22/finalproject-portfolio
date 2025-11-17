package bitc.full502.backend.controller;

import bitc.full502.backend.dto.ConfirmOrderRequestDTO;
import bitc.full502.backend.dto.ReadyOrderDTO;
import bitc.full502.backend.entity.AgencyOrderEntity;
import bitc.full502.backend.service.ReadyOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agencyorder")
@RequiredArgsConstructor
public class ReadyOrderController {

    private final ReadyOrderService service;

    // 임시 저장 조회
    @GetMapping("/draft")
    public ResponseEntity<List<ReadyOrderDTO>> getDrafts(@RequestParam(defaultValue = "0") int agKey) {
        List<ReadyOrderDTO> drafts = service.getDrafts(agKey);
        return ResponseEntity.ok(drafts);
    }

    // 임시 저장 추가
    @PostMapping("/draft")
    public ResponseEntity<List<ReadyOrderDTO>> saveDraft(@RequestBody List<ReadyOrderDTO> dtos) {
        List<ReadyOrderDTO> saved = service.saveDraftList(dtos);
        return ResponseEntity.ok(saved);
    }

    // 선택 삭제
    @DeleteMapping("/draft")
    public ResponseEntity<Void> deleteDrafts(@RequestBody Map<String, List<Integer>> payload) {
        List<Integer> rdKeys = payload.get("rdKeys");
        service.deleteDrafts(rdKeys);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<AgencyOrderEntity> confirmOrder(@RequestBody ConfirmOrderRequestDTO request) {
        if (request.getAgKey() == null || request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Date reserveDate = null;
        if (request.getReserveDate() != null) {
            reserveDate = Date.valueOf(request.getReserveDate());
        }

        // 서비스에서 실제 주문 저장 후 생성된 엔티티 반환
        AgencyOrderEntity savedOrder = service.confirmOrder(request.getAgKey(), request.getItems(), reserveDate);

        return ResponseEntity.ok(savedOrder);
    }

}
