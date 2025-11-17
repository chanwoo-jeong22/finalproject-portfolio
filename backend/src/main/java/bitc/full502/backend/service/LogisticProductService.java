package bitc.full502.backend.service;

import bitc.full502.backend.entity.ProductEntity;
import bitc.full502.backend.dto.LogisticProductDTO;
import bitc.full502.backend.entity.LogisticProductEntity;
import bitc.full502.backend.repository.LogisticProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class LogisticProductService {

    private final LogisticProductRepository repository;

    public List<LogisticProductDTO> getAllLogisticProducts(String sortField, String sortOrder) {
        List<LogisticProductEntity> entities = repository.findAll();

        return entities.stream()
                .map(e -> {
                    LogisticProductDTO dto = new LogisticProductDTO();
                    dto.setLpKey(e.getLpKey()); // 진경 추가
                    dto.setLgName(e.getLogistic().getLgName());
                    dto.setPdNum(e.getProduct().getPdNum());
                    dto.setPdProducts(e.getProduct().getPdProducts());
                    dto.setPdPrice(e.getProduct().getPdPrice());
                    dto.setStock(e.getStock());

                    // 진경 추가, 수정
                    // ProductEntity의 생성일과 lpStore 중 최신 날짜 계산
                    LocalDate productCreated = Optional.ofNullable(e.getProduct().getCreatedDate())
                            .map(LocalDateTime::toLocalDate)
                            .orElse(null);
                    LocalDate lpStoreDate = e.getLpStore();

                    if (productCreated != null && lpStoreDate != null) {
                        dto.setLpStore(lpStoreDate.isAfter(productCreated) ? lpStoreDate : productCreated);
                    } else if (lpStoreDate != null) {
                        dto.setLpStore(lpStoreDate);
                    } else {
                        dto.setLpStore(productCreated);
                    }

                    dto.setLpDelivery(e.getLpDelivery());
                    return dto;
                    // 진경 추가, 수정

                })
                .sorted((a, b) -> {
                  // 1. lgName 비교 (null 가능성이 없으면 그대로)
                  int result = b.getLgName().compareTo(a.getLgName());
                  if (result != 0) return result;

                  // 2. pdNum 비교 (null 가능성이 없으면 그대로)
                  result = b.getPdNum().compareTo(a.getPdNum());
                  if (result != 0) return result;

                  // 3. lpStore null-safe 비교
                  if (a.getLpStore() == null && b.getLpStore() == null) result = 0;
                  else if (a.getLpStore() == null) result = 1;
                  else if (b.getLpStore() == null) result = -1;
                  else result = b.getLpStore().compareTo(a.getLpStore());
                  if (result != 0) return result;

                  // 4. lpDelivery null-safe 비교
                  if (a.getLpDelivery() == null && b.getLpDelivery() == null) result = 0;
                  else if (a.getLpDelivery() == null) result = 1;
                  else if (b.getLpDelivery() == null) result = -1;
                  else result = b.getLpDelivery().compareTo(a.getLpDelivery());

                  return result;
                })
                .collect(Collectors.toList());
    }


    public List<LogisticProductDTO> findMine(String loginId) {
        return repository.findMineByLoginId(loginId).stream().map(row -> {
            LogisticProductDTO d = new LogisticProductDTO();
            d.setLpKey(      ((Number) row[0]).intValue() );
            d.setLgName(     (String) row[1] );
            d.setPdNum(      (String) row[2] );
            d.setPdProducts( (String) row[3] );
            d.setPdCategory( (String) row[4] );                 // ✅ 카테고리는 4
            d.setPdPrice(    ((Number) row[5]).intValue() );    // ✅ 가격은 5
            d.setStock(      ((Number) row[6]).intValue() );
            return d;
        }).toList();
    }



}
