import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";  // redux hooks (useDispatch, useSelector 래핑)
import {
  fetchOrderItems,
  fetchOrderInfo,
  setSortField,
  clearError,
} from "../../redux/slices/common/orderdetail-slice";
import styles from "../../styles/logistic/order-detail.module.css";

export default function OrderDetail() {
  const { orKey } = useParams<{ orKey: string }>();
  const dispatch = useAppDispatch();

  // 예: auth에서 token을 가져오는 부분 (본인 프로젝트 구조에 맞게 수정)
  const token = useAppSelector((state) => state.auth.token);

  // 슬라이스 상태 선택
  const {
    items,
    orderInfo,
    loading,
    error,
    sortField,
    sortOrder,
  } = useAppSelector((state) => state.orderDetail);

  // 데이터 불러오기: orKey, token, sortField, sortOrder 변경 시 재호출
  useEffect(() => {
    if (!orKey || !token) return;

    dispatch(fetchOrderItems({ orKey, token }));
    dispatch(fetchOrderInfo({ orKey, token }));
  }, [dispatch, orKey, token]);

  // 정렬 로직: redux 상태 변경시 정렬 재적용
  const sortedItems = React.useMemo(() => {
    if (!items) return [];

    return [...items].sort((a, b) => {
      const field = sortField || "pdNum";

      if (a[field] < b[field]) return sortOrder === "asc" ? -1 : 1;
      if (a[field] > b[field]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, sortField, sortOrder]);

  // 정렬 필드 변경 핸들러
  const handleSort = (field: keyof typeof items[0]) => {
    dispatch(setSortField(field));
  };

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
                {[
                  { title: "품번", field: "pdNum" },
                  { title: "카테고리", field: "pdCategory" },
                  { title: "제품명", field: "oiProducts" },
                  { title: "수량", field: "oiQuantity" },
                  { title: "단가", field: "oiPrice" },
                  { title: "총액", field: "oiTotal" },
                ].map(({ title, field }) => {
                  const isActive = sortField === field;
                  return (
                    <th
                      key={field}
                      className={styles.ta}
                      onClick={() => handleSort(field as any)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        {title}
                        <button>{isActive ? (sortOrder === "asc" ? "▲" : "▼") : "▼"}</button>
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
