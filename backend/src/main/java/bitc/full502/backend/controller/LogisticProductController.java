package bitc.full502.backend.controller;

import bitc.full502.backend.dto.LogisticProductDTO;
import bitc.full502.backend.service.LogisticProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LogisticProductController {

    private final LogisticProductService service;

    @GetMapping("/logisticproducts")
    public List<LogisticProductDTO> getLogisticProducts(
            @RequestParam(defaultValue = "lgName") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder
    ) {
        return service.getAllLogisticProducts(sortField, sortOrder);
    }

    @GetMapping("/logisticproduct")
    public List<LogisticProductDTO> getLogisticProducts(
            @RequestParam(defaultValue = "lgName") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder,
            Authentication auth
    ) {

        return service.getAllLogisticProducts(sortField, sortOrder);
    }

    @GetMapping("/logisticproducts/mine")
    public List<LogisticProductDTO> getMyStocks(Authentication auth) {
        String loginId = (auth != null) ? auth.getName() : null;
        if (loginId == null) return List.of(); // 로그인 없으면 빈 리스트 반환
        return service.findMine(loginId);
    }
}
