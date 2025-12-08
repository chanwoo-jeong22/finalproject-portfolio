import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../api/api";
import styles from "../../../styles/logistic/logistic-order.module.css";
import { RootState } from "../../../redux/store";
import {
  setAllOrders,
  setOrders,
  setProducts,
  setAgencies,
  setDeliveries,
  setAgencyorderForm,
  setSortField,
  setSortOrder,
  setIsOpen,
} from "../../../redux/slices/logistic/orderfulfillment-slice";
import { AgencyOrder } from "../../../types/entity";

export default function OrderfulFillment() {
  const dispatch = useDispatch();

  // Redux 상태 값 가져오기
  const isOpen = useSelector((state: RootState) => state.orderfulfillment.isOpen);
  const token = useSelector((state: RootState) => state.auth.token);
  const sheet = useSelector((state: RootState) => state.orderfulfillment.sheet);
  const allOrders = useSelector((state: RootState) => state.orderfulfillment.allOrders);
  const orders = useSelector((state: RootState) => state.orderfulfillment.orders);
  const agencyorderForm = useSelector((state: RootState) => state.orderfulfillment.agencyorderForm);
  const sortField = useSelector((state: RootState) => state.orderfulfillment.sortField);
  const sortOrder = useSelector((state: RootState) => state.orderfulfillment.sortOrder);
  
  const [names , setNames] = useState<string[]>([]);

  // -------------------------------------
  // 주문 데이터 fetch 및 Redux 상태에 저장
  // -------------------------------------
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const ordersRes = await api.get("/agencyorder/full/mine", {
          params: {
            status: ["배송 준비중", "배송중", "배송완료"],
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 서버 응답에서 주문 데이터 추출 (data가 있거나 바로 data인 경우 모두 처리)
        const rawOrders: AgencyOrder[] = ordersRes.data?.data ?? ordersRes.data ?? [];

        // 주문 아이템의 상품명과 수량 계산하여 보완
        const list = rawOrders.map((o) => {
          setNames(prevName => [...prevName, o.orProducts])

          return {
            ...o,
            orProducts: o.orProducts ?? names.join(", "),
            orQuantity: o.orQuantity,
          };
        });

        dispatch(setAllOrders(list));
        dispatch(setOrders(list));
      } catch (err) {
        console.error("OrderfulFillment fetch error:", err);
      }
    };

    fetchData();
  }, [token, dispatch]);

  // -------------------------------------
  // input, select 등 폼 변경 처리 함수
  // -------------------------------------
  const onAgencyOrderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    dispatch(
      setAgencyorderForm({
        ...agencyorderForm,
        // type이 number면 숫자로 변환, 아니면 문자열 유지
        [name]: type === "number" && value !== "" ? Number(value) : value,
      })
    );
  };

  // -------------------------------------
  // 주문 상세 팝업 열기 함수
  // -------------------------------------
  const openOrderPopup = (row: AgencyOrder) => {
    console.log("팝업 열기 - orKey:", row.orKey);
    if (!row.orKey) {
      alert("주문 키(orKey)가 없습니다!");
      return;
    }
    const token = localStorage.getItem("token");
    const url = `${window.location.origin}/logistic-orderdetail/${row.orKey}?token=${encodeURIComponent(token ?? "")}`;
    window.open(
      url,
      "order-detail-popup",
      "width=1400,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
    );
  };

  // -------------------------------------
  // 문자열 날짜를 Date 객체로 변환
  // asEnd가 true면 23:59:59 시각으로 변환
  // 변환 실패 시 null 반환
  // -------------------------------------
  const toDate = (v: string | null | undefined, asEnd = false): Date | null => {
    if (!v) return null;
    const s = String(v).slice(0, 10);
    const t = `${s}T${asEnd ? "23:59:59" : "00:00:00"}`;
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  };

  // -------------------------------------
  // target 날짜가 start~end 사이인지 체크
  // -------------------------------------
  const inRange = (target: string, start?: string, end?: string): boolean => {
    const T = toDate(target);
    if (!T) return false;
    const S = toDate(start);
    const E = toDate(end, true);
    if (S && T < S) return false;
    if (E && T > E) return false;
    return true;
  };

  // -------------------------------------
  // 숫자 변환: 빈 문자열, null, undefined면 null 반환
  // -------------------------------------
  const toNum = (v: string | number | null | undefined): number | null =>
    v === "" || v == null ? null : Number(v);

  // -------------------------------------
  // 숫자 범위 체크: target이 start~end 범위 내에 있는지 확인
  // -------------------------------------
  const inRangeNum = (
    target: string | number,
    start?: string | number,
    end?: string | number
  ): boolean => {
    const T = toNum(target);
    if (T === null || Number.isNaN(T)) return false;
    const S = toNum(start);
    const E = toNum(end);
    if (S != null && T < S) return false;
    if (E != null && T > E) return false;
    return true;
  };

  // -------------------------------------
  // 필터링 함수: form 상태에 따라 주문 목록 필터링 후 상태 저장
  // -------------------------------------
  const Filter = () => {
    const f = agencyorderForm;

    // 문자열 포함 여부 검사 함수 (q가 없으면 항상 true)
    const like = (v: string | number | null | undefined, q: string | number | null | undefined): boolean =>
      !q || String(v ?? "").toLowerCase().includes(String(q).toLowerCase());

    const filtered = allOrders.filter((o) => {
      if (f.orDateStart || f.orDateEnd) {
        if (!inRange(o.orDate, f.orDateStart, f.orDateEnd)) return false;
      }

      if (f.reserveStart || f.reserveEnd) {
        if (!inRange(o.orReserve, f.reserveStart, f.reserveEnd)) return false;
      }

      if (f.orTotalStart !== "" || f.orTotalEnd !== "") {
        if (!inRangeNum(o.orTotal, f.orTotalStart, f.orTotalEnd)) return false;
      }

      if (f.orQuantityStart !== "" || f.orQuantityEnd !== "") {
        if (!inRangeNum(o.orQuantity, f.orQuantityStart, f.orQuantityEnd)) return false;
      }

      if (!like(o.orProducts, f.orProducts)) return false;
      if (!like(o.orGu, f.orGu)) return false;

      if (f.orderNumber !== "" && f.orderNumber != null) {
        const q = String(f.orderNumber).trim().toLowerCase();
        const src = String(o.orderNumber ?? "").toLowerCase();
        if (!src.includes(q)) return false;
      }

      if (!like(o.orStatus, f.orStatus)) return false;

      return true;
    });

    dispatch(setOrders(filtered));
  };

  // -------------------------------------
  // 정렬 필드 변경 및 방향 토글 함수
  // -------------------------------------
  const handleSort = (field: keyof AgencyOrder) => {
    const next = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSortField(field));
    dispatch(setSortOrder(next));
  };

  // -------------------------------------
  // 정렬 아이콘 표시 함수 (현재 정렬 필드 기준)
  // -------------------------------------
  const getSortArrow = (field: keyof AgencyOrder): string => {
    if (sortField === field) return sortOrder === "asc" ? "▲" : "▼";
    return "▼";
  };

  // -------------------------------------
  // 정렬된 주문 목록 계산
  // useMemo로 의존값 변경 시 재계산 최적화
  // -------------------------------------
  const rows = useMemo(() => {
    // 특정 필드 값 읽기 (orderNumber는 orKey 대체 가능)
    const read = (
      o: AgencyOrder,
      f: keyof AgencyOrder | "orderNumber"
    ): string | number | undefined => {
      if (f === "orderNumber") return o.orderNumber ?? o.orKey;
      return o[f] as string | number | undefined;
    };

    // 숫자 필드 판별
    const isNumber = (f: keyof AgencyOrder): boolean => {
      const numberFields = new Set(["orTotal", "orQuantity", "orPrice", "orKey"]);
      return numberFields.has(f as string);
    };

    // 날짜 필드 판별
    const isDate = (f: keyof AgencyOrder): boolean => {
      const dateFields = new Set(["orDate", "orReserve"]);
      return dateFields.has(f as string);
    };

    // 비교 함수 (정렬 기준에 따라 다르게 비교)
    const cmp = (a: AgencyOrder, b: AgencyOrder): number => {
      const A = read(a, sortField);
      const B = read(b, sortField);

      if (A == null && B == null) return 0;
      if (A == null) return 1;
      if (B == null) return -1;

      if (isNumber(sortField)) {
        return sortOrder === "asc"
          ? (A as number) - (B as number)
          : (B as number) - (A as number);
      }
      if (isDate(sortField)) {
        const da = new Date(String(A));
        const db = new Date(String(B));
        return sortOrder === "asc"
          ? da.getTime() - db.getTime()
          : db.getTime() - da.getTime();
      }

      return sortOrder === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    };

    return [...orders].sort(cmp);
  }, [orders, sortField, sortOrder]);


  // 필터 리셋
  const resetFilter = () => {
    dispatch(
      setAgencyorderForm({
        orKey: "",
        orStatus: "",
        orProducts: "",
        orQuantity: "",
        orTotal: "",
        orPrice: "",
        orDate: "",
        orReserve: "",
        orGu: "",
        agName: "",
        pdProducts: "",
        dvName: "",
        pdNum: "",

        orderNumber: "",

        orDateStart: "",
        orDateEnd: "",
        reserveStart: "",
        reserveEnd: "",

        orTotalStart: "",
        orTotalEnd: "",
        orQuantityStart: "",
        orQuantityEnd: "",
      })
    );

    dispatch(setOrders(allOrders));
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>주문 출고</h2>

      {/* ===== 검색 폼 ===== */}
      <div className={styles.formScroll}>
        <div className={styles.formInner}>
          <div className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>주문일</label>
                <div className={styles.inline}>
                  <input type="date" name="orDateStart" value={agencyorderForm.orDateStart} onChange={onAgencyOrderChange} />
                  <span className={styles.tilde}>~</span>
                  <input type="date" name="orDateEnd" value={agencyorderForm.orDateEnd} onChange={onAgencyOrderChange} />
                </div>
              </div>

              {/* 도착예정일 */}
              <div className={styles.field}>
                <label>배송예정일</label>
                <div className={styles.inline}>
                  <input type="date" name="reserveStart" value={agencyorderForm.reserveStart} onChange={onAgencyOrderChange} />
                  <span className={styles.tilde}>~</span>
                  <input type="date" name="reserveEnd" value={agencyorderForm.reserveEnd} onChange={onAgencyOrderChange} />
                </div>
              </div>
              <div className={styles.field}>
                <label>처리 상태</label>
                <div className={styles.inline}>
                  <select name="orStatus" value={agencyorderForm.orStatus} onChange={onAgencyOrderChange}>
                    <option value="">전체</option>
                    <option value="주문대기">주문대기</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>대리점</label>
                <div className={styles.inline}>
                  <input type="text" name="agName" value={agencyorderForm.agName} onChange={onAgencyOrderChange} placeholder="대리점" />
                </div>
              </div>
              <div className={styles.field}>
                <label>제품명</label>
                <div className={styles.inline}>
                  <input name="orProducts" value={agencyorderForm.orProducts} onChange={onAgencyOrderChange} placeholder="제품명 일부" />
                </div>
              </div>
              <div className={styles.field}>
                <label>수량</label>
                <div className={styles.inline}>
                  <div className={styles.inline}>
                    <input type="number" name="orQuantityStart" value={agencyorderForm.orQuantityStart} onChange={onAgencyOrderChange} />
                    <span className={styles.tilde}>~</span>
                    <input type="number" name="orQuantityEnd" value={agencyorderForm.orQuantityEnd} onChange={onAgencyOrderChange} />
                  </div>
                </div>
              </div>
              <div className={styles.field}>
                <label>총액</label>
                <div className={styles.inline}>
                  <div className={styles.inline}>
                    <input type="number" name="orTotalStart" value={agencyorderForm.orTotalStart} onChange={onAgencyOrderChange} />
                    <span className={styles.tilde}>~</span>
                    <input type="number" name="orTotalEnd" value={agencyorderForm.orTotalEnd} onChange={onAgencyOrderChange} />
                  </div>
                </div>
              </div>
              <div className={styles.field}>
                <label>주문번호</label>
                <div className={styles.inline}>
                  <input name="orderNumber" value={agencyorderForm.orderNumber} onChange={onAgencyOrderChange} />
                </div>
              </div>
              <div className={styles.field} style={{ alignItems: "flex-end" }}>
                <button className={styles.btnDark} onClick={Filter}>검색</button>
                <button className={styles.btnDark} onClick={resetFilter} style={{ marginLeft: 8 }}>초기화</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 결과 표 ===== */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><div><p>주문번호</p>
                <button onClick={() => handleSort("orderNumber")}>{getSortArrow("orderNumber")}</button>
              </div></th>

              <th><div><p>대리점</p>
                <button onClick={() => handleSort("orProducts")}>{getSortArrow("orProducts")}</button>
              </div></th>

              <th><div><p>처리 상태</p>
                <button onClick={() => handleSort("orStatus")}>{getSortArrow("orStatus")}</button>
              </div></th>

              <th><div><p>제품명</p>
                <button onClick={() => handleSort("orProducts")}>{getSortArrow("orProducts")}</button>
              </div></th>

              <th><div><p>수량</p>
                <button onClick={() => handleSort("orQuantity")}>{getSortArrow("orQuantity")}</button>
              </div></th>

              <th><div><p>총액</p>
                <button onClick={() => handleSort("orTotal")}>{getSortArrow("orTotal")}</button>
              </div></th>

              <th><div><p>주문일</p>
                <button onClick={() => handleSort("orDate")}>{getSortArrow("orDate")}</button>
              </div></th>

              <th><div><p>배송예정일</p>
                <button onClick={() => handleSort("orReserve")}>{getSortArrow("orReserve")}</button>
              </div></th>

              <th><div><p>배송기사</p>
                <button onClick={() => handleSort("dvName")}>{getSortArrow("dvName")}</button>
              </div></th>

              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.orKey}>
                  <td>{r.orderNumber}</td>
                  <td>{r.orProducts}</td>
                  <td>{r.orStatus}</td>
                  <td className={styles.left}>{r.orProducts}</td>
                  <td>{r.orQuantity}</td>
                  <td className={styles.right}>{typeof r.orPrice === "number" ? r.orPrice.toLocaleString() : r.orPrice}</td>
                  <td>{r.orDate}</td>
                  <td>{r.orReserve}</td>
                  <td>{r.dvName}</td>
                  {/*상세보기로 수정*/}
                  <td className={styles.viewCell}><button className={styles.viewBtn} onClick={() => openOrderPopup(r)}>상세보기</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className={styles.empty}>검색 결과가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== 주문서 모달 ===== */}
      {isOpen && sheet && (
        <div className={styles.modalBackdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>주문서 상세</div>
                <div className={styles.modalMeta}>
                  <span>주문번호: {sheet.orderNumber}</span>
                  <span>주문일: {sheet.orDate}</span>
                  <span>대리점: {sheet.orProducts}</span>
                  <span>도착예정일: {sheet.orReserve}</span>
                </div>
              </div>
              <button className={styles.modalClose} onClick={() => setIsOpen(false)}>닫기</button>
            </div>
            <div className={styles.modalBody}>
              <table className={styles.modalTable}>
                <thead>
                  <tr>
                    <th>품번</th>
                    <th>제품명</th>
                    <th>지역(구)</th>
                    <th>수량</th>
                    <th>단가</th>
                    <th>총액</th>
                    <th>상태</th>
                    <th>배송기사</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sheet.orderNumber}</td>
                    <td>{sheet.orProducts}</td>
                    <td>{sheet.orGu}</td>
                    <td>{sheet.orQuantity}</td>
                    <td className={styles.right}>{typeof sheet.orPrice === "number" ? sheet.orPrice.toLocaleString() : sheet.orPrice}</td>
                    <td className={styles.right}>{typeof sheet.orTotal === "number" ? sheet.orTotal.toLocaleString() : sheet.orTotal}</td>
                    <td>{sheet.orStatus}</td>
                    <td>{sheet.dvName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}