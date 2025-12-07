import React, { useState, useEffect } from "react";
import styles from "../../../styles/agency/orders.module.css";
import api from "../../../api/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";

// Redux RootState 타입
interface RootState {
  auth: {
    token: string | null;
  };
}

// DraftItem 타입
export interface DraftItem {
  rdKey: number;
  pdKey: string;
  rdProducts: string;
  rdQuantity: number;
  rdPrice: number;
  rdTotal: number;
}

// 부모에서 OutletContext 로 전달받는 orders 아이템 타입
interface ParentOrderItem {
  orKey: number | string;
  orDate: string;
  [key: string]: any;
}

// OutletContext 타입
interface OutletContextType {
  orders: ParentOrderItem[];
  setOrders: React.Dispatch<React.SetStateAction<ParentOrderItem[]>>;
}

export default function OrderDraft() {
  const { orders, setOrders } = useOutletContext<OutletContextType>();

  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);

  // 임시 저장 목록
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  // 선택된 항목들 (rdKey 배열)
  const [selected, setSelected] = useState<number[]>([]);
  // 도착 예정일
  const [expectedDate, setExpectedDate] = useState<string>("");

  // 임시 저장 불러오기
  useEffect(() => {
    if (!token) return;

    const userInfoStr = localStorage.getItem("userInfo");
    const agKey = userInfoStr ? JSON.parse(userInfoStr).agKey : null;
    if (!agKey) {
      console.error("대리점 키(agKey)가 없습니다.");
      return;
    }

    const fetchDrafts = async () => {
      try {
        const res = await api.get<DraftItem[]>(`/agencyorder/draft?agKey=${agKey}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrafts(res.data);
      } catch (err) {
        console.error("임시 저장 데이터 불러오기 실패", err);
      }
    };

    fetchDrafts();
  }, [token]);

  // 개별 선택 토글
  const toggleSelect = (rdKey: number) => {
    setSelected(prev =>
      prev.includes(rdKey) ? prev.filter(x => x !== rdKey) : [...prev, rdKey]
    );
  };

  // 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selected.length === drafts.length) {
      setSelected([]);
    } else {
      setSelected(drafts.map(item => item.rdKey));
    }
  };

  // 선택 항목 삭제
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await api.delete("/agencyorder/draft", {
        data: { rdKeys: selected },
        headers: { Authorization: `Bearer ${token}` },
      });

      setDrafts(prev => prev.filter(item => !selected.includes(item.rdKey)));
      setSelected([]);
      alert("선택 항목이 삭제되었습니다.");
    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제 중 오류 발생");
    }
  };

  // 수량 증가
  const incrementQty = (rdKey: number) => {
    setDrafts(prev =>
      prev.map(item =>
        item.rdKey === rdKey
          ? {
              ...item,
              rdQuantity: item.rdQuantity + 1,
              rdTotal: (item.rdQuantity + 1) * item.rdPrice,
            }
          : item
      )
    );
  };

  // 수량 감소 (최소 1)
  const decrementQty = (rdKey: number) => {
    setDrafts(prev =>
      prev.map(item =>
        item.rdKey === rdKey
          ? {
              ...item,
              rdQuantity: Math.max(item.rdQuantity - 1, 1),
              rdTotal: Math.max(item.rdQuantity - 1, 1) * item.rdPrice,
            }
          : item
      )
    );
  };

  // 주문 확정
  const handleConfirmOrder = async () => {
    if (selected.length === 0) {
      alert("확정할 품목을 선택해주세요.");
      return;
    }

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const agKey = userInfoStr ? JSON.parse(userInfoStr).agKey : null;
      if (!agKey) {
        alert("사용자 정보가 없습니다.");
        return;
      }

      const selectedItems = drafts.filter(item => selected.includes(item.rdKey));

      // 기본 도착 예정일 = 오늘 + 4일
      const today = new Date();
      const defaultArrival = new Date(today);
      defaultArrival.setDate(today.getDate() + 4);

      const arrivalDate =
        expectedDate || defaultArrival.toISOString().slice(0, 10);

      // 주문 확정 요청
      const res = await api.post(
        "/agencyorder/confirm",
        {
          agKey,
          items: selectedItems,
          reserveDate: arrivalDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const savedOrder = res.data;

      // 임시 저장 삭제
      await api.delete("/agencyorder/draft", {
        data: { rdKeys: selected },
        headers: { Authorization: `Bearer ${token}` },
      });

      setDrafts(prev => prev.filter(item => !selected.includes(item.rdKey)));
      setSelected([]);

      // UI용 주문 데이터 구성
      const items = selectedItems.map(item => ({
        sku: item.pdKey,
        name: item.rdProducts,
        qty: item.rdQuantity,
        price: item.rdPrice,
      }));

      const totalAmount = items.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
      );

      // 주문번호 UI 포맷
      const date = new Date(savedOrder.orDate);
      const yy = String(date.getFullYear()).slice(2);
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const seq = String(Number(savedOrder.orKey) % 100).padStart(2, "0");

      const orderNumberUI = `${yy}${mm}${dd}${seq}`;

      const formattedOrder = {
        ...savedOrder,
        items,
        totalAmount,
        orderNumberUI,
      };

      // 부모 상태에 추가
      setOrders(prev => [...prev, formattedOrder]);

      alert("주문이 확정되었습니다.");
    } catch (err) {
      console.error("주문 확정 실패:", err);
      alert("주문 확정 중 오류 발생");
    }
  };

  return (
    <div className={styles.ordersPage}>
      <section className={styles.section}>
        <h2 className={styles.title}>주문 임시저장</h2>

        {/* 도착 예정일 선택 및 버튼 영역 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
            <div className={styles.fieldGroup}>
              <label htmlFor="expectedDate">도착 예정일</label>
              <input
                type="date"
                id="expectedDate"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.buttonGroup} style={{ visibility: selected.length > 0 ? "visible" : "hidden" }}>
            <button type="button" onClick={handleDeleteSelected} className={styles.danger}>
              삭제
            </button>
            <button type="button" onClick={handleConfirmOrder} className={styles.primary}>
              주문 확정
            </button>
          </div>
        </div>

        {/* 임시 저장 테이블 */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.center} ${styles.t_w40}`}>
                  <input
                    type="checkbox"
                    checked={drafts.length > 0 && selected.length === drafts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className={styles.center}>품번</th>
                <th className={styles.center}>제품명</th>
                <th className={styles.right}>수량</th>
                <th className={styles.right}>단가</th>
                <th className={styles.right}>총액</th>
              </tr>
            </thead>
            <tbody>
              {drafts.length > 0 ? (
                drafts.map(item => (
                  <tr key={item.rdKey}>
                    <td className={`${styles.center} ${styles.t_w40}`}>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.rdKey)}
                        onChange={() => toggleSelect(item.rdKey)}
                      />
                    </td>
                    <td className={styles.center}>{item.pdKey}</td>
                    <td className={styles.center}>{item.rdProducts}</td>
                    <td className={styles.right}>
                      <button type="button" onClick={() => decrementQty(item.rdKey)}>-</button>
                      {item.rdQuantity}
                      <button type="button" onClick={() => incrementQty(item.rdKey)}>+</button>
                    </td>
                    <td className={styles.right}>{item.rdPrice.toLocaleString()}원</td>
                    <td className={styles.right}>{item.rdTotal.toLocaleString()}원</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.center}>
                    등록된 임시 저장 주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
