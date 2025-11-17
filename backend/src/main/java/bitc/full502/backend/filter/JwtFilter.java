package bitc.full502.backend.filter;

import bitc.full502.backend.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

import static org.aspectj.weaver.tools.cache.SimpleCacheFactory.path;

/**
 * JWT 인증 필터
 * 모든 요청에 대해 JWT 검증 수행
 * 특정 URL은 인증 없이 통과 가능 (임시저장 등)
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;

  // JWT 없이 허용할 URL 목록
  private static final List<String> EXCLUDE_URLS = List.of(
      "/api/agencyorder/draft" // 임시 저장은 로그인 없이 테스트 가능
  );

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain)
      throws ServletException, IOException {

    if (path.startsWith("/api/orders/**")) {
      filterChain.doFilter(request, response);
      return;
    }
    if (path.startsWith("/api/orders/items/**")) {
      filterChain.doFilter(request, response);
      return;
    }

    if (path.startsWith("/api/orders/**")) {
      filterChain.doFilter(request, response);
      return;
    }
    if (path.startsWith("/api/orders/items/**")) {
      filterChain.doFilter(request, response);
      return;
    }

    String requestPath = request.getRequestURI(); // 현재 요청 경로 확인

    // 허용 URL이면 인증 없이 통과
    for (String path : EXCLUDE_URLS) {
      if (requestPath.startsWith(path)) {
        filterChain.doFilter(request, response);
        return;
      }
    }

    // Authorization 헤더에서 JWT 추출
    final String header = request.getHeader(HttpHeaders.AUTHORIZATION);

    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        Claims claims = jwtUtil.validateToken(token); // JWT 검증
        String userId = claims.getSubject();
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

          // JWT에서 role 추출 후 Spring Security 권한 객체 생성
          String role = claims.get("role", String.class);
          List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(userId, null, authorities);

          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      } catch (Exception e) {
        // JWT 검증 실패 시 로그만 남기고 요청 거부하지 않음
        System.out.println("JWT 검증 실패: " + e.getMessage());
      }
    }

    filterChain.doFilter(request, response); // 다음 필터 실행
  }
}
