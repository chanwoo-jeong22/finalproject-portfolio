package bitc.full502.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ProductWebConfig implements WebMvcConfigurer {

    @Value("${app.upload.product.dir}")
    private String productUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/product/**")
            .addResourceLocations("file:" + productUploadDir + "/");
    }
}
