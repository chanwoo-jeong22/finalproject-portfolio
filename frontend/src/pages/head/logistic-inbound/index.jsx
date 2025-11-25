import {useState, useEffect, useContext} from "react";
import headStyles from "../../../styles/head/head.module.css";
import axios from "axios";
import {AuthContext} from "../../../context/auth-context";
import styles from "../../../styles/main.module.css";

function LogisticInbound() {
    const {token} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]); // 현재 표시되는 제품 데이터
    const [allProducts, setAllProducts] = useState([]); // 전체 데이터 저장
    const [sortConfig, setSortConfig] = useState({key: "", direction: "asc"}); // 정렬
    const [filters, setFilters] = useState({
        lgName: "",
        pdNum: "",
        pdProducts: "",
        priceMin: "",
        priceMax: "",
        stockMin: "",
        stockMax: ""
    });
    const [updatedKeys, setUpdatedKeys] = useState([]); // 입고 등록된 row 강조 가능

    // 천 단위마다 콤마
    const formatNumber = (value) => {
        if (value === "" || value === null) return "";
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 입력 시 콤마 제거 후 숫자만 상태에 저장
    const handleComma = (key, value) => {
        const onlyNumber = value.replace(/,/g, ""); // 콤마 제거
        if (onlyNumber === "" || isNaN(onlyNumber)) {
            setFilters((prev) => ({ ...prev, [key]: "" }));
        } else {
            setFilters((prev) => ({ ...prev, [key]: parseInt(onlyNumber) }));
        }
    };

    // 데이터 가져오기
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/logisticproducts", {headers: {Authorization: `Bearer ${token}`}});

            console.log("API 응답 데이터:", res.data);
            console.log("첫 번째 항목:", res.data[0]);

            // 입고 수량 필드 추가 (초기값 0)
            const dataWithStore = res.data.map(p => ({...p, lpStoreInput: 0}));
            setProducts(dataWithStore);
            setAllProducts(dataWithStore);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
            alert("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 필터 input 업데이트
    const handleInputChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value}));
    };

    // 통합 검색
    const handleSearch = () => {
        const {lgName, pdNum, pdProducts, priceMin, priceMax, stockMin, stockMax} = filters;

        // 조건이 하나도 없으면 전체 데이터 표시 (초기화 역할)
        if (!lgName && !pdNum && !pdProducts && !priceMin && !priceMax && !stockMin && !stockMax) {
            setProducts(allProducts);
            return;
        }

        // 필터 적용
        let result = [...allProducts];

        if (lgName) result = result.filter(p => p.lgName.includes(lgName));
        if (pdNum) result = result.filter(p => p.pdNum.includes(pdNum));
        if (pdProducts) result = result.filter(p => p.pdProducts.includes(pdProducts));

        if (priceMin) result = result.filter(p => p.pdPrice >= parseInt(priceMin));
        if (priceMax) result = result.filter(p => p.pdPrice <= parseInt(priceMax));

        if (stockMin) result = result.filter(p => p.stock >= parseInt(stockMin));
        if (stockMax) result = result.filter(p => p.stock <= parseInt(stockMax));

        setProducts(result);
    };

    // 검색 초기화
    const handleReset = () => {
        setFilters({
            lgName: "",
            pdNum: "",
            pdProducts: "",
            priceMin: "",
            priceMax: "",
            stockMin: "",
            stockMax: ""
        });
        setProducts(allProducts); // 전체 데이터 표시
    };

    // 개별 입고 등록
    const handleUpdate = async (lpKey, quantity) => {
        try {
            if (!quantity || quantity <= 0) return;
            await axios.post(`http://localhost:8080/api/logistic-store/${lpKey}/update`, null, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {quantity}
                }
            );

            // products에서 해당 row만 갱신
            setProducts(prev =>
                prev.map(item =>
                    item.lpKey === lpKey
                        ? {...item, stock: item.stock + quantity, lpStoreInput: 0} // 수량 업데이트 후 입력 초기화
                        : item
                )
            );

            // 입고 등록 row 강조색
            setUpdatedKeys([lpKey]);
            alert("입력하신 입고가 등록되었습니다.");

        } catch (err) {
            console.error("입고 등록 오류:", err);
            alert("입고 등록 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
        }
    };

    // 여러 개 한 번에 입고 등록
    const handleBulkUpdate = async () => {
        try {
            const updates = products.filter(p => p.lpStoreInput > 0);

            if (updates.length === 0) {
                alert("입고할 수량을 입력하세요.");
                return;
            }

            // 데이터 확인
            console.log("업데이트할 첫 번째 항목:", updates[0]);

            await Promise.all(
                updates.map(p => {
                    if (!p.lpKey) {
                        console.error("lpKey가 없습니다:", p);
                        throw new Error(`lpKey가 없습니다: ${JSON.stringify(p)}`);
                    }

                    return axios.post(`http://localhost:8080/api/logistic-store/${p.lpKey}/update`, null, {
                        headers: {Authorization: `Bearer ${token}`},
                        params: {quantity: p.lpStoreInput}
                    });
                })
            );

            // products 배열에서 stock만 갱신 (row 순서 유지)
            setProducts(prev =>
                prev.map(item => {
                    const updated = updates.find(u => u.lpKey === item.lpKey);
                    if (updated) {
                        return {
                            ...item,
                            stock: item.stock + updated.lpStoreInput,
                            lpStoreInput: 0
                        };
                    }
                    return item;
                })
            );

            // 입고 등록 row 강조색
            setUpdatedKeys(updates.map(u => u.lpKey));

            alert("입력하신 모든 입고가 등록되었습니다.");

        } catch (err) {
            console.error("여러 입고 등록 오류:", err);
            alert("일괄 입고 등록 중에 오류가 발생했어요. 나중에 다시 시도해 주세요.");
        }
    };

    // 정렬 함수
    const handleSort = (key) => {
        setSortConfig(prev => {
            const direction = prev.key === key && prev.direction === "asc" ? "desc" : "asc";

            setProducts(prevProducts => {
                const sorted = [...prevProducts].sort((a, b) => {
                    let aValue = a[key];
                    let bValue = b[key];

                    if (typeof aValue === "string" && typeof bValue === "string") {
                        return direction === "asc"
                            ? aValue.localeCompare(bValue, "ko")
                            : bValue.localeCompare(aValue, "ko");
                    }

                    if (typeof aValue === "number" && typeof bValue === "number") {
                        return direction === "asc" ? aValue - bValue : bValue - aValue;
                    }

                    return 0;
                });
                return sorted;
            });

            return {key, direction};
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
                                        onChange={(e) => handleInputChange("lgName", e.target.value)}
                                        className={headStyles.select_input}
                                    />
                                </div>
                                <div className={headStyles.section}>
                                    <h5>품번</h5>
                                    <input
                                        type="text"
                                        value={filters.pdNum}
                                        onChange={(e) => handleInputChange("pdNum", e.target.value)}
                                        className={`${headStyles.select_input} ${headStyles.input_w150}`}
                                    />
                                </div>
                                <div className={headStyles.section}>
                                    <h5>제품명</h5>
                                    <input
                                        type="text"
                                        value={filters.pdProducts}
                                        onChange={(e) => handleInputChange("pdProducts", e.target.value)}
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
                                        onChange={(e) => handleComma("priceMin", e.target.value)}
                                        className={`${headStyles.select_input} ${headStyles.input_w80}`}
                                    />
                                    <span>~</span>
                                    <input
                                        type="text"
                                        value={formatNumber(filters.priceMax)}
                                        onChange={(e) => handleComma("priceMax", e.target.value)}
                                        className={`${headStyles.select_input} ${headStyles.input_w80}`}
                                    />
                                </div>
                                <div className={`${headStyles.section} ${headStyles.input_right}`}>
                                    <h5>재고별</h5>
                                    <input
                                        type="text"
                                        value={filters.stockMin}
                                        onChange={(e) => handleInputChange("stockMin", e.target.value)}
                                        className={`${headStyles.select_input} ${headStyles.input_w80}`}
                                    />
                                    <span>~</span>
                                    <input
                                        type="text"
                                        value={filters.stockMax}
                                        onChange={(e) => handleInputChange("stockMax", e.target.value)}
                                        className={`${headStyles.select_input} ${headStyles.input_w80}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={headStyles.right_select}>
                            <button className={`${headStyles.btn} ${headStyles.reset}`} onClick={handleReset}>초기화
                            </button>
                            <button className={`${headStyles.btn} ${headStyles.search}`} onClick={handleSearch}>검색
                            </button>
                            <button className={`${headStyles.btn} ${headStyles.ic_store}`} onClick={handleBulkUpdate}>입고
                            </button>
                        </div>
                    </div>
                </div>

                {/*물류 입고 리스트 영역*/}
                <div className={headStyles.table_container}>
                    {loading ? (
                      <p className={styles.list_loading}>리스트를 불러오는 중입니다.</p>
                    ) : (
                      <table className={`${headStyles.table} ${headStyles.table_lgStore}`}>
                          <thead>
                          <tr>
                              <th className={`${headStyles.table_th_sortable} ${
                                sortConfig.key === "lgName"
                                  ? sortConfig.direction === "asc"
                                    ? headStyles.table_th_asc
                                    : headStyles.table_th_desc
                                  : ""
                              }`}>
                                  업체명
                                  <button className={headStyles.table_sort_icon}
                                          onClick={() => handleSort("lgName")}></button>
                              </th>
                              <th className={`${headStyles.table_th_sortable} ${
                                sortConfig.key === "pdNum"
                                  ? sortConfig.direction === "asc"
                                    ? headStyles.table_th_asc
                                    : headStyles.table_th_desc
                                  : ""
                              }`}>
                                  품번
                                  <button className={headStyles.table_sort_icon}
                                          onClick={() => handleSort("pdNum")}></button>
                              </th>
                              <th className={`${headStyles.table_th_sortable} ${
                                sortConfig.key === "pdProducts"
                                  ? sortConfig.direction === "asc"
                                    ? headStyles.table_th_asc
                                    : headStyles.table_th_desc
                                  : ""
                              }`}>
                                  제품명
                                  <button className={headStyles.table_sort_icon}
                                          onClick={() => handleSort("pdProducts")}></button>
                              </th>
                              <th className={`${headStyles.table_th_sortable} ${
                                sortConfig.key === "pdPrice"
                                  ? sortConfig.direction === "asc"
                                    ? headStyles.table_th_asc
                                    : headStyles.table_th_desc
                                  : ""
                              }`}>
                                  가격
                                  <button className={headStyles.table_sort_icon}
                                          onClick={() => handleSort("pdPrice")}></button>
                              </th>
                              <th className={`${headStyles.table_th_sortable} ${
                                sortConfig.key === "stock"
                                  ? sortConfig.direction === "asc"
                                    ? headStyles.table_th_asc
                                    : headStyles.table_th_desc
                                  : ""
                              }`}>
                                  재고
                                  <button className={headStyles.table_sort_icon}
                                          onClick={() => handleSort("stock")}></button>
                              </th>
                              <th>입고</th>
                          </tr>
                          </thead>
                          <tbody>
                          {products.map((item) => (
                            <tr key={item.lpKey}
                                className={updatedKeys.includes(item.lpKey) ? headStyles.highlightRow : ""}>
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
                                      min="0" // 마이너스 방지
                                      onChange={(e) => {
                                          const value = Number(e.target.value);
                                          setProducts(prev =>
                                            prev.map(p => p.lpKey === item.lpKey ? {...p, lpStoreInput: value} : p)
                                          );
                                      }}
                                      onKeyDown={(e) => {
                                          // 엔터로 입고
                                          if (e.key === "Enter") {
                                              handleUpdate(item.lpKey, item.lpStoreInput);
                                          }
                                          // e 키 입력 차단 (마이너스, e, +, -, . 입력 방지)
                                          if (["e", "E", "+", "-", "."].includes(e.key)) {
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
    )
}

export default LogisticInbound