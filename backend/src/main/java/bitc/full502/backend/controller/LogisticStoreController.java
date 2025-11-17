package bitc.full502.backend.controller;

import bitc.full502.backend.dto.LogisticStoreDTO;
import bitc.full502.backend.service.LogisticStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistic-store")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LogisticStoreController {

    private final LogisticStoreService logisticStoreService;

    @GetMapping
    public List<LogisticStoreDTO> getStores(
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Integer priceMin,
            @RequestParam(required = false) Integer priceMax,
            @RequestParam(required = false) Integer stockMin,
            @RequestParam(required = false) Integer stockMax
    ) {
        return logisticStoreService.searchStores(companyName, productCode, productName,
                priceMin, priceMax, stockMin, stockMax);
    }

    // 입고 입력
    @PostMapping("/{stKey}/update-store")
    public void updateStore(@PathVariable int stKey, @RequestParam int quantity) {
        logisticStoreService.updateStoreQuantity(stKey, quantity);
    }

    // 재고 증가
    @PostMapping("/{lpKey}/increase-stock")
    public void increaseStock(@PathVariable Integer lpKey, @RequestParam Integer quantity) {
        logisticStoreService.increaseStock(lpKey, quantity);
    }

    // Frontend에서 호출하는 재고 증가 엔드포인트
    @PostMapping("/{lpKey}/update")
    public void updateStock(@PathVariable Integer lpKey, @RequestParam Integer quantity) {
        logisticStoreService.increaseStock(lpKey, quantity);
    }
}
