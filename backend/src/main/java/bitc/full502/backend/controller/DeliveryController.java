package bitc.full502.backend.controller;


import bitc.full502.backend.dto.DeliveryDTO;
import bitc.full502.backend.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryController {

    private final DeliveryService deliveryService ;

    @GetMapping
    public List<DeliveryDTO> list() {
        return deliveryService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> one(@PathVariable int id) {
        DeliveryDTO dto = deliveryService.findById(id);
        return (dto != null) ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable int id, @RequestParam Map<String,Object> body) {
        String status = String.valueOf(body.getOrDefault("status","대기중"));
        boolean on = Boolean.parseBoolean(String.valueOf(body.getOrDefault("delivery", false)));
        deliveryService.updateDriverStatus(id, status, on);
        return ResponseEntity.noContent().build();
    }
}
