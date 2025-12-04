package bitc.full502.backend.service;

import bitc.full502.backend.dto.AgencyOrderDTO;
import bitc.full502.backend.dto.OrderItemRequestDTO;
import bitc.full502.backend.dto.OrderResponseDTO;
import bitc.full502.backend.entity.*;
import bitc.full502.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.transaction.annotation.Propagation.REQUIRES_NEW;

@Service
@RequiredArgsConstructor
public class AgencyOrderService {

    private final AgencyOrderRepository repo;
    private final ProductRepository productRepository;
    private final AgencyRepository agencyRepository;
    private final DeliveryRepository deliveryRepository;
    private final AgencyProductRepository agencyProductRepository;

    private final LogisticProductRepository logisticProductRepository;


    //============================================================
    // 1️⃣ 물류팀 테스트용 서비스 메서드 (items 포함, 총액 계산)
    //============================================================
    public List<AgencyOrderDTO> findAll() {
        return repo.findAll().stream().map(e -> {
            AgencyOrderDTO dto = new AgencyOrderDTO();
            dto.setOrKey(e.getOrKey());
            dto.setOrderNumber(e.getOrderNumber());
            dto.setOrStatus(e.getOrStatus());
            dto.setOrDate(e.getOrDate());
            dto.setOrReserve(e.getOrReserve());
            dto.setOrGu(e.getOrGu());
            dto.setDvName(e.getDvName());

            if (e.getAgency() != null) dto.setAgName(e.getAgency().getAgName());
            if (e.getDelivery() != null) dto.setDvName(e.getDelivery().getDvName());
            if (e.getProduct() != null) dto.setPdProducts(e.getProduct().getPdProducts());

            if (e.getItems() != null) {
                List<AgencyOrderDTO.Item> items = e.getItems().stream().map(item -> {
                    AgencyOrderDTO.Item dtoItem = new AgencyOrderDTO.Item();
                    dtoItem.setQuantity(item.getOiQuantity());
                    dtoItem.setPrice(item.getOiPrice());
                    dtoItem.setName(item.getOiProducts());
                    dtoItem.setSku(item.getPdKey() != 0 ? String.valueOf(item.getPdKey()) : "N/A");
                    dtoItem.setPdKey(item.getPdKey());
                    return dtoItem;
                }).toList();

                dto.setItems(items);
                int totalAmount = items.stream().mapToInt(i -> i.getQuantity() * i.getPrice()).sum();
                dto.setOrTotal(totalAmount);
            } else {
                dto.setItems(List.of());
                dto.setOrTotal(0);
            }

            return dto;
        }).toList();
    }

    private int mapGuToLgKey(String orGu) {
        switch (orGu) {
            case "부산": return 1;
            case "서울": return 2;
            case "울산": return 3;
            case "강원": return 4;
            case "대구": return 5;
            default: throw new IllegalArgumentException("Unknown or_gu: " + orGu);
        }
    }

    //============================================================
    // 2️⃣ 단일 주문 조회
    //============================================================
    public AgencyOrderDTO findById(int orKey) {
        return repo.findById(orKey)
            .map(e -> {
                AgencyOrderDTO dto = new AgencyOrderDTO();
                dto.setOrKey(e.getOrKey());
                dto.setOrderNumber(e.getOrderNumber());
                dto.setOrStatus(e.getOrStatus());
                dto.setOrDate(e.getOrDate());
                dto.setOrReserve(e.getOrReserve());
                dto.setOrGu(e.getOrGu());
                dto.setOrProducts(e.getOrProducts());
                dto.setOrPrice(e.getOrPrice());
                dto.setOrQuantity(e.getOrQuantity());
                dto.setOrTotal(e.getOrTotal());
                dto.setAgAddress(e.getAgency().getAgAddress());
                dto.setAgName(e.getAgency().getAgName());
                dto.setAgPhone(e.getAgency().getAgPhone());
                dto.setDvName(e.getDelivery() != null ? e.getDelivery().getDvName() : null);

                if (e.getItems() != null) {
                    List<AgencyOrderDTO.Item> items = e.getItems().stream().map(item -> {
                        AgencyOrderDTO.Item dtoItem = new AgencyOrderDTO.Item();
                        dtoItem.setQuantity(item.getOiQuantity());
                        dtoItem.setPrice(item.getOiPrice());
                        dtoItem.setName(item.getOiProducts());
                        dtoItem.setPdKey(item.getPdKey());
                        dtoItem.setSku(item.getPdKey() != 0 ? String.valueOf(item.getPdKey()) : "N/A");
                        return dtoItem;
                    }).toList();
                    dto.setItems(items);
                } else {
                    dto.setItems(List.of());
                }

                return dto;
            }).orElse(null);
    }

