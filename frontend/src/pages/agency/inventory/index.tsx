import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/agency/orders.module.css";
import api from "../../../api/api";

// Redux 상태 타입 (필요에 따라 확장 가능)
interface RootState {
  auth: {
    token: string | null;
    userInfo: {
      agKey?: string;
      [key: string]: any;
    };
  };
}

// 재고 아이템 타입 (API 응답 기반)
interface InventoryItem {
  pdKey: string;
  pdNum?: string;
  pdProducts?: string;
  stock?: number;
  lastArrival?: string | null;
}

export default function Inventory() {
  // Redux에서 토큰과 사용자 정보 가져오기
  const token = useSelector((state: RootState) => state.auth.token);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // ----------------- 재고 API 호출 -----------------
  const fetchInventory = async () => {
    // agKey, token 없으면 요청 중단
    if (!userInfo?.agKey || !token) return;
    setLoading(true);

    try {
      const res = await api.get<InventoryItem[]>(`/agency/${userInfo.agKey}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // lastArrival이 없으면 null로 명확히 처리
      const data = res.data.map((item) => ({
        ...item,
        lastArrival: item.lastArrival ?? null,
      }));

      setInventory(data);
    } catch (err: any) {
      console.error("❌ 재고 조회 실패:", err);

      if (err.response?.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        // 추가로 로그아웃 처리/리다이렉트 로직 필요하면 여기에 작성
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 및 userInfo/token 변경 시 재고 데이터 갱신
  useEffect(() => {
    fetchInventory();
  }, [userInfo, token]);

  // ----------------- 검색어 필터링 및 정렬 -----------------
  const filteredInventory = useMemo(() => {
    return inventory
      .filter((item) => item.pdNum?.toLowerCase().includes(sku.toLowerCase()))
      .filter((item) => item.pdProducts?.toLowerCase().includes(name.toLowerCase()))
      .sort((a, b) => {
        // 최신 입고일 순, 이후 제품명 순 정렬
        const dateA = a.lastArrival ? new Date(a.lastArrival) : new Date(0);
        const dateB = b.lastArrival ? new Date(b.lastArrival) : new Date(0);

        if (dateB.getTime() - dateA.getTime() !== 0) return dateB.getTime() - dateA.getTime();

        return (a.pdProducts ?? "").localeCompare(b.pdProducts ?? "");
      });
  }, [inventory, sku, name]);

  return (
    <div className={styles.ordersPage}>
      <section className={styles.section}>
        <h2 className={styles.title}>재고 현황</h2>

        {/* 검색 필터 영역 */}
        <div
          className={styles.searchRow}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-start" }}
        >
          {/* 품번 검색 */}
          <div className={styles.fieldGroup} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <label className={styles.label}>품번</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={styles.searchInput}
              placeholder="품번 입력"
            />
          </div>

          {/* 제품명 검색 */}
          <div className={styles.fieldGroup} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <label className={styles.label}>제품명</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.searchInput}
              placeholder="제품명 입력"
            />
          </div>
        </div>

        {/* 재고 테이블 */}
        <div className={styles.tableWrap}>
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>품번</th>
                  <th>제품명</th>
                  <th className={styles.right}>재고 수량</th>
                  <th className={styles.right}>최근 입고일</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item, index) => (
                    <tr key={`${item.pdKey}-${index}`}>
                      <td>{item.pdNum ?? "-"}</td>
                      <td>{item.pdProducts ?? "-"}</td>
                      <td className={styles.right}>{item.stock ?? "-"}</td>
                      <td className={styles.right}>
                        {item.lastArrival ? new Date(item.lastArrival).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.center}>
                      {inventory.length === 0 ? "데이터를 불러오는 중입니다..." : "검색 결과가 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
