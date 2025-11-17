package bitc.full502.backend.controller;

import bitc.full502.backend.dto.LogisticDTO;
import bitc.full502.backend.entity.LogisticEntity;
import bitc.full502.backend.repository.LogisticRepository;
import bitc.full502.backend.service.LogisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logistic")
@RequiredArgsConstructor
public class LogisticController {
  private final LogisticService logisticService;

  // 마이페이지 조회
  @GetMapping("/mypage/{id}")
  public ResponseEntity<LogisticDTO> getLogisticInfo(@PathVariable String id) {
    return logisticService.getLogisticInfo(id);
  }

  // 마이페이지 수정
  @PutMapping("/mypage/{id}")
  public ResponseEntity<String> updateLogisticInfo(
      @PathVariable String id,
      @RequestBody LogisticDTO dto
  ) {
    boolean updated = logisticService.updateLogisticInfo(id, dto);
    if (updated) {
      return ResponseEntity.ok("수정 완료");
    } else {
      return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");
    }
  }

  @PostMapping("/register")
  public ResponseEntity<String> register(@RequestBody LogisticDTO dto) {
    LogisticEntity entity = LogisticEntity.builder()
        .lgName(dto.getLgName())
        .lgCeo(dto.getLgCeo())
        .lgId(dto.getLgId())
        .lgPw(dto.getLgPw())
        .lgAddress(dto.getLgAddress())
        .lgZip(dto.getLgZip())
        .lgPhone(dto.getLgPhone())
        .lgEmail(dto.getLgEmail())
        .build();

    logisticService.createLogistic(entity);
    return ResponseEntity.ok("회원가입 및 초기 재고 등록 완료");
  }
}
