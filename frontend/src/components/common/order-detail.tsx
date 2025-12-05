import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchOrderItems,
  fetchOrderInfo,
  setSortField,
  clearError,
} from "../../redux/slices/common/orderdetail-slice";
import styles from "../../styles/logistic/order-detail.module.css";

type OrderItem = {
  oiKey: string;
  pdNum: string;
  pdCategory: string;
  oiProducts: string;
  oiQuantity: number;
  oiPrice: number;
  oiTotal: number;
};

export default function OrderDetail() {
  const { orKey } = useParams<{ orKey: string }>();
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);

  const {
    items,
    orderInfo,
    loading,
    error,
    sortField,
    sortOrder,
  } = useAppSelector((state) => state.orderDetail);

  useEffect(() => {
    if (!orKey || !token) return;

    dispatch(fetchOrderItems({ orKey, token }));
    dispatch(fetchOrderInfo({ orKey, token }));
  }, [dispatch, orKey, token]);

  const sortedItems = React.useMemo(() => {
    if (!items) return [];

    const field = sortField || "pdNum";
    return [...items].sort((a, b) => {
      if (a[field] < b[field]) return sortOrder === "asc" ? -1 : 1;
      if (a[field] > b[field]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, sortField, sortOrder]);

  const handleSort = (field: keyof OrderItem) => {
    dispatch(setSortField(field));
  };

  const columns: { title: string; field: keyof OrderItem }[] = [
    { title: "품번", field: "pdNum" },
    { title: "카테고리", field: "pdCategory" },
    { title: "제품명", field: "oiProducts" },
    { title: "수량", field: "oiQuantity" },
    { title: "단가", field: "oiPrice" },
    { title: "총액", field: "oiTotal" },
  ];

  return (
    <div className={styles.fixedRoot}>
      <div className={styles.content}>
        <h2 className={styles.title}>주문 상세 정보</h2>

        {error && (
          <div style={{ color: "red", marginBottom: 10 }}>
            에러가 발생했습니다: {error}
            <button onClick={() => dispatch(clearError())}>닫기</button>
          </div>
        )}

        {/* 주문 정보 */}
        <div className={styles.search_bg}>
          <div className={styles.line1}>
            <div className={styles.section}>
              <label>주문번호</label>
              <input
                type="text"
                className={styles.input}
                readOnly
                value={orderInfo?.orKey || ""}
              />
            </div>
            <div className={styles.section}>
              <label>대리점</label>
              <input
                type="text"
                className={styles.input}
                readOnly
                value={orderInfo?.agencyName || ""}
              />
            </div>
          </div>
          <div className={styles.line2}>
            <div className={styles.section}>
              <label>주문일</label>
              <input
                type="text"
                className={styles.input}
                readOnly
                value={orderInfo?.orDate || ""}
              />
            </div>
            <div className={styles.section}>
              <label>배송요청일</label>
              <input
                type="text"
                className={styles.input}
                readOnly
                value={orderInfo?.orReserve || ""}
              />
            </div>
          </div>
        </div>

        {/* 주문 아이템 테이블 */}
        <div className={styles.table_container}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map(({ title, field }) => {
                  const isActive = sortField === field;
                  return (
                    <th
                      key={field}
                      className={styles.ta}
                      onClick={() => handleSort(field)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        {title}
                        <button>
                          {isActive ? (sortOrder === "asc" ? "▲" : "▼") : "▼"}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    로딩 중...
                  </td>
                </tr>
              ) : sortedItems.length > 0 ? (
                sortedItems.map((item) => (
                  <tr key={item.oiKey}>
                    <td className={styles.t_left}>{item.pdNum}</td>
                    <td className={styles.t_left}>{item.pdCategory}</td>
                    <td className={styles.t_left}>{item.oiProducts}</td>
                    <td className={styles.t_right}>{item.oiQuantity}</td>
                    <td className={styles.t_right}>
                      {Number(item.oiPrice).toLocaleString()}원
                    </td>
                    <td className={styles.t_right}>
                      {Number(item.oiTotal).toLocaleString()}원
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    주문 아이템이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
