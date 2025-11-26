import { useState, useMemo, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import styles from "../../../styles/logistic/logistic-order.module.css";

export default function LogisticInventory() {
    // 검색 폼
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");
    const [stockFrom, setStockFrom] = useState("");
    const [stockTo, setStockTo] = useState("");

    // 데이터/상태
    const [rows, setRows] = useState([]);
    const [origRows, setOrigRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [sortField, setSortField] = useState("sku");
    const [sortOrder, setSortOrder] = useState("asc");



    // 주문 화면과 동일한 인증 컨텍스트
    const { token } = useContext(AuthContext);

    // 쿼리 파라미터 구성
    const buildParams = useCallback(() => {
        const p = {};
        if (sku) p.pdNum = sku;              // 서버 @RequestParam 이름에 맞춤
        if (name) p.pdProducts = name;
        if (priceFrom) p.priceFrom = priceFrom;
        if (priceTo) p.priceTo = priceTo;
        if (stockFrom) p.stockFrom = stockFrom;
        if (stockTo) p.stockTo = stockTo;

        return p;
    }, [sku, name, priceFrom, priceTo, stockFrom, stockTo]);

    // 호출 (엔드포인트 하나로 고정)
    const fetchRows = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            setErr("");

            const res = await axios.get("/api/logisticproducts/mine", {
                params: buildParams(),
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                // 세션-쿠키 방식이면 주석 해제:
                // withCredentials: true,
            });

            // 응답 포맷 유연 파싱
            const raw = res.data;
            const list = raw?.data ?? raw?.content ?? (Array.isArray(raw) ? raw : []);
            if (!Array.isArray(list)) throw new Error("재고 데이터를 불러오지 못했습니다.");

            // 필드 매핑(둘 다 커버: lp*/pd*)
            const mapped = list.map((r, i) => ({
                id:    r.lpKey ?? r.pdKey ?? r.id ?? i + 1,
                type:  r.lpType ?? r.pdCategory ?? "미등록",
                sku:   r.pdNum ?? r.sku ?? "",
                name:  r.pdProducts ?? r.productName ?? "",
                price: Number(r.lpPrice ?? r.pdPrice ?? r.price ?? 0),
                stock: Number(r.lpStock ?? r.pdStock ?? r.stock ?? 0),
            }));

             setOrigRows(mapped);   // ★ 원본 저장
             setRows(mapped)
        } catch (e) {
            const code = e?.response?.status;
            setErr(`Request failed with status code ${code ?? "???"}`);
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [buildParams, token]);
    // 숫자 범위 판정
    const toNum = (v) => (v === "" || v == null ? null : Number(v));
    const inRangeNum = (target, start, end) => {
        const T = toNum(target);
        if (T == null || Number.isNaN(T)) return false;
        const S = toNum(start);
        const E = toNum(end);
        if (S != null && T < S) return false;
        if (E != null && T > E) return false;
        return true;
    };
    const like = (v, q) => !q || String(v ?? "").toLowerCase().includes(String(q).toLowerCase());

    const Filter = () => {
        setRows(origRows);
        // origRows 기준으로 필터
        const filtered = origRows.filter((r) => {
            if (!like(r.sku,  sku))  return false;
            if (!like(r.name, name)) return false;

            if (priceFrom !== "" || priceTo !== "") {
                if (!inRangeNum(r.price, priceFrom, priceTo)) return false;
            }
            if (stockFrom !== "" || stockTo !== "") {
                if (!inRangeNum(r.stock, stockFrom, stockTo)) return false;
            }
            return true;
        });
        setRows(filtered);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") Filter(); // ★ fetchRows() → Filter() 로 변경
    };

    const handleSearch = () => Filter(); // ★ 동일

    const resetFilter = () => {
        setSku("");
        setName("");
        setPriceFrom("");
        setPriceTo("");
        setStockFrom("");
        setStockTo("");
        setRows(origRows); // ★ 원본 복원
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

    // 최초 로드
    useEffect(() => {
        if (!token) return;        // 토큰 없으면 호출하지 않음
        fetchRows();
    }, [token, fetchRows]);


    const data = useMemo(() => {
           const sorted = [...rows];
           sorted.sort((a, b) => {
                const A = a[sortField];
                const B = b[sortField];
                 if (A == null || B == null) return 0;
                 const numericFields = ["price", "stock"];
                 if (numericFields.includes(sortField)) {
                      return sortOrder === "asc" ? (A - B) : (B - A);
                     }
                 // 문자열 비교 (sku, name, type)
                     return sortOrder === "asc"
                   ? String(A).localeCompare(String(B))
                       : String(B).localeCompare(String(A));
               });
           return sorted;
         }, [rows, sortField, sortOrder]);

    if (loading) return <div className={styles.page}>불러오는 중…</div>;
    if (err) return <div className={styles.page}>에러: {err}</div>;





    return (
        // 진경 클래스 추가
        <div className={styles.page}>
            <h2 className={styles.title}>재고 현황</h2>

            {/* 검색 조건 */}
            <div className={styles.formScroll}>
                <div className={styles.formInner}>
            <div className={styles.form}>
                <div className={styles.row}>
                    <div className={styles.field} >
                        <label>품번</label>
                        <div className={styles.inline}>
                            <input value={sku} onChange={(e) => setSku(e.target.value)} onKeyDown={handleKeyDown} />
                            <button className={styles.btnDark} onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>제품명</label>
                        <div className={styles.inline}>
                            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} />
                            <button className={styles.btnDark} onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>가격범위</label>
                        <div className={styles.inline}>
                            <input className={styles.smallInput} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} onKeyDown={handleKeyDown} />
                            <span className={styles.tilde}>~</span>
                            <input className={styles.smallInput} value={priceTo} onChange={(e) => setPriceTo(e.target.value)} onKeyDown={handleKeyDown} />
                            <button className={styles.btnDark} onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>재고범위</label>
                        <div className={styles.inline}>
                            <input className={styles.smallInput} value={stockFrom} onChange={(e) => setStockFrom(e.target.value)} onKeyDown={handleKeyDown} />
                            <span className={styles.tilde}>~</span>
                            <input className={styles.smallInput} value={stockTo} onChange={(e) => setStockTo(e.target.value)} onKeyDown={handleKeyDown} />
                            <button className={styles.btnDark} onClick={handleSearch}>검색</button>
                            <button className={styles.btnDark} onClick={resetFilter} style={{marginLeft:8}}>초기화</button>
                        </div>
                    </div>
                </div>
            </div>
                </div>
            </div>

            {/* 테이블 */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        {/* 진경 <button> 추가 */}
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
                        {/* //진경 <button> 추가 */}
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
                            {/*진경 수정*/}
                            <td colSpan={5} >데이터가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
