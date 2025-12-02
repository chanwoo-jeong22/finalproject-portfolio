import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../../../styles/main.module.css";
import { RootState, AppDispatch } from "../../../redux/store";
import {
    fetchOrders,
    confirmOrders,
    setSearchParams,
    toggleSelectOrder,
    toggleSelectAll,
    setSort,
} from "../../../redux/slices/head/ordercheck-slice";

function OrderCheck() {
    const dispatch = useDispatch<AppDispatch>(); // 여기 AppDispatch 꼭 지정
    const {
        orders,
        loading,
        error,
        selectedOrderIds,
        searchParams,
        sortField,
        sortOrder,
    } = useSelector((state: RootState) => state.ordercheck);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleSort = (field: keyof typeof orders[0]) => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field) {
            newOrder = sortOrder === "asc" ? "desc" : "asc";
        }
        dispatch(setSort({ field, order: newOrder }));
    };

    const handleSearchChange = (
        key: keyof typeof searchParams,
        value: string
    ) => {
        dispatch(setSearchParams({ [key]: value }));
    };

    const handleSearch = () => {
        dispatch(fetchOrders());
    };

    const toggleSelect = (orderId: number) => {
        dispatch(toggleSelectOrder(orderId));
    };

    const toggleSelectAllOrders = () => {
        dispatch(toggleSelectAll());
    };

    const handleConfirmOrders = async () => {
        if (selectedOrderIds.length === 0) {
            alert("주문을 선택해주세요.");
            return;
        }
        try {
            await dispatch(confirmOrders(selectedOrderIds)).unwrap();
            alert("선택한 주문이 주문 처리 완료 상태로 변경되었습니다.");
            dispatch(fetchOrders());
        } catch {
            alert("주문 확정에 실패했습니다.");
        }
    };

    const handleEnterKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const openOrderPopup = (orKey: number) => {
        const url = `${window.location.origin}/agencyorder-popup/${orKey}`;
        window.open(
            url,
            "_blank",
            "width=1100,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
        );
    };

    const filteredOrders = orders.filter(order => {
        // 제품명 필터링
        if (searchParams.productName) {
            const productName = searchParams.productName.toLowerCase();
            const orProducts = order.orProducts.toLowerCase();
            if (!orProducts.includes(productName)) {
                return false;
            }
        }

        // 대리점 필터링
        if (searchParams.agency) {
            if (!order.agencyName.toLowerCase().includes(searchParams.agency.toLowerCase())) {
                return false;
            }
        }

        // 주문번호 필터링
        if (searchParams.orderNo) {
            if (!order.orderNumber.toLowerCase().includes(searchParams.orderNo.toLowerCase())) {
                return false;
            }
        }

        // 처리 상태 필터링
        if (searchParams.status) {
            if (order.displayStatus !== searchParams.status) {
                return false;
            }
        }

        // 주문일 필터링
        if (searchParams.orderDateFrom) {
            if (order.orDate < searchParams.orderDateFrom) return false;
        }
        if (searchParams.orderDateTo) {
            if (order.orDate > searchParams.orderDateTo) return false;
        }

        // 배송요청일 필터링
        if (searchParams.deliveryDateFrom) {
            if (order.orReserve < searchParams.deliveryDateFrom) return false;
        }
        if (searchParams.deliveryDateTo) {
            if (order.orReserve > searchParams.deliveryDateTo) return false;
        }

        // 수량 필터링
        if (searchParams.quantityMin) {
            if (order.orQuantity < Number(searchParams.quantityMin)) return false;
        }
        if (searchParams.quantityMax) {
            if (order.orQuantity > Number(searchParams.quantityMax)) return false;
        }

        // 총액 필터링
        if (searchParams.totalMin) {
            if (order.orPrice < Number(searchParams.totalMin)) return false;
        }
        if (searchParams.totalMax) {
            if (order.orPrice > Number(searchParams.totalMax)) return false;
        }

        return true;
    });

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>주문 확정</p>
            <div className={styles.select2}>
                <div className={styles.left_select}>
                    {/* 주문일 */}
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>주문일</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchParams.orderDateFrom}
                                onChange={(e) =>
                                    handleSearchChange("orderDateFrom", e.target.value)
                                }
                                onKeyDown={handleEnterKey}
                            />
                            <p>~</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchParams.orderDateTo}
                                onChange={(e) =>
                                    handleSearchChange("orderDateTo", e.target.value)
                                }
                                onKeyDown={handleEnterKey}
                            />
                        </div>
                        {/* 배송요청일 */}
                        <div className={styles.section}>
                            <p>배송요청일</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchParams.deliveryDateFrom}
                                onChange={(e) =>
                                    handleSearchChange("deliveryDateFrom", e.target.value)
                                }
                                onKeyDown={handleEnterKey}
                            />
                            <p>~</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchParams.deliveryDateTo}
                                onChange={(e) =>
                                    handleSearchChange("deliveryDateTo", e.target.value)
                                }
                                onKeyDown={handleEnterKey}
                            />
                        </div>
                        {/* 처리 상태 */}
                        <div className={styles.section}>
                            <p>처리 상태</p>
                            <select
                                value={searchParams.status}
                                onChange={(e) =>
                                    handleSearchChange("status", e.target.value)
                                }
                                onKeyDown={handleEnterKey}
                            >
                                <option value=""></option>
                                <option value="승인 대기중">승인 대기중</option>
                                <option value="승인 완료">승인 완료</option>
                            </select>
                        </div>
                    </div>

                    {/* 대리점, 제품명, 주문번호 */}
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>대리점</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchParams.agency}
                                onChange={(e) => handleSearchChange("agency", e.target.value)}
                                onKeyDown={handleEnterKey}
                            />
                        </div>
                        <div className={styles.section}>
                            <p>제품명</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchParams.productName}
                                onChange={(e) =>
                                    handleSearchChange("productName", e.target.value)
                                }
                                onKeyDown={handleEnterKey}
                            />
                        </div>
                        <div className={styles.section}>
                            <p>주문번호</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchParams.orderNo}
                                onChange={(e) => handleSearchChange("orderNo", e.target.value)}
                                onKeyDown={handleEnterKey}
                            />
                        </div>
                    </div>
                </div>

                {/* 버튼 */}
                <div className={styles.right_select2}>
                    <button
                        className={`${styles.big_btn} ${styles.search}`}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        검색
                    </button>
                    <button
                        className={`${styles.big_btn} ${styles.bg_green}`}
                        onClick={handleConfirmOrders}
                        disabled={loading || selectedOrderIds.length === 0}
                    >
                        주문 <br /> 확정
                    </button>
                </div>
            </div>

            {/* 테이블 */}
            <div className={styles.table_container}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.t_w40}>
                                <input
                                    type="checkbox"
                                    onChange={toggleSelectAllOrders}
                                    checked={
                                        selectedOrderIds.length ===
                                        orders.filter((o) => o.orStatus !== "배송 완료").length &&
                                        orders.length > 0
                                    }
                                />
                            </th>
                            {[
                                { title: "주문번호", field: "orKey" },
                                { title: "대리점", field: "agencyName" },
                                { title: "처리 상태", field: "displayStatus" },
                                { title: "제품명", field: "orProducts" },
                                { title: "수량", field: "orQuantity" },
                                { title: "총액", field: "orPrice" },
                                { title: "주문일", field: "orDate" },
                                { title: "배송요청일", field: "orReserve" },
                            ].map(({ title, field }) => (
                                <th
                                    key={field}
                                    onClick={() => handleSort(field as keyof typeof orders[0])}
                                    style={{ cursor: "pointer" }}
                                    className={field === "orProducts" ? styles.t_w400 : ""}
                                >
                                    <div>
                                        <p>{title}</p>
                                        <button>
                                            {sortField === field
                                                ? sortOrder === "asc"
                                                    ? "▲"
                                                    : "▼"
                                                : "▼"}
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center" }}>
                                    로딩 중...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center", color: "red" }}>
                                    {error}
                                </td>
                            </tr>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders
                                .filter((o) => o.orStatus !== "배송 완료") // 기존 필터 유지
                                .map((order) => (
                                    <tr
                                        key={order.orKey}
                                        className={selectedOrderIds.includes(order.orKey) ? styles.checkedRow : ""}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => openOrderPopup(order.orKey)}
                                    >
                                        <td className={styles.t_w40}>
                                            <input
                                                className={styles.ccaa}
                                                type="checkbox"
                                                checked={selectedOrderIds.includes(order.orKey)}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={() => toggleSelect(order.orKey)}
                                            />
                                        </td>
                                        <td>{order.orderNumber}</td>
                                        <td className={styles.t_left}>{order.agencyName}</td>
                                        <td>{order.displayStatus}</td>
                                        <td className={`${styles.t_left} ${styles.t_w400}`}>
                                            <div className={styles.ellipsis}>{order.orProducts}</div>
                                        </td>
                                        <td>{order.orQuantity}</td>
                                        <td className={styles.t_right}>
                                            {Number(order.orPrice).toLocaleString()}원
                                        </td>
                                        <td>{order.orDate}</td>
                                        <td>{order.orReserve}</td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center" }}>
                                    주문 데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}

export default OrderCheck;
