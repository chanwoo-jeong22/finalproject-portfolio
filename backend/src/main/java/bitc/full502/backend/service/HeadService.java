package bitc.full502.backend.service;

import bitc.full502.backend.dto.HeadDTO;
import bitc.full502.backend.entity.HeadEntity;
import bitc.full502.backend.repository.HeadRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class HeadService {

  private final HeadRepository headRepository;
  private final PasswordEncoder passwordEncoder;

  public HeadService(HeadRepository headRepository, PasswordEncoder passwordEncoder) {
    this.headRepository = headRepository;
    this.passwordEncoder = passwordEncoder;
  }

  // ---------------- 회원가입 ----------------
  public void signup(HeadDTO dto, MultipartFile profile) throws IOException {
    if (headRepository.existsByHdId(dto.getHdId())) {
      throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
    }
    if (headRepository.existsByHdEmail(dto.getHdEmail())) {
      throw new IllegalArgumentException("이미 등록된 이메일입니다.");
    }

    HeadEntity entity = HeadEntity.builder()
        .hdName(dto.getHdName())
        .hdId(dto.getHdId())
        .hdPw(passwordEncoder.encode(dto.getHdPw()))
        .hdEmail(dto.getHdEmail())
        .hdPhone(dto.getHdPhone())
        .hdAuth(dto.getHdAuth())
        .build();

    if (profile != null && !profile.isEmpty()) {
      String fileName = UUID.randomUUID() + "_" + profile.getOriginalFilename();
      String uploadDir = getUploadDir();
      Path filePath = Paths.get(uploadDir, fileName);
      Files.createDirectories(filePath.getParent());
      profile.transferTo(filePath.toFile());
      entity.setHdProfile(fileName);
    }

    headRepository.save(entity);
  }

  // ---------------- 마이페이지: 내 정보 조회 ----------------
  public HeadDTO getMyPage(String hdId) {
    HeadEntity entity = headRepository.findByHdId(hdId)
        .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

    return HeadDTO.builder()
        .hdId(entity.getHdId())
        .hdName(entity.getHdName())
        .hdEmail(entity.getHdEmail())
        .hdPhone(entity.getHdPhone())
        .hdAuth(entity.getHdAuth())
        .hdProfile(entity.getHdProfile() != null ? "/uploads/profile/" + entity.getHdProfile() : null)
        .build();
  }

  // ---------------- 마이페이지: 내 정보 수정 ----------------
  public void updateMyPage(String hdId, HeadDTO dto, MultipartFile profile) throws IOException {
    HeadEntity entity = headRepository.findByHdId(hdId)
        .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

    // 이메일 중복 체크 (자기 자신 제외)
    if (!entity.getHdEmail().equals(dto.getHdEmail()) && headRepository.existsByHdEmail(dto.getHdEmail())) {
      throw new IllegalArgumentException("이미 등록된 이메일입니다.");
    }

    entity.setHdName(dto.getHdName());           // 이름 수정 가능
    entity.setHdEmail(dto.getHdEmail());         // 이메일 수정
    entity.setHdPhone(dto.getHdPhone());         // 전화번호 수정
    entity.setHdAuth(dto.getHdAuth());           // 직급/권한 수정

    // 비밀번호 수정 가능
    if (dto.getHdPw() != null && !dto.getHdPw().isEmpty()) {
      entity.setHdPw(passwordEncoder.encode(dto.getHdPw()));
    }

    // 프로필 이미지 수정
    if (profile != null && !profile.isEmpty()) {
      String fileName = UUID.randomUUID() + "_" + profile.getOriginalFilename();
      String uploadDir = getUploadDir();
      Path filePath = Paths.get(uploadDir, fileName);
      Files.createDirectories(filePath.getParent());
      profile.transferTo(filePath.toFile());
      entity.setHdProfile(fileName);
    }

    headRepository.save(entity);
  }

  // ---------------- 마이페이지: 비밀번호 변경 ----------------
  public void updatePassword(String hdId, String currentPw, String newPw) {
    HeadEntity entity = headRepository.findByHdId(hdId)
        .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

    if (!passwordEncoder.matches(currentPw, entity.getHdPw())) {
      throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
    }

    entity.setHdPw(passwordEncoder.encode(newPw));
    headRepository.save(entity);
  }

  // ---------------- 유틸 ----------------
  private String getUploadDir() {
    String osName = System.getProperty("os.name").toLowerCase();
    return osName.contains("mac") || osName.contains("win")
        ? System.getProperty("user.home") + "/finalproject/backend/uploads/profile"
        : "/opt/app/uploads/profile";
  }

  // ---------------- 중복체크 ----------------
  public boolean existsById(String hdId) {
    return headRepository.existsByHdId(hdId);
  }

  public boolean existsByEmail(String hdEmail) {
    return headRepository.existsByHdEmail(hdEmail);
  }
}
