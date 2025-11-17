package bitc.full502.backend.service;

import bitc.full502.backend.dto.LogisticDTO;
import bitc.full502.backend.entity.LogisticEntity;
import bitc.full502.backend.repository.LogisticRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LogisticService {

  private final LogisticRepository repo;
  private final PasswordEncoder passwordEncoder;

  // 조회
  public ResponseEntity<LogisticDTO> getLogisticInfo(String id) {
    return repo.findByLgId(id)
        .map(logistic -> ResponseEntity.ok(
            new LogisticDTO(
                logistic.getLgKey(),
                logistic.getLgCode(),
                logistic.getLgName(),
                logistic.getLgCeo(),
                logistic.getLgPw(),
                logistic.getLgId(),
                logistic.getLgAddress(),
                logistic.getLgZip(),
                logistic.getLgPhone(),
                logistic.getLgEmail()
            )
        ))
        .orElse(ResponseEntity.status(404).build());
  }

  // 수정
  public boolean updateLogisticInfo(String id, LogisticDTO dto) {
    Optional<LogisticEntity> opt = repo.findByLgId(id);
    if (opt.isEmpty()) return false;

    LogisticEntity entity = opt.get();
    entity.setLgCeo(dto.getLgCeo());
    entity.setLgPhone(dto.getLgPhone());
    entity.setLgEmail(dto.getLgEmail());

    // 비밀번호가 들어오면 암호화 후 저장
    if (dto.getLgPw() != null && !dto.getLgPw().isBlank()) {
      entity.setLgPw(passwordEncoder.encode(dto.getLgPw()));
    }

    repo.save(entity);
    return true;
  }

  @Transactional
  public LogisticEntity createLogistic(LogisticEntity entity) {
    // 비밀번호 암호화
    entity.setLgPw(passwordEncoder.encode(entity.getLgPw()));

    // 저장
    LogisticEntity saved = repo.save(entity);

    // 초기 재고 생성
    repo.initLogisticStock(saved.getLgKey());

    return saved;
  }
}
