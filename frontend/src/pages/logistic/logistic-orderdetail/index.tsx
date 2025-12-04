import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchOrderDetail,
  setDriverName,
  startDelivery,
} from "../../../redux/slices/logistic/orderdetail-slice";
import styles from "../../../styles/logistic/logistic-order-detail.module.css";

export default function LogisticOrderDetail() {
  const { orKey } = useParams<{ orKey: string }>();
  const dispatch = useAppDispatch();

  const {
    header,
    items,
    drivers,
    driverName,
    driverPhone,
    driverCar,
    loading,
    error,
  } = useAppSelector((state) => state.orderdetail);

  // 상세 조회
  useEffect(() => {
    if (orKey) {
      dispatch(fetchOrderDetail(orKey));
    }
  }, [dispatch, orKey]);

  const isCompleted = ["배송중", "배송완료"].includes(header?.orStatus ?? "");

  // 기사 선택
  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setDriverName(e.target.value));
  };

  // 상태 변경 + 기사 저장
  const handleStartDelivery = () => {
  if (!header) return; 


    if (!driverName) {
      alert("운전기사를 선택해주세요.");
      return;
    }

    const sel = drivers.find((d) => d.name === driverName);
    if (!sel) {
      alert("선택된 운전기사를 찾을 수 없습니다.");
      return;
    }

    dispatch(
      startDelivery({
        orKey: header.orKey,
        driverId: sel.id,
        driverName: sel.name,
      })
    )
      .unwrap()
      .then(() => {
        alert("출고가 시작되었습니다. (배송중)");
      })
      .catch((err) => {
        console.error(err);
        alert("출고 처리에 실패했습니다.");
      });
  };


  // 로딩 표시
  if (loading) {
    return (
      <div className={styles.fixedRoot}>
        <div className={styles.content}>불러오는 중…</div>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className={styles.fixedRoot}>
        <div className={styles.content}>에러: {error}</div>
      </div>
    );
  }

  if (!header) {
    return (
      <div className={styles.fixedRoot}>
        <div className={styles.content}>데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.fixedRoot}>
      <div className={styles.content}>
        <h2 className={styles.title}>주문 관리 (출고)</h2>

        {/* 상단 */}
        <div className={styles.headerGridWrap}>
          <div className={styles.headerGrid}>
            {/* 1행 */}
            <label className={`${styles.label} ${styles.labelOrderDate}`}>주문일</label>
            <input className={styles.input} type="text" value={header.orDate} disabled />

            <label className={`${styles.label} ${styles.labelShipDate}`}>출고날짜</label>
            <input className={styles.input} type="text" value={header.orReserve} disabled />

            {/* 출고 버튼 */}
            <div className={styles.kingBtns}>
              <button
                className={`${styles.king} ${styles.black}`}
                disabled={isCompleted}
                onClick={handleStartDelivery}
              >
                출고
                <br />
                등록
              </button>

            </div>

            {/* 2행 */}
            <label className={styles.label}>대리점</label>
            <input className={styles.input} type="text" value={header.agName} disabled />

            <label className={styles.label}>전화번호</label>
            <input className={styles.input} type="text" value={header.agPhone} disabled />

            {/* 3행: 기사 */}
            <label className={styles.label}>운전기사</label>
            <select
              className={styles.selectDriver}
              value={driverName}
              disabled={isCompleted}
              onChange={handleDriverChange}
            >
              <option value="">-- 운전기사 선택 --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.name} disabled={!d.delivery}>
                  {d.delivery
                    ? `🟢 ${d.name} (${d.car})`
                    : `🔴 ${d.name} (${d.car})`}
                </option>
              ))}
            </select>

            <label className={styles.label}>기사 전화</label>
            <input className={styles.input} type="text" value={driverPhone} disabled />

            <div className={styles.driverCarGroup}>
              <label className={styles.inlineLabel}>차량번호</label>
              <input className={styles.inlineInput} type="text" value={driverCar} disabled />
            </div>

            {/* 4행 */}
            <label className={styles.label}>지역</label>
            <input
              className={`${styles.input} ${styles.wide}`}
              type="text"
              value={header.agAddress}
              disabled
            />
          </div>
        </div>

        {/* 상품 테이블 */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>품번</th>
                <th>제품명</th>
                <th className={styles.right}>수량</th>
                <th className={styles.right}>단가</th>
                <th className={styles.right}>총액</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.pdNum}</td>
                    <td>{r.oiProducts}</td>
                    <td className={styles.right}>{r.oiQuantity.toLocaleString()}</td>
                    <td className={styles.right}>{r.oiPrice.toLocaleString()}</td>
                    <td className={styles.right}>{r.oiTotal.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.right}>
                    품목이 없습니다.
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
