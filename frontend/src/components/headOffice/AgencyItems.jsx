import {useState, useEffect, useMemo, useContext} from "react";
import axios from "axios";
import headStyles from "./Head_jin.module.css";
import PdImgZoom from "./PdImgZoom.jsx";
import { AuthContext } from "../../context/AuthContext.tsx";

function AgencyItems() {
    const { token } = useContext(AuthContext);
    // -----------------------
    // 상태
    // -----------------------
    // 전체 본사 제품 (정규화된 형태)
    const [allProducts, setAllProducts] = useState([]);
    // 선택된 대리점 제품 (정규화된 형태)
    const [agencyProducts, setAgencyProducts] = useState([]);
    // 필터링 리스트 (UI에 보여줄 데이터)
    const [filteredAllProducts, setFilteredAllProducts] = useState([]);
    const [filteredAgencyProducts, setFilteredAgencyProducts] = useState([]);
    // 선택된 대리점
    const [selectedAgency, setSelectedAgency] = useState("");
    const [selectedAgencyName, setSelectedAgencyName] = useState("");
    // 대리점 리스트 (정규화)
    const [agencies, setAgencies] = useState([]);
    // 검색어
    const [searchNum, setSearchNum] = useState("");       // 품번
    const [searchName, setSearchName] = useState("");     // 제품명

    // 체크박스
    const [selectedAll, setSelectedAll] = useState(false);
    const [selectedAgencyAll, setSelectedAgencyAll] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]); // pdKey 배열
    const [selectedAgencyProducts, setSelectedAgencyProducts] = useState([]); // pdKey 배열

    // 제품 목록 정렬
    const [sortConfigAll, setSortConfigAll] = useState({ key: null, direction: "asc" });
    // 대리점 목록 정렬
    const [sortConfigAgency, setSortConfigAgency] = useState({ key: null, direction: "asc" });



    // -----------------------
    // 헬퍼: 정규화 / 유틸
    // -----------------------
    // 유틸: pdKey 기준 중복 제거 후 배열 반환
    const uniqByKey = (arr) => {
        const map = new Map();
        arr.forEach(item => {
            if (item && item.pdKey != null && !Number.isNaN(item.pdKey)) map.set(Number(item.pdKey), item);
        });
        return Array.from(map.values());
    };

    // -----------------------
    // 검색창 초기화 (입력값만)
    // -----------------------
    const handleResetSearch = () => {
        setSearchNum("");
        setSearchName("");
        setSelectedAgency("");
        setSelectedAgencyName("");
        // 검색창 초기화는 리스트 상태(필터된 리스트)는 건드리지 않음 (요구사항)
    };

    // -----------------------
    // 초기 데이터 불러오기
    // -----------------------
    useEffect(() => {
        // 본사 제품
        axios.get("/api/agency-items/products", {headers: {Authorization: `Bearer ${token}`}})
            .then(res => {
                console.log("본사 제품 API 응답:", res.data); // 일관된 필드명 확인
                // FIX: 정규화 적용
                const normalized = res.data.filter(p => p.pdKey !== null);
                setAllProducts(normalized);
                setFilteredAllProducts(normalized);
            })
            .catch(err => {
                console.error("GET /api/agency-items/products error:", err);
            });

        // 대리점 리스트
        axios.get("/api/agency-items", {headers: {Authorization: `Bearer ${token}`}})
            .then(res => {
                console.log("대리점 API 응답:", res.data);
                const normalized = res.data.filter(a => a.agKey !== null);
                setAgencies(normalized);
            })
            .catch(err => {
                console.error("GET /api/agency-items error:", err);
            });
    }, []);

    // -----------------------
    // 대리점 선택 시 2번 리스트 로드 + 1번 리스트 재계산
    // -----------------------
    useEffect(() => {
        if (!selectedAgency) {
            setSelectedAgencyName("");
            setAgencyProducts([]);
            setFilteredAgencyProducts([]);
            // 1번 리스트는 모든 제품(아직 대리점이 없으므로 전체)
            setFilteredAllProducts(allProducts);
            return;
        }

        // selectedAgency는 value가 문자열일 수 있으니 숫자로 변환
        const agencyIdNum = Number(selectedAgency);
        const agencyObj = agencies.find(a => Number(a.agKey) === agencyIdNum);
        setSelectedAgencyName(agencyObj ? agencyObj.agName : "");

        axios.get(`/api/agency-items/${agencyIdNum}/products`, {headers: {Authorization: `Bearer ${token}`}})
            .then(res => {
                console.log("대리점 제품 API 응답:", res.data); // 일관된 필드명 확인
                const normalized = res.data.filter(p => p.pdKey !== null);
                const uniq = uniqByKey(normalized);
                setAgencyProducts(uniq);
                setFilteredAgencyProducts(uniq);

                // 1번 리스트 재계산 → agencyProducts에 없는 제품만 남기기 (pdKey 비교)
                const agencyKeys = new Set(uniq.map(x => Number(x.pdKey)));
                const newAll = allProducts.filter(p => !agencyKeys.has(Number(p.pdKey)));
                setFilteredAllProducts(newAll);
            })
            .catch(err => {
                console.error(`GET /api/agency/${agencyIdNum}/products error:`, err);
                // 실패 시 안전하게 1번 리스트는 전체로 돌려놓음
                setAgencyProducts([]);
                setFilteredAgencyProducts([]);
                setFilteredAllProducts(allProducts);
            });

        // 체크박스 초기화
        setSelectedProducts([]);
        setSelectedAgencyProducts([]);
        setSelectedAll(false);
        setSelectedAgencyAll(false);
        // FIX: allProducts도 의존성으로 추가해서 allProducts가 변경되면 재계산되도록 함
    }, [selectedAgency, agencies, allProducts]);

    // -----------------------
    // 체크박스 관련
    // -----------------------
    const handleCheckAll = () => {
        if (selectedAll) setSelectedProducts([]);
        else setSelectedProducts(filteredAllProducts.map(p => p.pdKey));
        setSelectedAll(!selectedAll);
    };

    const handleCheckAgencyAll = () => {
        if (selectedAgencyAll) setSelectedAgencyProducts([]);
        else setSelectedAgencyProducts(filteredAgencyProducts.map(p => p.pdKey));
        setSelectedAgencyAll(!selectedAgencyAll);
    };

    const handleCheck = (pdKey) => {
        setSelectedProducts(prev => prev.includes(pdKey) ? prev.filter(id => id !== pdKey) : [...prev, pdKey]);
    };

    const handleCheckAgency = (pdKey) => {
        setSelectedAgencyProducts(prev => prev.includes(pdKey) ? prev.filter(id => id !== pdKey) : [...prev, pdKey]);
    };

