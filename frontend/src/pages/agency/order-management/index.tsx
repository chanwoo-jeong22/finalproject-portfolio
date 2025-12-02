import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../redux/store";
import styles from "../../../styles/agency/orders.module.css";
import {
    toggleSelectForAdd,
    toggleSelectAllForAdd,
    toggleSelectRegistered,
    toggleSelectAllRegistered,
    addRegisteredItems,
    updateRegisteredQty,
    deleteSelectedRegistered,
    setExpectedDate,
    clearSelectForAdd,
} from "../../../redux/slices/agency/order-management/agency-slice";
import {
    fetchAgencyProducts,
    saveDraft,
    confirmOrder
} from '../../../redux/slices/agency/order-management/thunks'

export default function OrderManagement() {
    const dispatch = useDispatch<AppDispatch>();

    // Redux state
    const token = useSelector((state: RootState) => state.auth.token);
    const agencyId = useSelector((state: RootState) => state.auth.userInfo.agKey);

    const {
        lineItems,
        registeredItems,
        selectedForAdd,
        selectedRegistered,
        expectedDate,
        orders,
        drafts,
        loading,
    } = useSelector((state: RootState) => state.agency);

    // Local UI state
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [filteredLineItems, setFilteredLineItems] = useState(lineItems);
    const [isSaving, setIsSaving] = useState(false);

    // 초기 데이터 로드 및 주문 리스트 자동 갱신
    useEffect(() => {
        if (agencyId && token) {
            dispatch(fetchAgencyProducts(agencyId));
            // dispatch(fetchOrders());
            // // 5초마다 주문 목록 갱신
            // const interval = setInterval(() => {
            //     dispatch(fetchOrders());
            // }, 5000);
            // return () => clearInterval(interval);
        }
    }, [agencyId, token, dispatch]);

    // lineItems 변화시 필터 초기화
    useEffect(() => {
        setFilteredLineItems(lineItems);
    }, [lineItems]);

    // 검색 필터 적용
    const handleSearch = () => {
    const filtered = lineItems.filter(
        (p) =>
            (sku ? p.sku.includes(sku) : true) &&
            (name ? p.name.includes(name) : true)
    );
    setFilteredLineItems(filtered);
    dispatch(clearSelectForAdd()); // 선택 초기화: 전체 선택 해제
};



    // 선택 토글 핸들러들
    const onToggleSelectForAdd = (id: string) => {
        dispatch(toggleSelectForAdd(id));
    };
    const onToggleSelectAllForAdd = () => {
        dispatch(toggleSelectAllForAdd());
    };
    const onToggleSelectRegistered = (id: string) => {
        dispatch(toggleSelectRegistered(id));
    };
    const onToggleSelectAllRegistered = () => {
        dispatch(toggleSelectAllRegistered());
    };

    // + 저장: 선택 품목 등록
    const onAddToRegistered = () => {
        if (selectedForAdd.length === 0) {
            alert("추가할 품목을 선택해주세요.");
            return;
        }
        const selectedItems = lineItems.filter((item) =>
            selectedForAdd.includes(item.id)
        );
        dispatch(addRegisteredItems(selectedItems));
    };

    // 등록 품목 수량 변경
    const onUpdateRegisteredQty = (id: string, delta: number) => {
        dispatch(updateRegisteredQty({ id, delta }));
    };

    // 등록 품목 삭제
    const onDeleteSelectedRegistered = () => {
        if (selectedRegistered.length === 0) return;
        dispatch(deleteSelectedRegistered());
    };

    // 도착 예정일 변경
    const onExpectedDateChange = (date: string) => {
        dispatch(setExpectedDate(date));
    };

    // 임시 저장
    const onTempSave = async () => {
        if (isSaving) return;
        if (selectedForAdd.length === 0) {
            alert("임시 저장할 품목을 선택해주세요.");
            return;
        }
        setIsSaving(true);
        try {
            const itemsToSave = lineItems.filter((item) =>
                selectedForAdd.includes(item.id)
            );
            await dispatch(saveDraft(itemsToSave)).unwrap();
            alert("임시 저장 완료!");
        } catch (err: any) {
            alert("임시 저장 중 오류 발생: " + (err.message ?? err));
        } finally {
            setIsSaving(false);
        }
    };

    // 주문 확정
    const onConfirmOrder = async () => {
        if (!registeredItems.length || selectedRegistered.length === 0) {
            alert("하나 이상의 품목을 선택해야 주문할 수 있습니다.");
            return;
        }
        try {
            const selectedItems = registeredItems.filter((item) =>
                selectedRegistered.includes(item.id)
            );
            if (!agencyId) throw new Error("Agency ID가 없습니다.");
            await dispatch(
                confirmOrder({
                    agKey: agencyId,
                    items: selectedItems.map((item) => ({
                        pdKey: item.pdKey,
                        rdQuantity: item.qty,
                        rdPrice: item.price,
                        rdProducts: item.name,
                    })),
                    reserveDate:
                        expectedDate ||
                        new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .slice(0, 10),
                })
            ).unwrap();
            alert("주문이 확정되었습니다!");
        } catch (err: any) {
            alert("주문 확정 중 오류 발생: " + (err.message ?? err));
        }
    };

    return (
        <div className={styles.ordersPage}>
            {/* 주문 저장 섹션 */}
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
                        <button onClick={handleSearch} className={styles.searchBtn}>
                            검색
                        </button>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>제품명</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.searchInput}
                            placeholder="제품명 입력"
                        />
                        <button onClick={handleSearch} className={styles.searchBtn}>
                            검색
                        </button>
                    </div>

                    <div
                        className={styles.buttonRow}
                        style={{ marginLeft: "auto", gap: "6px" }}
                    >
                        <button
                            onClick={onAddToRegistered}
                            className={styles.primary}
                            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                        >
                            + 저장
                        </button>

                        <button
                            onClick={onTempSave}
                            className={styles.primary}
                            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                            disabled={isSaving}
                        >
                            임시 저장
                        </button>
                    </div>
                </div>

                <div
                    className={styles.tableWrap}
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th className={`${styles.center} ${styles.t_w40}`}>
                                <input
                                    type="checkbox"
                                    checked={
                                        filteredLineItems.length > 0 &&
                                        selectedForAdd.length === filteredLineItems.length
                                    }
                                    onChange={onToggleSelectAllForAdd}
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
                        {filteredLineItems.length > 0 ? (
                            filteredLineItems.map((item, index) => (
                                <tr key={`${item.id}-${index}`}>
                                    <td className={styles.center}>
                                        <input
                                            type="checkbox"
                                            checked={selectedForAdd.includes(item.id)}
                                            onChange={() => onToggleSelectForAdd(item.id)}
                                        />
                                    </td>
                                    <td className={styles.center}>{item.sku}</td>
                                    <td className={styles.center}>{item.name}</td>
                                    <td className={styles.right}>{item.qty}</td>
                                    <td className={styles.right}>
                                        {item.price.toLocaleString()}원
                                    </td>
                                    <td className={styles.right}>
                                        {(item.qty * item.price).toLocaleString()}원
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center" }}>
                                    {loading ? "데이터를 불러오는 중입니다..." : "검색 결과가 없습니다."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 주문 확정 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.title}>주문 확정</h2>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="expectedDate">도착 예정일</label>
                            <input
                                type="date"
                                id="expectedDate"
                                value={expectedDate}
                                onChange={(e) => onExpectedDateChange(e.target.value)}
                                min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                                    .toISOString()
                                    .split("T")[0]}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div
                        className={styles.buttonGroup}
                        style={{
                            visibility:
                                selectedRegistered.length > 0 ? "visible" : "hidden",
                        }}
                    >
                        {selectedRegistered.length > 0 && (
                            <button
                                onClick={onDeleteSelectedRegistered}
                                className={styles.danger}
                            >
                                삭제
                            </button>
                        )}
                        <button className={styles.primary} onClick={onConfirmOrder}>
                            주문 확정
                        </button>
                    </div>
                </div>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th className={`${styles.center} ${styles.t_w40}`}>
                                <input
                                    type="checkbox"
                                    checked={
                                        registeredItems.length > 0 &&
                                        selectedRegistered.length === registeredItems.length
                                    }
                                    onChange={onToggleSelectAllRegistered}
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
                                    <td className={`${styles.center} ${styles.t_w40}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRegistered.includes(item.id)}
                                            onChange={() => onToggleSelectRegistered(item.id)}
                                        />
                                    </td>
                                    <td className={styles.center}>{item.sku}</td>
                                    <td className={styles.center}>{item.name}</td>
                                    <td className={styles.right}>
                                        <button onClick={() => onUpdateRegisteredQty(item.id, -1)}>
                                            -
                                        </button>
                                        <span style={{ margin: "0 5px" }}>{item.qty}</span>
                                        <button onClick={() => onUpdateRegisteredQty(item.id, 1)}>
                                            +
                                        </button>
                                    </td>
                                    <td className={styles.right}>{item.price.toLocaleString()}원</td>
                                    <td className={styles.right}>
                                        {(item.qty * item.price).toLocaleString()}원
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className={styles.center}
                                    style={{ color: "#888", padding: "20px" }}
                                >
                                    {loading ? "데이터를 불러오는 중입니다..." : "등록된 주문이 없습니다."}
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
