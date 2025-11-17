import styles from './main.module.css';
import {useState, useEffect, useContext} from 'react';
import axios from 'axios';

// 정환 추가
import { AuthContext } from '../../context/AuthContext.tsx';
// 정환 추가

function LogisticProduct() {

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortField, setSortField] = useState('lgName');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchLgName, setSearchLgName] = useState('');
    const [searchPdNum, setSearchPdNum] = useState('');
    const [searchPdProducts, setSearchPdProducts] = useState('');
    const [searchDateFrom, setSearchDateFrom] = useState('');
    const [searchDateTo, setSearchDateTo] = useState('');
    const [searchPriceFrom, setSearchPriceFrom] = useState('');
    const [searchPriceTo, setSearchPriceTo] = useState('');
    const [searchStockFrom, setSearchStockFrom] = useState('');
    const [searchStockTo, setSearchStockTo] = useState('');

    // 정환 추가
    const { token } = useContext(AuthContext);
    // 정환 추가

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/logisticproducts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }, // 정환 추가
            });
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error('API fetch error:', err);
        }
    };

    const handleSort = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        setFilteredProducts((prev) => [...prev].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        }));
    };

    const getSortArrow = (field) => {
        if (sortField === field) return sortOrder === 'asc' ? '▲' : '▼';
        return '▼';
    };

    const handleSearch = () => {
        let result = [...products];

        if (searchLgName) result = result.filter(p => p.lgName.includes(searchLgName));
        if (searchPdNum) result = result.filter(p => p.pdNum.includes(searchPdNum));
        if (searchPdProducts) result = result.filter(p => p.pdProducts.includes(searchPdProducts));

        if (searchDateFrom) result = result.filter(p => p.lpStore >= searchDateFrom);
        if (searchDateTo) result = result.filter(p => p.lpStore <= searchDateTo);

        // 콤마 제거 후 숫자로 변환
        if (searchPriceFrom) result = result.filter(p => p.pdPrice >= parseInt(searchPriceFrom.replace(/,/g, '')));
        if (searchPriceTo) result = result.filter(p => p.pdPrice <= parseInt(searchPriceTo.replace(/,/g, '')));

        if (searchStockFrom) result = result.filter(p => p.stock >= parseInt(searchStockFrom));
        if (searchStockTo) result = result.filter(p => p.stock <= parseInt(searchStockTo));

        setFilteredProducts(result);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 진경 추가 (천단위 콤마, 초기화 버튼)
    // 가격 input change 핸들러
    const handlePriceChange = (setter) => (e) => {
        // 입력값에서 숫자만 추출
        const numericValue = e.target.value.replace(/\D/g, '');
        // 숫자를 천단위 콤마로 변환
        const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        // state 업데이트
        setter(formattedValue);
    };

    // 초기화 버튼
    const handleReset = () => {
        setSearchLgName('');
        setSearchPdNum('');
        setSearchPdProducts('');
        setSearchDateFrom('');
        setSearchDateTo('');
        setSearchPriceFrom('');
        setSearchPriceTo('');
        setSearchStockFrom('');
        setSearchStockTo('');
        setFilteredProducts(products); // 전체 제품으로 초기화
    };

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>물류업체 제품 현황</p>
            <div className={styles.select2}>
                <div className={styles.left_select}>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>업체명</p>
                            <input type="text" className={styles.input1} value={searchLgName} onChange={e => setSearchLgName(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                        <div className={styles.section}>
                            <p>품번</p>
                            <input type="text" className={styles.input1} value={searchPdNum} onChange={e => setSearchPdNum(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                        <div className={styles.section}>
                            <p>제품명</p>
                            <input type="text" className={styles.input1} value={searchPdProducts} onChange={e => setSearchPdProducts(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                    </div>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>입고일</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`} value={searchDateFrom} onChange={e => setSearchDateFrom(e.target.value)} onKeyDown={handleKeyDown} />
                            <span>~</span>
                            <input type="date" className={`${styles.input1} ${styles.ta}`} value={searchDateTo} onChange={e => setSearchDateTo(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                        <div className={styles.section}>
                            <p>가격별</p>
                            <input type="text" className={styles.input5} value={searchPriceFrom} onChange={handlePriceChange(setSearchPriceFrom)} onKeyDown={handleKeyDown} />
                            <span>~</span>
                            <input type="text" className={styles.input5} value={searchPriceTo} onChange={handlePriceChange(setSearchPriceTo)} onKeyDown={handleKeyDown} />
                        </div>
                        <div className={styles.section}>
                            <p>재고별</p>
                            <input type="text" className={styles.input5} value={searchStockFrom} onChange={e => setSearchStockFrom(e.target.value)} onKeyDown={handleKeyDown} />
                            <span>~</span>
                            <input type="text" className={styles.input5} value={searchStockTo} onChange={e => setSearchStockTo(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                    </div>
                </div>
                <div className={styles.right_select2}>
                    {/*진경 버튼 수정, 추가*/}
                    <button className={`${styles.big_btn} ${styles.reset}`} onClick={handleReset}>초기화</button>
                    <button className={`${styles.big_btn} ${styles.search}`} onClick={handleSearch}>검색</button>
                </div>
            </div>
            <div className={styles.table_container}>
                <table className={styles.table}>
                    <thead>
                    <tr className={styles.fixed}>
                        {['lgName','pdNum','pdProducts','pdPrice','stock','lpStore'].map((field, idx) => (
                            <th key={idx}>
                                <div>
                                    <p>{field === 'lgName' ? '업체명' :
                                        field === 'pdNum' ? '품번' :
                                            field === 'pdProducts' ? '제품명' :
                                                field === 'pdPrice' ? '가격' :
                                                    field === 'stock' ? '재고' :
                                                        field === 'lpStore' ? '최신 입고일' : ''}</p>
                                    <button
                                        className={styles.sort}
                                        onClick={() => handleSort(field)}
                                    >
                                        {getSortArrow(field)}
                                    </button>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(filteredProducts) && filteredProducts.map((p, idx) => (
                        <tr key={idx}>
                            <td>{p.lgName}</td>
                            <td>{p.pdNum}</td>
                            <td className={styles.t_left}>{p.pdProducts}</td>
                            <td className={styles.t_right}>{p.pdPrice.toLocaleString()}원</td>
                            <td className={styles.t_right}>{p.stock}</td>
                            <td>{p.lpStore}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LogisticProduct;
