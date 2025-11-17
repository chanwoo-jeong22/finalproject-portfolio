package bitc.full502.backend.service;

import bitc.full502.backend.dto.LogisticStoreDTO;
import bitc.full502.backend.entity.LogisticStoreEntity;
import bitc.full502.backend.repository.LogisticProductRepository;
import bitc.full502.backend.repository.LogisticStoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogisticStoreService {

    private final LogisticStoreRepository logisticStoreRepository;
    private final LogisticProductRepository logisticProductRepository;

    public List<LogisticStoreDTO> searchStores(String companyName, String productCode, String productName,
                                               Integer priceMin, Integer priceMax,
                                               Integer stockMin, Integer stockMax) {

        List<LogisticStoreEntity> entities = logisticStoreRepository.searchStores(
                companyName, productCode, productName, priceMin, priceMax, stockMin, stockMax);

        return entities.stream().map(ls -> LogisticStoreDTO.builder()
                .stKey(ls.getStKey())
                .companyName(ls.getLogistic().getLgName())
                .productCode(ls.getProduct().getPdNum())
                .productName(ls.getProduct().getPdProducts())
                .price(ls.getProduct().getPdPrice())
                .stock(ls.getLogisticProduct().getStock())
                .stStore(ls.getStStore())
                .lpKey(ls.getLogisticProduct().getLpKey())
                .storeDate(ls.getStoreDate()) // 입고일 추가
                .build()
        ).toList();
    }

    // 입고 수량 업데이트(등록)
    @Transactional
    public void updateStoreQuantity(int stKey, int quantity) {
        LogisticStoreEntity entity = logisticStoreRepository.findById(stKey)
                .orElseThrow(() -> new RuntimeException("해당 데이터가 없습니다."));
        entity.setStStore(quantity);
        // save() 생략 가능 (JPA flush 자동 반영)
    }

    // 재고 증가
    @Transactional
    public void increaseStock(Integer lpKey, Integer quantity) {
        logisticProductRepository.increaseStock(lpKey, quantity);
    }
}