    // findFullById → findById 래핑
    public AgencyOrderDTO findFullById(int orKey) {
        return findById(orKey);
    }


    //============================================================
    // 4️⃣ 대리점 주문 확정
    //============================================================
    @Transactional
    public AgencyOrderEntity confirmOrder(AgencyOrderEntity order, List<AgencyOrderItemEntity> items) {
        prepareOrder(order, items, "승인 대기중");
        return repo.save(order);
    }

    //============================================================
// 5️⃣ 주문 저장/확정 공통 처리 (중복 품목 합산)
//============================================================
    private void prepareOrder(AgencyOrderEntity order, List<AgencyOrderItemEntity> items, String status) {
        // 1️⃣ 대리점, 배송 세팅
        Integer agKey = order.getAgency().getAgKey();
        AgencyEntity agency = agencyRepository.findById(agKey)
                .orElseThrow(() -> new RuntimeException("대리점이 존재하지 않습니다."));
        order.setAgency(agency);

        int dvKey = (order.getDelivery() != null) ? order.getDelivery().getDvKey() : 1;
        DeliveryEntity delivery = deliveryRepository.findById(dvKey)
                .orElseThrow(() -> new RuntimeException("배송지가 존재하지 않습니다."));
        order.setDelivery(delivery);

        order.setOrStatus(status);
        order.setOrDate(new java.sql.Date(System.currentTimeMillis()));
        order.setOrGu(order.getOrGu() != null ? order.getOrGu() : "");
        if ("DRAFT".equals(status) && order.getOrReserve() == null) {
            order.setOrReserve(new java.sql.Date(System.currentTimeMillis()));
        }

        // 2️⃣ 중복 품목 합산
        Map<Integer, AgencyOrderItemEntity> mergedItems = new HashMap<>();
        for (AgencyOrderItemEntity item : items) {
            if (item.getPdKey() == 0) continue;

            ProductEntity product = productRepository.findById(item.getPdKey())
                    .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));
            item.setProduct(product);
            item.setOiProducts(product.getPdProducts());

