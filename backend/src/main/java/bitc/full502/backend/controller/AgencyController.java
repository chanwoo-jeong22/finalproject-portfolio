package bitc.full502.backend.controller;


import bitc.full502.backend.dto.AgencyDTO;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.service.AgencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/agency")
@RequiredArgsConstructor
public class AgencyController {
  private final AgencyService agencyService;
  private final AgencyRepository repo ;


  @PostMapping("/register")
  public ResponseEntity<String> registerAgency(@RequestBody AgencyDTO dto) {
    try {
      boolean success = agencyService.registerAgency(dto);
      if (success) {
        return ResponseEntity.ok("대리점 등록 완료");
      } else {
        return ResponseEntity.status(400).body("등록 실패");
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).body("서버 오류: " + e.getMessage());
    }
  }

  // 마이페이지 조회
  @GetMapping("/mypage/{id}")
  public ResponseEntity<AgencyDTO> getAgencyInfo(@PathVariable String id) {
    return agencyService.getAgencyInfo(id);
  }

  // 마이페이지 수정 (비밀번호 포함)
  @PutMapping("/mypage/{id}")
  public ResponseEntity<String> updateAgencyInfo(
      @PathVariable String id,
      @RequestBody AgencyDTO dto
  ) {
    boolean updated = agencyService.updateAgencyInfo(id, dto);
    if (updated) {
      return ResponseEntity.ok("수정 완료");
    } else {
      return ResponseEntity.status(404).body("유저를 찾을 수 없습니다.");
    }
  }


  @GetMapping
  public List<AgencyDTO> list() {
      return agencyService.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<AgencyDTO> one(@PathVariable int id) {
      AgencyDTO dto = agencyService.findById(id);
      return (dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build());
  }
}
