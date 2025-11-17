package bitc.full502.backend.service;

import bitc.full502.backend.dto.AgencyProductDTO;
import bitc.full502.backend.dto.AgencyProductResponseDTO;
import bitc.full502.backend.dto.OrderItemRequestDTO;
import bitc.full502.backend.dto.ProductItemDTO;
import bitc.full502.backend.entity.AgencyProductEntity;
import bitc.full502.backend.repository.AgencyProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyProductService {

    private final AgencyProductRepository repository;

    public List<AgencyProductDTO> getAllAgencyProducts(String sortField, String sortOrder) {
        List<AgencyProductEntity> entities = repository.findAll();

        return entities.stream()
                .map(e -> {
                    AgencyProductDTO dto = new AgencyProductDTO();
                    dto.setPdKey(e.getProduct().getPdKey());
                    dto.setAgName(e.getAgency().getAgName());
                    dto.setPdNum(e.getProduct().getPdNum());
                    dto.setPdProducts(e.getProduct().getPdProducts());
                    dto.setPdPrice(e.getProduct().getPdPrice());
                    dto.setApStore(e.getApStore());
                    dto.setStock(e.getStock());
                    return dto;
                })
                .sorted((a, b) -> {

                    int result = b.getAgName().compareTo(a.getAgName());
                    if (result != 0) return result;
                    result = b.getPdNum().compareTo(a.getPdNum());
                    if (result != 0) return result;

                    return b.getApStore().compareTo(a.getApStore());
                })
                .collect(Collectors.toList());
    }
    // ============================================================
    // 새로 추가: 특정 대리점(agKey) 기준 조회
    // - 기존 기능에는 영향 없음
    // - 로그인한 대리점만 자기 품목 확인 가능
    // ============================================================
    public List<AgencyProductDTO> getProductsByAgKey(int agKey, String sortField, String sortOrder) {
        // repository에서 해당 대리점 품목만 가져오기
        List<AgencyProductEntity> entities = repository.findByAgency_AgKey(agKey);

        return entities.stream()
                .map(e -> {
                    AgencyProductDTO dto = new AgencyProductDTO();
                    dto.setPdKey(e.getProduct().getPdKey());
                    dto.setAgName(e.getAgency().getAgName());
                    dto.setPdNum(e.getProduct().getPdNum());
                    dto.setPdProducts(e.getProduct().getPdProducts());
                    dto.setPdPrice(e.getProduct().getPdPrice());
                    dto.setApStore(e.getApStore());
                    dto.setStock(e.getStock());
                    return dto;
                })
                .sorted((a, b) -> {
                    int result = b.getAgName().compareTo(a.getAgName());
                    if (result != 0) return result;
                    result = b.getPdNum().compareTo(a.getPdNum());
                    if (result != 0) return result;
                    return b.getApStore().compareTo(a.getApStore());
                })
                .collect(Collectors.toList());
    }

    public List<AgencyProductResponseDTO> getProductsByAgKey(Integer agKey) {
        List<AgencyProductEntity> entities = repository.findByAgency_AgKey(agKey);

        return entities.stream()
                .map(ap -> new AgencyProductResponseDTO(
                        ap.getProduct().getPdKey(),
                        ap.getProduct().getPdNum(),
                        ap.getProduct().getPdProducts(),
                        ap.getProduct().getPdPrice(),
                        false,
                        ap.getStock(),
                        ap.getApStore()
                ))
                .collect(Collectors.toList());
    }
    public List<AgencyProductResponseDTO> getProductsByAgKeys(Integer agKey) {
        return repository.findByAgency_AgKey(agKey)
                .stream()
                .map(ap -> new AgencyProductResponseDTO(
                        ap.getProduct().getPdKey(),
                        ap.getProduct().getPdNum(),
                        ap.getProduct().getPdProducts(),
                        ap.getProduct().getPdPrice(),
                        false,
                        ap.getStock(),
                        ap.getApStore()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void registerOrders(List<OrderItemRequestDTO> orders, Integer agKey) {
        for (OrderItemRequestDTO order : orders) {
            AgencyProductEntity entity = repository.findById(order.getPdKey())
                    .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다: " + order.getPdKey()));

            if (entity.getStock() < order.getQuantity()) {
                throw new RuntimeException("재고가 부족합니다: " + entity.getProduct().getPdProducts());
            }

            // 재고 차감
            entity.setStock(entity.getStock() - order.getQuantity());
            repository.save(entity);

            // 필요하면 주문 테이블에도 기록 가능 (여기서는 생략)
        }
    }
    public List<ProductItemDTO> getAllProducts() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 특정 대리점 agKey 기준
    public List<ProductItemDTO> getProductsByAgKey(int agKey) {
        return repository.findByAgency_AgKey(agKey).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductItemDTO convertToDTO(AgencyProductEntity entity) {
        return new ProductItemDTO(
                entity.getProduct().getPdNum(),
                entity.getProduct().getPdProducts(),
                entity.getStock(),
                entity.getApStore(),
                entity.getAgency().getAgKey()
        );
    }
}
