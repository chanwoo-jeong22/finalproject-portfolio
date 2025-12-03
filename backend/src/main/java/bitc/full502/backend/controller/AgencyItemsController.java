package bitc.full502.backend.controller;

import bitc.full502.backend.dto.AgencyItemsDTO;
import bitc.full502.backend.dto.AgencyItemsListDTO;
import bitc.full502.backend.entity.ProductEntity;
import bitc.full502.backend.service.AgencyItemsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/agency-items")
@RequiredArgsConstructor
public class AgencyItemsController {

    private final AgencyItemsService agencyItemsService;

    // 전체 대리점 조회
    @GetMapping
    public List<AgencyItemsDTO> getAllAgencies() {
        return agencyItemsService.getAllAgencies();
    }

    // 본사 전체 제품 조회
    @GetMapping("/products") // /api/agency-items/products
    public List<AgencyItemsListDTO> getAllHeadProducts() {
        return agencyItemsService.getAllHeadProducts();
    }

    // 특정 대리점 취급 제품 조회
    @GetMapping("/{agencyId}/products")
    public List<AgencyItemsListDTO> getAgencyProducts(@PathVariable Integer agencyId) {
        return agencyItemsService.getAgencyProducts(agencyId);
    }

    // 대리점에 제품 등록
    @PostMapping("/{agencyId}/register")
    public List<AgencyItemsListDTO> registerProducts(@PathVariable Integer agencyId, @RequestBody List<Integer> productIds) {
        return agencyItemsService.registerProducts(agencyId, productIds);
    }

    // 대리점에서 제품 삭제
    @PostMapping("/{agencyId}/delete")
    public List<AgencyItemsListDTO> deleteProducts(@PathVariable Integer agencyId, @RequestBody List<Integer> productIds) {
        return agencyItemsService.deleteProducts(agencyId, productIds);
    }

}
