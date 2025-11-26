import styles from '../../../styles/main.module.css';
import {useState, useEffect, useContext} from 'react';
import axios from 'axios';

function AgencyProductStatus() {

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortField, setSortField] = useState('agName');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchAgName, setSearchAgName] = useState('');
    const [searchPdNum, setSearchPdNum] = useState('');
    const [searchPdProducts, setSearchPdProducts] = useState('');
    const [searchDateFrom, setSearchDateFrom] = useState('');
    const [searchDateTo, setSearchDateTo] = useState('');
    const [searchPriceFrom, setSearchPriceFrom] = useState('');
    const [searchPriceTo, setSearchPriceTo] = useState('');

    // 정환 추가
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    // 정환 추가

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/agency/agencyproducts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }, // 정환 추가
            });
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error('API fetch error:', err);
        } finally {
            setLoading(false);
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

        if (searchAgName) result = result.filter(p => p.agName.includes(searchAgName));
        if (searchPdNum) result = result.filter(p => p.pdNum.includes(searchPdNum));
        if (searchPdProducts) result = result.filter(p => p.pdProducts.includes(searchPdProducts));

        if (searchDateFrom) result = result.filter(p => p.apStore >= searchDateFrom);
        if (searchDateTo) result = result.filter(p => p.apStore <= searchDateTo);

        if (searchPriceFrom) result = result.filter(p => p.pdPrice >= parseInt(searchPriceFrom));
        if (searchPriceTo) result = result.filter(p => p.pdPrice <= parseInt(searchPriceTo));

        setFilteredProducts(result);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>대리점 제품 현황</p>
            <div className={styles.select1}>
                <div className={styles.left_select}>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>업체명</p>
                            <input type="text" className={styles.input1} value={searchAgName} onChange={e => setSearchAgName(e.target.value)} onKeyDown={handleKeyDown} />
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
                            <p>가격별</p>
                            <input type="text" className={styles.input5} value={searchPriceFrom} onChange={e => setSearchPriceFrom(e.target.value)} onKeyDown={handleKeyDown} />
                            <p>~</p>
                            <input type="text" className={styles.input5} value={searchPriceTo} onChange={e => setSearchPriceTo(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                        <div className={styles.section}>
                            <p>입고일</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`} value={searchDateFrom} onChange={e => setSearchDateFrom(e.target.value)} onKeyDown={handleKeyDown} />
                            <p>~</p>
                            <input type="date" className={`${styles.input1} ${styles.ta}`} value={searchDateTo} onChange={e => setSearchDateTo(e.target.value)} onKeyDown={handleKeyDown} />
                        </div>
                    </div>
                </div>
                <div className={styles.right_select3}>
                    <button className={`${styles.big_btn} ${styles.search}`} onClick={handleSearch}>검색</button>
                </div>
            </div>
            <div className={styles.table_container}>
                {loading ? (
                  <p className={styles.list_loading}>리스트를 불러오는 중입니다.</p>
                ) : (
                  <table className={styles.table}>
                      <thead>
                      <tr>
                          {['agName','pdNum','pdProducts','apPrice','apStore'].map((field, idx) => (
                            <th key={idx}>
                                <div>
                                    <p>{field === 'agName' ? '업체명' :
                                      field === 'pdNum' ? '품번' :
                                        field === 'pdProducts' ? '제품명' :
                                          field === 'apPrice' ? '가격' : '입고일'}</p>
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
                            <td className={styles.t_left}>{p.agName}</td>
                            <td>{p.pdNum}</td>
                            <td className={styles.t_left}>{p.pdProducts}</td>
                            <td className={styles.t_right}>{p.pdPrice
                                ? parseInt(String(p.pdPrice).replace(/[^\d]/g, ''), 10).toLocaleString() + '원'
                                : '-'}</td>
                            <td>{p.apStore}</td>
                        </tr>
                      ))}
                      </tbody>
                  </table>
                )}
            </div>
        </div>
    )
}

export default AgencyProductStatus;
