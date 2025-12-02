import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import headStyles from "../../../styles/head/head.module.css";
import PdImgZoom from "../../../components/head/pdlmgzoom/index";
import api from "../../../api/api";

import type { RootState } from "../../../redux/store";

interface Product {
  pdKey: number;
  pdNum: string;
  pdProducts: string;
  pdCategory: string;
  pdImage: string;
}

interface Agency {
  agKey: number;
  agName: string;
}

function AgencyItems() {
  const token = useSelector((state: RootState) => state.auth.token);

  // 상태
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [agencyProducts, setAgencyProducts] = useState<Product[]>([]);
  const [filteredAllProducts, setFilteredAllProducts] = useState<Product[]>([]);
  const [filteredAgencyProducts, setFilteredAgencyProducts] = useState<Product[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [selectedAgencyName, setSelectedAgencyName] = useState<string>("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [searchNum, setSearchNum] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");

  const [selectedAll, setSelectedAll] = useState<boolean>(false);
  const [selectedAgencyAll, setSelectedAgencyAll] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedAgencyProducts, setSelectedAgencyProducts] = useState<number[]>([]);

  const [sortConfigAll, setSortConfigAll] = useState<{ key: keyof Product | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });
  const [sortConfigAgency, setSortConfigAgency] = useState<{ key: keyof Product | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });

  const uniqByKey = (arr: Product[]) => {
    const map = new Map<number, Product>();
    arr.forEach(item => {
      if (item && item.pdKey != null && !Number.isNaN(item.pdKey)) map.set(Number(item.pdKey), item);
    });
    return Array.from(map.values());
  };

  const handleResetSearch = () => {
    setSearchNum("");
    setSearchName("");
    setSelectedAgency("");
    setSelectedAgencyName("");
  };

  useEffect(() => {
    if (!token) return;
    api.get("/agency-items/products", {
    })
      .then(res => {
        const normalized = res.data.filter((p: Product) => p.pdKey !== null);
        const uniqueNormalized = uniqByKey(normalized);  // 여기서 중복 제거
        setAllProducts(uniqueNormalized);
        setFilteredAllProducts(uniqueNormalized);
      })

      .catch(err => {
        console.error("GET /agency-items/products error:", err);
      });

    api.get("/agency-items", {
    })
      .then(res => {
        const normalized = res.data.filter((a: Agency) => a.agKey !== null);
        setAgencies(normalized);
      })
      .catch(err => {
        console.error("GET /agency-items error:", err);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!selectedAgency) {
      setSelectedAgencyName("");
      setAgencyProducts([]);
      setFilteredAgencyProducts([]);
      setFilteredAllProducts(allProducts);
      return;
    }

    const agencyIdNum = Number(selectedAgency);
    const agencyObj = agencies.find(a => Number(a.agKey) === agencyIdNum);
    setSelectedAgencyName(agencyObj ? agencyObj.agName : "");

    api.get(`/agency-items/${agencyIdNum}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const normalized = res.data.filter((p: Product) => p.pdKey !== null);
        const uniq = uniqByKey(normalized);
        setAgencyProducts(uniq);
        setFilteredAgencyProducts(uniq);

        const agencyKeys = new Set(uniq.map(x => Number(x.pdKey)));
        const newAll = allProducts.filter(p => !agencyKeys.has(Number(p.pdKey)));
        setFilteredAllProducts(newAll);
      })
      .catch(err => {
        console.error(`GET /agency-items/${agencyIdNum}/products error:`, err);
        setAgencyProducts([]);
        setFilteredAgencyProducts([]);
        setFilteredAllProducts(allProducts);
      });

    setSelectedProducts([]);
    setSelectedAgencyProducts([]);
    setSelectedAll(false);
    setSelectedAgencyAll(false);
  }, [selectedAgency, agencies, allProducts, token]);

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

  const handleCheck = (pdKey: number) => {
    setSelectedProducts(prev => (prev.includes(pdKey) ? prev.filter(id => id !== pdKey) : [...prev, pdKey]));
  };

  const handleCheckAgency = (pdKey: number) => {
    setSelectedAgencyProducts(prev => (prev.includes(pdKey) ? prev.filter(id => id !== pdKey) : [...prev, pdKey]));
  };

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

    api.post(`/agency-items/${agencyIdNum}/register`, selectedProducts, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        const toRegister = filteredAllProducts.filter(p => selectedProducts.includes(p.pdKey));
        const updatedAgencyProducts = uniqByKey([...toRegister, ...agencyProducts]);
        setAgencyProducts(updatedAgencyProducts);

        setFilteredAgencyProducts(
          updatedAgencyProducts.filter(p =>
            String(p.pdNum).includes(searchNum) &&
            String(p.pdProducts).includes(searchName)
          )
        );

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
        console.error(`POST /agency-items/${agencyIdNum}/register error:`, err);
        alert("등록 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.");
      });
  };

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

    api.post(`/agency-items/${agencyIdNum}/delete`, selectedAgencyProducts, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        const toDelete = filteredAgencyProducts.filter(p => selectedAgencyProducts.includes(p.pdKey));
        const updatedAgencyProducts = filteredAgencyProducts.filter(p => !selectedAgencyProducts.includes(p.pdKey));

        setAgencyProducts(updatedAgencyProducts);

        setFilteredAgencyProducts(
          updatedAgencyProducts.filter(p =>
            String(p.pdNum).includes(searchNum) &&
            String(p.pdProducts).includes(searchName)
          )
        );

        const updatedAll = uniqByKey([...toDelete, ...allProducts.filter(p => !updatedAgencyProducts.some(ap => ap.pdKey === p.pdKey))]);
        setFilteredAllProducts(
          updatedAll.filter(p =>
            String(p.pdNum).includes(searchNum) &&
            String(p.pdProducts).includes(searchName)
          )
        );

        setSelectedAgencyProducts([]);
        setSelectedAgencyAll(false);
      })
      .catch(err => {
        console.error(`POST /agency-items/${agencyIdNum}/delete error:`, err);
        alert("삭제 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.");
      });
  };

  const handleSearch = () => {
    const filteredAll = allProducts.filter(
      p => !agencyProducts.some(ap => ap.pdKey === p.pdKey) &&
        String(p.pdNum || "").includes(String(searchNum || "")) &&
        String(p.pdProducts || "").includes(String(searchName || ""))
    );

    const filteredAgency = agencyProducts.filter(
      p => String(p.pdNum || "").includes(String(searchNum || "")) &&
        String(p.pdProducts || "").includes(String(searchName || ""))
    );

    setFilteredAllProducts(filteredAll);
    setFilteredAgencyProducts(filteredAgency);

    setSelectedProducts([]);
    setSelectedAll(false);
    setSelectedAgencyProducts([]);
    setSelectedAgencyAll(false);
  };

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

  const sortedAllProducts = useMemo(() => {
    const key = sortConfigAll.key;
    if (!key) return filteredAllProducts;
    return [...filteredAllProducts].sort((a, b) => {
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";
      if (aValue < bValue) return sortConfigAll.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfigAll.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredAllProducts, sortConfigAll]);

  const sortedAgencyProducts = useMemo(() => {
    const key = sortConfigAgency.key;
    if (!key) return filteredAgencyProducts;
    return [...filteredAgencyProducts].sort((a, b) => {
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";
      if (aValue < bValue) return sortConfigAgency.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfigAgency.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredAgencyProducts, sortConfigAgency]);


  const handleSortAll = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfigAll.key === key && sortConfigAll.direction === "asc") {
      direction = "desc";
    }
    setSortConfigAll({ key, direction });
  };

  const handleSortAgency = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfigAgency.key === key && sortConfigAgency.direction === "asc") {
      direction = "desc";
    }
    setSortConfigAgency({ key, direction });
  };

  return (
    <div className={`${headStyles.content} ${headStyles.content_grid3}`}>
      <h1 className={headStyles.title}>대리점 취급 품목</h1>

      {/* 검색영역 */}
      <div className={`${headStyles.select_wrap} ${headStyles.select_bg}`}>
        <div className={headStyles.left_select}>
          <div className={headStyles.section}>
            <h5>대리점</h5>
            <select value={selectedAgency} onChange={e => setSelectedAgency(e.target.value)}>
              <option value="">선택하세요</option>
              {agencies.map(a => (
                <option key={a.agKey} value={a.agKey}>{a.agName || "이름없음"}</option>
              ))}
            </select>
          </div>

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

      {/* 리스트 영역 */}
      <div className={headStyles.column_grid3}>
        <section className={headStyles.sec_grid}>
          <h1 className={headStyles.s_title}>제품 목록</h1>
          <div className={headStyles.table_container}>
            <table className={`${headStyles.table} ${headStyles.table_agPdReg}`}>
              <thead>
                <tr>
                  <th className={headStyles.t_check_box}>
                    <input type="checkbox" checked={selectedAll} onChange={handleCheckAll} />
                  </th>
                  <th className={`${headStyles.table_th_sortable} ${sortConfigAll.key === "pdCategory"
                    ? (sortConfigAll.direction === "asc"
                      ? headStyles.table_th_asc
                      : headStyles.table_th_desc)
                    : ""
                    }`}>
                    카테고리
                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAll("pdCategory")}></button>
                  </th>
                  <th className={`${headStyles.table_th_sortable} ${sortConfigAll.key === "pdNum"
                    ? (sortConfigAll.direction === "asc"
                      ? headStyles.table_th_asc
                      : headStyles.table_th_desc)
                    : ""
                    }`}>
                    품번
                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAll("pdNum")}></button>
                  </th>
                  <th className={`${headStyles.table_th_sortable} ${sortConfigAll.key === "pdProducts"
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
                        <PdImgZoom
                          imageUrl={
                            product.pdImage.startsWith("/uploads/")
                              ? `http://localhost:8080${product.pdImage}`
                              : `http://localhost:8080/uploads/product/${product.pdImage}`
                          }
                          altText={product.pdProducts}
                        >
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
          <button className={headStyles.list_reset_btn} onClick={handleResetAllProducts}></button>
        </section>

        <div className={headStyles.middle_btnArea}>
          <button className={`${headStyles.border_btn} ${headStyles.add_btn}`} onClick={handleRegister}>등록</button>
          <button className={`${headStyles.border_btn} ${headStyles.del_btn}`} onClick={handleDelete}>삭제</button>
        </div>

        <section className={headStyles.sec_grid}>
          <h1 className={headStyles.s_title}>
            {selectedAgencyName ? `${selectedAgencyName} 목록` : "대리점 목록"}
          </h1>

          <div className={headStyles.table_container}>
            <table className={`${headStyles.table} ${headStyles.table_agPdReg}`}>
              <thead>
                <tr>
                  <th className={headStyles.t_check_box}>
                    <input type="checkbox" checked={selectedAgencyAll} onChange={handleCheckAgencyAll} />
                  </th>
                  <th className={`${headStyles.table_th_sortable} ${sortConfigAgency.key === "pdCategory"
                    ? (sortConfigAgency.direction === "asc"
                      ? headStyles.table_th_asc
                      : headStyles.table_th_desc)
                    : ""
                    }`}>
                    카테고리
                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAgency("pdCategory")}></button>
                  </th>
                  <th className={`${headStyles.table_th_sortable} ${sortConfigAgency.key === "pdNum"
                    ? (sortConfigAgency.direction === "asc"
                      ? headStyles.table_th_asc
                      : headStyles.table_th_desc)
                    : ""
                    }`}>
                    품번
                    <button className={headStyles.table_sort_icon} onClick={() => handleSortAgency("pdNum")}></button>
                  </th>
                  <th className={`${headStyles.table_th_sortable} ${sortConfigAgency.key === "pdProducts"
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
                  <tr key={product.pdKey} className={selectedAgencyProducts.includes(product.pdKey) ? headStyles.checkedRow : ""}>
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
                        <PdImgZoom
                          imageUrl={
                            product.pdImage.startsWith("/uploads/")
                              ? `http://localhost:8080${product.pdImage}`
                              : `http://localhost:8080/uploads/product/${product.pdImage}`
                          }
                          altText={product.pdProducts}
                        >
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
          <button className={headStyles.list_reset_btn} onClick={handleResetAgencyProducts}></button>
        </section>
      </div>
    </div>
  );
}

export default AgencyItems;
