package bitc.full502.backend.service;

import bitc.full502.backend.dto.ReadyOrderDTO;
import bitc.full502.backend.entity.*;
import bitc.full502.backend.repository.AgencyOrderItemRepository;
import bitc.full502.backend.repository.AgencyOrderRepository;
import bitc.full502.backend.repository.AgencyRepository;
import bitc.full502.backend.repository.ReadyOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReadyOrderService {

    private final ReadyOrderRepository repo;
    private final AgencyRepository agencyRepo;
    private final AgencyOrderRepository agencyOrderRepository;
    private final AgencyOrderItemRepository agencyOrderItemRepository;


    // 임시 저장 중복 방지 + 저장
    @Transactional
    public List<ReadyOrderDTO> saveDraftList(List<ReadyOrderDTO> dtos) {
        if (dtos.isEmpty()) return List.of();

        int agKey = dtos.get(0).getAgKey();

        // 기존 임시 저장된 동일 agKey 주문 조회
        List<ReadyOrderEntity> existingDrafts = repo.findByAgKeyAndRdStatus(agKey, "임시");
        Set<Integer> existingPdKeys = existingDrafts.stream()
                .map(ReadyOrderEntity::getPdKey)
                .collect(Collectors.toSet());

        // 중복 제거
        List<ReadyOrderEntity> entitiesToSave = dtos.stream()
                .filter(dto -> !existingPdKeys.contains(dto.getPdKey()))
                .map(dto -> ReadyOrderEntity.builder()
                        .agKey(dto.getAgKey())
                        .pdKey(dto.getPdKey())
                        .rdStatus("임시")
                        .rdProducts(dto.getRdProducts())
                        .rdQuantity(dto.getRdQuantity())
                        .rdPrice(dto.getRdPrice())
                        .rdTotal(dto.getRdTotal())
                        .rdDate(new java.sql.Date(System.currentTimeMillis()))
                        .rdReserve(new java.sql.Date(System.currentTimeMillis()))
                        .rdPriceCurrent(dto.getRdPriceCurrent())
                        .rdPriceChanged(dto.isRdPriceChanged())
                        .build())
                .toList();

        List<ReadyOrderEntity> savedList = repo.saveAll(entitiesToSave);

        return savedList.stream()
                .map(ReadyOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 선택 삭제
    @Transactional
    public void deleteDrafts(List<Integer> rdKeys) {
        if (rdKeys != null && !rdKeys.isEmpty()) {
            repo.deleteByRdKeyIn(rdKeys);
        }
    }

    // 임시 저장 조회
    public List<ReadyOrderDTO> getDrafts(int agKey) {
        List<ReadyOrderEntity> entities;

        if (agKey != 0) {
            entities = repo.findByAgKeyAndRdStatus(agKey, "임시");
        } else {
            entities = repo.findByRdStatus("임시");
        }

        return entities.stream()
                .map(ReadyOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AgencyOrderEntity confirmOrder(int agKey, List<ReadyOrderDTO> items, Date reserveDate) {
        if (items == null || items.isEmpty()) return null;

        AgencyEntity agency = agencyRepo.findById(agKey)
                .orElseThrow(() -> new RuntimeException("대리점 정보가 없습니다."));

        LocalDate today = LocalDate.now();
        Date sqlToday = Date.valueOf(today);

        // 1️⃣ DB 기준 오늘 최대 orderNumber 조회 → 중복 방지
        String todayPrefix = String.format("%02d%02d%02d", today.getYear() % 100, today.getMonthValue(), today.getDayOfMonth());
        String maxOrderNumber = agencyOrderRepository.findMaxOrderNumberLike(todayPrefix + "%"); // Repository에서 구현 필요

        int seq = 1;
        if (maxOrderNumber != null) {
            seq = Integer.parseInt(maxOrderNumber.substring(6)) + 1;
        }
        String orderNumber = todayPrefix + String.format("%02d", seq);

        // 2️⃣ 주문 엔티티 생성
        AgencyOrderEntity order = new AgencyOrderEntity();
        order.setAgency(agency);
        order.setOrStatus("승인 대기중");
        order.setOrProducts(items.stream().map(ReadyOrderDTO::getRdProducts).collect(Collectors.joining(", ")));
        order.setOrPrice(items.stream().mapToInt(ReadyOrderDTO::getRdPrice).sum());
        order.setOrQuantity(items.stream().mapToInt(ReadyOrderDTO::getRdQuantity).sum());
        order.setOrTotal(items.stream().mapToInt(ReadyOrderDTO::getRdTotal).sum());
        order.setOrDate(sqlToday);
        order.setOrReserve(reserveDate != null ? reserveDate : sqlToday);
        order.setOrderNumber(orderNumber);
        order.setOrGu(agency.getAgAddress().substring(0, 2));

        agencyOrderRepository.save(order);
        agencyOrderRepository.flush();

        // 3️⃣ 주문 아이템 저장
        for (ReadyOrderDTO dto : items) {
            AgencyOrderItemEntity item = new AgencyOrderItemEntity();
            item.setOrKey(order.getOrKey());
            item.setPdKey(dto.getPdKey());
            item.setOiProducts(dto.getRdProducts());
            item.setOiPrice(dto.getRdPrice());
            item.setOiQuantity(dto.getRdQuantity());
            item.setOrDelivery(false);
            agencyOrderItemRepository.save(item);
        }

        // 4️⃣ 임시 주문 삭제
        List<Integer> rdKeys = items.stream().map(ReadyOrderDTO::getRdKey).toList();
        repo.deleteByRdKeyIn(rdKeys);

        return order; // 프론트로 반환
    }

}

