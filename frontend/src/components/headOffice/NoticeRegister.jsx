import {useContext, useEffect, useState} from "react";
import axios from "axios";
import headStyles from './Head_jin.module.css';
import HeadPopup from './HeadPopup';
import NoticeDetail from './NoticeDetail';

// 정환 추가
import { AuthContext } from '../../context/AuthContext.tsx';
// 정환 추가

const API_URL = "http://localhost:8080/api/notices";

function NoticeRegister() {

    // 정환 추가
    const { token } = useContext(AuthContext);
    // 정환 추가

    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [registerCategory1, setRegisterCategory1] = useState('');
    const [registerCategory2, setRegisterCategory2] = useState('');
    const [content, setContent] = useState('');

    const [searchCategory1, setSearchCategory1] = useState('');
    const [searchCategory2, setSearchCategory2] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState('');

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [detailNotice, setDetailNotice] = useState(null);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const isAllChecked = notices.length > 0 && notices.every(item => item.isChecked);

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setNotices(notices.map(item => ({ ...item, isChecked: checked })));
    };

    const handleSelectOne = (rowId) => {
        setNotices(notices.map(item => {
            const itemId = (item.ntKey ?? item.nt_key ?? item.id);
            return itemId === rowId ? { ...item, isChecked: !item.isChecked } : item;
        }));
    };

    // 정렬
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        setNotices((prev) => {
            return [...prev].sort((a, b) => {
                let aValue, bValue;

                if (key === 'atCreated') {
                    aValue = (a.atCreated ?? a.at_created) || '';
                    bValue = (b.atCreated ?? b.at_created) || '';
                } else if (key === 'startDate') {
                    // 노출기간은 시작일 기준으로 정렬
                    aValue = a.startDate || '';
                    bValue = b.startDate || '';
                } else if (key === 'ntCode') {
                    aValue = a.ntCode ?? a.code;
                    bValue = b.ntCode ?? b.code;
                } else if (key === 'ntCategory') {
                    aValue = a.ntCategory ?? a.category2 ?? '';
                    bValue = b.ntCategory ?? b.category2 ?? '';
                }

                if (key === 'atCreated' || key === 'startDate') {
                    aValue = aValue ? new Date(aValue) : new Date(0);
                    bValue = bValue ? new Date(bValue) : new Date(0);
                }

                if (typeof aValue === "string") aValue = aValue.toLowerCase();
                if (typeof bValue === "string") bValue = bValue.toLowerCase();

                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        });
    };

    // 상세보기
    const handleNoticeClick = (notice) => {
        setDetailNotice(notice);
        setShowDetail(true);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setDetailNotice(null);
        // 목록 새로고침
        fetchNotices({
            category1: searchCategory1,
            category2: searchCategory2,
            date: searchDate
        });
    };

    const handleSaveSuccess = () => {
        // 상세보기 닫기
        handleCloseDetail();
    };

    const handleDeleteSuccess = () => {
        // 상세보기 닫기
        handleCloseDetail();
    };

    // 공지사항 조회
    const fetchNotices = async (params = {}) => {

        // 정환 추가
        if (!token) return;
        // 정환 추가

        setIsLoading(true);
        setError(null);
        try {
            let codes = [];
            if (!params.category1 || params.category1 === "0") {
                codes = [0,1,2,3]; // 전체
            } else {
                codes = [Number(params.category1), 0];
            }

            const response = await axios.get(API_URL, {
                params: { codes },

                // 정환 추가
                headers: { Authorization: `Bearer ${token}` }
                // 정환 추가
            });
            let data = response.data;

            if (params.category2 && params.category2 !== "0") {
                data = data.filter(item => (item.ntCategory ?? item.category2) === params.category2);
            }
            if (params.searchDate) {
                data = data.filter(item => (item.atCreated ?? item.at_created)?.split("T")[0] === params.searchDate);
            }

            // 등록일 기준 내림차순 정렬 (최신순)
            data.sort((a, b) => new Date(b.atCreated ?? b.at_created) - new Date(a.atCreated ?? a.at_created));

            setNotices(data.map(item => ({
                ...item,
                isChecked: false,
                ntKey: item.ntKey,
                ntCode: item.ntCode,
                ntCategory: item.ntCategory,
                ntContent: item.ntContent,
                startDate: item.startDate,
                endDate: item.endDate,
                atCreated: item.atCreated
            })));
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [token]);

    const handleSearch = () => {
        fetchNotices({
            category1: searchCategory1,
            category2: searchCategory2,
            searchDate: searchDate
        });
    };

    // 공지사항 등록
    const handleRegisterNotice = async () => {
        if (!registerCategory1) {
            alert("대분류를 선택해주세요!");
            return;
        }
        if (!registerCategory2 || !content.trim()) {
            alert('소분류와 내용을 모두 입력해주세요!');
            return;
        }

        // 날짜 유효성 검증
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start && start < now) {
            alert("시작일은 오늘 이후 날짜여야 합니다.");
            return;
        }

        if (start && end && start > end) {
            alert("시작일은 종료일보다 이전이어야 합니다.");
            return;
        }

        if (start && end && end < start) {
            alert("종료일은 시작일보다 이후 날짜여야 합니다.");
            return;
        }

        if (end && end < now) {
            alert("종료일은 오늘 이후 날짜여야 합니다.");
            return;
        }

        try {
            let codeToSave = Number(registerCategory1);
            if (registerCategory1 === "0") codeToSave = 0; // 전체 코드 저장

            // 종료일 기본값 2개월 뒤
            let end = endDate;
            if (!end) {
                const twoMonthsLater = new Date();
                twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
                end = twoMonthsLater.toISOString().split("T")[0];
            }

            await axios.post(API_URL, {
                    ntCode: codeToSave,
                    ntCategory: registerCategory2,
                    ntContent: content
                }, {
                    ntContent: content,
                    startDate: startDate || null,
                    endDate: endDate || null
                },
                {headers: { Authorization: `Bearer ${token}` }} // 정환 추가
            );


            alert('새 공지사항이 등록되었습니다!');
            setRegisterCategory1('');
            setRegisterCategory2('');
            setContent('');
            setStartDate(today);
            setEndDate('');
            fetchNotices();

        } catch (err) {
            alert("공지사항 등록 실패: " + (err.response?.data?.message || err.message));
        }
    };

    // 공지사항 삭제
    const handleDeleteSelected = async () => {
        const selectedIds = notices
            .filter(item => item.isChecked)
            .map(item => (item.ntKey ?? item.nt_key ?? item.id))
            .filter(Boolean);
        if (selectedIds.length === 0) {
            alert("삭제할 공지사항을 선택해주세요!");
            return;
        }
        if (!window.confirm(`${selectedIds.length}개의 공지사항을 정말 삭제하시겠어요?`)) return;

        try {
            setIsLoading(true);
            // 선택된 항목 일괄 삭제 (백엔드: RequestBody List<Integer> ids)
            await axios.delete(API_URL, {
                data: selectedIds,
                headers: { Authorization: `Bearer ${token}` } // 정환 추가
            });
            alert(`${selectedIds.length}개의 공지사항이 삭제되었습니다.`);
            fetchNotices();
        } catch (err) {
            alert("공지사항 삭제 실패: " + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const closeNoticeDetail = () => {
        setIsPopupOpen(false);
        setSelectedNotice(null);
    };

    // 한 개 삭제
    const handleDeleteOne = async (notice) => {
        if (!notice?.ntKey) return;
        if (!window.confirm('해당 공지사항을 삭제하시겠습니까?')) return;
        try {
            setIsLoading(true);
            await axios.delete(API_URL, {
                data: [notice.ntKey],
                headers: { Authorization: `Bearer ${token}` } // 진경 추가
            });
            alert('삭제되었습니다.');
            closeNoticeDetail();
            fetchNotices();
        } catch (err) {
            alert('공지사항 삭제 실패: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    // 공지사항 수정
    const handleModifyOne = async (notice) => {
        if (!notice?.ntKey) return;
        const newCategory = prompt('소분류를 입력하세요 (주문/출고/배송/제품현황):', notice.ntCategory || '');
        if (newCategory === null) return;
        const newContent = prompt('내용을 입력하세요:', notice.ntContent || '');
        if (newContent === null) return;
        try {
            setIsLoading(true);
            await axios.put(`${API_URL}/${notice.ntKey}`, {
                ntCode: notice.ntCode,
                ntCategory: newCategory,
                ntContent: newContent,
            }, { headers: { Authorization: `Bearer ${token}` } }); // 진경 추가
            alert('수정되었습니다.');
            closeNoticeDetail();
            fetchNotices();
        } catch (err) {
            alert('공지사항 수정 실패: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${headStyles.content} ${headStyles.content_grid}`}>
            <h1 className={headStyles.title}>공지사항 등록</h1>

            <div className={headStyles.inner_grid}>
                {/* 공지사항 등록 */}
                <section className={headStyles.sec1}>
                    <div className={headStyles.select_wrap}>
                        <div className={headStyles.left_select}>
                            <div className={headStyles.section}>
                                <h5>분류</h5>
                                <select className={headStyles.select_w120}
                                        value={registerCategory1}
                                        onChange={(e) => setRegisterCategory1(e.target.value)}>
                                    <option value="">대분류 선택</option>
                                    <option value="0">전체</option>
                                    <option value="1">본사</option>
                                    <option value="2">물류</option>
                                    <option value="3">대리점</option>
                                </select>
                                <select className={headStyles.select_w120}
                                        value={registerCategory2}
                                        onChange={(e) => setRegisterCategory2(e.target.value)}>
                                    <option value="">소분류 선택</option>
                                    <option value="주문">주문</option>
                                    <option value="출고">출고</option>
                                    <option value="배송">배송</option>
                                    <option value="제품현황">제품현황</option>
                                </select>
                            </div>

                            <div className={headStyles.section}>
                                <h5>노출 기간</h5>
                                <input type="date" className={`${headStyles.select_input} ${headStyles.input_w150}`} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <span>~</span>
                                <input type="date" className={`${headStyles.select_input} ${headStyles.input_w150}`} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                <span className={headStyles.essential}>* 2개월 후 자동 삭제</span>
                            </div>
                        </div>
                        <div className={headStyles.right_select}>
                            <button className={`${headStyles.btn} ${headStyles.register} ${headStyles.bg_green}`} onClick={handleRegisterNotice}>등록</button>
                        </div>
                    </div>
                    <textarea className={headStyles.notice_input_text}
                              placeholder="내용을 입력하세요"
                              value={content}
                              onChange={(e) => setContent(e.target.value)} />
                </section>

                {/* 공지사항 리스트 */}
                <section className={headStyles.sec2}>
                    <div className={headStyles.select_scroll}>
                        <div className={headStyles.select_wrap}>
                            <div className={headStyles.left_select}>
                                <div className={headStyles.section}>
                                    <h5>분류</h5>
                                    <select className={headStyles.select_w120}
                                            value={searchCategory1}
                                            onChange={(e) => setSearchCategory1(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="1">본사</option>
                                        <option value="2">물류</option>
                                        <option value="3">대리점</option>
                                    </select>
                                    <select className={headStyles.select_w120}
                                            value={searchCategory2}
                                            onChange={(e) => setSearchCategory2(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="주문">주문</option>
                                        <option value="출고">출고</option>
                                        <option value="배송">배송</option>
                                        <option value="제품현황">제품현황</option>
                                    </select>
                                </div>
                                <div className={headStyles.section}>
                                    <h5>등록날짜</h5>
                                    <input type="date"
                                           className={`${headStyles.select_input} ${headStyles.input_w150}`}
                                           value={searchDate}
                                           onChange={(e) => setSearchDate(e.target.value)} />
                                </div>
                            </div>
                            <div className={headStyles.right_select}>
                                <button className={`${headStyles.btn} ${headStyles.search}`} onClick={handleSearch}>검색</button>
                                <button className={`${headStyles.btn} ${headStyles.reset}`} onClick={() => {
                                    setSearchCategory1('');
                                    setSearchCategory2('');
                                    setSearchDate('');
                                    fetchNotices();
                                }}>초기화</button>
                                <button className={`${headStyles.btn} ${headStyles.delete}`} onClick={handleDeleteSelected}>삭제</button>
                            </div>
                        </div>
                    </div>

                    <div className={headStyles.table_container}>
                        <table className={`${headStyles.table} ${headStyles.table_ntReg}`}>
                            <thead>
                            <tr>
                                <th className={headStyles.t_check_box}>
                                    <input
                                        type="checkbox"
                                        id="checkAll"
                                        checked={isAllChecked}
                                        onChange={handleSelectAll}
                                        disabled={notices.length === 0} />
                                    <label htmlFor="checkAll"></label>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfig.key === "atCreated"
                                        ? (sortConfig.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    등록 날짜
                                    <button className={headStyles.table_sort_icon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSort("atCreated");
                                            }}>
                                    </button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfig.key === "startDate"
                                        ? (sortConfig.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    노출기간
                                    <button className={headStyles.table_sort_icon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSort("startDate");
                                            }}>
                                    </button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfig.key === "ntCode"
                                        ? (sortConfig.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    대분류
                                    <button className={headStyles.table_sort_icon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSort("ntCode");
                                            }}>
                                    </button>
                                </th>
                                <th className={`${headStyles.table_th_sortable} ${
                                    sortConfig.key === "ntCategory"
                                        ? (sortConfig.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                }`}>
                                    소분류
                                    <button className={headStyles.table_sort_icon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSort("ntCategory");
                                            }}>
                                    </button>
                                </th>
                                <th className={headStyles.nt_th_content}>내용</th>
                            </tr>
                            </thead>
                            <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className={headStyles.none_list}>로딩중...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className={headStyles.none_list}>
                                        데이터를 불러오는데 실패했습니다: {error.message}
                                    </td>
                                </tr>
                            ) : notices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={headStyles.none_list}>조회된 공지사항이 없어요.</td>
                                </tr>
                            ) : (
                                notices.map(item => {
                                    const rowId = (item.ntKey ?? item.nt_key ?? item.id);
                                    return (
                                        <tr key={rowId} className={item.isChecked ? headStyles.checkedRow : ''}>
                                            <td className={headStyles.t_check_box}>
                                                <input
                                                    type="checkbox"
                                                    id={`check-${rowId}`}
                                                    checked={item.isChecked}
                                                    onChange={() => handleSelectOne(rowId)} />
                                                <label htmlFor={`check-${rowId}`}></label>
                                            </td>
                                            <td>{(item.atCreated ?? item.atCreated)?.split("T")[0]}</td>
                                            <td>{item.startDate && item.endDate && (
                                                <p className={headStyles.display_date}>
                                                    {item.startDate} ~ {item.endDate}
                                                </p>
                                            )}</td>
                                            <td>{(item.ntCode ?? item.code) === 1 ? "본사" : (item.ntCode ?? item.code) === 2 ? "물류" : ((item.ntCode ?? item.code) === 3 ? "대리점" : "전체")}</td>
                                            <td>{item.ntCategory ?? item.category2}</td>
                                            <td>
                                                <div className={headStyles.flex_between}>
                                                    <p className={headStyles.ellipsis}>{item.ntContent ?? item.content}</p>
                                                    <button onClick={() => handleNoticeClick(item)} className={headStyles.clickContent}>상세보기</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <HeadPopup isOpen={isPopupOpen} onClose={closeNoticeDetail}>
                {selectedNotice && (
                    <NoticeDetail
                        noticeDetail={selectedNotice}
                        onDelete={() => handleDeleteOne(selectedNotice)}
                        onModify={() => handleModifyOne(selectedNotice)}
                    />
                )}
            </HeadPopup>

            {/* 상세보기 팝업 (수정/삭제 가능) */}
            {showDetail && detailNotice && (
                <HeadPopup isOpen={showDetail} onClose={handleCloseDetail}>
                    <NoticeDetail
                        noticeDetail={detailNotice}
                        onDelete={handleDeleteSuccess}
                        onSave={handleSaveSuccess}
                    />
                </HeadPopup>
            )}
        </div>
    )
}

export default NoticeRegister;
