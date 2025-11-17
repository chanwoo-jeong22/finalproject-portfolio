package bitc.full502.backend.controller;


import bitc.full502.backend.entity.ProductEntity;
import bitc.full502.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductEntity> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/create")
    public ResponseEntity<?> createProduct(
            @RequestParam String pd_category,
            @RequestParam String pd_num,
            @RequestParam String pd_products,
            @RequestParam int pd_price,
            @RequestParam("pd_image") MultipartFile pd_image) {

        try {
            ProductEntity product = new ProductEntity();
            product.setPdCategory(pd_category);
            product.setPdNum(pd_num);
            product.setPdProducts(pd_products);
            product.setPdPrice(pd_price);

            ProductEntity saved = productService.createProduct(product, pd_image);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("이미지 업로드 실패");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProduct(
            @RequestParam int pd_key,
            @RequestParam String pd_category,
            @RequestParam String pd_num,
            @RequestParam String pd_products,
            @RequestParam int pd_price,
            @RequestParam(value="pd_image", required=false) MultipartFile pd_image) {

        try {
            ProductEntity product = new ProductEntity();
            product.setPdKey(pd_key);
            product.setPdCategory(pd_category);
            product.setPdNum(pd_num);
            product.setPdProducts(pd_products);
            product.setPdPrice(pd_price);

            ProductEntity updated = productService.updateProduct(product, pd_image);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("이미지 업로드 실패");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @DeleteMapping("/delete")
    public void deleteProducts(@RequestBody List<Integer> ids) {
        productService.deleteProducts(ids);
    }
}
