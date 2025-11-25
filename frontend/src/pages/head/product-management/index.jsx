import { useEffect, useState } from 'react';

// 정환 수정
import { useApi } from "../../../api/axios-instance.ts";
// 정환 수정

import styles from '../../../styles/main.module.css';

function ProductManagement() {

    // 정환 수정
    const api = useApi();
    // 정환 수정

    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState({ pdNum: '', pdProducts: '', pdPrice: '' });
    const [newProduct, setNewProduct] = useState({ pdCategory: '', pdNum: '', pdProducts: '', pdPrice: '', pdImage: '' });
    const [editProduct, setEditProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newImageFile, setNewImageFile] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchProducts = async () => {
        try {
            console.log('token:', localStorage.getItem('token'));
            // 정환 수정
            const res = await api.get('/api/products');
            // 정환 수정

            const sorted = res.data.sort((a, b) => {
                if (a.pdNum < b.pdNum) return 1;
                if (a.pdNum > b.pdNum) return -1;
                return 0;
            });

            setAllProducts(sorted);
            setProducts(sorted);
            setSortField('pdNum');
            setSortOrder('desc');
        } catch (err) {
            console.error(err);
            alert('제품 조회 실패');
        }
    };

    useEffect(() => {
        (async () => {
            await fetchProducts();
        })();
    }, []);

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (!window.confirm('선택한 제품을 정말 삭제하시겠습니까?')) return;
        try {
            // 정환 수정
            await api.delete('/api/products/delete', { data: selectedIds });
            // 정환 수정

            alert('삭제 완료!');
            setSelectedIds([]);
            await fetchProducts();
        } catch (err) {
            console.error(err);
            alert('삭제 실패');
        }
    };

    const handleSearch = () => {
        const filtered = allProducts.filter(p =>
            (!search.pdNum || p.pdNum.includes(search.pdNum)) &&
            (!search.pdProducts || p.pdProducts.includes(search.pdProducts)) &&
            (!search.pdPrice || p.pdPrice === Number(search.pdPrice))
        );
        setProducts(filtered);
    };

    const handleRegister = async () => {
        const { pdCategory, pdNum, pdProducts, pdPrice } = newProduct;

        if (!pdCategory || !pdProducts || !pdPrice || !newImageFile) {
            alert('모든 필드(카테고리, 제품명, 단가, 이미지)를 입력해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('pd_category', pdCategory);
            formData.append('pd_num', pdNum);
            formData.append('pd_products', pdProducts);
            formData.append('pd_price', pdPrice.toString());
            formData.append('pd_image', newImageFile);

            // 정환 수정
            await api.post('/api/products/create', formData);
            // 정환 수정

            alert('등록 완료!');
            setNewProduct({ pdCategory: '', pdNum: '', pdProducts: '', pdPrice: '', pdImage: '' });
            setNewImageFile(null);
            setShowModal(false);
            await fetchProducts();

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                alert(JSON.stringify(err.response.data, null, 2));
            } else {
                alert('등록 실패');
            }
        }
    };

    const handleUpdate = async () => {
        if (!editProduct) return;

        const { pdCategory, pdNum, pdProducts, pdPrice, pdKey } = editProduct;

        if (!pdCategory || !pdProducts || !pdPrice) {
            alert('모든 필드(카테고리, 제품명, 단가)를 입력해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('pd_key', pdKey.toString());
            formData.append('pd_num', pdNum);
            formData.append('pd_category', pdCategory);
            formData.append('pd_products', pdProducts);
            formData.append('pd_price', pdPrice.toString());
            if (editImageFile) formData.append('pd_image', editImageFile);

            // 정환 수정
            await api.post('/api/products/update', formData);
            // 정환 수정

            alert('수정 완료!');
            setShowEditModal(false);
            setEditImageFile(null);
            await fetchProducts();
        } catch (err) {
            console.error(err?.response || err);
            alert(err?.response?.data || '수정 실패');
        }
    };

    const openEditModal = (product) => {
        console.log('Clicked product:', product);
        setEditProduct({ ...product });
        setShowEditModal(true);
    };

    const handleNewImageChange = (e) => {
        const file = e.target.files[0];
        setNewImageFile(file);
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result != null) {
                setNewProduct(prev => ({ ...prev, pdImage: reader.result.toString() }));
            }
        };

        reader.readAsDataURL(file);
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        setEditImageFile(file);
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setEditProduct(prev => ({ ...prev, pdImage: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSort = (field) => {
        let order = 'asc';
        if (sortField === field) order = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sorted = [...products].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });
        setProducts(sorted);
    };

    // 초기화 버튼 : 진경 추가
    const handleReset = () => {
        setSearch({ pdNum: '', pdProducts: '', pdPrice: '' }); // 검색 필드 초기화
        setProducts(allProducts); // 전체 제품으로 초기화
    };

    return (
        <div className={styles.contents_main}>
            <p className={styles.title}>제품 관리</p>

            <div className={styles.select3}>
                <div className={`${styles.left_select} ${styles.jc}`}>
                    <div className={styles.line}>
                        {['pdNum', 'pdProducts', 'pdPrice'].map((field) => (
                            <div className={styles.section} key={field}>
                                <p>{field === 'pdNum' ? '품번' : field === 'pdProducts' ? '제품명' : '단가'}</p>
                                <input
                                    type="text"
                                    className={styles.input1}
                                    value={search[field]}
                                    onChange={(e) => setSearch({ ...search, [field]: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.right_select1}>
                    <button onClick={handleReset} className={`${styles.big_btn} ${styles.reset}`}>초기화</button>
                    <button onClick={handleDelete} className={`${styles.big_btn} ${styles.delete}`}>삭제</button>
                    <button onClick={() => setShowModal(true)} className={`${styles.big_btn} ${styles.register}`}>등록</button>
                </div>
            </div>

            <div className={styles.table_container}>
                <table className={`${styles.table} ${styles.head_product_list}`}>
                    <thead>
                    <tr>
                        <th className={styles.t_w40}>
                            <input
                                type="checkbox"
                                onChange={(e) => setSelectedIds(e.target.checked ? products.map(p => Number(p.pdKey)) : [])}
                                checked={selectedIds.length === products.length && products.length > 0}
                            />
                        </th>
                        {['pdNum','pdCategory','pdProducts','pdPrice'].map((field) => (
                            <th key={field} onClick={() => handleSort(field)}>
                                <div>
                                    <p>{field==='pdNum'?'품번':field==='pdCategory'?'카테고리':field==='pdProducts'?'제품명':'단가'}</p>
                                    <button>{sortField===field ? (sortOrder==='asc'?'▲':'▼'):'▼'}</button>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((p) => (
                        <tr key={p.pdKey} className={selectedIds.includes(Number(p.pdKey)) ? styles.checkedRow : ''}>
                            <td className={styles.t_w40}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(Number(p.pdKey))}
                                    onChange={() => toggleSelect(Number(p.pdKey))}
                                />
                            </td>
                            <td onClick={() => openEditModal(p)}>{p.pdNum}</td>
                            <td onClick={() => openEditModal(p)}>{p.pdCategory}</td>
                            <td className={styles.t_left} onClick={() => openEditModal(p)}>{p.pdProducts}</td>
                            <td className={styles.t_right} onClick={() => openEditModal(p)}>{Number(p.pdPrice).toLocaleString()}원</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className={styles.modal_overlay}>
                    <div className={styles.modal}>
                        <button onClick={() => setShowModal(false)} className={styles.modal_close_btn}></button>
                        <h2>제품 등록</h2>
                        <div className={styles.center}>
                            <div className={styles.modal_content}>
                                <p className={styles.pop_stitle}>카테고리</p>
                                {/*<select*/}
                                {/*    className={styles.pop_input}*/}
                                {/*    value={newProduct.pdCategory}*/}
                                {/*    onChange={(e) => setNewProduct({ ...newProduct, pdCategory: e.target.value })}*/}
                                {/*>*/}
                                {/*    <option value="라면류">라면류</option>*/}
                                {/*    <option value="즉석식품류">즉석식품류</option>*/}
                                {/*    <option value="과자류">과자류</option>*/}
                                {/*    <option value="음료류">음료류</option>*/}
                                {/*    <option value="빵류">빵류</option>*/}
                                {/*    <option value="생활용품">생활용품</option>*/}
                                {/*</select>*/}
                                <div className={styles.categoryGroup}>
                                    {["라면류", "즉석식품류", "과자류", "음료류", "빵류", "생활용품"].map((cat) => (
                                        <label
                                            key={cat}
                                            className={`${styles.categoryOption} ${newProduct.pdCategory === cat ? styles.active : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="pdCategory"
                                                value={cat}
                                                checked={newProduct.pdCategory === cat}
                                                onChange={(e) => setNewProduct({
                                                    ...newProduct,
                                                    pdCategory: e.target.value
                                                })}
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
                                    onChange={(e) => setNewProduct({...newProduct, pdProducts: e.target.value})}
                                />

                                <label className={styles.pop_stitle}>단가</label>
                                <input
                                    className={styles.pop_input}
                                    type="text"
                                    value={newProduct.pdPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/,/g, ''); // 콤마 제거
                                        if (!isNaN(rawValue)) {
                                            setNewProduct({ ...newProduct, pdPrice: rawValue });
                                        }
                                    }}
                                />
                            </div>
                            <div className={styles.modal_right}>
                                <p className={styles.pop_stitle}>제품 이미지</p>
                                <div className={styles.img_box}>
                                    {newProduct.pdImage && <img src={newProduct.pdImage} alt="preview" />}
                                    {!newProduct.pdImage && (
                                      <p className={styles.img_up_text}>
                                          파일 선택 버튼을 눌러 파일을 직접 선택해 주세요.
                                      </p>
                                    )}
                                </div>
                                <label className={styles.pop_img_btn}>
                                    파일 선택
                                    <input type="file" accept="image/*" onChange={handleNewImageChange}
                                           className={styles.hidden}/>
                                </label>
                            </div>
                        </div>
                        <div className={styles.modal_buttons}>
                            {/*진경 버튼 클래스명 변경*/}
                            <button onClick={handleRegister} className={styles.pop_btn_register}>등록</button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewProduct({ pdCategory: '', pdNum: '', pdProducts: '', pdPrice: '', pdImage: '' });
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
                                {/*<select*/}
                                {/*    className={styles.input4}*/}
                                {/*    value={editProduct.pdCategory}*/}
                                {/*    onChange={(e) => setEditProduct({ ...editProduct, pdCategory: e.target.value })}*/}
                                {/*>*/}
                                {/*    <option value=""></option>*/}
                                {/*    <option value="라면">라면</option>*/}
                                {/*    <option value="과자">과자</option>*/}
                                {/*    <option value="껌">껌</option>*/}
                                {/*    <option value="사탕">사탕</option>*/}
                                {/*</select>*/}
                                <div className={styles.categoryGroup}>
                                    {["라면류", "즉석식품류", "과자류", "음료류", "빵류", "생활용품"].map((cat) => (
                                        <label
                                            key={cat}
                                            className={`${styles.categoryOption} ${editProduct.pdCategory === cat ? styles.active : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="editCategory"
                                                value={cat}
                                                checked={editProduct.pdCategory === cat}
                                                onChange={(e) => setEditProduct({ ...editProduct, pdCategory: e.target.value })}
                                            />
                                            {cat}
                                        </label>
                                    ))}
                                </div>

                                <label className={styles.pop_stitle}>제품명</label>
                                <input
                                    className={styles.pop_input}
                                    type="text"
                                    value={editProduct.pdProducts}
                                    onChange={(e) => setEditProduct({ ...editProduct, pdProducts: e.target.value })}
                                />

                                <label className={styles.pop_stitle}>단가</label>
                                <input
                                    className={styles.pop_input}
                                    type="text"
                                    value={editProduct.pdPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/,/g, ''); // 콤마 제거
                                        if (!isNaN(rawValue)) {
                                            setEditProduct({ ...editProduct, pdPrice: rawValue });
                                        }
                                    }}
                                />
                            </div>
                            <div className={styles.modal_right}>
                                <p className={styles.pop_stitle}>제품 이미지</p>
                                <div className={styles.img_box}>
                                    {editProduct.pdImage && (
                                        <img
                                            src={
                                                typeof editProduct.pdImage === 'string' && editProduct.pdImage.startsWith('data:')
                                                    ? editProduct.pdImage
                                                    : editProduct.pdImage.startsWith('/uploads/')
                                                        ? `http://localhost:8080${editProduct.pdImage}`
                                                        : `http://localhost:8080/uploads/product/${editProduct.pdImage}`
                                            }
                                            alt="preview"
                                        />
                                    )}
                                    {!editProduct.pdImage && (
                                      <p className={styles.img_up_text}>
                                          파일 선택 버튼을 눌러 파일을 직접 선택해 주세요.
                                      </p>
                                    )}
                                </div>
                                <label className={styles.pop_img_btn}>
                                    파일 선택
                                    <input type="file" accept="image/*" onChange={handleEditImageChange} className={styles.hidden}/>
                                </label>
                            </div>
                        </div>
                        <div className={styles.modal_buttons}>
                            {/*진경 버튼 클래스명 변경*/}
                            <button onClick={handleUpdate} className={styles.pop_btn_register}>수정</button>
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
