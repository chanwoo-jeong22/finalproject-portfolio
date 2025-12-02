import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';  // Redux hooks (타입 안전)
import {
    fetchHeadProducts,  // 슬라이스에서 변경된 thunk 이름
    setSortField,
    setSearchAgName,
    setSearchPdNum,
    setSearchPdProducts,
    setSearchDateFrom,
    setSearchDateTo,
    setSearchPriceFrom,
    setSearchPriceTo,
    applyFilter,
} from '../../../redux/slices/head/agencyproductstatus-slice';  // 경로는 본인 환경에 맞게 조정

import styles from '../../../styles/main.module.css';

// 본사용 대리점 제품 현황 컴포넌트
const AgencyProductStatus: React.FC = () => {
    const dispatch = useAppDispatch();

    // Redux 상태값 읽기
    const {
        filteredProducts,
        sortField,
        sortOrder,
        searchAgName,
        searchPdNum,
        searchPdProducts,
        searchDateFrom,
        searchDateTo,
        searchPriceFrom,
        searchPriceTo,
        loading,
        error,
    } = useAppSelector(state => state.agencyProductStatus);

    // 컴포넌트 마운트 시 본사 API에서 제품 리스트 조회
    useEffect(() => {
        dispatch(fetchHeadProducts());
    }, [dispatch]);

    // 정렬 필드 변경 처리
    const handleSort = (field: string) => {
        dispatch(setSortField(field as any));
    };

    // 검색어 상태 변경 핸들러
    const handleChange = (field: string, value: string) => {
        switch (field) {
            case 'agName':
                dispatch(setSearchAgName(value));
                break;
            case 'pdNum':
                dispatch(setSearchPdNum(value));
                break;
            case 'pdProducts':
                dispatch(setSearchPdProducts(value));
                break;
            case 'dateFrom':
                dispatch(setSearchDateFrom(value));
                break;
            case 'dateTo':
                dispatch(setSearchDateTo(value));
                break;
            case 'priceFrom':
                dispatch(setSearchPriceFrom(value));
                break;
            case 'priceTo':
                dispatch(setSearchPriceTo(value));
                break;
        }
    };

    // 엔터 입력 시 필터 적용
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            dispatch(applyFilter());
        }
    };

    // 검색 버튼 클릭 시 필터 적용
    const handleSearch = () => {
        dispatch(applyFilter());
    };

    // 정렬 방향 표시 함수
    const getSortArrow = (field: string) => {
        if (sortField === field) return sortOrder === 'asc' ? '▲' : '▼';
        return '▼';
    };

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>대리점 제품 현황</p>
            <div className={styles.select1}>
                <div className={styles.left_select}>
                    <div className={styles.line}>
                        {/* 업체명 검색 */}
                        <div className={styles.section}>
                            <p>업체명</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchAgName}
                                onChange={e => handleChange('agName', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {/* 품번 검색 */}
                        <div className={styles.section}>
                            <p>품번</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchPdNum}
                                onChange={e => handleChange('pdNum', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {/* 제품명 검색 */}
                        <div className={styles.section}>
                            <p>제품명</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchPdProducts}
                                onChange={e => handleChange('pdProducts', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                    <div className={styles.line}>
                        {/* 가격 범위 검색 */}
                        <div className={styles.section}>
                            <p>가격별</p>
                            <input
                                type="text"
                                className={styles.input5}
                                value={searchPriceFrom}
                                onChange={e => handleChange('priceFrom', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <p>~</p>
                            <input
                                type="text"
                                className={styles.input5}
                                value={searchPriceTo}
                                onChange={e => handleChange('priceTo', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {/* 입고일 범위 검색 */}
                        <div className={styles.section}>
                            <p>입고일</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchDateFrom}
                                onChange={e => handleChange('dateFrom', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <p>~</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchDateTo}
                                onChange={e => handleChange('dateTo', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.right_select3}>
                    <button className={`${styles.big_btn} ${styles.search}`} onClick={handleSearch}>
                        검색
                    </button>
                </div>
            </div>

            {/* 로딩 상태 및 에러 표시 */}
            {loading ? (
                <p className={styles.list_loading}>리스트를 불러오는 중입니다.</p>
            ) : error ? (
                <p className={styles.list_loading} style={{ color: 'red' }}>
                    {error}
                </p>
            ) : (
                <div className={styles.table_container}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {['agName', 'pdNum', 'pdProducts', 'pdPrice', 'apStore'].map((field, idx) => (
                                    <th key={idx}>
                                        <div>
                                            <p>
                                                {field === 'agName'
                                                    ? '업체명'
                                                    : field === 'pdNum'
                                                        ? '품번'
                                                        : field === 'pdProducts'
                                                            ? '제품명'
                                                            : field === 'pdPrice'
                                                                ? '가격'
                                                                : '입고일'}
                                            </p>
                                            <button className={styles.sort} onClick={() => handleSort(field)}>
                                                {getSortArrow(field)}
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts && filteredProducts.length > 0 ? (
                                filteredProducts.map((p, idx) => (
                                    <tr key={idx}>
                                        <td className={styles.t_left}>{p.agName}</td>
                                        <td>{p.pdNum}</td>
                                        <td className={styles.t_left}>{p.pdProducts}</td>
                                        <td className={styles.t_right}>
                                            {p.pdPrice
                                                ? parseInt(String(p.pdPrice).replace(/[^\d]/g, ''), 10).toLocaleString() + '원'
                                                : '-'}
                                        </td>
                                        <td>{p.apStore}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center' }}>
                                        결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AgencyProductStatus;
