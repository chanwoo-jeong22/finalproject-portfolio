package bitc.full502.backend.service;

import bitc.full502.backend.entity.ResetTokenEntity;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.HeadRepository;
import bitc.full502.backend.repository.LogisticRepository;
import bitc.full502.backend.repository.ResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResetPasswordService {

  private final ResetTokenRepository tokenRepository;
  private final HeadRepository headRepository;
  private final LogisticRepository logisticRepository;
  private final AgencyRepository agencyRepository;
  private final PasswordEncoder passwordEncoder;

  // 토큰 생성
  public ResetTokenEntity createToken(Byte userType, Integer userId) {
    ResetTokenEntity token = new ResetTokenEntity();
    token.setUserType(userType);
    token.setUserId(userId);
    token.setToken(UUID.randomUUID().toString());
    token.setExpireAt(LocalDateTime.now().plusMinutes(30));
    token.setUsed(false);
    return tokenRepository.save(token);
  }

  // 토큰 검증
  @Transactional
  public boolean validateToken(String tokenStr) {
    return tokenRepository.findByTokenAndUsedFalse(tokenStr)
        .filter(t -> t.getExpireAt().isAfter(LocalDateTime.now()))
        .isPresent();
  }

  // 토큰 사용 처리
  @Transactional
  public void markTokenUsed(String tokenStr) {
    tokenRepository.findByTokenAndUsedFalse(tokenStr).ifPresent(token -> {
      token.setUsed(true);
      tokenRepository.save(token);
    });
  }

  // 계정 확인 + 토큰 생성
  public ResetTokenEntity findUserAndCreateToken(String userId, String email) {
    // 본사
    return headRepository.findByHdIdAndHdEmail(userId, email)
        .map(u -> createToken((byte)1, u.getHdKey()))
        // 물류
        .or(() -> logisticRepository.findByLgIdAndLgEmail(userId, email)
            .map(u -> createToken((byte)2, u.getLgKey())))
        // 대리점
        .or(() -> agencyRepository.findByAgIdAndAgEmail(userId, email)
            .map(u -> createToken((byte)3, u.getAgKey())))
        .orElse(null);
  }

  // 새 비밀번호 변경
  @Transactional
  public boolean resetPassword(String tokenStr, String newPassword) {
    ResetTokenEntity token = tokenRepository.findByTokenAndUsedFalse(tokenStr).orElse(null);
    if (token == null || token.getExpireAt().isBefore(LocalDateTime.now())) {
      return false;
    }

    Byte userType = token.getUserType();
    Integer userId = token.getUserId();
    String encodedPw = passwordEncoder.encode(newPassword);

    switch (userType) {
      case 1 -> headRepository.findById(userId).ifPresent(u -> u.setHdPw(encodedPw));
      case 2 -> logisticRepository.findById(userId).ifPresent(u -> u.setLgPw(encodedPw));
      case 3 -> agencyRepository.findById(userId).ifPresent(u -> u.setAgPw(encodedPw));
    }

    markTokenUsed(tokenStr);
    return true;
  }
}
