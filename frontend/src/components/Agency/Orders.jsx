import { useState, useEffect, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import styles from "./Orders.module.css";
import api from "../../api/api.js";

export default function Orders() {
    const navigate = useNavigate();
    const outletContext = useOutletContext();
    const { token } = useContext(AuthContext);

    const { orders, setOrders, drafts, setDrafts } = useOutletContext();

    const [isSaving, setIsSaving] = useState(false);
    const [agencyId, setAgencyId] = useState(null);
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [lineItems, setLineItems] = useState([]);
    const [selectedForAdd, setSelectedForAdd] = useState([]);
    const [registeredItems, setRegisteredItems] = useState([]);
    const [selectedRegistered, setSelectedRegistered] = useState([]);
    const [expectedDate, setExpectedDate] = useState("");
    const [selectedDelivery, setSelectedDelivery] = useState("");


    // -------------------------
    // 체크박스 토글
    // -------------------------
    const toggleSelectForAdd = (id) => {
        setSelectedForAdd(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleSelectAllForAdd = () => {
        if (selectedForAdd.length === lineItems.length) setSelectedForAdd([]);
        else setSelectedForAdd(lineItems.map(item => item.id));
    };

    // -------------------------
    // + 추가 → 주문 등록
    // -------------------------
    const handleAddToRegistered = () => {
        if (selectedForAdd.length === 0) return;
        const selectedItems = lineItems.filter(item => selectedForAdd.includes(item.id));
        const uniqueSelectedItems = selectedItems.reduce((acc, item) => {
            if (!acc.find(i => i.id === item.id)) acc.push({ ...item });
            return acc;
        }, []);
        const uniqueItemsToAdd = uniqueSelectedItems.filter(item => !registeredItems.some(ri => ri.id === item.id));
        setRegisteredItems(prev => [...prev, ...uniqueItemsToAdd]);
        setSelectedForAdd([]);
    };

    const handleRegisteredQtyChange = (id, delta) => {
        setRegisteredItems(prev =>
            prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
        );
    };

    // -------------------------
    // 임시 저장
    // -------------------------
    const handleTempSave = async () => {
        if (isSaving) return;
        setIsSaving(true);

        // ✅ selectedForAdd 기준으로 uniqueLineItems 필터링
        const itemsToSave = uniqueLineItems.filter(item => selectedForAdd.includes(item.id));
        console.log(itemsToSave)
        if (!itemsToSave.length) {
            alert("임시 저장할 품목을 선택해주세요.");
            setIsSaving(false);
            return;
        }

        try {
            const payload = itemsToSave.map(item => ({
                pdKey: item.pdKey,
                agKey: JSON.parse(localStorage.getItem("userInfo")).agKey,
                rdQuantity: item.qty,
                rdPrice: item.price,
                rdTotal: item.qty * item.price,
                rdProducts: item.name
            }))
            const res = await api.post("/agencyorder/draft", payload);
            console.log("임시 저장 성공:", res.data);

            // 🔹 새로 저장된 항목을 drafts 상태에 반영
            setDrafts(prev => [...prev, ...res.data]);

            alert("임시 저장 완료!");
            setSelectedForAdd([]); // 체크박스 초기화
        } catch (err) {
            console.error("임시 저장 실패", err);
            alert("임시 저장 중 오류 발생: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // -------------------------
    // 검색
    // -------------------------
    const handleSearch = () => {
        setLineItems(prev =>
            prev.filter(
                p => (sku ? p.sku.includes(sku) : true) &&
                    (name ? p.name.includes(name) : true)
            )
        );
        setSelectedForAdd([]);
    };

    // -------------------------
    // 주문 등록 체크박스
    // -------------------------
    const toggleSelectRegistered = (id) => {
        setSelectedRegistered(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleSelectAllRegistered = () => {
        if (selectedRegistered.length === registeredItems.length) setSelectedRegistered([]);
        else setSelectedRegistered(registeredItems.map(item => item.id));
    };
    const handleDeleteSelectedRegistered = () => {
        if (!selectedRegistered.length) return;
        setRegisteredItems(prev => prev.filter(item => !selectedRegistered.includes(item.id)));
        setSelectedRegistered([]);
    };

    // -------------------------
    // 주문 확정 API 호출
    // -------------------------

    const handleConfirmOrder = async () => {
        if (!registeredItems.length || !selectedRegistered.length) {
            alert("하나 이상의 품목을 선택해야 주문할 수 있습니다.");
            return;
        }

        try {
            const agKey = JSON.parse(localStorage.getItem("userInfo")).agKey;
            const selectedItems = registeredItems.filter(item => selectedRegistered.includes(item.id));

            const today = new Date();
            const defaultArrival = new Date(today);
            defaultArrival.setDate(today.getDate() + 4);
            const arrivalDate = expectedDate || defaultArrival.toISOString().slice(0, 10);

            // 1️⃣ DB에 주문 저장
            const res = await api.post(
                "/agencyorder/confirm",
                {
                    agKey,
                    items: selectedItems.map(item => ({
                        pdKey: item.pdKey,
                        rdQuantity: item.qty,
                        rdPrice: item.price,
                        rdProducts: item.name
                    })),
                    reserveDate: arrivalDate
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const savedOrder = res.data;

            // 2️⃣ 선택한 등록 품목 제거 → state 갱신
            setRegisteredItems(prev => prev.filter(item => !selectedRegistered.includes(item.id)));
            setSelectedRegistered([]);
            setExpectedDate("");

            // 3️⃣ UI용 데이터 계산
            const items = selectedItems.map(item => ({
                sku: item.pdKey,
                name: item.name,
                qty: item.qty,
                price: item.price
            }));

            const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

            // 4️⃣ 오늘 날짜 기준 기존 주문 개수 확인 → 순번 계산
            const todayOrdersCount = orders.filter(o => {
                const d = new Date(o.orDate);
                return d.toDateString() === today.toDateString();
            }).length + 1; // 새 주문 순번만 계산

            const yy = String(today.getFullYear()).slice(2);
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            const seq = String(todayOrdersCount).padStart(2, "0");
            const orderNumberUI = `${yy}${mm}${dd}${seq}`;

            const formattedOrder = { ...savedOrder, items, totalAmount, orderNumber: orderNumberUI };

            // 5️⃣ Orders 상태에 바로 반영
            setOrders(prev => [...prev, formattedOrder]);

            alert("주문이 확정되었습니다!");

        } catch (err) {
            console.error("주문 확정 실패:", err);
            alert("주문 확정 중 오류 발생");
        }
    };





    // -------------------------
    // 주문현황 API
    // -------------------------
    const fetchOrders = async () => {
        try {
            const res = await api.get("/agencyorder/full", {headers: { Authorization: `Bearer ${token}` }});
            setOrders(res.data);
        } catch (err) {
            console.error("주문현황 불러오기 실패", err);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [token]);

    // -------------------------
    // 대리점 품목 API
    // -------------------------
    const fetchAgencyProducts = async () => {
        if (!agencyId) return;

        try {
            const res = await api.get(`/agency-items/${agencyId}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const normalized = res.data.map(p => ({
                id: p.pdKey,
                pdKey: p.pdKey,
                sku: p.pdNum,
                name: p.pdProducts,
                qty: 1,
                price: p.pdPrice
            }));
            setLineItems(normalized);
            setSelectedForAdd([]);
        } catch (err) {
            console.error("대리점 품목 불러오기 실패", err);
        }
    };

    useEffect(() => {
        const storedAgencyId = localStorage.getItem("userInfo");
        if (storedAgencyId) {
            setAgencyId(JSON.parse(storedAgencyId).agKey)
        }
    }, []);

    useEffect(() => {
        if (agencyId && token) {
            fetchAgencyProducts();
        }
    }, [agencyId, token]);

    // -------------------------
    // 중복 제거: pdKey 기준
    // -------------------------
    const uniqueLineItems = lineItems.filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.pdKey === item.pdKey)
    );


    // -------------------------
    // 렌더링
    // -------------------------
    console.log("lineItems IDs 👉", lineItems.map(item => item.id));

    if (!outletContext || !outletContext.orders || !outletContext.setOrders || !outletContext.drafts || !outletContext.setDrafts) {
        return <div>오류: 주문 상태를 불러올 수 없습니다.</div>;
    }

    return (
        <div className={styles.ordersPage}>
            {/* =========================
          주문 저장 섹션
      ========================== */}
            <section className={styles.section}>
                <h2 className={styles.title}>주문 저장</h2>

                <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>품번</label>
                        <input
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className={styles.searchInput}
                            placeholder="품번 입력"
                        />
                        <button onClick={handleSearch} className={styles.searchBtn}>검색</button>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>제품명</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.searchInput}
                            placeholder="제품명 입력"
                        />
                        <button onClick={handleSearch} className={styles.searchBtn}>검색</button>
                    </div>

                    <div className={styles.buttonRow} style={{ marginLeft: "auto", gap: "6px" }}>
                        {/* + 저장: 등록 섹션에 있는 품목만 */}
                        <button
                            onClick={handleAddToRegistered}
                            className={styles.primary}
                            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                        >
                            + 저장
                        </button>

                        {/* 임시 저장: 체크박스 선택 기준 */}
                        <button
                            onClick={handleTempSave}
                            className={styles.primary}
                            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                        >
                            임시 저장
                        </button>
                    </div>




                </div>

                <div className={styles.tableWrap} style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            {/*진경 클래스명 추가*/}
                            <th className={`${styles.center} ${styles.t_w40}`}>
                                <input
                                    type="checkbox"
                                    checked={lineItems.length > 0 && selectedForAdd.length === lineItems.length}
                                    onChange={toggleSelectAllForAdd}
                                />
                            </th>
                            <th className={styles.center}>품번</th>
                            <th className={styles.center}>제품명</th>
                            <th className={styles.right}>수량</th>
                            <th className={styles.right}>단가</th>
                            <th className={styles.right}>총액</th>
                        </tr>
                        </thead>


                        <tbody>
                        {uniqueLineItems.length > 0 ? (
                            uniqueLineItems.map((item, index) => {
                                console.log("🔥 item 확인:", item); // ✅ 여기 추가

                                return (
                                    <tr key={`${item.id}-${index}`}>
                                        <td className={styles.center}>
                                            <input
                                                type="checkbox"
                                                checked={selectedForAdd.includes(item.id)}
                                                onChange={() => toggleSelectForAdd(item.id)}
                                            />
                                        </td>
                                        <td className={styles.center}>{item.sku}</td>
                                        <td className={styles.center}>{item.name}</td>
                                        <td className={styles.right}>{item.qty}</td>
                                        <td className={styles.right}>
                                            {item?.price ? item.price.toLocaleString() + "원" : "0원"}
                                        </td>
                                        <td className={styles.right}>
                                            {item?.qty && item?.price
                                                ? (item.qty * item.price).toLocaleString() + "원"
                                                : "0원"}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                          <tr>
                              <td colSpan={6} style={{ textAlign: "center" }}>
                                  {lineItems.length === 0 ? "데이터를 불러오는 중입니다..." : "검색 결과가 없습니다."}
                              </td>
                          </tr>
                        )}
                        </tbody>

                    </table>
                </div>
            </section>

            {/* =========================
          주문 확정 섹션
      ========================== */}
            <section className={styles.section}>
                <h2 className={styles.title}>주문 확정</h2>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="expectedDate">도착 예정일</label>
                            <input
                                type="date"
                                id="expectedDate"
                                value={expectedDate}
                                onChange={(e) => setExpectedDate(e.target.value)}
                                min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div className={styles.buttonGroup} style={{ visibility: selectedRegistered.length > 0 ? "visible" : "hidden" }}>
                        {selectedRegistered.length > 0 && (
                            <button onClick={handleDeleteSelectedRegistered} className={styles.danger}>
                                삭제
                            </button>
                        )}
                        <button
                            className={styles.primary}
                            onClick={handleConfirmOrder}
                        >
                            주문 확정
                        </button>
                    </div>
                </div>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            {/*진경 클래스명 추가*/}
                            <th className={`${styles.center} ${styles.t_w40}`}>
                                <input
                                    type="checkbox"
                                    checked={registeredItems.length > 0 && selectedRegistered.length === registeredItems.length}
                                    onChange={toggleSelectAllRegistered}
                                />
                            </th>
                            <th className={styles.center}>품번</th>
                            <th className={styles.center}>제품명</th>
                            <th className={styles.right}>수량</th>
                            <th className={styles.right}>단가</th>
                            <th className={styles.right}>총액</th>
                        </tr>
                        </thead>

                        <tbody>
                        {registeredItems.length > 0 ? (
                            registeredItems.map((item, index) => (
                                <tr key={`${item.id}-${index}`}>
                                    {/*진경 클래스명 추가*/}
                                    <td className={`${styles.center} ${styles.t_w40}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRegistered.includes(item.id)}
                                            onChange={() => toggleSelectRegistered(item.id)}
                                        />
                                    </td>
                                    <td className={styles.center}>{item.sku}</td>
                                    <td className={styles.center}>{item.name}</td>
                                    <td className={styles.right}>
                                        <button onClick={() => handleRegisteredQtyChange(item.id, -1)}>-</button>
                                        <span style={{ margin: "0 5px" }}>{item.qty}</span>
                                        <button onClick={() => handleRegisteredQtyChange(item.id, 1)}>+</button>
                                    </td>
                                    <td className={styles.right}>{item.price.toLocaleString()}원</td>
                                    <td className={styles.right}>{(item.qty * item.price).toLocaleString()}원</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.center} style={{ color: "#888", padding: "20px" }}>
                                    {registeredItems === null ? "데이터를 불러오는 중입니다..." : "등록된 주문이 없습니다."}
                                </td>
                            </tr>
                        )}
                        </tbody>

                    </table>
                </div>
            </section>
        </div>
    );
}
