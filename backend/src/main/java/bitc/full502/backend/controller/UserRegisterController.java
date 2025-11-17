package bitc.full502.backend.controller;

import bitc.full502.backend.dto.UserRegisterDTO;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.LogisticRepository;
import bitc.full502.backend.service.UserRegisterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRegisterController {

  private final UserRegisterService service;
  private final AgencyRepository agencyRepo;
  private final LogisticRepository logisticRepo;

  // 회원가입
  @PostMapping("/register")
  public String register(@RequestBody UserRegisterDTO dto) {
    // 아이디 중복 체크
    boolean idExists = agencyRepo.existsByAgId(dto.getLoginId())
        || logisticRepo.existsByLgId(dto.getLoginId());
    if (idExists) {
      return "duplicate-id";
    }

    // 이메일 중복 체크
    boolean emailExists = agencyRepo.existsByAgEmail(dto.getEmail())
        || logisticRepo.existsByLgEmail(dto.getEmail());
    if (emailExists) {
      return "duplicate-email";
    }

    service.registerUser(dto);
    return "success";
  }

  // 아이디 중복 확인
  @GetMapping("/check-id")
  public boolean checkId(@RequestParam String loginId) {
    if (loginId == null || loginId.trim().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "아이디를 입력해주세요.");
    }
    return agencyRepo.existsByAgId(loginId) || logisticRepo.existsByLgId(loginId);
  }

  // 이메일 중복 확인
  @GetMapping("/check-email")
  public Map<String, Object> checkEmail(@RequestParam String email) {
    if (email == null || email.trim().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일을 입력해주세요.");
    }

    boolean exists = agencyRepo.existsByAgEmail(email) || logisticRepo.existsByLgEmail(email);

    return Map.of(
        "valid", !exists,   // 중복 없으면 true
        "message", exists ? "이미 등록된 이메일입니다." : "사용 가능한 이메일입니다."
    );
  }

  // 삭제
  @PostMapping("/delete")
  public String deleteUsers(@RequestBody Map<String, Object> data) {
    @SuppressWarnings("unchecked")
    List<Integer> userKeys = (List<Integer>) data.get("userIds");

    if (userKeys == null || userKeys.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제할 유저를 선택해주세요.");
    }

    for (Integer key : userKeys) {
      // 대리점 삭제
      agencyRepo.findById(Integer.valueOf(key)).ifPresent(agencyRepo::delete);

      // 물류업체 삭제
      logisticRepo.findById(Integer.valueOf(key)).ifPresent(logisticRepo::delete);
    }

    return "success";
  }

  @GetMapping("/list")
  public List<Map<String, Object>> getUserList() {
    List<Map<String, Object>> userList = new ArrayList<>();

    // 대리점 유저
    agencyRepo.findAll().forEach(a -> {
      userList.add(Map.of(
          "userKey", a.getAgKey(),   // PK 전달
          "userId", a.getAgName(),
          "userName", a.getAgCeo(),
          "address", a.getAgAddress(),
          "tel", a.getAgPhone(),
          "type", "agency"
      ));
    });

    // 물류업체 유저
    logisticRepo.findAll().forEach(l -> {
      userList.add(Map.of(
          "userKey", l.getLgKey(),   // PK 전달
          "userId", l.getLgName(),
          "userName", l.getLgCeo(),
          "address", l.getLgAddress(),
          "tel", l.getLgPhone(),
          "type", "logistic"
      ));
    });

    return userList;
  }

  @GetMapping("/check-company")
  public ResponseEntity<Boolean> checkCompany(@RequestParam String userId) {
    boolean logisticExists = logisticRepo.existsByLgName(userId);
    boolean agencyExists = agencyRepo.existsByAgName(userId);
    return ResponseEntity.ok(logisticExists || agencyExists);
  }
}
