import React, { useEffect, useState, ChangeEvent } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import api from "../../../api/api";
import styles from "../../../styles/main.module.css";

interface Product {
  pdKey: number;
  pdCategory: string;
  pdNum: string;
  pdProducts: string;
  pdPrice: number;
  pdImage?: string;
}

interface SearchType {
  pdNum: string;
  pdProducts: string;
  pdPrice: string;
}

interface NewProductType {
  pdCategory: string;
  pdNum: string;
  pdProducts: string;
  pdPrice: string | number;
  pdImage: string;
}

function ProductManagement() {
  // Redux에서 토큰 가져오기
  const token = useSelector((state: RootState) => state.auth.token);

  // 전체 상품 목록 상태 (서버에서 받아온 모든 상품)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  // 필터링된 상품 목록 상태 (검색어에 맞춰 보여줄 리스트)
  const [products, setProducts] = useState<Product[]>([]);
  // 체크박스 선택된 상품 키 목록 상태
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 검색 필터 상태: 품번, 제품명, 단가
  const [search, setSearch] = useState<SearchType>({ pdNum: "", pdProducts: "", pdPrice: "" });
  // 신규 등록용 상품 정보 상태
  const [newProduct, setNewProduct] = useState<NewProductType>({
    pdCategory: "",
    pdNum: "",
    pdProducts: "",
    pdPrice: "",
    pdImage: "",
  });
  // 수정용 상품 정보 상태
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  // 신규 등록 모달 표시 상태
  const [showModal, setShowModal] = useState<boolean>(false);
  // 수정 모달 표시 상태
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  // 신규 등록 이미지 파일 상태
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  // 수정 이미지 파일 상태
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  // 정렬 기준 필드 상태
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  // 정렬 방향 상태 (오름차순/내림차순)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 서버에서 상품 목록을 가져오는 함수
  const fetchProducts = async () => {
    try {
      const res = await api.get<Product[]>("/products");

      // 기본적으로 품번(pdNum) 내림차순 정렬
      const sorted = res.data.sort((a, b) => {
        if (a.pdNum < b.pdNum) return 1;
        if (a.pdNum > b.pdNum) return -1;
        return 0;
      });

      setAllProducts(sorted);
      setProducts(sorted);
      setSortField("pdNum");
      setSortOrder("desc");
    } catch (err) {
      console.error(err);
      alert("제품 조회 실패");
    }
  };

  // 토큰이 바뀌거나 컴포넌트가 처음 마운트될 때 상품 목록 가져오기
  useEffect(() => {
    fetchProducts();
  }, [token]);

  // 상품 선택/해제 토글 함수
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // 선택된 상품들 삭제 함수
  const handleDelete = async () => {
    if (!window.confirm("선택한 제품을 정말 삭제하시겠습니까?")) return;
    try {
      await api.delete("/api/products/delete", {
        data: selectedIds,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      alert("삭제 완료!");
      setSelectedIds([]);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  // --- 자동 필터링을 위한 함수 ---
  // 현재 allProducts에서 search 상태에 맞는 항목만 필터링하여 products에 저장
  const filterProducts = () => {
    const filtered = allProducts.filter((p) => {
      const pdPriceNum = Number(search.pdPrice); // 단가 검색은 숫자 비교
      return (
        (!search.pdNum || p.pdNum.includes(search.pdNum)) && // 품번 포함 여부
        (!search.pdProducts || p.pdProducts.toLowerCase().includes(search.pdProducts.toLowerCase())) && // 제품명 포함 여부 (대소문자 무시)
        (!search.pdPrice || p.pdPrice === pdPriceNum) // 단가 일치 여부
      );
    });
    setProducts(filtered);
  };

  // search 상태나 allProducts 상태가 바뀔 때마다 자동으로 필터링 수행
  useEffect(() => {
    filterProducts();
  }, [search, allProducts]);

  // 신규 상품 등록 함수
  const handleRegister = async () => {
    const { pdCategory, pdNum, pdProducts, pdPrice } = newProduct;

    // 필수 입력값 체크
    if (!pdCategory || !pdProducts || !pdPrice || !newImageFile) {
      alert("모든 필드(카테고리, 제품명, 단가, 이미지)를 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pd_category", pdCategory);
      formData.append("pd_num", pdNum);
      formData.append("pd_products", pdProducts);
      formData.append("pd_price", pdPrice.toString());
      formData.append("pd_image", newImageFile);

      await api.post("/api/products/create", formData, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            }
          : { "Content-Type": "multipart/form-data" },
      });

      alert("등록 완료!");
      // 등록 후 초기화
      setNewProduct({ pdCategory: "", pdNum: "", pdProducts: "", pdPrice: "", pdImage: "" });
      setNewImageFile(null);
      setShowModal(false);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  // 기존 상품 수정 함수
  const handleUpdate = async () => {
    if (!editProduct) return;

    const { pdCategory, pdNum, pdProducts, pdPrice, pdKey } = editProduct;

    if (!pdCategory || !pdProducts || !pdPrice) {
      alert("모든 필드(카테고리, 제품명, 단가)를 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pd_key", pdKey.toString());
      formData.append("pd_num", pdNum);
      formData.append("pd_category", pdCategory);
      formData.append("pd_products", pdProducts);
      formData.append("pd_price", pdPrice.toString());
      if (editImageFile) formData.append("pd_image", editImageFile);

      await api.post("/api/products/update", formData, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            }
          : { "Content-Type": "multipart/form-data" },
      });

      alert("수정 완료!");
      setShowEditModal(false);
      setEditImageFile(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  // 수정 모달 열기 함수
  const openEditModal = (product: Product) => {
    setEditProduct({ ...product });
    setShowEditModal(true);
  };

  // 신규 등록 이미지 파일 변경 핸들러
  const handleNewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewImageFile(file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct((prev) => (prev ? { ...prev, pdImage: reader.result ? reader.result.toString() : "" } : prev));
    };
    reader.readAsDataURL(file);
  };

  // 수정 이미지 파일 변경 핸들러
  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditProduct((prev) => (prev ? { ...prev, pdImage: reader.result?.toString() } : prev));
    };
    reader.readAsDataURL(file);
  };

  // 테이블 헤더 클릭 시 정렬 처리 함수
  const handleSort = (field: keyof Product) => {
    let order: "asc" | "desc" = "asc";
    if (sortField === field) order = sortOrder === "asc" ? "desc" : "asc"; // 같은 필드 클릭 시 정렬 방향 토글
    setSortField(field);
    setSortOrder(order);

    // 현재 보여지는 products 배열 기준 정렬
    const sorted = [...products].sort((a, b) => {
      const aVal = a[field]!;
      const bVal = b[field]!;
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
    setProducts(sorted);
  };

  // 검색 필드 초기화 함수 (초기화 버튼 클릭 시 호출)
  const handleReset = () => {
    setSearch({ pdNum: "", pdProducts: "", pdPrice: "" });
    setProducts(allProducts);
  };

  return (
    <div className={styles.contents_main}>
      <p className={styles.title}>제품 관리</p>

      {/* 검색 및 버튼 영역 */}
      <div className={styles.select3}>
        <div className={`${styles.left_select} ${styles.jc}`}>
          <div className={styles.line}>
            {/* 검색 입력 필드들 */}
            {["pdNum", "pdProducts", "pdPrice"].map((field) => (
              <div className={styles.section} key={field}>
                <p>{field === "pdNum" ? "품번" : field === "pdProducts" ? "제품명" : "단가"}</p>
                <input
                  type="text"
                  className={styles.input1}
                  value={search[field as "pdNum" | "pdProducts" | "pdPrice"]}
                  onChange={(e) => setSearch({ ...search, [field]: e.target.value })}
                  // Enter 키 눌러도 자동 필터링되므로 별도 검색 함수 호출 불필요
                  // onKeyDown 제거 가능
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right_select1}>
          <button onClick={handleReset} className={`${styles.big_btn} ${styles.reset}`}>
            초기화
          </button>
          <button onClick={handleDelete} className={`${styles.big_btn} ${styles.delete}`}>
            삭제
          </button>
          <button onClick={() => setShowModal(true)} className={`${styles.big_btn} ${styles.register}`}>
            등록
          </button>
        </div>
      </div>

      {/* 상품 리스트 테이블 */}
      <div className={styles.table_container}>
        <table className={`${styles.table} ${styles.head_product_list}`}>
          <thead>
            <tr>
              {/* 전체 선택 체크박스 */}
              <th className={styles.t_w40}>
                <input
                  type="checkbox"
                  onChange={(e) => setSelectedIds(e.target.checked ? products.map((p) => Number(p.pdKey)) : [])}
                  checked={selectedIds.length === products.length && products.length > 0}
                />
              </th>

              {/* 정렬 가능 컬럼 헤더 */}
              {["pdNum", "pdCategory", "pdProducts", "pdPrice"].map((field) => (
                <th key={field} onClick={() => handleSort(field as "pdNum" | "pdCategory" | "pdProducts" | "pdPrice")}>
                  <div>
                    <p>{field === "pdNum" ? "품번" : field === "pdCategory" ? "카테고리" : field === "pdProducts" ? "제품명" : "단가"}</p>
                    <button>{sortField === field ? (sortOrder === "asc" ? "▲" : "▼") : "▼"}</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 상품 데이터 행 */}
            {products.map((p) => (
              <tr key={p.pdKey} className={selectedIds.includes(Number(p.pdKey)) ? styles.checkedRow : ""}>
                <td className={styles.t_w40}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(Number(p.pdKey))}
                    onChange={() => toggleSelect(Number(p.pdKey))}
                  />
                </td>
                {/* 클릭하면 수정 모달 열림 */}
                <td onClick={() => openEditModal(p)}>{p.pdNum}</td>
                <td onClick={() => openEditModal(p)}>{p.pdCategory}</td>
                <td className={styles.t_left} onClick={() => openEditModal(p)}>
                  {p.pdProducts}
                </td>
                <td className={styles.t_right} onClick={() => openEditModal(p)}>
                  {Number(p.pdPrice).toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 신규 등록 모달 */}
      {showModal && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <button onClick={() => setShowModal(false)} className={styles.modal_close_btn}></button>
            <h2>제품 등록</h2>
            <div className={styles.center}>
              <div className={styles.modal_content}>
                <p className={styles.pop_stitle}>카테고리</p>
                <div className={styles.categoryGroup}>
                  {["라면류", "즉석식품류", "과자류", "음료류", "빵류", "생활용품"].map((cat) => (
                    <label key={cat} className={`${styles.categoryOption} ${newProduct.pdCategory === cat ? styles.active : ""}`}>
                      <input
                        type="radio"
                        name="pdCategory"
                        value={cat}
                        checked={newProduct.pdCategory === cat}
                        onChange={(e) => setNewProduct({ ...newProduct, pdCategory: e.target.value })}
                      />
                      {cat}
                    </label>
                  ))}
                </div>

                <label className={styles.pop_stitle}>제품명</label>
                <input
                  className={styles.pop_input}
                  type="text"
                  value={newProduct.pdProducts}
                  onChange={(e) => setNewProduct({ ...newProduct, pdProducts: e.target.value })}
                />

                <label className={styles.pop_stitle}>단가</label>
                <input
                  className={styles.pop_input}
                  type="text"
                  value={newProduct.pdPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, ""); // 콤마 제거
                    // 숫자 외 입력 막음 + 빈값 허용
                    if (/^\d*$/.test(rawValue)) {
                      setNewProduct({ ...newProduct, pdPrice: rawValue });
                    }
                  }}
                />
              </div>
              <div className={styles.modal_right}>
                <p className={styles.pop_stitle}>제품 이미지</p>
                <div className={styles.img_box}>
                  {newProduct.pdImage && <img src={newProduct.pdImage} alt="preview" />}
                  {!newProduct.pdImage && <p className={styles.img_up_text}>파일 선택 버튼을 눌러 파일을 직접 선택해 주세요.</p>}
                </div>
                <label className={styles.pop_img_btn}>
                  파일 선택
                  <input type="file" accept="image/*" onChange={handleNewImageChange} className={styles.hidden} />
                </label>
              </div>
            </div>
            <div className={styles.modal_buttons}>
              <button onClick={handleRegister} className={styles.pop_btn_register}>
                등록
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewProduct({ pdCategory: "", pdNum: "", pdProducts: "", pdPrice: "", pdImage: "" });
                  setNewImageFile(null);
                }}
                className={styles.pop_btn_cancel}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && editProduct && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <button onClick={() => setShowEditModal(false)} className={styles.modal_close_btn}></button>
            <h2>제품 수정</h2>
            <div className={styles.center}>
              <div className={styles.modal_content}>
                <label className={styles.pop_stitle}>카테고리</label>
                <div className={styles.categoryGroup}>
                  {["라면류", "즉석식품류", "과자류", "음료류", "빵류", "생활용품"].map((cat) => (
                    <label key={cat} className={`${styles.categoryOption} ${editProduct.pdCategory === cat ? styles.active : ""}`}>
                      <input
                        type="radio"
                        name="editCategory"
                        value={cat}
                        checked={editProduct.pdCategory === cat}
                        onChange={(e) =>
                          setEditProduct((prev) => (prev ? { ...prev, pdCategory: e.target.value } : prev))
                        }
                      />
                      {cat}
                    </label>
                  ))}
                </div>

                <label className={styles.pop_stitle}>품번</label>
                <input
                  className={styles.pop_input}
                  type="text"
                  value={editProduct.pdNum}
                  readOnly
                />

                <label className={styles.pop_stitle}>제품명</label>
                <input
                  className={styles.pop_input}
                  type="text"
                  value={editProduct.pdProducts}
                  onChange={(e) =>
                    setEditProduct((prev) => (prev ? { ...prev, pdProducts: e.target.value } : prev))
                  }
                />

                <label className={styles.pop_stitle}>단가</label>
                <input
                  className={styles.pop_input}
                  type="text"
                  value={editProduct.pdPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(rawValue)) {
                      setEditProduct((prev) =>
                        prev ? { ...prev, pdPrice: Number(rawValue) } : prev
                      );
                    }
                  }}
                />
              </div>

              <div className={styles.modal_right}>
                <p className={styles.pop_stitle}>제품 이미지</p>
                <div className={styles.img_box}>
                  {editProduct.pdImage && <img src={editProduct.pdImage} alt="preview" />}
                  {!editProduct.pdImage && <p className={styles.img_up_text}>파일 선택 버튼을 눌러 파일을 직접 선택해 주세요.</p>}
                </div>
                <label className={styles.pop_img_btn}>
                  파일 선택
                  <input type="file" accept="image/*" onChange={handleEditImageChange} className={styles.hidden} />
                </label>
              </div>
            </div>
            <div className={styles.modal_buttons}>
              <button onClick={handleUpdate} className={styles.pop_btn_register}>
                수정
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditProduct(null);
                  setEditImageFile(null);
                }}
                className={styles.pop_btn_cancel}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
