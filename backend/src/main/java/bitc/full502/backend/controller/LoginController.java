package bitc.full502.backend.controller;

import bitc.full502.backend.dto.LoginDTO;
import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/login")
@RequiredArgsConstructor
public class LoginController {

  private final LoginService loginService;

  /**
   * 로그인 처리
   * -------------------------
   * @param sep     로그인 구분 (head_office / agency / logistic)
   * @param loginId 사용자 아이디
   * @param loginPw 사용자 비밀번호
   * @return token + (agency 로그인 시 agencyId)
   */
  @PostMapping
  public Map<String, Object> login(@RequestParam String sep,
                                   @RequestParam String loginId,
                                   @RequestParam String loginPw) {

    LoginService.LoginResult result = loginService.login(sep, loginId, loginPw);
    if (result == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 틀렸습니다.");
    }

    // 프론트에서 JWT 토큰과 실제 ID를 받을 수 있도록 반환
    return Map.of(
        "token", result.token(),
        "userId", result.userId(), // 본사: hdId, 대리점: agId, 물류업// 체: lgId
            "agKey", result.agKey()
    );
  }
}