            if (mergedItems.containsKey(item.getPdKey())) {
                AgencyOrderItemEntity exist = mergedItems.get(item.getPdKey());
                exist.setOiQuantity(exist.getOiQuantity() + item.getOiQuantity());
            } else {
                mergedItems.put(item.getPdKey(), item);
            }
        }

        List<AgencyOrderItemEntity> finalItems = new ArrayList<>(mergedItems.values());
        order.setItems(finalItems);

        // 3️⃣ 총 수량, 총액 계산
        int totalQuantity = finalItems.stream().mapToInt(AgencyOrderItemEntity::getOiQuantity).sum();
        int totalPrice = finalItems.stream().mapToInt(i -> i.getOiQuantity() * i.getOiPrice()).sum();

        order.setOrQuantity(totalQuantity);
        order.setOrPrice(totalPrice);
        order.setOrTotal(totalPrice);

        // 4️⃣ 대표 상품, 제품명 문자열
        if (!finalItems.isEmpty()) {
            order.setProduct(finalItems.get(0).getProduct());
            String productsStr = finalItems.stream()
                    .map(AgencyOrderItemEntity::getOiProducts)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("미정");
            order.setOrProducts(productsStr);
        }

        // 5️⃣ 주문번호 생성
        if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
            String today = new SimpleDateFormat("yyMMdd").format(new Date());
            long countToday = repo.countByOrderNumberStartingWith(today);
            order.setOrderNumber(today + String.format("%04d", countToday + 1));
        }
    }

    //============================================================
    // 6️⃣ 대리점 주문 상태 업데이트 (기사명 포함)
    //============================================================
    @Transactional
    public void updateOrderStatusWithDriver(int orKey, String status, String dvName, Integer dvKey) {
        AgencyOrderEntity order = repo.findById(orKey)
                .orElseThrow(() -> new RuntimeException("주문 없음: " + orKey));

        order.setOrStatus(status);
        order.setDvName(dvName);


        if (dvKey != null) {
            DeliveryEntity d = deliveryRepository.findById(dvKey)
                    .orElseThrow(() -> new RuntimeException("기사 없음: " + dvKey));
            order.setDelivery(d);
        } else {
            order.setDelivery(null);
        }
        if ("배송중".equals(status) && order.getItems() != null) {
            int lgKey = mapGuToLgKey(order.getOrGu()); // 주문에 있는 or_gu 기준으로 lg_key 구함
            for (AgencyOrderItemEntity item : order.getItems()) {
                int updated = logisticProductRepository.decreaseStockIfEnoughByPdAndLg(
                        item.getPdKey(), lgKey, item.getOiQuantity());
                if (updated == 0) {
                    throw new RuntimeException("물류 재고 부족: 상품키=" + item.getPdKey());
                }
            }
        }


        // 🚀 배송 완료 처리
        if ("배송완료".equals(status) && order.getItems() != null) {

            // 1️⃣ 배송 예정일 제거
            order.setOrReserve(null);

            // 2️⃣ 대리점 재고 증가
            for (AgencyOrderItemEntity item : order.getItems()) {
                List<AgencyProductEntity> agencyProducts = agencyProductRepository
                        .findByAgency_AgKeyAndProduct_PdKey(order.getAgency().getAgKey(), item.getPdKey());

                if (agencyProducts.isEmpty()) {
                    throw new RuntimeException("대리점 재고 없음: " + item.getPdKey());
                }

                // 같은 상품이 여러 개 있으면 모두 재고 증가
                for (AgencyProductEntity agencyProduct : agencyProducts) {
                    agencyProduct.setStock(agencyProduct.getStock() + item.getOiQuantity());
                    agencyProductRepository.save(agencyProduct);
                }
            }
        }

        repo.save(order);
    }



    //============================================================
    // 배송 완료 처리 + 재고 반영 (자동완료용)
    //============================================================
    @Transactional
    public void autoCompleteDelivery(int orKey) {
        // 주문 가져오기
        AgencyOrderEntity order = repo.findById(orKey)
                .orElseThrow(() -> new RuntimeException("주문 없음: " + orKey));

        // 배송 상태 "배송완료"로 변경
        order.setOrStatus("배송완료");
        repo.save(order);



        // 대리점 재고 증가
        if (order.getItems() != null) {
            for (AgencyOrderItemEntity item : order.getItems()) {
                List<AgencyProductEntity> agencyProducts = agencyProductRepository
                        .findByAgency_AgKeyAndProduct_PdKey(order.getAgency().getAgKey(), item.getPdKey());

                if (agencyProducts.isEmpty())
                    throw new RuntimeException("대리점 재고 없음: " + item.getPdKey());

                AgencyProductEntity agencyProduct = agencyProducts.get(0); // 첫 번째 선택
                agencyProduct.setStock(agencyProduct.getStock() + item.getOiQuantity());
                agencyProductRepository.save(agencyProduct);
            }
        }

        // 🚚 Delivery 업데이트
        if (order.getDelivery() != null) {
            DeliveryEntity delivery = order.getDelivery();
            delivery.setDvStatus("대기중");
            delivery.setDvDelivery(true);
            deliveryRepository.save(delivery);
        }
    }



    // 대리점용: 기사 포함 주문 조회
    public List<AgencyOrderDTO> getOrdersWithDriver(int agencyId, String status) {
        List<AgencyOrderEntity> orders;

        if (status == null || status.isBlank()) {
            orders = repo.findByAgency_AgKey(agencyId);
        } else {
            orders = repo.findByAgencyAndStatus(agencyId, status);
        }

        return orders.stream().map(e -> {
            AgencyOrderDTO dto = new AgencyOrderDTO();
            dto.setOrKey(e.getOrKey());
            dto.setOrderNumber(e.getOrderNumber());
            dto.setOrStatus(e.getOrStatus());
            dto.setOrDate(e.getOrDate());
            dto.setOrReserve(e.getOrReserve());
            dto.setOrGu(e.getOrGu());
            dto.setOrProducts(e.getOrProducts());
            dto.setOrPrice(e.getOrPrice());
            dto.setOrQuantity(e.getOrQuantity());
            dto.setOrTotal(e.getOrTotal());

            if (e.getAgency() != null) {
                dto.setAgName(e.getAgency().getAgName());
                dto.setAgAddress(e.getAgency().getAgAddress());
                dto.setAgPhone(e.getAgency().getAgPhone());
            }

            // 🚚 배송 기사명 포함
            dto.setDvName(e.getDelivery() != null ? e.getDelivery().getDvName() : e.getDvName());

            if (e.getItems() != null) {
                List<AgencyOrderDTO.Item> items = e.getItems().stream().map(item -> {
                    AgencyOrderDTO.Item dtoItem = new AgencyOrderDTO.Item();
                    dtoItem.setQuantity(item.getOiQuantity());
                    dtoItem.setPrice(item.getOiPrice());
                    dtoItem.setName(item.getOiProducts());
                    dtoItem.setPdKey(item.getPdKey());
                    dtoItem.setSku(item.getPdKey() != 0 ? String.valueOf(item.getPdKey()) : "N/A");
                    return dtoItem;
                }).toList();
                dto.setItems(items);
            } else {
                dto.setItems(List.of());
            }

            return dto;
        }).toList();
    }


    //============================================================
    // 7️⃣ OrderResponseDTO 변환 (기타 기능)
    //============================================================
    public List<OrderResponseDTO> getAllOrders() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    private OrderResponseDTO toDTO(AgencyOrderEntity order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrKey(order.getOrKey());
        dto.setOrStatus(order.getOrStatus());
        dto.setOrProducts(order.getOrProducts());
        dto.setOrPrice(order.getOrPrice());
        dto.setOrQuantity(order.getOrQuantity());
        dto.setOrTotal(order.getOrTotal());
        dto.setOrDate(order.getOrDate());
        dto.setOrReserve(order.getOrReserve());
        dto.setOrGu(order.getOrGu());
        dto.setOrderNumber(order.getOrderNumber());
        if (order.getAgency() != null) dto.setAgencyName(order.getAgency().getAgName());
        if (order.getProduct() != null) dto.setProductName(order.getProduct().getPdProducts());
        return dto;
    }

    //============================================================
    // 8️⃣ 대리점 ID와 상태 기준 주문 조회
    //============================================================
    public List<AgencyOrderDTO> getOrders(int agencyId, String status) {
    List<AgencyOrderEntity> orders;

    if (status == null || status.isBlank()) {
        orders = repo.findByAgency_AgKey(agencyId);
    } else {
        orders = repo.findByAgencyAndStatus(agencyId, status);
    }

    // 바로 여기서 DTO 리스트로 변환
    return orders.stream().map(e -> {
        AgencyOrderDTO dto = new AgencyOrderDTO();
        dto.setOrKey(e.getOrKey());
        dto.setOrderNumber(e.getOrderNumber());
        dto.setOrStatus(e.getOrStatus());
        dto.setOrDate(e.getOrDate());
        dto.setOrReserve(e.getOrReserve());
        dto.setOrGu(e.getOrGu());
        dto.setOrProducts(e.getOrProducts());
        dto.setOrPrice(e.getOrPrice());
        dto.setOrQuantity(e.getOrQuantity());
        dto.setOrTotal(e.getOrTotal());

        if (e.getAgency() != null) {
            dto.setAgName(e.getAgency().getAgName());
            dto.setAgAddress(e.getAgency().getAgAddress());
            dto.setAgPhone(e.getAgency().getAgPhone());
        }

        dto.setDvName(e.getDelivery() != null ? e.getDelivery().getDvName() : e.getDvName());

        if (e.getItems() != null) {
            List<AgencyOrderDTO.Item> items = e.getItems().stream().map(item -> {
                AgencyOrderDTO.Item dtoItem = new AgencyOrderDTO.Item();
                dtoItem.setQuantity(item.getOiQuantity());
                dtoItem.setPrice(item.getOiPrice());
                dtoItem.setName(item.getOiProducts());
                dtoItem.setPdKey(item.getPdKey());
                dtoItem.setSku(item.getPdKey() != 0 ? String.valueOf(item.getPdKey()) : "N/A");
                return dtoItem;
            }).toList();
            dto.setItems(items);
        } else {
            dto.setItems(List.of());
        }

        return dto;
    }).toList();
}


    @Transactional
    public void confirmOrders(List<Integer> orderIds) {
        List<AgencyOrderEntity> orders = repo.findAllById(orderIds);

        for (AgencyOrderEntity order : orders) {
            order.setOrStatus("배송 준비중");
        }
        repo.saveAll(orders);
    }

    public List<OrderResponseDTO> searchOrders(Map<String, String> searchParams) {
        return repo.findAll().stream()
                .filter(order -> {
                    if (searchParams.containsKey("orderNo") && !searchParams.get("orderNo").isEmpty()) {
                        if (!String.valueOf(order.getOrKey()).contains(searchParams.get("orderNo"))) return false;
                    }
                    if (searchParams.containsKey("productName") && !searchParams.get("productName").isEmpty()) {
                        if (order.getProduct() == null || !order.getProduct().getPdProducts().contains(searchParams.get("productName")))
                            return false;
                    }
                    if (searchParams.containsKey("agency") && !searchParams.get("agency").isEmpty()) {
                        if (order.getAgency() == null || !order.getAgency().getAgName().contains(searchParams.get("agency")))
                            return false;
                    }
                    if (searchParams.containsKey("status") && !searchParams.get("status").isEmpty()) {
                        if (!order.getOrStatus().equals(searchParams.get("status"))) return false;
                    }
                    if (searchParams.containsKey("orderDateFrom") && !searchParams.get("orderDateFrom").isEmpty()) {
                        if (order.getOrDate().before(java.sql.Date.valueOf(searchParams.get("orderDateFrom"))))
                            return false;
                    }
                    if (searchParams.containsKey("orderDateTo") && !searchParams.get("orderDateTo").isEmpty()) {
                        if (order.getOrDate().after(java.sql.Date.valueOf(searchParams.get("orderDateTo"))))
                            return false;
                    }
                    if (searchParams.containsKey("deliveryDateFrom") && !searchParams.get("deliveryDateFrom").isEmpty()) {
                        if (order.getOrReserve().before(java.sql.Date.valueOf(searchParams.get("deliveryDateFrom"))))
                            return false;
                    }
                    if (searchParams.containsKey("deliveryDateTo") && !searchParams.get("deliveryDateTo").isEmpty()) {
                        if (order.getOrReserve().after(java.sql.Date.valueOf(searchParams.get("deliveryDateTo"))))
                            return false;
                    }
                    if (searchParams.containsKey("quantityMin") && !searchParams.get("quantityMin").isEmpty()) {
                        if (order.getOrQuantity() < Integer.parseInt(searchParams.get("quantityMin"))) return false;
                    }
                    if (searchParams.containsKey("quantityMax") && !searchParams.get("quantityMax").isEmpty()) {
                        if (order.getOrQuantity() > Integer.parseInt(searchParams.get("quantityMax"))) return false;
                    }
                    if (searchParams.containsKey("totalMin") && !searchParams.get("totalMin").isEmpty()) {
                        if (order.getOrTotal() < Integer.parseInt(searchParams.get("totalMin"))) return false;
                    }
                    if (searchParams.containsKey("totalMax") && !searchParams.get("totalMax").isEmpty()) {
                        if (order.getOrTotal() > Integer.parseInt(searchParams.get("totalMax"))) return false;
                    }

                    return true;
                })
                .map(this::toDTO)
                .collect(Collectors.toList());

    }
    // 1. agKey 기준 조회 (대리점별 스케줄)
