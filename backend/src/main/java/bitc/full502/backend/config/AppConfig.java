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
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations("file:" + uploadDir + "/");
        registry.addResourceHandler("/uploads/product/**")
                .addResourceLocations("file:" + productUploadDir + "/");
    }

    // ==============================
    // 🔹 Security: JWT + CORS 설정
    // ==============================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS / CSRF 비활성화
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // 세션 비활성화 (JWT 사용)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 요청 권한 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                // ✅ 로그인 및 인증 관련
                                "/api/login", "/api/login/**",
                                "/api/auth/findPw", "/api/auth/resetPw",
                                "/api/users/check-id", "/api/users/check-email",
                                "/api/users/register", "/api/users/list", "/api/users/delete",
                                "/api/head/signup", "/api/head/checkEmail",

                                // ✅ 대리점 관련
                                "/api/agency", "/api/agency/**",
                                "/api/agency/mypage/**",
                                "/api/agency/update", "/api/agency/register",
                                "/api/agency/*/products", "/api/agency/agencyproducts",

                                // ✅ 주문 관련
                                "/api/agencyorder/**", "/api/agencyorder/register",
                                "/api/agencyorder/full", "/api/agencyorder/confirm",
                                "/api/agencyorder/android", "/api/agencyorder/draft",

                                // ✅ 제품 관련
                                "/api/products", "/api/products/**",
                                "/api/agencyproducts", "/api/logisticproducts", "/api/logisticproducts/**",

                                // ✅ 물류 관련
                                "/api/logistic/update", "/api/logistic/register",
                                "/api/logistic/mypage/**", "/api/logisticproduct", "/api/logistic-store/**",

                                // ✅ 공통 리소스 / 공지사항 / 대시보드
                                "/api/notices", "/api/notices/**",
                                "/api/dashboard/**",

                                // ✅ 주문 / 납품 / 상태 관련
                                "/api/orders", "/api/orders/**",
                                "/api/orders/items", "/api/orders/items/**",
                                "/api/deliveries", "/api/deliveries/**",
                                "/api/status",

                                // ✅ 기타 허용 경로
                                "/uploads/**", "/uploads/profile/**", "/uploads/product/**",
                                "/api/agency-items/**", "/api/agencies", "/api/agencies/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )

                // JWT 필터 등록
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ==============================
    // 🔹 비밀번호 인코더
    // ==============================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==============================
    // 🔹 CORS 설정 (개발용: 모든 허용)
    // ==============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // 모든 출처 허용
        configuration.setAllowedMethods(Arrays.asList("*"));         // 모든 HTTP 메서드 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));         // 모든 헤더 허용
        configuration.setAllowCredentials(true);                     // 쿠키 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
