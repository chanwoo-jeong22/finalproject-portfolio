package bitc.full502.backend.controller;

import bitc.full502.backend.dto.InventoryDTO;
import bitc.full502.backend.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agency")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{agencyId}/inventory")
    public List<InventoryDTO> getAgencyInventory(@PathVariable int agencyId) {
        return inventoryService.getAgencyInventory(agencyId);
    }
}