// -----------------------
// 등록 (1 -> 2)
// -----------------------
    const handleRegister = () => {
        if (!selectedAgency) {
            alert("대리점을 선택해야 등록할 수 있습니다.");
            return;
        }
        if (selectedProducts.length === 0) {
            alert("등록할 제품을 선택해주세요.");
            return;
        }

        const agencyIdNum = Number(selectedAgency);

        axios.post(`/api/agency-items/${agencyIdNum}/register`, selectedProducts, {headers: {Authorization: `Bearer ${token}`}})
            .then(() => {
                // 서버 반영 후 프론트 상태 업데이트 (중복 제거)
                const toRegister = filteredAllProducts.filter(p => selectedProducts.includes(p.pdKey));
                // 최신 등록 제품 위로 추가
                const updatedAgencyProducts = uniqByKey([...toRegister, ...agencyProducts]);
                setAgencyProducts(updatedAgencyProducts);

                // 검색 필터 유지
                setFilteredAgencyProducts(
                    updatedAgencyProducts.filter(p =>
                        String(p.pdNum).includes(searchNum) &&
                        String(p.pdProducts).includes(searchName)
                    )
                );

                // 1번 리스트 재계산: allProducts - agencyProducts
                const updatedAll = allProducts.filter(p => !updatedAgencyProducts.some(ap => ap.pdKey === p.pdKey));
                setFilteredAllProducts(
                    updatedAll.filter(p =>
                        String(p.pdNum).includes(searchNum) &&
                        String(p.pdProducts).includes(searchName)
                    )
                );

                setSelectedProducts([]);
                setSelectedAll(false);
            })
            .catch(err => {
                console.error(`POST /api/agency/${agencyIdNum}/register error:`, err);
                alert("등록 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.");
            });
    };

