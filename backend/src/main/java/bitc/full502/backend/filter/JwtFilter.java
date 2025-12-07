package bitc.full502.backend.filter;

import bitc.full502.backend.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

  private final JwtUtil jwtUtil;

  private static final List<String> EXCLUDE_URLS = List.of(
    "/api/login",
    "/api/users/register",
    "/api/users/check-id", 
    "/api/users/check-email",   
    "/api/agencyorder/draft",
    "/api/head/signup",
    "/api/head/checkEmail",
    "/api/auth/findPw",
    "/api/auth/resetPw",
    "/uploads/"
);


  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain)
      throws ServletException, IOException {

    String requestPath = request.getRequestURI();
    logger.debug("요청 경로: {}", requestPath);

    // 인증 제외 경로 처리
    for (String path : EXCLUDE_URLS) {
      if (requestPath.startsWith(path)) {
        filterChain.doFilter(request, response);
        return;
      }
    }

    final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    logger.debug("JWT 헤더: {}", header);

    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        Claims claims = jwtUtil.validateToken(token);
        logger.debug("JWT claims subject: {}", claims.getSubject());

        if (claims.getSubject() != null && SecurityContextHolder.getContext().getAuthentication() == null) {
          String userId = claims.getSubject();
          String role = claims.get("role", String.class);
          logger.debug("JWT role: {}", role);  // 이 줄 추가!

          String springRole;
          switch (role) {
            case "head_office":
              springRole = "HEAD";
              break;
            case "agency":
              springRole = "AGENCY";
              break;
            case "logistic":
              springRole = "LOGISTIC";
              break;
            default:
              springRole = "GUEST";
          }

          List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + springRole));
          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(userId, null, authorities);
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

          SecurityContextHolder.getContext().setAuthentication(auth);
        }

      } catch (Exception e) {
        logger.warn("JWT 검증 실패: {}", e.getMessage());
        // 인증 실패 시 401 응답 반환 후 필터 체인 종료
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Invalid or expired JWT token");
        return;
      }
    } else {
      logger.debug("Authorization 헤더가 없거나 Bearer 토큰 형식이 아님");
      // 토큰이 필요하지만 없으면 401 응답 처리 (필요하다면)
      // 여기서는 인증 제외 URL이 아니면 무조건 401 처리
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getWriter().write("Authorization header missing or invalid");
      return;
    }

    filterChain.doFilter(request, response);
  }
}
