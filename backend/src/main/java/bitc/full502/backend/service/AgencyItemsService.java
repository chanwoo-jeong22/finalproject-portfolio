package bitc.full502.backend.service;

import bitc.full502.backend.dto.AgencyItemsDTO;
import bitc.full502.backend.dto.AgencyItemsListDTO;
import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.entity.AgencyProductEntity;
import bitc.full502.backend.entity.ProductEntity;
import bitc.full502.backend.repository.AgencyItemsRepository;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AgencyItemsService {

    private final AgencyRepository agencyRepository;
    private final ProductRepository productRepository;
    private final AgencyItemsRepository agencyItemsRepository;

    // 전체 대리점 조회
    public List<AgencyItemsDTO> getAllAgencies() {
        return agencyRepository.findAll().stream()
                .map(a -> new AgencyItemsDTO(
                        a.getAgKey(),
                        a.getAgName(),
                        a.getAgCode()
                ))
                .collect(Collectors.toList());
    }

    // 본사 전체 제품 조회 (업체명, 입고일 포함)
    public List<AgencyItemsListDTO> getAllHeadProducts() {
        List<AgencyProductEntity> apList = agencyItemsRepository.findAll();

        return apList.stream()
                .map(ap -> {
                    ProductEntity p = ap.getProduct();
                    AgencyEntity a = ap.getAgency();

                    AgencyItemsListDTO dto = new AgencyItemsListDTO(
                            p.getPdKey(),
                            p.getPdCategory(),
                            p.getPdNum(),
                            p.getPdProducts(),
                            p.getPdImage(),
                            p.getPdPrice(),
                            a.getAgName(),    // 업체명
                            ap.getApStore()   // 입고일
                    );
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // 특정 대리점 제품 조회
    public List<AgencyItemsListDTO> getAgencyProducts(Integer agencyId) {
        AgencyEntity agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new IllegalArgumentException("대리점 없음: " + agencyId));

        return agencyItemsRepository.findByAgency(agency).stream()
                .map(ap -> {
                    ProductEntity p = ap.getProduct();
                    AgencyItemsListDTO dto = new AgencyItemsListDTO(
                            p.getPdKey(),
                            p.getPdCategory(),
                            p.getPdNum(),
                            p.getPdProducts(),
                            p.getPdImage(),
                            p.getPdPrice(),
                            agency.getAgName(),
                            ap.getApStore()
                    );
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // 대리점에 제품 등록
    public List<AgencyItemsListDTO> registerProducts(Integer agencyId, List<Integer> productIds) {
        AgencyEntity agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new IllegalArgumentException("대리점 없음: " + agencyId));

        List<ProductEntity> products = productRepository.findAllById(productIds);

        List<AgencyProductEntity> toSave = products.stream()
                .map(p -> {
                    AgencyProductEntity ap = new AgencyProductEntity();
                    ap.setAgency(agency);
                    ap.setProduct(p);
                    ap.setStock(0);
                    ap.setApStore(LocalDate.now());
                    return ap;
                })
                .collect(Collectors.toList());

        agencyItemsRepository.saveAll(toSave);

        return getAgencyProducts(agencyId);
    }

    // 대리점에서 제품 삭제
    public List<AgencyItemsListDTO> deleteProducts(Integer agencyId, List<Integer> productIds) {
        AgencyEntity agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new IllegalArgumentException("대리점 없음: " + agencyId));

        List<ProductEntity> products = productRepository.findAllById(productIds);

        List<AgencyProductEntity> apList = agencyItemsRepository.findByAgencyAndProductIn(agency, products);
        agencyItemsRepository.deleteAll(apList);

        return getAgencyProducts(agencyId);
    }

}
