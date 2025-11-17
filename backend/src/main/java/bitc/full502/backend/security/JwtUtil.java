package bitc.full502.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

  private final SecretKey SECRET_KEY;

  // application.properties에 등록: jwt.secret=mySuperSecretKey123
  public JwtUtil(@Value("${jwt.secret}") String secret) {
    this.SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  // 토큰 생성
  public String generateToken(String userId, String role) {
    return Jwts.builder()
            .setSubject(userId)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 2))
            .signWith(SECRET_KEY)
            .compact();
  }

  // 토큰 검증
  public Claims validateToken(String token) {
    return Jwts.parserBuilder()
            .setSigningKey(SECRET_KEY)
            .build()
            .parseClaimsJws(token)
            .getBody();
  }
}