import { useParams } from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import styles from "../../styles/logistic/order-detail.module.css";
import { AuthContext } from "../../context/auth-context";

export default function OrderDetail() {
    const { token } = useContext(AuthContext);
    const { orKey } = useParams();
    const [items, setItems] = useState([]);
    const [orderInfo, setOrderInfo] = useState({
        orKey: '',
        agencyName: '',
        orDate: '',
        orReserve: ''
    });

    // 기본 정렬
    const [sortField, setSortField] = useState('pdNum');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        // 주문 아이템 가져오기
        axios.get(`http://localhost:8080/api/agencyorder/items/${orKey}`, {headers: {Authorization: `Bearer ${token}`}})
            .then(res => {
                const data = res.data ?? [];
                const sorted = sortItems(data, sortField, sortOrder);
                setItems(sorted);
            })
            .catch(err => console.error(err));

        // 주문 정보 가져오기
        axios.get(`http://localhost:8080/api/agencyorder/${orKey}/info`, {headers: {Authorization: `Bearer ${token}`}})
            .then(res => setOrderInfo(res.data ?? {}))
            .catch(err => console.error(err));
    }, [orKey, sortField, sortOrder]);

    // ===== 정렬 함수 =====
    const sortItems = (list, field, order) => {
        return [...list].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (field) => {
        let newOrder = 'asc';
        if (sortField === field) newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
    };

    return (
        <div className={styles.fixedRoot}>
            <div className={styles.content}>
                <h2 className={styles.title}>주문 상세 정보</h2>

                {/* 주문 정보 */}
                <div className={styles.search_bg}>
                    <div className={styles.line1}>
                        <div className={styles.section}>
                            <label>주문번호</label>
                            <input type="text" className={styles.input} readOnly value={orderInfo.orKey}/>
                        </div>
                        <div className={styles.section}>
                            {/*<p className={styles.blank}></p>*/}
                            <label>대리점</label>
                            {/*<p className={styles.blank}></p>*/}
                            <input type="text" className={styles.input} readOnly value={orderInfo.agencyName}/>
                        </div>
                    </div>
                    <div className={styles.line2}>
                        <div className={styles.section}>
                            <label>주문일</label>
                            {/*<p className={styles.blank}></p>*/}
                            <input type="text" className={styles.input} readOnly value={orderInfo.orDate}/>
                        </div>
                        <div className={styles.section}>
                            <label>배송요청일</label>
                            <input type="text" className={styles.input} readOnly value={orderInfo.orReserve}/>
                        </div>
                    </div>
                </div>

                {/* 주문 아이템 테이블 */}
                <div className={styles.table_container}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            {[
                                { title: '품번', field: 'pdNum' },
                                { title: '카테고리', field: 'pdCategory' },
                                { title: '제품명', field: 'oiProducts' },
                                { title: '수량', field: 'oiQuantity' },
                                { title: '단가', field: 'oiPrice' },
                                { title: '총액', field: 'oiTotal' }
                            ].map(({ title, field }) => {
                                const isActive = sortField === field;
                                return (
                                    <th
                                        key={field}
                                        className={styles.ta}
                                        onClick={() => handleSort(field)}
                                        style={{
                                            cursor: 'pointer'
                                        }}
                                    >
                                         <div>
                                             {title}
                                             <button>{isActive ? (sortOrder === 'asc' ? '▲' : '▼') : '▼'}</button>
                                         </div>
                                    </th>
                                );
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        {items.length > 0 ? (
                            items.map(item => (
                                <tr key={item.oiKey}>
                                    <td className={styles.t_left}>{item.pdNum}</td>
                                    <td className={styles.t_left}>{item.pdCategory}</td>
                                    <td className={styles.t_left}>{item.oiProducts}</td>
                                    <td className={styles.t_right}>{item.oiQuantity}</td>
                                    <td className={styles.t_right}>{Number(item.oiPrice).toLocaleString()}원</td>
                                    <td className={styles.t_right}>{Number(item.oiTotal).toLocaleString()}원</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>주문 아이템이 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
