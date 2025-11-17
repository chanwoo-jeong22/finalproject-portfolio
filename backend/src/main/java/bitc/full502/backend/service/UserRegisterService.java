package bitc.full502.backend.service;

import bitc.full502.backend.dto.UserRegisterDTO;
import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.entity.LogisticEntity;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.LogisticRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserRegisterService {
  private final AgencyRepository agencyRepo;
  private final LogisticRepository logisticRepo;
  private final PasswordEncoder passwordEncoder;

  public void registerUser(UserRegisterDTO dto) {
    String encodedPw = passwordEncoder.encode(dto.getUserPw1());

    if ("대리점".equals(dto.getType())) {
      AgencyEntity agency = AgencyEntity.builder()
          .agName(dto.getUserId())
          .agCeo(dto.getUserName())
          .agId(dto.getLoginId())
          .agPw(encodedPw)
          .agAddress(dto.getAddress())
          .agZip(dto.getZip())
          .agPhone(dto.getTel())
          .agEmail(dto.getEmail())
          .build();
      agencyRepo.save(agency);

    } else if ("물류업체".equals(dto.getType())) {
      LogisticEntity logistic = LogisticEntity.builder()
          .lgName(dto.getUserId())
          .lgCeo(dto.getUserName())
          .lgId(dto.getLoginId())
          .lgPw(encodedPw)
          .lgAddress(dto.getAddress())
          .lgZip(dto.getZip())
          .lgPhone(dto.getTel())
          .lgEmail(dto.getEmail())
          .build();
      logisticRepo.save(logistic);
    }
  }
}
