import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/agency/orders.module.css";
import api from "../../../api/api";

// Redux 상태 타입 (실제 프로젝트에 맞게 확장해서 사용하세요)
interface RootState {
  auth: {
    token: string | null;
    userInfo: {
      agKey?: string;
      [key: string]: unknown; // 기타 사용자 정보는 필요에 따라 적절히 타입 지정
    };
  };
}

// API에서 받아오는 재고 아이템 타입 정의
interface InventoryItem {
  pdKey: string; // 제품 고유 키 (필수)
  pdNum?: string; // 제품 번호 (품번)
  pdProducts?: string; // 제품명
  stock?: number; // 재고 수량
  lastArrival?: string | null; // 최근 입고일, 없을 수도 있음
}

export default function Inventory() {
  // Redux에서 인증 토큰과 사용자 정보 가져오기
  const token = useSelector((state: RootState) => state.auth.token);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // 컴포넌트 상태 - 재고 목록, 검색어(품번, 제품명), 로딩 상태
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // 재고 데이터를 서버에서 받아오는 함수
  const fetchInventory = async () => {
    // 사용자 정보 및 토큰 없으면 요청하지 않음
    if (!userInfo?.agKey || !token) return;

    setLoading(true);

    try {
      // API 호출 - baseURL, 토큰 헤더는 api.ts 인터셉터에서 처리됨
      const res = await api.get<InventoryItem[]>(`/agency/${userInfo.agKey}/inventory`);

      // 응답 데이터가 배열 형태로 오면 lastArrival 값이 없을 경우 명확히 null로 처리
      const data = res.data.map((item) => ({
        ...item,
        lastArrival: item.lastArrival ?? null,
      }));

      setInventory(data);
    } catch (error) {
      // 에러 타입이 확실하지 않을 수 있어 unknown으로 받고 체크하는 게 안전함
      if (error instanceof Error) {
        console.error("❌ 재고 조회 실패:", error.message);
      } else {
        console.error("❌ 재고 조회 실패: 알 수 없는 에러");
      }

      // 예를 들어 401 에러라면 로그인 만료 알림
      // (axios 에러인지 타입 체크는 api.ts 인터셉터에서 처리하는 게 좋음)
      // 여기서는 간단히 alert만 처리
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 처음 렌더링될 때, userInfo나 token이 바뀔 때마다 재고 조회
  useEffect(() => {
    fetchInventory();
  }, [userInfo, token]);

  // 검색어(품번, 제품명) 기준으로 재고 목록 필터링 및 최신 입고순 정렬
  const filteredInventory = useMemo(() => {
    return inventory
      .filter((item) => item.pdNum?.toLowerCase().includes(sku.toLowerCase()))
      .filter((item) => item.pdProducts?.toLowerCase().includes(name.toLowerCase()))
      .sort((a, b) => {
        // 입고일 기준 내림차순 정렬
        const dateA = a.lastArrival ? new Date(a.lastArrival) : new Date(0);
        const dateB = b.lastArrival ? new Date(b.lastArrival) : new Date(0);

        if (dateB.getTime() !== dateA.getTime()) return dateB.getTime() - dateA.getTime();

        // 입고일이 같으면 제품명 오름차순 정렬
        return (a.pdProducts ?? "").localeCompare(b.pdProducts ?? "");
      });
  }, [inventory, sku, name]);

  return (
    <div className={styles.ordersPage}>
      <section className={styles.section}>
        <h2 className={styles.title}>재고 현황</h2>

        {/* 검색 필터 */}
        <div
          className={styles.searchRow}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-start" }}
        >
          {/* 품번 입력 */}
          <div className={styles.fieldGroup} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <label className={styles.label}>품번</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={styles.searchInput}
              placeholder="품번 입력"
            />
          </div>

          {/* 제품명 입력 */}
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