public List<AgencyOrderDTO> getScheduleByAgKey(LocalDate from, LocalDate to, Integer agKey) {
    List<AgencyOrderEntity> entities = repo.findScheduleByAgKey(from, to, agKey);
    return toDTOList(entities);
}

// 2. gu 기준 조회 (지역 구 필터링)
public List<AgencyOrderDTO> getScheduleByGu(LocalDate from, LocalDate to, String gu) {
    List<AgencyOrderEntity> entities = repo.findSchedule(from, to, gu);
    return toDTOList(entities);
}

// 3. agKey 와 gu 모두 null 일 때는 전체 조회 (필요 시 구현)
public List<AgencyOrderDTO> getSchedule(LocalDate from, LocalDate to, Object filterKey) {
    if (filterKey == null) {
        // 전체 조회 - gu 파라미터 null 전달
        return getScheduleByGu(from, to, null);
    }
    if (filterKey instanceof Integer) {
        return getScheduleByAgKey(from, to, (Integer) filterKey);
    }
    if (filterKey instanceof String) {
        return getScheduleByGu(from, to, (String) filterKey);
    }
    // 예외 처리 또는 기본값 반환
    return List.of();
}

// 공통 DTO 변환 로직
private List<AgencyOrderDTO> toDTOList(List<AgencyOrderEntity> entities) {
    return entities.stream()
        .collect(Collectors.toMap(
            AgencyOrderEntity::getOrKey,
            o -> {
                AgencyOrderDTO dto = new AgencyOrderDTO();
                dto.setOrKey(o.getOrKey());
                dto.setOrderNumber(o.getOrderNumber());
                dto.setOrStatus(o.getOrStatus());
                dto.setOrReserve(o.getOrReserve());
                dto.setOrProducts(o.getOrProducts());
                dto.setOrQuantity(o.getOrQuantity());
                dto.setOrPrice(o.getOrPrice());
                dto.setOrTotal(o.getOrTotal());

                if (o.getAgency() != null) {
                    dto.setAgName(o.getAgency().getAgName());
                    dto.setAgAddress(o.getAgency().getAgAddress());
                    dto.setAgPhone(o.getAgency().getAgPhone());
                }

                if (o.getDelivery() != null) {
                    dto.setDvName(o.getDelivery().getDvName());
                }
                return dto;
            },
            (existing, duplicate) -> existing
        ))
        .values()
        .stream()
        .toList();
}

    public List<AgencyOrderDTO> findMineByLoginId(String loginId, boolean isHQ, String status) {

    List<AgencyOrderEntity> list;

    if (isHQ) {
        // 본사면 전체 조회 → status 있으면 필터링 적용
        if (status == null || status.isBlank()) {
            list = repo.findAll();
        } else {
            list = repo.findByOrStatus(status);
        }
    }
    else {
        // 대리점 또는 물류 담당자
        if (status == null || status.isBlank()) {
            list = repo.findForLogisticByLoginId(loginId);
        } else {
            list = repo.findForLogisticByLoginIdAndStatus(loginId, status);
        }
    }

    return list.stream()
            .map(e -> {
                AgencyOrderDTO dto = new AgencyOrderDTO();
                dto.setOrKey(e.getOrKey());
                dto.setOrderNumber(e.getOrderNumber());
                dto.setOrStatus(e.getOrStatus());
                dto.setOrDate(e.getOrDate());
                dto.setOrReserve(e.getOrReserve());
                dto.setOrGu(e.getOrGu());
                dto.setOrProducts(e.getOrProducts());
                dto.setOrPrice(e.getOrPrice());
                dto.setOrQuantity(e.getOrQuantity());
                dto.setOrTotal(e.getOrTotal());

                if (e.getAgency() != null) dto.setAgName(e.getAgency().getAgName());
                if (e.getDelivery() != null) dto.setDvName(e.getDelivery().getDvName());
                if (e.getProduct() != null) dto.setPdProducts(e.getProduct().getPdProducts());

                return dto;
            })
            .collect(Collectors.toList());
}



    public String resolveGuPrefixByLoginId(String loginId) {
        if (loginId == null) return null;
        String id = loginId.toLowerCase();

        if (id.contains("seoul")) return "서울";
        if (id.contains("busan") || id.contains("pusan")) return "부산";
        if (id.contains("ulsan")) return "울산";
        if (id.contains("daegu")) return "대구";
        if (id.contains("gangwon")) return "강원";


        // 기본값: HQ 같은 경우 null 리턴 → 전체 조회
        return null;
    }

    public void registerOrders(List<OrderItemRequestDTO> orders, Integer agKey) {
        if (orders == null || orders.isEmpty()) {
            throw new RuntimeException("주문할 제품이 없습니다.");
        }

        List<AgencyOrderEntity> entities = orders.stream().map(dto -> {
            ProductEntity product = productRepository.findById(dto.getPdKey())
                    .orElseThrow(() -> new RuntimeException("제품 정보 없음: " + dto.getPdKey()));

            AgencyEntity agency = agencyRepository.findById(agKey)
                    .orElseThrow(() -> new RuntimeException("대리점 없음: " + agKey));

            AgencyOrderEntity order = new AgencyOrderEntity();
            order.setAgency(agency);
            order.setProduct(product);
            order.setOrQuantity(dto.getQuantity());
            order.setOrPrice(product.getPdPrice());
            order.setOrTotal(dto.getQuantity() * product.getPdPrice());
            order.setOrStatus("DRAFT");
            order.setOrDate(new java.sql.Date(new Date().getTime()));

            // -------------------------------
            // or_gu 설정 (주소의 시까지만)
            // -------------------------------
            String agAddress = agency.getAgAddress();
            String orGu = "";
            if (agAddress != null && !agAddress.isBlank()) {
                String[] parts = agAddress.split(" ");
                orGu = parts[0]; // 시만
            }
            order.setOrGu(orGu);

            return order;
        }).toList();

        repo.saveAll(entities);
    }

    @Transactional(propagation = REQUIRES_NEW)
    public AgencyOrderEntity createOrder(int agKey, List<OrderItemRequestDTO> items) {

        if (items == null || items.isEmpty()) {
            throw new RuntimeException("주문할 상품이 없습니다.");
        }

        // 1️⃣ 대리점 조회
        AgencyEntity agency = agencyRepository.findById(agKey)
                .orElseThrow(() -> new RuntimeException("대리점 없음"));

        // 2️⃣ orGu 추출 (주소 앞 단어)
        String orGu = "기본값";
        if (agency.getAgAddress() != null && !agency.getAgAddress().isBlank()) {
            orGu = agency.getAgAddress().split("\\s+")[0]; // 시만
        }

        // 3️⃣ 주문 헤더 생성
        AgencyOrderEntity order = new AgencyOrderEntity();
        order.setAgency(agency);
        order.setOrStatus("승인 대기중");
        order.setOrDate(new java.sql.Date(System.currentTimeMillis()));

        // or_reserve = or_date + 3일
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, 3);
        order.setOrReserve(new java.sql.Date(cal.getTimeInMillis()));

        order.setOrGu(orGu);

        // 4️⃣ order_number 생성 (오늘 날짜 + 순번)
        String datePrefix = new SimpleDateFormat("yyMMdd").format(new Date(System.currentTimeMillis()));
        int countToday = (int) repo.countByOrderNumberStartingWith(datePrefix);

        if (countToday == 0) {
            order.setOrderNumber(datePrefix + String.format("%02d", countToday + 1));
        }
        else {
            countToday = repo.findMaxOrderNumber();
            order.setOrderNumber(String.format("%02d", countToday + 1));
        }

        repo.saveAndFlush(order);

        return order;
    }

    //    @Transactional
    public void updateOrder(int orKey, List<OrderItemRequestDTO> items) {

        Optional<AgencyOrderEntity> op = repo.findById(orKey);

        AgencyOrderEntity ao = op.get();

        // 5️⃣ 주문 아이템 생성
        List<AgencyOrderItemEntity> orderItems = new ArrayList<>();
        for (OrderItemRequestDTO itemDTO : items) {
            ProductEntity product = productRepository.findById(itemDTO.getPdKey())
                    .orElseThrow(() -> new RuntimeException("상품 없음: " + itemDTO.getPdKey()));

            AgencyOrderItemEntity orderItem = new AgencyOrderItemEntity();
            orderItem.setOrder(ao);
            orderItem.setProduct(product);
//            orderItem.setOrKey(ao.getOrKey());
            orderItem.setPdKey(product.getPdKey());
            orderItem.setOiProducts(product.getPdProducts());
            orderItem.setOiPrice(itemDTO.getPdPrice());
            orderItem.setOiQuantity(itemDTO.getQuantity());
            orderItem.setOrDelivery(false);
            orderItem.setOiTotal(itemDTO.getPdPrice() * itemDTO.getQuantity());

            orderItems.add(orderItem);
        }
        ao.setItems(orderItems);

        // 6️⃣ or_products, or_quantity, or_total, orPrice 계산
        String allProducts = orderItems.stream()
                .map(AgencyOrderItemEntity::getOiProducts)
                .collect(Collectors.joining(", "));
        int totalQuantity = orderItems.stream()
                .mapToInt(AgencyOrderItemEntity::getOiQuantity)
                .sum();
        int totalAmount = orderItems.stream()
                .mapToInt(AgencyOrderItemEntity::getOiTotal)
                .sum();

        ao.setOrProducts(allProducts);
        ao.setOrQuantity(totalQuantity);
        ao.setOrTotal(totalAmount);
        ao.setOrPrice(totalAmount); // 추가: orPrice 저장

        repo.save(ao);
    }
}
