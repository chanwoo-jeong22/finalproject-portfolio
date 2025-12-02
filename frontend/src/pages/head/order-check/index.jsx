import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../styles/main.module.css';

function Order() {
    const [orders, setOrders] = useState([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [searchParams, setSearchParams] = useState({
        orderNo: '',
        productName: '',
        agency: '',
        status: '',
        orderDateFrom: '',
        orderDateTo: '',
        deliveryDateFrom: '',
        deliveryDateTo: '',
        quantityMin: '',
        quantityMax: '',
        totalMin: '',
        totalMax: ''
    });

    const [sortField, setSortField] = useState('orKey');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/agencyorder/search', { params: searchParams });
            let mappedOrders = res.data.map(order => ({
                ...order,
                displayStatus: order.orStatus === '배송 준비중' ? '승인 완료' : order.orStatus,
                agencyName: order.agencyName || 'N/A'
            }));

            // 기본 정렬 또는 헤더 클릭 시 정렬
            mappedOrders = sortOrders(mappedOrders, sortField, sortOrder);
            setOrders(mappedOrders);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ===== 정렬 함수 =====
    const sortOrders = (orderList, field, order) => {
        const sorted = [...orderList].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const handleSort = (field) => {
        let newOrder = 'asc';
        if (sortField === field) newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
        setOrders(prev => sortOrders(prev, field, newOrder));
    };

    // ===== 체크박스 =====
    const toggleSelectOrder = (orderId) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === orders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.map(o => o.orKey));
        }
    };

    // ===== 검색 =====
    const handleSearch = () => {
        fetchOrders();
    };

    // ===== 주문 확정 =====
    const handleConfirmOrders = async () => {
        try {
            await axios.post('http://localhost:8080/api/agencyorder/confirm/order', { orderIds: selectedOrderIds });
            fetchOrders();
            setSelectedOrderIds([]);
            alert('선택한 주문이 주문 처리 완료 상태로 변경되었습니다.');
        } catch (err) {
            console.error("Error confirming orders:", err);
            alert('주문 확정에 실패했습니다.');
        }
    };

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const openOrderPopup = (orKey) => {
        const url = `${window.location.origin}/agencyorder-popup/${orKey}`;
        window.open(
            url,
            "_blank",
            "width=1100,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
        );
    };

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>주문 확정</p>
            <div className={styles.select2}>
                <div className={styles.left_select}>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>주문일</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`}
                                   onChange={e => setSearchParams({...searchParams, orderDateFrom: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                            <p>~</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`}
                                   onChange={e => setSearchParams({...searchParams, orderDateTo: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                        </div>
                        <div className={styles.section}>
                            <p>배송요청일</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`}
                                   onChange={e => setSearchParams({...searchParams, deliveryDateFrom: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                            <p>~</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`}
                                   onChange={e => setSearchParams({...searchParams, deliveryDateTo: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                        </div>
                        <div className={styles.section}>
                            <p>처리 상태</p>
                            <select defaultValue=""
                                    onChange={e => setSearchParams({...searchParams, status: e.target.value})}
                                    onKeyDown={handleEnterKey}>
                                <option value=""></option>
                                <option value="승인 대기중">승인 대기중</option>
                                <option value="승인 완료">승인 완료</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>대리점</p>
                            <input
                                type="text"
                                className={styles.input1}
                                onChange={e => setSearchParams({ ...searchParams, agency: e.target.value })}
                                onKeyDown={handleEnterKey}
                            />
                        </div>
                        <div className={styles.section}>
                            <p>제품명</p>
                            <input type="text" className={styles.input1}
                                   onChange={e => setSearchParams({...searchParams, productName: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                        </div>
                        <div className={styles.section}>
                            <p>주문번호</p>
                            <input type="text" className={styles.input1}
                                   onChange={e => setSearchParams({...searchParams, orderNo: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                        </div>
                    </div>

                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>수량</p>
                            <p className={styles.blank}></p>
                            <input type="text" className={styles.input5}
                                   onChange={e => setSearchParams({...searchParams, quantityMin: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                            <p>~</p>
                            <input type="text" className={styles.input5}
                                   onChange={e => setSearchParams({...searchParams, quantityMax: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                        </div>
                        <div className={styles.section}>
                            <p>총액</p>
                            <input type="text" className={styles.input5}
                                   onChange={e => setSearchParams({...searchParams, totalMin: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                            <p>~</p>
                            <input type="text" className={styles.input5}
                                   onChange={e => setSearchParams({...searchParams, totalMax: e.target.value})}
                                   onKeyDown={handleEnterKey}/>
                        </div>
                    </div>
                </div>
                <div className={styles.right_select2}>
                    <button className={`${styles.big_btn} ${styles.search}`} onClick={handleSearch}>검색</button>
                    <button className={`${styles.big_btn} ${styles.bg_green}`} onClick={handleConfirmOrders}>주문 <br/> 확정</button>
                </div>
            </div>
            <div className={styles.table_container}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th className={styles.t_w40}>
                            <input type="checkbox"
                                   onChange={toggleSelectAll}
                                   checked={selectedOrderIds.length === orders.filter(o => o.orStatus !== '배송 완료').length && orders.length > 0}/>
                        </th>
                        {[
                            { title: '주문번호', field: 'orKey' },
                            { title: '대리점', field: 'agencyName' },
                            { title: '처리 상태', field: 'displayStatus' },
                            { title: '제품명', field: 'orProducts' },
                            { title: '수량', field: 'orQuantity' },
                            { title: '총액', field: 'orTotal' },
                            { title: '주문일', field: 'orDate' },
                            { title: '배송요청일', field: 'orReserve' }
                        ].map(({ title, field }) => (
                            // 진경 클래스명 추가
                            <th key={field} onClick={() => handleSort(field)} style={{cursor:'pointer'}} className={field === 'orProducts' ? styles.t_w400 : ''}>
                                <div>
                                    <p>{title}</p>
                                    <button>{sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '▼'}</button>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {orders.filter(o => o.orStatus !== '배송 완료').length > 0 ? (
                        orders
                            .filter(o => o.orStatus !== '배송 완료')
                            .map(order => (
                                <tr key={order.orKey} className={selectedOrderIds.includes(order.orKey) ? styles.checkedRow : ''} style={{ cursor: 'pointer' }} onClick={() => openOrderPopup(order.orKey)}>
                                    <td className={styles.t_w40}>
                                        <input
                                            className={styles.ccaa}
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order.orKey)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => toggleSelectOrder(order.orKey)}
                                        />
                                    </td>
                                    <td>{order.orderNumber}</td>
                                    <td className={styles.t_left}>{order.agencyName}</td>
                                    <td>{order.displayStatus}</td>
                                    {/*진경 수정*/}
                                    <td className={`${styles.t_left} ${styles.t_w400}`}>
                                        <div className={styles.ellipsis}>{order.orProducts}</div>
                                    </td>
                                    {/* //진경 수정*/}
                                    <td>{order.orQuantity}</td>
                                    <td className={styles.t_right}>{Number(order.orTotal).toLocaleString()}원</td>
                                    <td>{order.orDate}</td>
                                    <td>{order.orReserve}</td>
                                </tr>
                            ))
                    ) : (
                        <tr>
                            <td colSpan={9} style={{ textAlign: 'center' }}>주문 데이터가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Order;