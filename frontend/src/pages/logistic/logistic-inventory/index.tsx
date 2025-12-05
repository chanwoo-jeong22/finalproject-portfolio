import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";

import {
  fetchInventory,
  setRows,
  resetFilters,
} from "../../../redux/slices/logistic/logisticinventory-slice";

import styles from "../../../styles/logistic/logistic-order.module.css";

// 재고 항목 타입 정의
interface InventoryItem {
  id: number | string;
  type: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

export default function LogisticInventory() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    rows,
    originalRows,
    loading,
    error,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.logisticInventory);

  const token = useSelector((state: RootState) => state.auth.token);

  // 🔎 검색 상태
  const [sku, setSku] = useState<string>("");
  const [name, setName] = useState<string>("");

  // 📌 최초 1회만 서버에서 전체 재고 로드
  useEffect(() => {
    if (token) {
      dispatch(fetchInventory({})); // 전체 조회
    }
  }, [token, dispatch]);

  // 🔥 로컬 자동 필터링
  useEffect(() => {
    let list = [...originalRows];

    const like = (v: string | number | null | undefined, q: string) =>
      !q || String(v ?? "").toLowerCase().includes(q.toLowerCase());

    list = list.filter((r: InventoryItem) => {
      if (!like(r.sku, sku)) return false;
      if (!like(r.name, name)) return false;
      return true;
    });

    dispatch(setRows(list));
  }, [sku, name, originalRows, dispatch]);

  const handleSort = (field: keyof InventoryItem) => {
    const next = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    dispatch({
      type: "logisticInventory/setSort",
      payload: { field, order: next },
    });
  };

  const getSortArrow = (field: keyof InventoryItem) => {
    if (sortField === field) return sortOrder === "asc" ? "▲" : "▼";
    return "▼";
  };

  const data = useMemo(() => {
    const sorted = [...rows];

    sorted.sort((a: InventoryItem, b: InventoryItem) => {
      const A = a[sortField as keyof InventoryItem];
      const B = b[sortField as keyof InventoryItem];

      if (A == null || B == null) return 0;

      const numericFields: (keyof InventoryItem)[] = ["price", "stock"];

      if (numericFields.includes(sortField as keyof InventoryItem)) {
        return sortOrder === "asc"
          ? (A as number) - (B as number)
          : (B as number) - (A as number);
      }

      return sortOrder === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    return sorted;
  }, [rows, sortField, sortOrder]);

  if (loading) return <div className={styles.page}>불러오는 중…</div>;
  if (error) return <div className={styles.page}>에러: {error}</div>;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>재고 현황</h2>

      {/* 검색창 간단화 */}
      <div className={styles.formScroll}>
        <div className={styles.formInner}>
          <div className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>품번</label>
                <input value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>제품명</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <button
                className={styles.btnDark}
                onClick={() => {
                  setSku("");
                  setName("");
                  dispatch(resetFilters());
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSort} onClick={() => handleSort("type")}>
                구분 <button>{getSortArrow("type")}</button>
              </th>
              <th className={styles.thSort} onClick={() => handleSort("sku")}>
                품번 <button>{getSortArrow("sku")}</button>
              </th>
              <th className={styles.thSort} onClick={() => handleSort("name")}>
                제품명 <button>{getSortArrow("name")}</button>
              </th>
              <th className={styles.thSort} onClick={() => handleSort("price")}>
                가격 <button>{getSortArrow("price")}</button>
              </th>
              <th className={styles.thSort} onClick={() => handleSort("stock")}>
                재고 <button>{getSortArrow("stock")}</button>
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td>{r.type}</td>
                <td>{r.sku}</td>
                <td>{r.name}</td>
                <td className={styles.right}>{r.price.toLocaleString()}</td>
                <td className={styles.right}>{r.stock.toLocaleString()}</td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={5}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
