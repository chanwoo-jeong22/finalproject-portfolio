import { useState, useEffect, useContext, useMemo } from "react";
import styles from "./Orders.module.css";
import api from "../../api/api.js";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function InventoryManagement() {
    const { token, userInfo } = useContext(AuthContext);

    const [inventory, setInventory] = useState([]);
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

    // ================= 재고 API 호출 =================
    const fetchInventory = async () => {
        if (!userInfo?.agKey || !token) return;
        setLoading(true);

        try {
            const res = await api.get(`/agency/${userInfo.agKey}/inventory`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // lastArrival undefined 처리
            const data = res.data.map((item) => ({
                ...item,
                lastArrival: item.lastArrival ?? null,
            }));

            setInventory(data);
        } catch (err) {
            console.error("❌ 재고 조회 실패:", err);
            if (err.response?.status === 401) {
                alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [userInfo, token]);

    // ================= 필터링 & 검색 =================
    const filteredInventory = useMemo(() => {
        return inventory
            .filter((item) =>
                item.pdNum?.toLowerCase().includes(sku.toLowerCase())
            )
            .filter((item) =>
                item.pdProducts?.toLowerCase().includes(name.toLowerCase())
            )
            .sort((a, b) => {
                // 재고 최신 순, 제품명 순 정렬
                const dateA = a.lastArrival ? new Date(a.lastArrival) : new Date(0);
                const dateB = b.lastArrival ? new Date(b.lastArrival) : new Date(0);

                if (dateB - dateA !== 0) return dateB - dateA;

                return (a.pdProducts ?? "").localeCompare(b.pdProducts ?? "");
            });
    }, [inventory, sku, name]);

    return (
      <div className={styles.ordersPage}>
          <section className={styles.section}>
              <h2 className={styles.title}>재고 현황</h2>

                {/* ================= 검색 Row ================= */}
                <div
                    className={styles.searchRow}
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "flex-start",
                    }}
                >
                    {/* 품번 검색 */}
                    <div
                        className={styles.fieldGroup}
                        style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                        <label className={styles.label}>품번</label>
                        <input
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className={styles.searchInput}
                            placeholder="품번 입력"
                        />
                    </div>

                    {/* 제품명 검색 */}
                    <div
                        className={styles.fieldGroup}
                        style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                        <label className={styles.label}>제품명</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.searchInput}
                            placeholder="제품명 입력"
                        />
                    </div>
                </div>

                {/* ================= 재고 테이블 ================= */}
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
                                            {item.lastArrival
                                                ? new Date(item.lastArrival).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className={styles.center}>
                                        {inventory.length === 0
                                            ? "데이터를 불러오는 중입니다..."
                                            : "검색 결과가 없습니다."}
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