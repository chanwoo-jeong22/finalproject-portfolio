import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import headStyles from '../../../styles/head/head.module.css';
import styles from '../../../styles/main.module.css';
import {
  fetchProducts,
  updateProductStock,
  bulkUpdateStock,
  setProductLpStoreInput,
  setFilteredProducts,
  resetUpdatedKeys,
  Product,
} from '../../../redux/slices/head/logisticinbound-slice';
import type { RootState, AppDispatch } from '../../../redux/store'; 

const LogisticInbound: React.FC = () => {
const dispatch = useDispatch<AppDispatch>();
  const { products, allProducts, loading, updatedKeys } = useSelector(
    (state: RootState) => state.logisticInbound
  );

  const [filters, setFilters] = useState({
    lgName: '',
    pdNum: '',
    pdProducts: '',
    priceMin: '',
    priceMax: '',
    stockMin: '',
    stockMax: '',
  });

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: '',
    direction: 'asc',
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // 천 단위마다 콤마
  const formatNumber = (value: string | number) => {
    if (value === '' || value === null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 입력 시 콤마 제거 후 숫자만 상태에 저장
  const handleComma = (key: keyof typeof filters, value: string) => {
    const onlyNumber = value.replace(/,/g, ''); // 콤마 제거
    if (onlyNumber === '' || isNaN(Number(onlyNumber))) {
      setFilters(prev => ({ ...prev, [key]: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: Number(onlyNumber) }));
    }
  };

  const handleInputChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // 필터 검색
  const handleSearch = () => {
    const { lgName, pdNum, pdProducts, priceMin, priceMax, stockMin, stockMax } = filters;
    if (!lgName && !pdNum && !pdProducts && !priceMin && !priceMax && !stockMin && !stockMax) {
      dispatch(setFilteredProducts(allProducts));
      return;
    }

    let result = [...allProducts];

    if (lgName) result = result.filter(p => p.lgName.includes(lgName));
    if (pdNum) result = result.filter(p => p.pdNum.includes(pdNum));
    if (pdProducts) result = result.filter(p => p.pdProducts.includes(pdProducts));

    if (priceMin) result = result.filter(p => p.pdPrice >= Number(priceMin));
    if (priceMax) result = result.filter(p => p.pdPrice <= Number(priceMax));

    if (stockMin) result = result.filter(p => p.stock >= Number(stockMin));
    if (stockMax) result = result.filter(p => p.stock <= Number(stockMax));

    dispatch(setFilteredProducts(result));
  };

  // 검색 초기화
  const handleReset = () => {
    setFilters({
      lgName: '',
      pdNum: '',
      pdProducts: '',
      priceMin: '',
      priceMax: '',
      stockMin: '',
      stockMax: '',
    });
    dispatch(setFilteredProducts(allProducts));
  };

  // 입고 수량 입력값 변경
  const handleInputStockChange = (lpKey: number, value: number) => {
    dispatch(setProductLpStoreInput({ lpKey, lpStoreInput: value }));
  };

  // 개별 입고 등록
  const handleUpdate = (lpKey: number, quantity: number) => {
    if (!quantity || quantity <= 0) return;
    dispatch(updateProductStock({ lpKey, quantity }));
  };

  // 한꺼번에 입고 등록
  const handleBulkUpdate = () => {
    dispatch(bulkUpdateStock())
      .unwrap()
      .then(() => {
        alert('입력하신 모든 입고가 등록되었습니다.');
      })
      .catch(err => {
        alert(err);
      });
  };

  // 정렬
  const handleSort = (key: keyof Product) => {
    setSortConfig(prev => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';

      const sorted = [...products].sort((a, b) => {
        let aValue = a[key];
        let bValue = b[key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? aValue.localeCompare(bValue, 'ko')
            : bValue.localeCompare(aValue, 'ko');
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });

      dispatch(setFilteredProducts(sorted));

      return { key, direction };
    });
  };

  return (
    <div className={`${headStyles.content} ${headStyles.content_grid}`}>
      <h1 className={headStyles.title}>물류업체 입고</h1>

      <section className={headStyles.sec_full}>
        {/* 검색 영역 */}
        <div>
          <div className={headStyles.select_wrap}>
            <div className={headStyles.left_select_wrap}>
              <div className={headStyles.left_select}>
                <div className={headStyles.section}>
                  <h5>업체명</h5>
                  <input
                    type="text"
                    value={filters.lgName}
                    onChange={e => handleInputChange('lgName', e.target.value)}
                    className={headStyles.select_input}
                  />
                </div>
                <div className={headStyles.section}>
                  <h5>품번</h5>
                  <input
                    type="text"
                    value={filters.pdNum}
                    onChange={e => handleInputChange('pdNum', e.target.value)}
                    className={`${headStyles.select_input} ${headStyles.input_w150}`}
                  />
                </div>
                <div className={headStyles.section}>
                  <h5>제품명</h5>
                  <input
                    type="text"
                    value={filters.pdProducts}
                    onChange={e => handleInputChange('pdProducts', e.target.value)}
                    className={headStyles.select_input}
                  />
                </div>
              </div>
              <div className={headStyles.left_select}>
                <div className={`${headStyles.section} ${headStyles.input_right}`}>
                  <h5>가격별</h5>
                  <input
                    type="text"
                    value={formatNumber(filters.priceMin)}
                    onChange={e => handleComma('priceMin', e.target.value)}
                    className={`${headStyles.select_input} ${headStyles.input_w80}`}
                  />
                  <span>~</span>
                  <input
                    type="text"
                    value={formatNumber(filters.priceMax)}
                    onChange={e => handleComma('priceMax', e.target.value)}
                    className={`${headStyles.select_input} ${headStyles.input_w80}`}
                  />
                </div>
                <div className={`${headStyles.section} ${headStyles.input_right}`}>
                  <h5>재고별</h5>
                  <input
                    type="text"
                    value={filters.stockMin}
                    onChange={e => handleInputChange('stockMin', e.target.value)}
                    className={`${headStyles.select_input} ${headStyles.input_w80}`}
                  />
                  <span>~</span>
                  <input
                    type="text"
                    value={filters.stockMax}
                    onChange={e => handleInputChange('stockMax', e.target.value)}
                    className={`${headStyles.select_input} ${headStyles.input_w80}`}
                  />
                </div>
              </div>
            </div>

            <div className={headStyles.right_select}>
              <button className={`${headStyles.btn} ${headStyles.reset}`} onClick={handleReset}>
                초기화
              </button>
              <button className={`${headStyles.btn} ${headStyles.search}`} onClick={handleSearch}>
                검색
              </button>
              <button className={`${headStyles.btn} ${headStyles.ic_store}`} onClick={handleBulkUpdate}>
                입고
              </button>
            </div>
          </div>
        </div>

        {/* 물류 입고 리스트 영역 */}
        <div className={headStyles.table_container}>
          {loading ? (
            <p className={styles.list_loading}>리스트를 불러오는 중입니다.</p>
          ) : (
            <table className={`${headStyles.table} ${headStyles.table_lgStore}`}>
              <thead>
                <tr>
                  <th
                    className={`${headStyles.table_th_sortable} ${
                      sortConfig.key === 'lgName'
                        ? sortConfig.direction === 'asc'
                          ? headStyles.table_th_asc
                          : headStyles.table_th_desc
                        : ''
                    }`}
                  >
                    업체명
                    <button className={headStyles.table_sort_icon} onClick={() => handleSort('lgName')} />
                  </th>
                  <th
                    className={`${headStyles.table_th_sortable} ${
                      sortConfig.key === 'pdNum'
                        ? sortConfig.direction === 'asc'
                          ? headStyles.table_th_asc
                          : headStyles.table_th_desc
                        : ''
                    }`}
                  >
                    품번
                    <button className={headStyles.table_sort_icon} onClick={() => handleSort('pdNum')} />
                  </th>
                  <th
                    className={`${headStyles.table_th_sortable} ${
                      sortConfig.key === 'pdProducts'
                        ? sortConfig.direction === 'asc'
                          ? headStyles.table_th_asc
                          : headStyles.table_th_desc
                        : ''
                    }`}
                  >
                    제품명
                    <button className={headStyles.table_sort_icon} onClick={() => handleSort('pdProducts')} />
                  </th>
                  <th
                    className={`${headStyles.table_th_sortable} ${
                      sortConfig.key === 'pdPrice'
                        ? sortConfig.direction === 'asc'
                          ? headStyles.table_th_asc
                          : headStyles.table_th_desc
                        : ''
                    }`}
                  >
                    가격
                    <button className={headStyles.table_sort_icon} onClick={() => handleSort('pdPrice')} />
                  </th>
                  <th
                    className={`${headStyles.table_th_sortable} ${
                      sortConfig.key === 'stock'
                        ? sortConfig.direction === 'asc'
                          ? headStyles.table_th_asc
                          : headStyles.table_th_desc
                        : ''
                    }`}
                  >
                    재고
                    <button className={headStyles.table_sort_icon} onClick={() => handleSort('stock')} />
                  </th>
                  <th>입고</th>
                </tr>
              </thead>
              <tbody>
                {products.map(item => (
                  <tr
                    key={item.lpKey}
                    className={updatedKeys.includes(item.lpKey) ? headStyles.highlightRow : ''}
                  >
                    <td>{item.lgName}</td>
                    <td>{item.pdNum}</td>
                    <td>{item.pdProducts}</td>
                    <td>{item.pdPrice.toLocaleString()}원</td>
                    <td>{item.stock}</td>
                    <td>
                      <input
                        type="number"
                        className={`${headStyles.select_input} ${headStyles.none_arrow}`}
                        value={item.lpStoreInput}
                        min={0}
                        onChange={e => handleInputStockChange(item.lpKey, Number(e.target.value))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleUpdate(item.lpKey, item.lpStoreInput);
                          }
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="입고 수량"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default LogisticInbound;
