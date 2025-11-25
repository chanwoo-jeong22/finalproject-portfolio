import { useState, useEffect, useContext } from "react";
import styles from "../../../styles/agency/Orders.module.css";
import { AuthContext } from "../../../context/auth-context.tsx";
import api from "../../../api/api.ts"; // axios 인스턴스 import
import { useNavigate, useOutletContext } from "react-router-dom";

export default function OrderDraft() {
    const { orders, setOrders } = useOutletContext(); // context orders 가져오기
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);
    const [selected, setSelected] = useState([]);
    const [expectedDate, setExpectedDate] = useState(""); // 도착 예정일
    const { token } = useContext(AuthContext);

    // 서버에서 임시 저장 데이터 불러오기
    const fetchDrafts = async () => {
        try {
            const res = await api.get("/agencyorder/draft", {headers: { Authorization: `Bearer ${token}` }});
            setDrafts(res.data);
        } catch (err) {
            console.error("임시 저장 데이터 불러오기 실패", err);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [token]);

    const toggleSelect = (rdKey) => {
        setSelected(prev =>
            prev.includes(rdKey) ? prev.filter(x => x !== rdKey) : [...prev, rdKey]
        );
    };

    const toggleSelectAll = () => {
        if (selected.length === drafts.length) setSelected([]);
        else setSelected(drafts.map(item => item.rdKey));
    };

    const handleDeleteSelected = async () => {
        if (selected.length === 0) return;

        try {
            await api.delete("/agencyorder/draft", { data: { rdKeys: selected } });
            setDrafts(prev => prev.filter(item => !selected.includes(item.rdKey)));
            setSelected([]);
            alert("선택 항목이 삭제되었습니다.");
        } catch (err) {
            console.error("삭제 실패", err);
            alert("삭제 중 오류 발생: " + err.message);
        }
    };

    const incrementQty = (rdKey) => {
        setDrafts(prev =>
            prev.map(item =>
                item.rdKey === rdKey
                    ? { ...item, rdQuantity: item.rdQuantity + 1, rdTotal: (item.rdQuantity + 1) * item.rdPrice }
                    : item
            )
        );
    };

    const decrementQty = (rdKey) => {
        setDrafts(prev =>
            prev.map(item =>
                item.rdKey === rdKey
                    ? { ...item, rdQuantity: Math.max(item.rdQuantity - 1, 1), rdTotal: Math.max(item.rdQuantity - 1, 1) * item.rdPrice }
                    : item
            )
        );
    };


    // 주문 확정
    const handleConfirmOrder = async () => {
        if (selected.length === 0) {
            alert("확정할 품목을 선택해주세요.");
            return;
        }

        try {
            const agKey = JSON.parse(localStorage.getItem("userInfo")).agKey;
            const selectedItems = drafts.filter(item => selected.includes(item.rdKey));

            const today = new Date();
            const defaultArrival = new Date(today);
            defaultArrival.setDate(today.getDate() + 4);
            const arrivalDate = expectedDate || defaultArrival.toISOString().slice(0,10);

            // 1️⃣ DB에 주문 저장
            const res = await api.post("/agencyorder/confirm", {
                agKey,
                items: selectedItems,
                reserveDate: arrivalDate
            }, { headers: { Authorization: `Bearer ${token}` } });

            const savedOrder = res.data;

            // 2️⃣ 임시 저장 삭제 → state 갱신
            await api.delete("/agencyorder/draft", { data: { rdKeys: selected } });
            setDrafts(prev => prev.filter(item => !selected.includes(item.rdKey)));
            setSelected([]);

            // 3️⃣ UI용 데이터 계산
            const items = selectedItems.map(item => ({
                sku: item.pdKey,
                name: item.rdProducts,
                qty: item.rdQuantity,
                price: item.rdPrice
            }));

            const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

            const date = new Date(savedOrder.orDate);
            const yy = String(date.getFullYear()).slice(2);
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const seq = String(Number(savedOrder.orKey) % 100).padStart(2, "0"); // YYMMDD00 형식
            const orderNumberUI = `${yy}${mm}${dd}${seq}`;

            const formattedOrder = { ...savedOrder, items, totalAmount, orderNumberUI };

            // 4️⃣ 주문현황 상태에 바로 반영 (navigate 없이)
            setOrders(prev => [...prev, formattedOrder]);

            alert("주문이 확정되었습니다.");

        } catch (err) {
            console.error("주문 확정 실패:", err);
            alert("주문 확정 중 오류 발생");
        }
    };

    // 렌더링

    return (
        <div className={styles.ordersPage}>
            <section className={styles.section}>
                <h2 className={styles.title}>주문 임시저장</h2>

                {/* 버튼 영역 */}
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

                    <div className={styles.buttonGroup} style={{ visibility: selected.length > 0 ? "visible" : "hidden" }}>
                        <button onClick={handleDeleteSelected} className={styles.danger}>삭제</button>
                        <button onClick={handleConfirmOrder} className={styles.primary}>주문 확정</button>
                    </div>
                </div>

                {/* 테이블 */}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            {/*진경 클래스명 추가*/}
                            <th className={`${styles.center} ${styles.t_w40}`}>
                                <input
                                    type="checkbox"
                                    checked={drafts.length > 0 && selected.length === drafts.length}
                                    onChange={toggleSelectAll}
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
                        {drafts.length > 0 ? (
                            drafts.map(item => (
                                <tr key={item.rdKey}>
                                    {/*진경 클래스명 추가*/}
                                    <td className={`${styles.center} ${styles.t_w40}`}>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(item.rdKey)}
                                            onChange={() => toggleSelect(item.rdKey)}
                                        />
                                    </td>
                                    <td className={styles.center}>{item.pdKey}</td>
                                    <td className={styles.center}>{item.rdProducts}</td>
                                    <td className={styles.right}>
                                        <button onClick={() => decrementQty(item.rdKey)}>-</button>
                                        {item.rdQuantity}
                                        <button onClick={() => incrementQty(item.rdKey)}>+</button>
                                    </td>
                                    <td className={styles.right}>{item.rdPrice.toLocaleString()}원</td>
                                    <td className={styles.right}>{item.rdTotal.toLocaleString()}원</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.center}>
                                    등록된 임시 저장 주문이 없습니다.
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