// -----------------------
// 삭제 (2 -> 1)
// -----------------------
    const handleDelete = () => {
        if (!selectedAgency) {
            alert("삭제하려면 먼저 대리점을 선택하세요.");
            return;
        }
        if (selectedAgencyProducts.length === 0) {
            alert("삭제할 제품을 선택해주세요.");
            return;
        }

        const agencyIdNum = Number(selectedAgency);

        axios.post(`/api/agency-items/${agencyIdNum}/delete`, selectedAgencyProducts, {headers: {Authorization: `Bearer ${token}`}})
            .then(() => {
                const toDelete = filteredAgencyProducts.filter(p => selectedAgencyProducts.includes(p.pdKey));
                const updatedAgencyProducts = filteredAgencyProducts.filter(p => !selectedAgencyProducts.includes(p.pdKey));

                setAgencyProducts(updatedAgencyProducts);

                // 검색 필터 유지
                setFilteredAgencyProducts(
                    updatedAgencyProducts.filter(p =>
                        String(p.pdNum).includes(searchNum) &&
                        String(p.pdProducts).includes(searchName)
                    )
                );

                // 1번 리스트 갱신, 최신 삭제 제품 위로
                const updatedAll = uniqByKey([...toDelete, ...allProducts.filter(p => !updatedAgencyProducts.some(ap => ap.pdKey === p.pdKey))]);
                setFilteredAllProducts(updatedAll.filter(p =>
                    (String(p.pdNum).includes(searchNum)) &&
                    (String(p.pdProducts).includes(searchName))
                ));

                setSelectedAgencyProducts([]);
                setSelectedAgencyAll(false);
            })
            .catch(err => {
                console.error(`POST /api/agency/${agencyIdNum}/delete error:`, err);
                alert("삭제 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.");
            });
    };


    // -----------------------
    // 검색
    // -----------------------
    const handleSearch = () => {
        const filteredAll = allProducts.filter(
            p => !agencyProducts.some(ap => ap.pdKey === p.pdKey) &&
                (String(p.pdNum || "").includes(String(searchNum || ""))) &&
                (String(p.pdProducts || "").includes(String(searchName || "")))
        );

        const filteredAgency = agencyProducts.filter(
            p => (String(p.pdNum || "").includes(String(searchNum || ""))) &&
                (String(p.pdProducts || "").includes(String(searchName || "")))
        );

        setFilteredAllProducts(filteredAll);
        setFilteredAgencyProducts(filteredAgency);

        // 체크박스 초기화
        setSelectedProducts([]);
        setSelectedAll(false);
        setSelectedAgencyProducts([]);
        setSelectedAgencyAll(false);
    };

    // -----------------------
    // 리스트 초기화 (각각)
    // -----------------------
    const handleResetAllProducts = () => {
        setSelectedProducts([]);
        setSelectedAll(false);
        setFilteredAllProducts(allProducts.filter(p => !agencyProducts.some(ap => ap.pdKey === p.pdKey)));
    };

    const handleResetAgencyProducts = () => {
        setSelectedAgencyProducts([]);
        setSelectedAgencyAll(false);
        setFilteredAgencyProducts(agencyProducts);
    };


    // 리스트 정렬
    // 제품목록 정렬
    const sortedAllProducts = useMemo(() => {
        if (!sortConfigAll.key) return filteredAllProducts;
        return [...filteredAllProducts].sort((a, b) => {
            const aValue = a[sortConfigAll.key] ?? "";
            const bValue = b[sortConfigAll.key] ?? "";
            if (aValue < bValue) return sortConfigAll.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfigAll.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredAllProducts, sortConfigAll]);


    // 대리점목록 정렬
    const sortedAgencyProducts = useMemo(() => {
        if (!sortConfigAgency.key) return filteredAgencyProducts;
        return [...filteredAgencyProducts].sort((a, b) => {
            const aValue = a[sortConfigAgency.key] ?? "";
            const bValue = b[sortConfigAgency.key] ?? "";
            if (aValue < bValue) return sortConfigAgency.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfigAgency.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredAgencyProducts, sortConfigAgency]);

    // 제품목록 handleSort
    const handleSortAll = (key) => {
        let direction = "asc";
        if (sortConfigAll.key === key && sortConfigAll.direction === "asc") {
            direction = "desc";
        }
        setSortConfigAll({ key, direction });
    };

    // 대리점목록 handleSort
    const handleSortAgency = (key) => {
        let direction = "asc";
        if (sortConfigAgency.key === key && sortConfigAgency.direction === "asc") {
            direction = "desc";
        }
        setSortConfigAgency({ key, direction });
    };


    return (
        <div className={`${headStyles.content} ${headStyles.content_grid3}`}>
            <h1 className={headStyles.title}>대리점 취급 품목</h1>

            {/*검색영역*/}
            <div className={`${headStyles.select_wrap} ${headStyles.select_bg}`}>
                <div className={headStyles.left_select}>
                    {/*대리점 선택 시 대리점 취급 품목 목록에 선택된 대리점의 취급 품목 리스트가 출력됨*/}
                    <div className={headStyles.section}>
                        <h5>대리점</h5>
                        <select value={selectedAgency} onChange={e => setSelectedAgency(e.target.value)}>
                            <option value="">선택하세요</option>
                            {agencies.map(a => (
                                <option key={a.agKey} value={a.agKey}>{a.agName || "이름없음"}</option>
                            ))}
                        </select>
                    </div>

                    {/*품번과 제품명은 각 리스트 모두 공통으로 사용
                     : 제품목록에 대리점 취급품목은 제외되므로 각 리스트에 중복되는 상품이 없으므로 검색 시 상품이 있는 쪽에 리스트 출력 */}
                    <div className={headStyles.section}>
                        <h5>품번</h5>
                        <input
                            type="text"
                            className={`${headStyles.select_input} ${headStyles.input_w150}`}
                            value={searchNum}
                            onChange={e => setSearchNum(e.target.value)}
                        />
                    </div>
                    <div className={headStyles.section}>
                        <h5>제품명</h5>
                        <input
                            type="text"
                            className={headStyles.select_input}
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                        />
                    </div>
                </div>

                <div className={headStyles.right_select}>
                    <button className={`${headStyles.btn} ${headStyles.reset}`} onClick={handleResetSearch}>초기화</button>
                    <button className={`${headStyles.btn} ${headStyles.search}`} onClick={handleSearch}>검색</button>
                </div>
            </div>

            {/*리스트 영역*/}
            <div className={headStyles.column_grid3}>
                {/*전체 제품 리스트(대리점 취급 품목은 제외)*/}
                <section className={headStyles.sec_grid}>
                    <h1 className={headStyles.s_title}>제품 목록</h1>
                    <div className={headStyles.table_container}>
                        <table className={`${headStyles.table} ${headStyles.table_agPdReg}`}>
                            <thead>
                            <tr>
                                <th className={headStyles.t_check_box}>
                                    <input type="checkbox" checked={selectedAll} onChange={handleCheckAll}/>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfigAll.key === "pdCategory"
                                        ? (sortConfigAll.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    카테고리
                                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAll("pdCategory")}></button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfigAll.key === "pdNum"
                                        ? (sortConfigAll.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    품번
                                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAll("pdNum")}></button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfigAll.key === "pdProducts"
                                        ? (sortConfigAll.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    제품명
                                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAll("pdProducts")}></button>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedAllProducts.map(product => (
                                // 진경 tr 클래스 추가
                                <tr key={product.pdKey} className={selectedProducts.includes(product.pdKey) ? headStyles.checkedRow : ""}>
                                    <td className={headStyles.t_check_box}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.pdKey)}
                                            onChange={() => handleCheck(product.pdKey)}
                                        />
                                    </td>
                                    <td>{product.pdCategory}</td>
                                    <td>{product.pdNum}</td>
                                    <td>
                                        <div className={headStyles.list_flex}>
                                            <PdImgZoom imageUrl={
                                                product.pdImage.startsWith('/uploads/')
                                                    ? `http://localhost:8080${product.pdImage}`
                                                    : `http://localhost:8080/uploads/product/${product.pdImage}`
                                            } altText={product.pdProducts}>
                                                <button className={headStyles.pd_zoom}></button>
                                            </PdImgZoom>
                                            <span>{product.pdProducts}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/*리스트 초기화 버튼*/}
                    <button className={headStyles.list_reset_btn} onClick={handleResetAllProducts}></button>
                </section>

                {/* 등록/삭제 버튼 */}
                <div className={headStyles.middle_btnArea}>
                    <button className={`${headStyles.border_btn} ${headStyles.add_btn}`} onClick={handleRegister}>등록
                    </button>
                    <button className={`${headStyles.border_btn} ${headStyles.del_btn}`} onClick={handleDelete}>삭제
                    </button>
                </div>

                {/*각 대리점 취급품목 리스트 : 검색창에서 대리점 선택 시에 리스트 출력됨*/}
                <section className={headStyles.sec_grid}>
                    <h1 className={headStyles.s_title}>
                        {selectedAgencyName ? `${selectedAgencyName} 목록` : '대리점 목록'}
                    </h1>

                    <div className={headStyles.table_container}>
                        <table className={`${headStyles.table} ${headStyles.table_agPdReg}`}>
                            <thead>
                            <tr>
                                <th className={headStyles.t_check_box}>
                                    <input type="checkbox" checked={selectedAgencyAll} onChange={handleCheckAgencyAll}/>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfigAgency.key === "pdCategory"
                                        ? (sortConfigAgency.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    카테고리
                                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAgency("pdCategory")}></button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfigAgency.key === "pdNum"
                                        ? (sortConfigAgency.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    품번
                                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAgency("pdNum")}></button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfigAgency.key === "pdProducts"
                                        ? (sortConfigAgency.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    제품명
                                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAgency("pdProducts")}></button>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedAgencyProducts.map(product => (
                                // 진경 tr 클래스 추가
                                <tr key={product.pdKey} className={selectedAgencyProducts.includes(product.pdKey) ? headStyles.checkedRow : ""} >
                                    <td className={headStyles.t_check_box}>
                                        <input
                                            type="checkbox"
                                            checked={selectedAgencyProducts.includes(product.pdKey)}
                                            onChange={() => handleCheckAgency(product.pdKey)}
                                        />
                                    </td>
                                    <td>{product.pdCategory}</td>
                                    <td>{product.pdNum}</td>
                                    <td>
                                        <div className={headStyles.list_flex}>
                                            <PdImgZoom imageUrl={
                                                product.pdImage.startsWith('/uploads/')
                                                    ? `http://localhost:8080${product.pdImage}`
                                                    : `http://localhost:8080/uploads/product/${product.pdImage}`
                                            } altText={product.pdProducts}>
                                                <button className={headStyles.pd_zoom}></button>
                                            </PdImgZoom>
                                            <span>{product.pdProducts}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/*리스트 초기화 버튼*/}
                    <button className={headStyles.list_reset_btn} onClick={handleResetAgencyProducts}></button>
                </section>
            </div>
        </div>
    )
}

export default AgencyItems;