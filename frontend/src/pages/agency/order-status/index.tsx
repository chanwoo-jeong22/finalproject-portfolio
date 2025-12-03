import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../api/api";
import styles from "../../../styles/agency/orders.module.css";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  fetchAgencyOrders,
  fetchAgencyProducts, // 주문 리스트 불러오기 thunk
  deleteOrders,      // 주문 삭제 thunk 이름 맞춰서 수정
} from "../../../redux/slices/agency/order-management/thunks";


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

export default function OrderStatus() {
  const useAppDispatch = () => useDispatch<AppDispatch>();

  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const token = useSelector((state: RootState) => state.auth.token);
  const orders = useSelector((state: RootState) => state.agencyOrders.orders);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

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

  // 최초 렌더 시 및 token 변경 시 주문 목록 불러오기
  useEffect(() => {
    console.log("token:", token, "agencyId:", userInfo.agKey);
    if (token && userInfo) {
      dispatch(fetchAgencyOrders(userInfo.agKey));
    }
  }, [dispatch, token, userInfo]);

  // Redux orders 변경 시 그룹핑 및 가공
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setGroupedOrders([]);
      setFilteredOrders([]);
      return;
    }

    const updatedOrders = orders.map((o) => ({
      ...o,
      orStatus: o.orStatus === "주문 처리 완료" ? "배송 준비중" : o.orStatus ?? "알 수 없음",
    }));

    const groupedMap: Record<string, Order> = {};
    updatedOrders.forEach((order) => {
      if (!groupedMap[order.orKey]) {
        groupedMap[order.orKey] = {
          ...order,
          orStatus: order.orStatus === "주문 처리 완료" ? "배송 준비중" : order.orStatus ?? "알 수 없음",
          items: [...(order.items ?? [])],
          delivery: order.delivery ?? null,
        };
      } else {
        groupedMap[order.orKey].items?.push(...(order.items ?? []));
      }
    });

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

  // location.state에 newOrder가 있으면 Redux 상태에 반영 (필요시)
  useEffect(() => {
    if (!newOrder?.items?.length) return;

    // 기존 orders에 newOrder가 없으면 추가 (여기서는 단순히 setOrders 호출 안하므로 Redux에 반영하는 thunk 필요)
    // 만약 Redux에서 newOrder 반영하는 thunk가 있다면 호출하는게 좋음.
    // 지금은 간단하게 navigate로 location state 초기화만 처리
    navigate(location.pathname, { replace: true, state: null });
  }, [newOrder, navigate, location.pathname]);

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

  const getArrow = (column: string) =>
    sortColumn !== column ? "▼" : sortDirection === "asc" ? "▲" : "▼";

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredOrders.length) setSelected([]);
    else setSelected(filteredOrders.map((o) => o.orKey));
  };

  // 선택된 주문 삭제 시 thunk 호출
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await dispatch(deleteOrders(selected)).unwrap();

      alert("선택된 주문이 삭제되었습니다.");
      setSelected([]);

      if (agencyId) {
        dispatch(fetchAgencyOrders(agencyId));
      } else {
        console.warn("agencyId가 없어 주문 리스트 갱신을 할 수 없습니다.");
      }
    } catch (err: any) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다: " + (err.message ?? "알 수 없는 오류"));
    }

  };

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
                      <td className={styles.center}>
                        {o.orStatus === "배송완료" || !o.dvName ? "-" : o.dvName}
                      </td>
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
