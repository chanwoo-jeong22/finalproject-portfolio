import React, { useEffect, useState } from "react";
import styles from "../../../styles/main.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchLogisticProducts } from "../../../redux/slices/head/logisticproductstatus-slice";

// 물류 제품 타입
interface LogisticProduct {
  lgName: string;
  pdNum: string;
  pdProducts: string;
  pdPrice: number;
  stock: number;
  lpStore: string;
}

const LogisticProductStatus: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux 데이터
  const { products, loading } = useSelector(
    (state: RootState) => state.headLogisticProduct
  );

  // 로컬 상태
  const [filteredProducts, setFilteredProducts] = useState<LogisticProduct[]>([]);
  const [sortField, setSortField] = useState<string>("lgName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 검색 스테이트 (자동 검색용)
  const [searchLgName, setSearchLgName] = useState("");
  const [searchPdNum, setSearchPdNum] = useState("");
  const [searchPdProducts, setSearchPdProducts] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");

  // 1. 최초 API 호출
  useEffect(() => {
    dispatch(fetchLogisticProducts());
  }, [dispatch]);

  // 2. Redux 데이터 들어오면 초기화
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // ------------------------------------------------------------------
  // 자동 필터링 (타이핑하면 바로 반영)
  // ------------------------------------------------------------------
  useEffect(() => {
    let result = [...products];

    if (searchLgName) result = result.filter((p) => p.lgName.includes(searchLgName));
    if (searchPdNum) result = result.filter((p) => p.pdNum.includes(searchPdNum));
    if (searchPdProducts)
      result = result.filter((p) => p.pdProducts.includes(searchPdProducts));

    if (searchDateFrom) result = result.filter((p) => p.lpStore >= searchDateFrom);
    if (searchDateTo) result = result.filter((p) => p.lpStore <= searchDateTo);

    setFilteredProducts(result);
  }, [searchLgName, searchPdNum, searchPdProducts, searchDateFrom, searchDateTo, products]);

  // ------------------------------------------------------------------
  // 정렬 기능
  // ------------------------------------------------------------------
  const handleSort = (field: string) => {
    const newOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";

    setSortField(field);
    setSortOrder(newOrder);

    setFilteredProducts((prev) =>
      [...prev].sort((a, b) => {
        if (a[field as keyof LogisticProduct] < b[field as keyof LogisticProduct])
          return newOrder === "asc" ? -1 : 1;
        if (a[field as keyof LogisticProduct] > b[field as keyof LogisticProduct])
          return newOrder === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const getSortArrow = (field: string) => {
    if (sortField === field) return sortOrder === "asc" ? "▲" : "▼";
    return "▼";
  };

  // 초기화
  const handleReset = () => {
    setSearchLgName("");
    setSearchPdNum("");
    setSearchPdProducts("");
    setSearchDateFrom("");
    setSearchDateTo("");

    setFilteredProducts(products);
  };

  return (
    <div className={styles.contents_main}>
      <p className={styles.title}>물류업체 제품 현황</p>

      {/* 검색 영역 */}
      <div className={styles.select2}>
        <div className={styles.left_select}>
          <div className={styles.line}>
            <div className={styles.section}>
              <p>업체명</p>
              <input
                type="text"
                className={styles.input1}
                value={searchLgName}
                onChange={(e) => setSearchLgName(e.target.value)}
              />
            </div>

            <div className={styles.section}>
              <p>품번</p>
              <input
                type="text"
                className={styles.input1}
                value={searchPdNum}
                onChange={(e) => setSearchPdNum(e.target.value)}
              />
            </div>

            <div className={styles.section}>
              <p>제품명</p>
              <input
                type="text"
                className={styles.input1}
                value={searchPdProducts}
                onChange={(e) => setSearchPdProducts(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.line}>
            <div className={styles.section}>
              <p>입고일</p>
              <input
                type="date"
                className={`${styles.input1} ${styles.ta}`}
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
              />
              <span>~</span>
              <input
                type="date"
                className={`${styles.input1} ${styles.ta}`}
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.right_select2}>
          <button className={`${styles.big_btn} ${styles.reset}`} onClick={handleReset}>
            초기화
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className={styles.table_container}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.fixed}>
              {["lgName", "pdNum", "pdProducts", "pdPrice", "stock", "lpStore"].map(
                (field, idx) => (
                  <th key={idx}>
                    <div>
                      <p>
                        {field === "lgName"
                          ? "업체명"
                          : field === "pdNum"
                            ? "품번"
                            : field === "pdProducts"
                              ? "제품명"
                              : field === "pdPrice"
                                ? "가격"
                                : field === "stock"
                                  ? "재고"
                                  : field === "lpStore"
                                    ? "최신 입고일"
                                    : ""}
                      </p>
                      <button className={styles.sort} onClick={() => handleSort(field)}>
                        {getSortArrow(field)}
                      </button>
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p, idx) => (
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

        {loading && <p>로딩 중...</p>}
      </div>
    </div>
  );
};

export default LogisticProductStatus;
