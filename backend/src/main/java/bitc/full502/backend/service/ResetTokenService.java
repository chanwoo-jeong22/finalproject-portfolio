package bitc.full502.backend.service;

import bitc.full502.backend.entity.ResetTokenEntity;
import bitc.full502.backend.repository.ResetTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class ResetTokenService {
  private final ResetTokenRepository tokenRepository;
  private final EmailService emailService;

  public ResetTokenService(ResetTokenRepository tokenRepository, EmailService emailService) {
    this.tokenRepository = tokenRepository;
    this.emailService = emailService;
  }

  // DB에 토큰 생성하고 이메일 발송
  public boolean createTokenAndSendEmail(Byte userType, Integer userId, String email) {
    try {
      ResetTokenEntity token = new ResetTokenEntity();
      token.setUserType(userType);
      token.setUserId(userId);
      token.setToken(UUID.randomUUID().toString());
      token.setExpireAt(LocalDateTime.now().plusMinutes(30));
      token.setUsed(false);

      tokenRepository.save(token);

      // 이메일 발송
      emailService.sendResetPasswordEmail(email, token.getToken());

      log.info("비밀번호 재설정 이메일 발송 성공: {}", email);
      return true;
    } catch (Exception e) {
      log.error("비밀번호 재설정 이메일 발송 실패: {}", email, e);
      return false;
    }
  }

  @Transactional
  public boolean validateToken(String tokenStr) {
    return tokenRepository.findByTokenAndUsedFalse(tokenStr)
        .filter(t -> t.getExpireAt().isAfter(LocalDateTime.now()))
        .isPresent();
  }

  @Transactional
  public void markTokenUsed(String tokenStr) {
    tokenRepository.findByTokenAndUsedFalse(tokenStr).ifPresent(token -> {
      token.setUsed(true);
      tokenRepository.save(token);
    });
  }

  public ResetTokenEntity getToken(String tokenStr) {
    return tokenRepository.findByTokenAndUsedFalse(tokenStr).orElse(null);
  }
}
