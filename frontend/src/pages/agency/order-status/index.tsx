import React, { useState, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import styles from "../../../styles/agency/orders.module.css";

// Redux 루트 상태 타입 (auth 부분만 정의)
interface RootState {
  auth: {
    token: string | null;
  };
}

// 주문 아이템 타입
interface OrderItem {
  sku?: string;
  name?: string;
  qty?: number;
  price?: number;
  product?: {
    pdNum?: string;
    pdProducts?: string;
  };
  quantity?: number;
}

// 주문 타입
interface Order {
  orKey: string;
  orStatus: string;
  orDate?: string;
  orReserve?: string;
  dvName?: string;
  orderNumber?: string;
  orderNumberUI?: string;
  items?: OrderItem[];
  totalAmount?: number;
  delivery?: any;
}

// OutletContext에서 내려받는 props 타입
interface OutletContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function OrderStatus() {
  // Outlet으로부터 orders, setOrders 받아옴
  const { orders, setOrders } = useOutletContext<OutletContextType>();

  // Redux에서 토큰 가져오기
  const token = useSelector((state: RootState) => state.auth.token);

  const location = useLocation();
  const navigate = useNavigate();
  const { newOrder } = (location.state || {}) as { newOrder?: Order };

  const [groupedOrders, setGroupedOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [popupOrderId, setPopupOrderId] = useState<string | null>(null);
  const popupOrder = popupOrderId
    ? groupedOrders.find((o) => o.orKey === popupOrderId) ?? null
    : null;

  const [fromDate, setFromDate] = useState("");
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState("");

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // orders 바뀔 때마다 주문 데이터 그룹핑 및 가공
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // 본사에서 "주문 처리 완료" 상태를 대리점에선 "배송 준비중"으로 변환
    const updatedOrders = orders.map((o) => ({
      ...o,
      orStatus: o.orStatus === "주문 처리 완료" ? "배송 준비중" : o.orStatus,
    }));

    // orKey 기준으로 주문 묶기 (items 병합, delivery 포함)
    const groupedMap: Record<string, Order> = {};
    updatedOrders.forEach((order) => {
      if (!groupedMap[order.orKey]) {
        groupedMap[order.orKey] = {
          ...order,
          items: [...(order.items ?? [])],
          delivery: order.delivery ?? null,
        };
      } else {
        groupedMap[order.orKey].items?.push(...(order.items ?? []));
      }
    });

    // 아이템 가공 및 총액 계산, UI용 주문번호 설정
    const grouped = Object.values(groupedMap).map((order) => {
      const items = (order.items ?? []).map((item) => ({
        sku: item.sku ?? item.product?.pdNum ?? "정보 없음",
        name: item.name ?? item.product?.pdProducts ?? "정보 없음",
        qty: item.qty ?? item.quantity ?? 0,
        price: item.price ?? 0,
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

      const orderNumberUI = order.orderNumber ?? order.orKey;

      return { ...order, items, totalAmount, orderNumberUI };
    });

    setGroupedOrders(grouped);
    setFilteredOrders(grouped);
  }, [orders]);

  // 새 주문이 들어오면 바로 추가하고 URL 상태 초기화
  useEffect(() => {
    if (!newOrder?.items?.length) return;

    const items = newOrder.items.map((item) => ({
      sku: item.sku ?? item.pdKey ?? "정보 없음",
      name: item.name ?? item.rdProducts ?? "정보 없음",
      qty: item.qty ?? item.rdQuantity ?? 0,
      price: item.price ?? item.rdPrice ?? 0,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const orderNumberUI = newOrder.orderNumber;

    const formattedOrder = { ...newOrder, items, totalAmount, orderNumberUI };

    setOrders((prev) => [...prev, formattedOrder]);
    setGroupedOrders((prev) => [...prev, formattedOrder]);
    setFilteredOrders((prev) => [...prev, formattedOrder]);

    navigate(location.pathname, { replace: true, state: null });
  }, [newOrder, navigate, location.pathname, setOrders]);

  // 테이블 정렬 처리
  const handleSort = (column: keyof Order) => {
    let direction: "asc" | "desc" = "asc";
    if (sortColumn === column && sortDirection === "asc") direction = "desc";
    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...filteredOrders].sort((a, b) => {
      const av = (a[column] ?? "") as string;
      const bv = (b[column] ?? "") as string;

      if (av < bv) return direction === "asc" ? -1 : 1;
      if (av > bv) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredOrders(sorted);
  };

  // 정렬 화살표 UI
  const getArrow = (column: string) =>
    sortColumn !== column ? "▼" : sortDirection === "asc" ? "▲" : "▼";

  // 단일 선택 토글
  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // 전체 선택/해제 토글
  const toggleSelectAll = () => {
    if (selected.length === filteredOrders.length) setSelected([]);
    else setSelected(filteredOrders.map((o) => o.orKey));
  };

  // 선택된 주문 삭제 처리
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;

    try {
      const agKey = JSON.parse(localStorage.getItem("userInfo") || "{}").agKey;

      await Promise.all(
        selected.map((id) =>
          api.delete(`/agencyorder/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      // 삭제된 주문 제외 후 상태 업데이트
      const updatedOrders = groupedOrders.filter((o) => !selected.includes(o.orKey));

      setGroupedOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSelected([]);

      alert("선택된 주문이 삭제되었습니다.");
    } catch (err: any) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다: " + err.message);
    }
  };

  // 필터링 적용 함수
  const applyFilters = (
    statusVal = status,
    orderIdVal = orderId,
    fromDateVal = fromDate
  ) => {
    const filtered = groupedOrders.filter((order) => {
      const matchStatus = statusVal ? order.orStatus === statusVal : true;
      const matchOrderId = orderIdVal
        ? (order.orderNumberUI ?? "").includes(orderIdVal)
        : true;
      const matchDate = fromDateVal ? (order.orDate ?? "").slice(0, 10) === fromDateVal : true;
      return matchStatus && matchOrderId && matchDate;
    });

    setFilteredOrders(filtered);
    setSelected([]);
  };

  return (
    <div className={styles.ordersPage}>
      <section className={styles.section}>
        <h2 className={styles.title}>주문 현황</h2>

        {/* 검색/필터 UI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>주문일</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setFromDate(val);
                  applyFilters(status, orderId, val);
                }}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>처리 상태</label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatus(val);
                  applyFilters(val, orderId, fromDate);
                }}
                className={styles.searchInput}
              >
                <option value="">전체</option>
                <option value="승인 대기중">승인 대기중</option>
                <option value="배송 준비중">배송 준비중</option>
                <option value="배송중">배송중</option>
                <option value="배송 완료">배송 완료</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>주문번호</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={styles.searchInput}
                placeholder="주문번호 입력"
              />
              <button
                className={styles.searchBtn}
                onClick={() => applyFilters(status, orderId, fromDate)}
              >
                검색
              </button>
            </div>
          </div>

          {/* 선택 삭제 버튼 */}
          <div
            className={styles.buttonGroup}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              height: 36,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {selected.length > 0 && (
              <button className={styles.danger} onClick={handleDeleteSelected}>
                선택 삭제
              </button>
            )}
          </div>
        </div>

        {/* 주문 테이블 */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.center} ${styles.t_w40}`}>
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selected.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className={styles.center}>주문일</th>
                <th
                  className={styles.center}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("orKey")}
                >
                  주문번호 {getArrow("orKey")}
                </th>
                <th className={styles.center}>제품명</th>
                <th className={styles.center}>수량</th>
                <th className={styles.center}>처리 상태</th>
                <th className={styles.center}>도착 예정일</th>
                <th className={styles.center}>배송 기사님</th>
                <th className={styles.center}>총액</th>
                <th className={styles.center}>보기</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const totalQty = o.items?.reduce((sum, i) => sum + (i.qty ?? 0), 0) ?? 0;
                  const productSummary =
                    o.items && o.items.length > 0
                      ? `${o.items[0].name} ${o.items.length > 1 ? `외 ${o.items.length - 1}개` : ""}`
                      : "-";

                  return (
                    <tr key={o.orKey}>
                      <td className={`${styles.center} ${styles.t_w40}`}>
                        <input
                          type="checkbox"
                          checked={selected.includes(o.orKey)}
                          onChange={() => toggleSelect(o.orKey)}
                        />
                      </td>
                      <td className={styles.center}>{o.orDate}</td>
                      <td className={styles.center}>{o.orderNumberUI}</td>
                      <td className={styles.center}>{productSummary}</td>
                      <td className={styles.center}>{totalQty}</td>
                      <td className={styles.center}>{o.orStatus}</td>
                      <td className={styles.center}>
                        {o.orStatus === "배송완료" || !o.orReserve
                          ? "-"
                          : new Date(o.orReserve).toLocaleDateString()}
                      </td>
                      <td className={styles.center}>{o.orStatus === "배송완료" || !o.dvName ? "-" : o.dvName}</td>
                      <td className={styles.right}>{(o.totalAmount ?? 0).toLocaleString()}</td>
                      <td className={styles.center}>
                        <span
                          style={{ cursor: "pointer", fontSize: 18, color: "#333" }}
                          onClick={() => setPopupOrderId(o.orKey)}
                        >
                          🔍
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className={styles.center}>
                    등록된 주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 주문 상세 모달 */}
        {popupOrder && (
          <div className={styles.modalOverlay} onClick={() => setPopupOrderId(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>주문 상세 (주문번호: {popupOrder.orderNumberUI})</h3>
                <button onClick={() => setPopupOrderId(null)}>닫기</button>
              </div>
              <table className={styles.modalTable}>
                <thead>
                  <tr>
                    <th>품번</th>
                    <th>제품명</th>
                    <th>수량</th>
                    <th>단가</th>
                  </tr>
                </thead>
                <tbody>
                  {popupOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>{item.price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
