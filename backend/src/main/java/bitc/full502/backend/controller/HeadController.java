package bitc.full502.backend.controller;

import bitc.full502.backend.dto.HeadDTO;
import bitc.full502.backend.service.HeadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/head")
public class HeadController {

  private final HeadService headService;

  public HeadController(HeadService headService) {
    this.headService = headService;
  }

  // 회원가입
  @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> signup(
      @RequestPart("data") HeadDTO headDTO,
      @RequestPart(value = "profile", required = false) MultipartFile profile
  ) {
    try {
      if (headService.existsById(headDTO.getHdId())) {
        throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
      }
      if (headService.existsByEmail(headDTO.getHdEmail())) {
        throw new IllegalArgumentException("이미 등록된 이메일입니다.");
      }

      headService.signup(headDTO, profile);
      return ResponseEntity.ok(Map.of("message", "회원가입 성공!"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  // 이메일 중복 체크
  @GetMapping("/checkEmail")
  public ResponseEntity<Map<String, Object>> checkEmail(@RequestParam String hd_email) {
    boolean exists = headService.existsByEmail(hd_email);
    return ResponseEntity.ok(Map.of(
        "valid", !exists,
        "message", exists ? "이미 등록된 이메일입니다." : "사용 가능한 이메일입니다."
    ));
  }

  // 내 정보 조회
  @GetMapping("/mypage/{hdId}")
  public ResponseEntity<?> getMyPage(@PathVariable String hdId) {
    try {
      HeadDTO headDTO = headService.getMyPage(hdId);
      return ResponseEntity.ok(headDTO);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("error", "해당 유저를 찾을 수 없습니다."));
    }
  }

  // 내 정보 수정
  @PutMapping(value = "/mypage/{hdId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> updateMyPage(
      @PathVariable String hdId,
      @RequestPart("data") HeadDTO headDTO,
      @RequestPart(value = "profile", required = false) MultipartFile profile
  ) {
    try {
      headService.updateMyPage(hdId, headDTO, profile);
      return ResponseEntity.ok(Map.of("message", "정보 수정 성공!"));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  // 비밀번호 변경
  @PatchMapping("/mypage/{hdId}/password")
  public ResponseEntity<?> updatePassword(
      @PathVariable String hdId,
      @RequestBody Map<String, String> request
  ) {
    try {
      String currentPw = request.get("currentPw");
      String newPw = request.get("newPw");

      headService.updatePassword(hdId, currentPw, newPw);
      return ResponseEntity.ok(Map.of("message", "비밀번호 변경 성공!"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }
}