package bitc.full502.backend.service;

import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.entity.HeadEntity;
import bitc.full502.backend.entity.LogisticEntity;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.HeadRepository;
import bitc.full502.backend.repository.LogisticRepository;
import bitc.full502.backend.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoginService {

  private final HeadRepository headRepo;
  private final AgencyRepository agencyRepo;
  private final LogisticRepository logisticRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public LoginResult login(String sep, String userId, String userPw) {
    switch (sep) {
      case "head_office":
        HeadEntity head = headRepo.findByHdId(userId).orElse(null);
        if (head != null && passwordEncoder.matches(userPw, head.getHdPw())) {
          String token = jwtUtil.generateToken(userId, sep);
          return new LoginResult(token, head.getHdId(), 0);
        }
        break;

      case "agency":
        AgencyEntity agency = agencyRepo.findByAgId(userId).orElse(null);
        if (agency != null && passwordEncoder.matches(userPw, agency.getAgPw())) {
          String token = jwtUtil.generateToken(userId, sep);
          return new LoginResult(token, agency.getAgId(), agency.getAgKey());
        }
        break;

      case "logistic":
        LogisticEntity logi = logisticRepo.findByLgId(userId).orElse(null);
        if (logi != null && passwordEncoder.matches(userPw, logi.getLgPw())) {
          String token = jwtUtil.generateToken(userId, sep);
          return new LoginResult(token, logi.getLgId(), 0);
        }
        break;
    }
    return null;
  }

  // 내부 DTO 클래스 (토큰 + 실제 ID 반환)
  public static record LoginResult(String token, String userId, int agKey) {}
}
