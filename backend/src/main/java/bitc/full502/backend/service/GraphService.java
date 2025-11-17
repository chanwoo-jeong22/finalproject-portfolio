package bitc.full502.backend.service;

import bitc.full502.backend.dto.GraphDTO;
import bitc.full502.backend.entity.AgencyEntity;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.GraphRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GraphService {

    private final GraphRepository graphRepository;
    private final AgencyRepository agencyRepository;

    public GraphService(GraphRepository graphRepository, AgencyRepository agencyRepository) {
        this.graphRepository = graphRepository;
        this.agencyRepository = agencyRepository;
    }

    public List<GraphDTO> getMonthlyGraph() {
        List<Object[]> rawData = graphRepository.getMonthlyGraphData();
        List<GraphDTO> result = new ArrayList<>();

        for (Object[] row : rawData) {
            String month = (String) row[0];
            String fullAddress = (String) row[1];
            String agName = (String) row[2];
            int order = ((Number) row[3]).intValue();
            int status = ((Number) row[4]).intValue();

            // month 포맷: YYYY-MM
            if (month != null) {
                String[] parts = month.split("-");
                if (parts.length == 2) {
                    String year = parts[0];
                    String monthNum = String.format("%02d", Integer.parseInt(parts[1]));
                    month = year + "-" + monthNum; // YYYY-MM 보장
                }
            }

            // 주소에서 '시'까지 추출
            String region = "미등록";
            if (fullAddress != null && !fullAddress.isBlank()) {
                String[] parts = fullAddress.split(" ");
                if (parts.length > 0) region = parts[0];
            }

            result.add(new GraphDTO(month, region, agName, order, status));
        }

        return result;
    }

    // 전체 대리점 반환
    public List<AgencyEntity> getAllAgencies() {
        return agencyRepository.findAll();
    }
}
