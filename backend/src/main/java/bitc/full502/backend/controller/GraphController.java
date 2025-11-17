package bitc.full502.backend.controller;

import bitc.full502.backend.dto.GraphDTO;
import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.service.GraphService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/api/dashboard/monthly")
    public List<GraphDTO> getMonthlyGraph() {
        return graphService.getMonthlyGraph();
    }

    // 전체 대리점 목록 API
    @GetMapping("/api/dashboard/agencies") // URL 수정: /api/dashboard/agencies
    public List<AgencyEntity> getAllAgencies() {
        return graphService.getAllAgencies(); // 반환 타입 맞춤
    }
}
