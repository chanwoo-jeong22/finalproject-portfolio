import React, { useEffect } from 'react';
import styles from '../../../styles/main.module.css';  // 경로가 맞으면 그대로, 아니면 조정 필요
import { useDispatch, useSelector } from 'react-redux';
import {
    setSortField,
    setSearchAgName,
    setSearchPdNum,
    setSearchPdProducts,
    setSearchDateFrom,
    setSearchDateTo,
    setSearchPriceFrom,
    setSearchPriceTo,
    applyFilter,
    fetchAgencyProducts,
} from '../../../redux/slices/head/agencyproductstatus-slice';
import type { RootState, AppDispatch } from '../../../redux/store';

function AgencyProductStatus() {
    const dispatch = useDispatch<AppDispatch>();
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
    } = useSelector((state: RootState) => state.agencyProductStatus);

    const token = useSelector((state: RootState) => state.auth.token);


    useEffect(() => {
        if (token) {
            dispatch(fetchAgencyProducts());
        }
    }, [dispatch, token]);

    // 검색어 변경시 액션 디스패치 및 필터 적용
    const onSearchChange = (setter: Function, value: string) => {
        dispatch(setter(value));  // dispatch 필수!
        dispatch(applyFilter());
    };

    // 정렬 버튼 클릭
    const onSortClick = (field: keyof typeof filteredProducts[0]) => {
        dispatch(setSortField(field));
    };

    // Enter키로 검색 실행
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            dispatch(applyFilter());
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
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchAgName}
                                onChange={e => onSearchChange(setSearchAgName, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className={styles.section}>
                            <p>품번</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchPdNum}
                                onChange={e => onSearchChange(setSearchPdNum, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className={styles.section}>
                            <p>제품명</p>
                            <input
                                type="text"
                                className={styles.input1}
                                value={searchPdProducts}
                                onChange={e => onSearchChange(setSearchPdProducts, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                    <div className={styles.line}>
                        <div className={styles.section}>
                            <p>가격별</p>
                            <input
                                type="text"
                                className={styles.input5}
                                value={searchPriceFrom}
                                onChange={e => onSearchChange(setSearchPriceFrom, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <p>~</p>
                            <input
                                type="text"
                                className={styles.input5}
                                value={searchPriceTo}
                                onChange={e => onSearchChange(setSearchPriceTo, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className={styles.section}>
                            <p>입고일</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchDateFrom}
                                onChange={e => onSearchChange(setSearchDateFrom, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <p>~</p>
                            <input
                                type="date"
                                className={`${styles.input1} ${styles.ta}`}
                                value={searchDateTo}
                                onChange={e => onSearchChange(setSearchDateTo, e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.right_select3}>
                    <button
                        className={`${styles.big_btn} ${styles.search}`}
                        onClick={() => dispatch(applyFilter())}
                    >
                        검색
                    </button>
                </div>
            </div>
            <div className={styles.table_container}>
                {loading ? (
                    <p className={styles.list_loading}>리스트를 불러오는 중입니다.</p>
                ) : error ? (
                    <p className={styles.list_loading}>에러 발생: {error}</p>
                ) : (
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
                                            <button
                                                className={styles.sort}
                                                onClick={() => onSortClick(field as keyof typeof filteredProducts[0])}
                                            >
                                                {sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '▼'}
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p, idx) => (
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
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AgencyProductStatus;
