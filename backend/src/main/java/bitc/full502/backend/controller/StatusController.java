package bitc.full502.backend.controller;

import bitc.full502.backend.dto.StatusDTO;
import bitc.full502.backend.service.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;

    @GetMapping("/api/status")
    public List<StatusDTO> getStatusList() {
        return statusService.findAllStatus();
    }
}
