package bitc.full502.backend.controller;

import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.entity.HeadEntity;
import bitc.full502.backend.entity.LogisticEntity;
import bitc.full502.backend.entity.ResetTokenEntity;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.HeadRepository;
import bitc.full502.backend.repository.LogisticRepository;
import bitc.full502.backend.service.ResetTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final ResetTokenService tokenService;
  private final HeadRepository headRepository;
  private final LogisticRepository logisticRepository;
  private final AgencyRepository agencyRepository;
  private final PasswordEncoder passwordEncoder;

  public AuthController(ResetTokenService tokenService,
                        HeadRepository headRepository,
                        LogisticRepository logisticRepository,
                        AgencyRepository agencyRepository,
                        PasswordEncoder passwordEncoder) {
    this.tokenService = tokenService;
    this.headRepository = headRepository;
    this.logisticRepository = logisticRepository;
    this.agencyRepository = agencyRepository;
    this.passwordEncoder = passwordEncoder;
  }

  // 비밀번호 찾기 요청
  @PostMapping("/findPw")
  public Map<String, Object> findPw(@RequestBody Map<String, String> req) {
    String userId = req.get("userId");
    String email = req.get("email");

    Map<String, Object> res = new HashMap<>();

    // DB에서 유저 조회
    HeadEntity head = headRepository.findByHdIdAndHdEmail(userId, email).orElse(null);
    if (head != null) {
      boolean sent = tokenService.createTokenAndSendEmail((byte) 1, head.getHdKey(), email);
      if (sent) {
        res.put("success", true);
        res.put("message", "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.\n메일함을 확인해주세요. (스팸메일함도 확인 부탁드립니다.)");
      } else {
        res.put("success", false);
        res.put("message", "이메일 발송에 실패했습니다. 관리자에게 문의해주세요.");
      }
      return res;
    }

    LogisticEntity logistic = logisticRepository.findByLgIdAndLgEmail(userId, email).orElse(null);
    if (logistic != null) {
      boolean sent = tokenService.createTokenAndSendEmail((byte) 2, logistic.getLgKey(), email);
      if (sent) {
        res.put("success", true);
        res.put("message", "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.\n메일함을 확인해주세요. (스팸메일함도 확인 부탁드립니다.)");
      } else {
        res.put("success", false);
        res.put("message", "이메일 발송에 실패했습니다. 관리자에게 문의해주세요.");
      }
      return res;
    }

    AgencyEntity agency = agencyRepository.findByAgIdAndAgEmail(userId, email).orElse(null);
    if (agency != null) {
      boolean sent = tokenService.createTokenAndSendEmail((byte) 3, agency.getAgKey(), email);
      if (sent) {
        res.put("success", true);
        res.put("message", "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.\n메일함을 확인해주세요. (스팸메일함도 확인 부탁드립니다.)");
      } else {
        res.put("success", false);
        res.put("message", "이메일 발송에 실패했습니다. 관리자에게 문의해주세요.");
      }
      return res;
    }

    // 일치하는 계정 없음
    res.put("success", false);
    res.put("message", "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.");
    return res;
  }

  // 비밀번호 재설정
  @PostMapping("/resetPw")
  public Map<String, Object> resetPw(@RequestBody Map<String, String> req) {
    String tokenStr = req.get("token");
    String newPassword = req.get("newPassword");

    Map<String, Object> res = new HashMap<>();

    ResetTokenEntity token = tokenService.getToken(tokenStr);
    if (token == null || token.getExpireAt().isBefore(java.time.LocalDateTime.now())) {
      res.put("success", false);
      res.put("message", "토큰이 유효하지 않거나 만료되었습니다.");
      return res;
    }

    // 토큰 사용 처리
    tokenService.markTokenUsed(tokenStr);

    // BCrypt로 암호화
    String encodedPassword = passwordEncoder.encode(newPassword);

    // 유저 타입에 따라 비밀번호 업데이트
    switch (token.getUserType()) {
      case 1 -> { // 본사
        headRepository.findById(token.getUserId()).ifPresent(head -> {
          head.setHdPw(encodedPassword);
          headRepository.save(head);
        });
      }
      case 2 -> { // 물류
        logisticRepository.findById(token.getUserId()).ifPresent(logi -> {
          logi.setLgPw(encodedPassword);
          logisticRepository.save(logi);
        });
      }
      case 3 -> { // 대리점
        agencyRepository.findById(token.getUserId()).ifPresent(agency -> {
          agency.setAgPw(encodedPassword);
          agencyRepository.save(agency);
        });
      }
    }

    res.put("success", true);
    res.put("message", "비밀번호가 변경되었습니다. 다시 로그인해주세요.");
    return res;
  }
}