package bitc.full502.backend.config;

import bitc.full502.backend.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class AppConfig implements WebMvcConfigurer {

    private final JwtFilter jwtFilter;

    @Value("${app.upload.profile.dir}")
    private String uploadDir;

    @Value("${app.upload.product.dir}")
    private String productUploadDir;

    public AppConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // ==============================
    // 🔹 WebMvc: 업로드 리소스 경로 설정
    // ==============================
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프로필 이미지 업로드 경로 매핑
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations("file:" + uploadDir + "/");
        // 제품 이미지 업로드 경로 매핑
        registry.addResourceHandler("/uploads/product/**")
                .addResourceLocations("file:" + productUploadDir + "/");
    }

    // ==============================
    // 🔹 Security: JWT + CORS 설정
    // ==============================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS / CSRF 비활성화 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            // JWT 사용을 위해 세션 비활성화
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 요청 권한 및 인증 설정
            .authorizeHttpRequests(auth -> auth
                // 인증 없이 접근 가능한 경로 (로그인, 회원가입, 공용 API 등)
                .requestMatchers(
                    "/api/login", "/api/login/**",
                    "/api/auth/findPw", "/api/auth/resetPw",
                    "/api/users/check-id", "/api/users/check-email",
                    "/api/users/register", "/api/users/list", "/api/users/delete",
                    "/api/head/signup", "/api/head/checkEmail",

                    // 공통 허용 API들 (필요에 따라 더 추가 가능)
                    "/api/agencyorder/draft", // 인증 없이 허용 예시

                    // 업로드 리소스
                    "/uploads/**", "/uploads/profile/**", "/uploads/product/**"
                ).permitAll()

                // ============================
                // 권한별 접근 제어
                // ============================

                // 헤드오피스 권한 필요 경로
                .requestMatchers("/api/head_office/**").hasRole("HEAD")

                // 대리점 권한 필요 경로
                .requestMatchers("/api/agency/**").hasAnyRole("AGENCY", "HEAD")

                // 물류 업체 권한 필요 경로
                .requestMatchers("/api/logistic/**").hasAnyRole("LOGISTIC", "HEAD")

                // 디테일 페이지 때문에 추가
                 .requestMatchers("/api/agencyorder/**").hasAnyRole("AGENCY", "LOGISTIC", "HEAD")

                // 나머지 요청은 인증만 되어 있으면 접근 가능
                .anyRequest().authenticated()
            )

            // JWT 필터를 UsernamePasswordAuthenticationFilter 전에 등록
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ==============================
    // 🔹 비밀번호 암호화 인코더
    // ==============================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==============================
    // 🔹 CORS 설정 (개발용 - 모든 출처, 메서드, 헤더 허용)
    // ==============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 모든 도메인에서 요청 허용 (운영 시에는 필요한 도메인만 허용 권장)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
        configuration.setAllowedMethods(Arrays.asList("*"));

        // 모든 헤더 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 쿠키, 인증 정보 포함 요청 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // 모든 경로에 위 CORS 설정 적용
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
