import {useContext, useEffect, useMemo, useState} from "react";
import styles from "./Logistic_Order.module.css";
import style from "./Logistic_MenuBox.module.css";
import axios from "axios";

// 정환 추가
import { AuthContext } from "../../context/AuthContext.tsx";
// 정환 추가

export default function Logistic_Orders() {
    // 정환 추가
    const { token } = useContext(AuthContext);
    // 정환 추가

    const [isOpen, setIsOpen] = useState(false);
    const [sheet, setSheet]   = useState(null);

    const [allOrders, setAllOrders] = useState([]);
    const [orders, setOrders] = useState([]);

    const [products,   setProducts]   = useState([]);
    const [agencies,   setAgencies]   = useState([]);
    const [deliveries, setDeliveries] = useState([]);

    const [sortField, setSortField] = useState("orDate");
    const [sortOrder, setSortOrder] = useState("desc");

    const [agencyorderForm, setAgencyorderForm] = useState({
        orKey: "",
        orStatus: "",
        orProducts:"",
        orQuantity:"",
        orTotal:"",
        orPrice: "",
        orDate:"",
        orReserve: "",
        orGu: "",
        agName: "",
        pdProducts:"",
        dvName: "",
        pdNum:"",

        // 검색용 //
        orDateStart: "",   // 주문일 시작
        orDateEnd: "",     // 주문일 끝
        reserveStart: "",  // 배송예정일 시작
        reserveEnd: "",

        orTotalStart: "",
        orTotalEnd: "",
        orQuantityStart: "",
        orQuantityEnd: "",
    })


    const onAgencyOrderChange = (e) => {
        const { name, value, type } = e.target;
        setAgencyorderForm((f) => ({
            ...f,
            [name]: type ==="number" && value !== "" ? Number(value) : value,
        }));
    };

    const openOrderPopup = (row) => {
        const url = `${window.location.origin}/order-detail/${row.orKey}`;
        window.open(
            url,
            "order-detail-popup",
            "width=1400,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
        );
    };

    useEffect(() => {

        if (!token) return; // 토큰 준비 전엔 호출 안 함

        // ✅ 공통 헤더 객체
        const auth = { headers: { Authorization: `Bearer ${token}` } };
        // 주문 목록
        axios.get("/api/agencyorder/full/mine", { headers: { Authorization: `Bearer ${token}` } // 정환추가

        })
            .then(res => {
                const raw = (res.data?.data ?? res.data ?? []);
                const list = raw.map(o => {
                    const items = o.items ?? o.orderItems ?? [];

                    const names = items
                        .map(i => i.name ?? i.oiProducts ?? i.product?.pdProducts)
                        .filter(Boolean);


                    const qtyFromItems = items.reduce((sum, i) =>
                        sum + (Number(i.quantity ?? i.oiQuantity ?? i.qty ?? 0) || 0), 0);

                    return {
                        ...o,
                        // ↓ DB/백엔드가 snake_case여도 안전하게 읽도록 fallback
                        orProducts: (o.orProducts ?? o.or_products) || names.join(", "),
                        orQuantity: (o.orQuantity ?? o.or_quantity) || qtyFromItems
                    };
                });
                     setAllOrders(list);
                     setOrders(list);
            })
            .catch(err => console.error("AgencyOrders error:", err));

        axios.get("/api/products").then(res => setProducts(res.data   ?? []));
          axios.get("/api/agencies").then(res => setAgencies(res.data   ?? []));
          axios.get("/api/deliveries").then(res => setDeliveries(res.data ?? []));
        }, [token]);

    const toDate = (v, asEnd = false) => {
        if (!v) return null;
        const s = String(v).slice(0, 10);
        const t = `${s}T${asEnd ? "23:59:59" : "00:00:00"}`;
        const d = new Date(t);
        return isNaN(d) ? null : d;
    };
    const inRange = (target, start, end) => {
        const T = toDate(target);
        if (!T) return false;
        const S = toDate(start);
        const E = toDate(end, true);
        if (S && T < S) return false;
        if (E && T > E) return false;
        return true;
    };

    const toNum = (v) => (v === "" || v == null ? null : Number(v));

    const inRangeNum = (target, start, end) => {
        const T = toNum(target);
        if(Number.isNaN(T)) return false;
        const S = toNum(start);
        const E = toNum(end);
        if( S != null && T < S ) return false;
        if (E != null && T > E ) return false;
        return true
    }

    const Filter = () => {
        const f = agencyorderForm;
        const like = (v, q) => !q || String(v ?? "").toLowerCase().includes(String(q).toLowerCase());


        const filtered = allOrders.filter((o) => {
            if (f.orDateStart || f.orDateEnd) {
                if (!inRange(o.orDate, f.orDateStart, f.orDateEnd)) return false;
            }

            // ✅ 도착예정일 범위 (reserveStart ~ reserveEnd) → o.orReserve 기준
            if (f.reserveStart || f.reserveEnd) {
                if (!inRange(o.orReserve, f.reserveStart, f.reserveEnd)) return false;
            }

            if(f.orTotalStart !== "" || f.orTotalEnd !== "") {
                if(!inRangeNum(o.orTotal, f.orTotalStart, f.orTotalEnd)) return false;
            }

            if(f.orQuantityStart !== "" || f.orQuantityEnd !== "") {
                if(!inRangeNum(o.orQuantity, f.orQuantityStart, f.orQuantityEnd)) return false;
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
        setOrders(filtered);
    };

    const handleSort = (field) => {
        const next = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(next);
    };

    const getSortArrow = (field) => {
        if (sortField === field) return sortOrder === "asc" ? "▲" : "▼";
        return "▼"; // 기본 표시
    };

    const rows = useMemo(() => {
        const read = (o, f) => {
            // 주문번호 컬럼은 orderNumber 없으면 orKey로 대체
            if (f === "orderNumber") return o.orderNumber ?? o.orKey;
            return o[f];
        };

        const isNumber = (f) => ["orTotal", "orQuantity", "orPrice", "orKey"].includes(f);
        const isDate   = (f) => ["orDate", "orReserve"].includes(f);

        const cmp = (a, b) => {
            const A = read(a, sortField);
            const B = read(b, sortField);

            if (A == null && B == null) return 0;
            if (A == null) return 1;
            if (B == null) return -1;

            if (isNumber(sortField)) {
                return sortOrder === "asc" ? (A - B) : (B - A);
            }
            if (isDate(sortField)) {
                const da = new Date(String(A));
                const db = new Date(String(B));
                return sortOrder === "asc" ? (da - db) : (db - da);
            }
            // 문자열 비교
            return sortOrder === "asc"
                ? String(A).localeCompare(String(B))
                : String(B).localeCompare(String(A));
        };

        return [...orders].sort(cmp);
    }, [orders, sortField, sortOrder]);

    const resetFilter = () => {
        setAgencyorderForm({
            orStatus: "",
            orProducts: "",
            orGu: "",
            agName: "",
            orDate: "",
            orReserve: "",
            orQuantity: "",
            orKey: "",
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

        });
        setOrders(allOrders);


    };

    return (
        // 진경 클래스 추가
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
                            <input type="date" name="orDateStart" value={agencyorderForm.orDateStart} onChange={onAgencyOrderChange}/>
                            <span className={styles.tilde}>~</span>
                            <input type="date" name="orDateEnd"   value={agencyorderForm.orDateEnd}   onChange={onAgencyOrderChange}/>
                        </div>
                    </div>

                    {/* 도착예정일 */}
                    <div className={styles.field}>
                        <label>배송예정일</label>
                        <div className={styles.inline}>
                            <input type="date" name="reserveStart" value={agencyorderForm.reserveStart} onChange={onAgencyOrderChange}/>
                            <span className={styles.tilde}>~</span>
                            <input type="date" name="reserveEnd"   value={agencyorderForm.reserveEnd}   onChange={onAgencyOrderChange}/>
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
                            <input type="text" name="agName" value={agencyorderForm.agName} onChange={onAgencyOrderChange} placeholder="대리점"/>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>제품명</label>
                        <div className={styles.inline}>
                            <input name="orProducts" value={agencyorderForm.orProducts} onChange={onAgencyOrderChange} placeholder="제품명 일부"/>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>수량</label>
                        <div className={styles.inline}>
                            <div className={styles.inline}>
                                <input type="number" name="orQuantityStart" value={agencyorderForm.orQuantityStart} onChange={onAgencyOrderChange}/>
                                <span className={styles.tilde}>~</span>
                                <input type="number" name="orQuantityEnd"   value={agencyorderForm.orQuantityEnd}   onChange={onAgencyOrderChange}/>
                            </div>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>총액</label>
                        <div className={styles.inline}>
                            <div className={styles.inline}>
                                <input type="number" name="orTotalStart" value={agencyorderForm.orTotalStart} onChange={onAgencyOrderChange}/>
                                <span className={styles.tilde}>~</span>
                                <input type="number" name="orTotalEnd"   value={agencyorderForm.orTotalEnd}   onChange={onAgencyOrderChange}/>
                            </div>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>주문번호</label>
                        <div className={styles.inline}>
                            <input name="orderNumber"  value={agencyorderForm.orderNumber} onChange={onAgencyOrderChange}/>
                        </div>
                    </div>
                    <div className={styles.field} style={{ alignItems: "flex-end" }}>
                        <button className={styles.btnDark} onClick={Filter}>검색</button>
                        <button className={styles.btnDark} onClick={resetFilter} style={{marginLeft:8}}>초기화</button>
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
                            <button onClick={() => handleSort("agName")}>{getSortArrow("agName")}</button>
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
                                <td>{r.agName}</td>
                                <td>{r.orStatus}</td>
                                <td className={styles.left}>{r.orProducts}</td>
                                <td>{r.orQuantity}</td>
                                <td className={styles.right}>{typeof r.orTotal === "number" ? r.orTotal.toLocaleString() : r.orTotal}</td>
                                <td>{r.orDate}</td>
                                <td>{r.orReserve}</td>
                                <td>{r.dvName}</td>
                                {/*상세보기로 수정 : 진경*/}
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
                                    <span>대리점: {sheet.agName}</span>
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