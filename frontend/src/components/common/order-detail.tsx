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

// 슬라이스에 맞게 OrderItem 타입 선언 (필요한 필드만)
type OrderItem = {
  oiKey: number;
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

  // OrderItem의 키 리스트 (슬라이스와 동일)
  const orderItemKeys = [
    "oiKey",
    "pdNum",
    "pdCategory",
    "oiProducts",
    "oiQuantity",
    "oiPrice",
    "oiTotal",
  ] as const;

  type OrderItemKey = typeof orderItemKeys[number];

  // sortField가 유효한 키인지 검사하는 타입 가드
  function isOrderItemKey(field: unknown): field is OrderItemKey {
    return typeof field === "string" && orderItemKeys.includes(field as OrderItemKey);
  }


  // 정렬 필드 유효성 검사 및 기본값 설정
  const field: OrderItemKey = isOrderItemKey(sortField) ? sortField : "pdNum";

  const sortedItems = React.useMemo(() => {
    if (!items) return [];

    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      // 문자열일 경우 localeCompare 사용
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // 숫자 혹은 기타 비교
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, field, sortOrder]);

  const handleSort = (field: OrderItemKey) => {
    dispatch(setSortField(field));
  };

  const columns: { title: string; field: OrderItemKey }[] = [
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
