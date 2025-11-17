package bitc.full502.backend.service;

import bitc.full502.backend.dto.AgencyDTO;
import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.repository.AgencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyRepository agencyRepo;
    private final PasswordEncoder passwordEncoder;

    // 조회
    public ResponseEntity<AgencyDTO> getAgencyInfo(String id) {
        return agencyRepo.findByAgId(id)
                .map(agency -> ResponseEntity.ok(
                        new AgencyDTO(
                                agency.getAgKey(),
                                agency.getAgCode(),
                                agency.getAgName(),
                                agency.getAgCeo(),
                                agency.getAgId(),
                                agency.getAgPw(),
                                agency.getAgAddress(),
                                agency.getAgZip(),
                                agency.getAgPhone(),
                                agency.getAgEmail()
                        )
                ))
                .orElse(ResponseEntity.status(404).build());
    }

    // 수정
    public boolean updateAgencyInfo(String id, AgencyDTO dto) {
        Optional<AgencyEntity> opt = agencyRepo.findByAgId(id);
        if (opt.isEmpty()) return false;

        AgencyEntity entity = opt.get();
        entity.setAgCeo(dto.getAgCeo());
        entity.setAgPhone(dto.getAgPhone());
        entity.setAgEmail(dto.getAgEmail());

        // 비밀번호가 들어오면 암호화 후 저장
        if (dto.getAgPw() != null && !dto.getAgPw().isBlank()) {
            entity.setAgPw(passwordEncoder.encode(dto.getAgPw()));
        }

        agencyRepo.save(entity);
        return true;
    }

    public boolean registerAgency(AgencyDTO dto) {
        // 아이디/이메일 중복 체크
        if (agencyRepo.existsByAgId(dto.getAgId()) || agencyRepo.existsByAgEmail(dto.getAgEmail())) {
            return false;
        }
        agencyRepo.save(dto.toEntity(passwordEncoder));
        return true;
    }


    public List<AgencyDTO> findAll() {
        return agencyRepo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public AgencyDTO findById(int id) {
        return agencyRepo.findById(id)
                .map(this::toDto)
                .orElse(null);
    }


    //    public List<AgencyDTO> findAll() {
//        return repo.findAll().stream().map(e -> {
    private AgencyDTO toDto(AgencyEntity e) {
        AgencyDTO dto = new AgencyDTO();
        dto.setAgKey(e.getAgKey());
        dto.setAgName(e.getAgName()); // 진경 추가
        dto.setAgAddress(e.getAgAddress());
        dto.setAgCeo(e.getAgCeo());
        dto.setAgPhone(e.getAgPhone());
        dto.setAgEmail(e.getAgEmail());
        dto.setAgZip(e.getAgZip());
        dto.setAgCode(e.getAgCode());
        return dto;
    }
}
