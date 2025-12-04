package bitc.full502.backend.controller;

import bitc.full502.backend.dto.AgencyOrderItemDTO;
import bitc.full502.backend.entity.AgencyOrderItemEntity;
import bitc.full502.backend.repository.AgencyOrderItemRepository;
import bitc.full502.backend.service.AgencyOrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agencyorder-item")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AgencyOrderItemController {
    private final AgencyOrderItemService itemrepo;

    @GetMapping("/items/{orKey}")
    public List<AgencyOrderItemDTO> getItems(@PathVariable int orKey) {
        return itemrepo.getItemsByOrderKey(orKey); 
    }

}
