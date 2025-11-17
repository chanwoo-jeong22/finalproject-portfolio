import { useMemo, useState, useRef, useEffect } from "react";
import styles from "./Inventory.module.css";

export default function Inbound() {
    /* ──────────────────────────────
     *  주문추가(카탈로그) 섹션
     * ────────────────────────────── */
    const [skuQuery, setSkuQuery] = useState("");
    const [nameQuery, setNameQuery] = useState("");

    const [catalog, setCatalog] = useState([
        { id: 1, sku: "A-100", name: "제품 A", price: 12000, checked: false, inputQty: 0 },
        { id: 2, sku: "B-200", name: "제품 B", price: 8000,  checked: false, inputQty: 0 },
        { id: 3, sku: "C-300", name: "제품 C", price: 15000, checked: false, inputQty: 0 },
        { id: 4, sku: "D-400", name: "제품 D", price: 5000,  checked: false, inputQty: 0 },
        { id: 5, sku: "E-500", name: "제품 E", price: 30000, checked: false, inputQty: 0 },
        { id: 6, sku: "F-600", name: "제품 F", price: 9000,  checked: false, inputQty: 0 },
        { id: 7, sku: "G-700", name: "제품 G", price: 11000, checked: false, inputQty: 0 },
    ]);

    // 상단(주문추가) 실시간 필터
    const filteredCatalog = useMemo(() => {
        const s = skuQuery.trim();
        const n = nameQuery.trim();
        return catalog.filter((r) => {
            if (s && !r.sku.includes(s)) return false;
            if (n && !r.name.includes(n)) return false;
            return true;
        });
    }, [catalog, skuQuery, nameQuery]);

    // 체크박스 쪽
    const toggleCatalogAll = (checked) =>
        setCatalog((prev) =>
            prev.map((r) => ({ ...r, checked, inputQty: checked ? r.inputQty : 0 })),
        );

    const toggleCatalogOne = (id, checked) =>
        setCatalog((prev) =>
            prev.map((r) => (r.id === id ? { ...r, checked, inputQty: checked ? r.inputQty : 0 } : r)),
        );

    const changeCatalogQty = (id, value) => {
        const num = Number(String(value).replace(/[^0-9]/g, "")) || 0;
        setCatalog((prev) => prev.map((r) => (r.id === id ? { ...r, inputQty: num } : r)));
    };

    const resetTopFilters = () => {
        setSkuQuery("");
        setNameQuery("");
    };

// 하단(입고 주문) 검색 초기화
    const resetBottomFilters = () => {
        setInSkuQuery("");
        setInNameQuery("");
    };

    /* ──────────────────────────────
     *  입고 주문(선택 결과) 섹션
     * ────────────────────────────── */
    const [inbounds, setInbounds] = useState([]); // {sku, name, price, qty}

    // 하단(입고 주문) 검색 상태(실시간)
    const [inSkuQuery, setInSkuQuery] = useState("");
    const [inNameQuery, setInNameQuery] = useState("");

    // +추가: 체크 && inputQty > 0 행을 하단으로 누적
    const addSelected = () => {
        const pick = catalog.filter((r) => r.checked && r.inputQty > 0);
        if (pick.length === 0) {
            alert("추가할 품목을 선택하고 수량을 입력해 주세요.");
            return;
        }
        setInbounds((prev) => {
            const map = new Map(prev.map((x) => [x.sku, { ...x }]));
            pick.forEach((p) => {
                const ex = map.get(p.sku);
                if (ex) {
                    ex.qty += p.inputQty;
                    map.set(p.sku, ex);
                } else {
                    map.set(p.sku, { sku: p.sku, name: p.name, price: p.price, qty: p.inputQty });
                }
            });
            return Array.from(map.values());
        });
        // 선택 품목만 체크 해제 & 수량 초기화
        setCatalog((prev) =>
            prev.map((r) => (r.checked ? { ...r, checked: false, inputQty: 0 } : r)),
        );
        resetTopFilters();
    };

    const removeInboundRow = (sku) =>
        setInbounds((prev) => prev.filter((r) => r.sku !== sku));

    // 입고 등록 → 하단 테이블 비움
    const handleInboundRegister = () => {
        if (inbounds.length === 0) {
            alert("입고할 품목이 없습니다.");
            return;
        }
        console.log("[입고 등록 요청] payload:", inbounds);
        setInbounds([]); // 화면 비우기
        alert("입고 등록 처리(예시). 목록을 초기화했습니다.");
        resetBottomFilters();
    };

    // 하단(입고 주문) 실시간 필터
    const filteredInbounds = useMemo(() => {
        const s = inSkuQuery.trim();
        const n = inNameQuery.trim();
        return inbounds.filter((r) => {
            if (s && !r.sku.includes(s)) return false;
            if (n && !r.name.includes(n)) return false;
            return true;
        });
    }, [inbounds, inSkuQuery, inNameQuery]);


    const allChecked = useMemo(
        () => catalog.length > 0 && catalog.every(r => r.checked), [catalog]);
    const someChecked = useMemo(() => catalog.some(r => r.checked), [catalog]);

    const headerChkRef = useRef(null);
    useEffect(() => {
        if (headerChkRef.current) {
            headerChkRef.current.indeterminate = !allChecked && someChecked;
        }
    }, [allChecked, someChecked]);
    return (
        <div className={styles.page}>
            {/* ───────── 상단: 주문추가 ───────── */}
            <h2 className={styles.title}>주문추가</h2>

            {/* 상단 검색 + +추가 */}
            <div className={styles.form}>
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label>품번</label>
                        <div className={styles.inline}>
                            <input
                                value={skuQuery}
                                onChange={(e) => setSkuQuery(e.target.value)}
                                placeholder="예: A-100"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>제품명</label>
                        <div className={styles.inline}>
                            <input
                                value={nameQuery}
                                onChange={(e) => setNameQuery(e.target.value)}
                                placeholder="예: 제품 A"
                            />
                        </div>
                    </div>

                    <div className={styles.actionBar}>
                        <button className={styles.actionBtn} onClick={addSelected}>
                            +추가
                        </button>
                    </div>
                </div>
            </div>

            {/* 주문추가 테이블(카탈로그) */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th style={{ width: 40 }}>
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={(e) => toggleCatalogAll(e.target.checked)}
                            />
                        </th>
                        <th>품번</th>
                        <th>제품명</th>
                        <th className={styles.right}>단가</th>
                        <th className={styles.right} >
                            수량
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredCatalog.length ? (
                        filteredCatalog.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!r.checked}
                                        onChange={(e) => toggleCatalogOne(r.id, e.target.checked)}
                                    />
                                </td>
                                <td>{r.sku}</td>
                                <td>{r.name}</td>
                                <td className={styles.right}>{r.price.toLocaleString()}</td>
                                <td className={styles.right}>
                                    <input
                                        className={`${styles.cellInput} ${styles.cellInputRight}`}
                                        value={r.inputQty}
                                        onChange={(e) => changeCatalogQty(r.id, e.target.value)}
                                        inputMode="numeric"
                                        placeholder="0"
                                        disabled={!r.checked}   /* 체크된 경우만 입력 가능 */
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className={styles.empty}>
                                검색 결과가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* ───────── 하단: 입고 주문 ───────── */}
            <h2 className={styles.title} style={{ marginTop: 48 }}>
                입고 주문
            </h2>

            {/* 하단 검색(좌측) + 입고 등록(우측) */}
            <div className={styles.form}>
                <div className={styles.row}>
                    {/* 좌측 검색 필드 */}
                    <div className={styles.field}>
                        <label>품번</label>
                        <div className={styles.inline}>
                            <input
                                value={inSkuQuery}
                                onChange={(e) => setInSkuQuery(e.target.value)}
                                placeholder="예: A-100"
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>제품명</label>
                        <div className={styles.inline}>
                            <input
                                value={inNameQuery}
                                onChange={(e) => setInNameQuery(e.target.value)}
                                placeholder="예: 제품 A"
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label style={{ visibility: "hidden" }}>reset</label>
                    </div>

                    {/* 우측 입고 등록 버튼 */}
                    <div className={styles.actionBar}>
                        <button className={styles.actionBtn} onClick={handleInboundRegister}>
                            입고<br/> 등록
                        </button>
                    </div>
                </div>
            </div>

            {/* 입고 주문 테이블 */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>품번</th>
                        <th>제품명</th>
                        <th className={styles.right}>수량</th>   {/* 텍스트 표시(수정불가) */}
                        <th className={styles.right}>단가</th>
                        <th className={styles.right}>총액</th>
                        <th style={{ width: 72 }}>삭제</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredInbounds.length > 0 && (
                        filteredInbounds.map((r) => {
                            const total = (r.qty || 0) * (r.price || 0);
                            return (
                                <tr key={r.sku}>
                                    <td>{r.sku}</td>
                                    <td>{r.name}</td>
                                    <td className={styles.right}>{r.qty.toLocaleString()}</td>
                                    <td className={styles.right}>{r.price.toLocaleString()}</td>
                                    <td className={styles.right}>{total.toLocaleString()}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <button className={styles.viewBtn} onClick={() => removeInboundRow(r.sku)}>
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
