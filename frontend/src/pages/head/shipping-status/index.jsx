// Status.jsx
import {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../../styles/main.module.css';
import { AuthContext } from "../../../context/auth-context.tsx";

function ShippingStatus() {
    const { token } = useContext(AuthContext);
    const [statusList, setStatusList] = useState([]); // 원본 데이터
    const [filteredList, setFilteredList] = useState([]); // 필터링된 데이터
    const [sortKey, setSortKey] = useState('orKey');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState({
        orderDateStart: '',
        orderDateEnd: '',
        reserveDateStart: '',
        reserveDateEnd: '',
        status: '',
        orderNumber: '',
        agency: '',
        deliveryName: '',
        phone: ''
    });

    useEffect(() => {
        axios.get('http://localhost:8080/api/status', {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => {
                setStatusList(res.data);
                setFilteredList(res.data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedList = [...filteredList].sort((a, b) => {
        const isDate = sortKey === 'orDate' || sortKey === 'orReserve';
        let aVal = a[sortKey];
        let bVal = b[sortKey];

        if (isDate) {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const filtered = statusList.filter(item => {
            return (
                (!filters.orderDateStart || item.orDate >= filters.orderDateStart) &&
                (!filters.orderDateEnd || item.orDate <= filters.orderDateEnd) &&
                (!filters.reserveDateStart || item.orReserve >= filters.reserveDateStart) &&
                (!filters.reserveDateEnd || item.orReserve <= filters.reserveDateEnd) &&
                (!filters.status ||
                            (filters.status === '1' && item.orStatus.includes('배송 준비중')) ||
                            (filters.status === '2' && item.orStatus.includes('배송 중')) ||
                            (filters.status === '3' && item.orStatus.includes('배송 완료'))) &&
                (!filters.orderNumber || item.orderNumber.toString().includes(filters.orderNumber)) &&
                (!filters.agency || item.agName.includes(filters.agency)) &&
                (!filters.deliveryName || item.dvName.includes(filters.deliveryName)) &&
                (!filters.phone || item.dvPhone.includes(filters.phone))
            );
        });
        setFilteredList(filtered);
    };

    // Order.jsx와 동일한 팝업 열기 함수
    const openOrderPopup = (orKey) => {
        const url = `${window.location.origin}/agencyorder-popup/${orKey}`;
        window.open(
            url,
            "_blank",
            "width=1280,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
        );
    };

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>출고 현황</p>
            <div className={styles.select1}>
                <div className={styles.left_select}>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>주문일</p>
                            <span className={styles.blank}></span>
                            <input type="date" name="orderDateStart" value={filters.orderDateStart} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                            <p>~</p>
                            <input type="date" name="orderDateEnd" value={filters.orderDateEnd} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                        </div>
                        <div className={styles.section}>
                            <p>배송예정일</p>
                            <span className={styles.blank}></span>
                            <input type="date" name="reserveDateStart" value={filters.reserveDateStart} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                            <p>~</p>
                            <input type="date" name="reserveDateEnd" value={filters.reserveDateEnd} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                        </div>
                        <div className={styles.section}>
                            <p>처리 상태</p>
                            <select name="status" value={filters.status} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}>
                                <option value=""></option>
                                <option value="1">배송 준비중</option>
                                <option value="2">배송 중</option>
                                <option value="3">배송 완료</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>주문번호</p>
                            <input type="text" name="orderNumber" value={filters.orderNumber} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                        </div>
                        <div className={styles.section}>
                            <p>대리점</p>
                            <input type="text" name="agency" value={filters.agency} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                        </div>
                        <div className={styles.section}>
                            <p>배달 기사</p>
                            <input type="text" name="deliveryName" value={filters.deliveryName} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                        </div>
                        <div className={styles.section}>
                            <p>전화번호</p>
                            <input type="text" name="phone" value={filters.phone} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className={styles.input1}/>
                        </div>
                    </div>
                </div>
                <div className={styles.right_select3}>
                    <button className={`${styles.big_btn} ${styles.search}`} onClick={handleSearch}>검색</button>
                </div>
            </div>

            <div className={styles.table_container}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        {[
                            { key: 'orKey', label: '주문번호' },
                            { key: 'agName', label: '대리점' },
                            { key: 'orStatus', label: '처리 상태' },
                            { key: 'dvName', label: '배달 기사' },
                            { key: 'dvPhone', label: '전화번호' },
                            { key: 'orDate', label: '주문일' },
                            { key: 'orReserve', label: '배송예정일' }
                        ].map(col => (
                            <th key={col.key}>
                                <div style={{ cursor: 'pointer' }} onClick={() => handleSort(col.key)}>
                                    <p>{col.label}</p>
                                    <button className={styles.sort}>
                                        {sortKey === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '▼'}
                                    </button>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sortedList.length > 0 ? (
                        sortedList.map(item => (
                            <tr key={item.orKey} style={{ cursor: 'pointer' }} onClick={() => openOrderPopup(item.orKey)}>
                                <td>{item.orderNumber}</td>
                                <td>{item.agName}</td>
                                <td>{item.orStatus}</td>
                                <td>{item.dvName}</td>
                                <td className={styles.t_center}>{item.dvPhone}</td>
                                <td className={styles.t_center}>{item.orDate}</td>
                                <td className={styles.t_center}>{item.orReserve}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ShippingStatus;
