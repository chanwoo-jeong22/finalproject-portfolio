package bitc.full502.backend.service;

import bitc.full502.backend.entity.LogisticEntity;
import bitc.full502.backend.entity.LogisticProductEntity;
import bitc.full502.backend.entity.ProductEntity;
import bitc.full502.backend.repository.LogisticProductRepository;
import bitc.full502.backend.repository.LogisticRepository;
import bitc.full502.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final LogisticRepository logisticRepository;
    private final LogisticProductRepository logisticProductRepository;

    @Value("${app.upload.product.dir}")
    private String uploadDir;

    public List<ProductEntity> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public ProductEntity createProduct(ProductEntity product, MultipartFile pd_image) throws IOException {

        if (product.getPdNum() == null || product.getPdNum().isEmpty()) {
            String prefix;
            switch (product.getPdCategory()) {
                case "라면류": prefix = "R"; break;
                case "즉석식품류": prefix = "F"; break;
                case "과자류": prefix = "S"; break;
                case "음료류": prefix = "D"; break;
                case "빵류": prefix = "B"; break;
                case "생활용품": prefix = "L"; break;
                default: prefix = "X";
            }
            long count = productRepository.countByPdCategory(product.getPdCategory()) + 1;
            product.setPdNum(prefix + String.format("%04d", count));
        }

        if (pd_image != null && !pd_image.isEmpty()) {
            File folder = new File(uploadDir);
            if (!folder.exists()) {
                boolean created = folder.mkdirs();
                if (!created) {
                    throw new IOException("업로드 디렉토리 생성 실패: " + uploadDir);
                }
            }
            String fileName = System.currentTimeMillis() + "_" + pd_image.getOriginalFilename();
            File file = new File(uploadDir + "/" + fileName); // <-- 슬래시 추가
            pd_image.transferTo(file);
            product.setPdImage("/uploads/product/" + fileName);
        } else {
            throw new IllegalArgumentException("제품 이미지를 입력해주세요.");
        }

        ProductEntity savedProduct = productRepository.save(product);

        List<LogisticEntity> logistics = logisticRepository.findAll();

        for (LogisticEntity logistic : logistics) {
            LogisticProductEntity lp = new LogisticProductEntity();
            lp.setProduct(savedProduct);
            lp.setLogistic(logistic);
            lp.setLpStore(null);
            lp.setLpDelivery(null);
            lp.setStock(0);
            logisticProductRepository.save(lp);
        }

        return savedProduct;
    }

    @Transactional
    public ProductEntity updateProduct(ProductEntity updatedProduct, MultipartFile pd_image) throws IOException {

        ProductEntity existing = productRepository.findById(updatedProduct.getPdKey())
                .orElseThrow(() -> new RuntimeException("해당 제품이 존재하지 않습니다: " + updatedProduct.getPdKey()));

        existing.setPdCategory(updatedProduct.getPdCategory());
        existing.setPdProducts(updatedProduct.getPdProducts());
        existing.setPdPrice(updatedProduct.getPdPrice());

        if (pd_image != null && !pd_image.isEmpty()) {
            File folder = new File(uploadDir);
            if (!folder.exists()) {
                boolean created = folder.mkdirs();
                if (!created) {
                    throw new IOException("업로드 디렉토리 생성 실패: " + uploadDir);
                }
            }
            String fileName = System.currentTimeMillis() + "_" + pd_image.getOriginalFilename();
            File file = new File(uploadDir + "/" + fileName); // <-- 슬래시 추가
            pd_image.transferTo(file);
            existing.setPdImage("/uploads/product/" + fileName);
        }

        return productRepository.save(existing);
    }

    public void deleteProducts(List<Integer> ids) {
        productRepository.deleteAllById(ids);
    }
}

