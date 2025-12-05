import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import api from "../../../api/api"; // api.ts 임포트
import headStyles from '../../../styles/head/head.module.css';
import HeadPopup from '../../../components/head/head-popup';
import NoticeDetail from '../../../components/common/notice-detail';

interface Notice {
    ntKey: number;
    nt_key?: number;
    id?: number;
    ntCode?: number;
    code?: number;
    ntCategory?: string;
    category2?: string;
    ntContent?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    atCreated?: string;
    at_created?: string;
    isChecked?: boolean;
}

// 에러 메시지 안전 추출 함수 (unknown 타입 기반)
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null &&
    "data" in (error as { response: { data?: unknown } }).response! &&
    typeof (error as { response: { data?: unknown } }).response.data === "object" &&
    (error as { response: { data: Record<string, unknown> } }).response.data !== null &&
    "message" in (error as { response: { data: Record<string, unknown> } }).response.data &&
    typeof (error as { response: { data: Record<string, unknown> } }).response.data.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function NoticeRegistration() {
    // Redux에서 토큰 조회
    const token = useSelector((state: RootState) => state.auth.token);

    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [registerCategory1, setRegisterCategory1] = useState<string>('');
    const [registerCategory2, setRegisterCategory2] = useState<string>('');
    const [content, setContent] = useState<string>('');

    const [searchCategory1, setSearchCategory1] = useState<string>('');
    const [searchCategory2, setSearchCategory2] = useState<string>('');
    const [searchDate, setSearchDate] = useState<string>('');
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>('');

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [detailNotice, setDetailNotice] = useState<Notice | null>(null);

    const category1Map: { [key: number]: string } = {
        0: '전체',
        1: '본사',
        2: '물류',
        3: '대리점',
    };

    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    const isAllChecked = notices.length > 0 && notices.every(item => item.isChecked);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setNotices(notices.map(item => ({ ...item, isChecked: checked })));
    };

    const handleSelectOne = (rowId: number | undefined) => {
        setNotices(notices.map(item => {
            const itemId = (item.ntKey ?? item.nt_key ?? item.id);
            return itemId === rowId ? { ...item, isChecked: !item.isChecked } : item;
        }));
    };

    // 정렬 함수
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        setNotices((prev) => {
            return [...prev].sort((a, b) => {
                let aValue: string | number | Date = "";
                let bValue: string | number | Date = "";

                if (key === 'atCreated') {
                    aValue = (a.atCreated ?? a.at_created) || '';
                    bValue = (b.atCreated ?? b.at_created) || '';
                } else if (key === 'startDate') {
                    aValue = a.startDate || '';
                    bValue = b.startDate || '';
                } else if (key === 'ntCode') {
                    aValue = a.ntCode ?? a.code ?? 0;
                    bValue = b.ntCode ?? b.code ?? 0;
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

    // 상세보기 버튼 클릭 시
    const handleNoticeClick = (notice: Notice) => {
        setDetailNotice(notice);
        setShowDetail(true);
    };

    // 상세보기 닫기
    const handleCloseDetail = () => {
        setShowDetail(false);
        setDetailNotice(null);
        fetchNotices({
            category1: searchCategory1,
            category2: searchCategory2,
            searchDate: searchDate
        });
    };

    const handleSaveSuccess = () => {
        handleCloseDetail();
    };

    const handleDeleteSuccess = () => {
        handleCloseDetail();
    };

    // 공지사항 조회 함수 (api.ts 사용, 토큰 자동 헤더 포함 가정)
    const fetchNotices = async (params: { category1?: string; category2?: string; searchDate?: string } = {}) => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            let codes: number[] = [];
            if (!params.category1 || params.category1 === "0") {
                codes = [0, 1, 2, 3]; // 전체
            } else {
                codes = [Number(params.category1), 0];
            }

            console.log("fetchNotices params.category1:", params.category1, "codes:", codes);

            const response = await api.get<Notice[]>('/notices', {
                params: { codes: codes.join(",") }, // 배열 → 문자열 변환
                headers: { Authorization: `Bearer ${token}` }
            });

            let data = response.data;

            if (params.category2 && params.category2 !== "0") {
                data = data.filter(item => (item.ntCategory ?? item.category2) === params.category2);
            }
            if (params.searchDate) {
                data = data.filter(item => (item.atCreated ?? item.at_created)?.split("T")[0] === params.searchDate);
            }

            data.sort((a, b) => {
                const bDateStr = (b.atCreated ?? b.at_created) || '';
                const aDateStr = (a.atCreated ?? a.at_created) || '';
                return new Date(bDateStr).getTime() - new Date(aDateStr).getTime();
            });

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
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [token]);

    // 검색 버튼
    const handleSearch = () => {
        fetchNotices({
            category1: searchCategory1,
            category2: searchCategory2,
            searchDate: searchDate
        });
    };

    // 공지사항 등록
    const handleRegisterNotice = async (): Promise<void> => {
        if (!registerCategory1) {
            alert("대분류를 선택해주세요!");
            return;
        }
        if (!registerCategory2 || !content.trim()) {
            alert('소분류와 내용을 모두 입력해주세요!');
            return;
        }

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

        if (end && end < now) {
            alert("종료일은 오늘 이후 날짜여야 합니다.");
            return;
        }

        try {
            let codeToSave = Number(registerCategory1);
            if (registerCategory1 === "0") codeToSave = 0;

            let finalEndDate = endDate;
            if (!finalEndDate) {
                const twoMonthsLater = new Date();
                twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
                finalEndDate = twoMonthsLater.toISOString().split("T")[0];
            }

            await api.post(
                '/notices',
                {
                    ntCode: codeToSave,
                    ntCategory: registerCategory2,
                    ntContent: content,
                    startDate: startDate || null,
                    endDate: finalEndDate || null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` } // 필요 시
                }
            );

            alert('새 공지사항이 등록되었습니다!');
            setRegisterCategory1('');
            setRegisterCategory2('');
            setContent('');
            setStartDate(today);
            setEndDate('');
            fetchNotices();

        } catch (error: unknown) {
            alert("공지사항 등록 실패: " + getErrorMessage(error));
        }
    };

    // 공지사항 다중 삭제
    const handleDeleteSelected = async (): Promise<void> => {
        const selectedIds = notices
            .filter(item => item.isChecked)
            .map(item => (item.ntKey ?? item.nt_key ?? item.id))
            .filter((id): id is number => typeof id === "number");

        if (selectedIds.length === 0) {
            alert("삭제할 공지사항을 선택해주세요!");
            return;
        }
        if (!window.confirm(`${selectedIds.length}개의 공지사항을 정말 삭제하시겠어요?`)) return;

        try {
            setIsLoading(true);
            await api.delete('/notices', {
                data: selectedIds,
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`${selectedIds.length}개의 공지사항이 삭제되었습니다.`);
            fetchNotices();
        } catch (error: unknown) {
            alert("공지사항 삭제 실패: " + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const closeNoticeDetail = (): void => {
        setIsPopupOpen(false);
        setSelectedNotice(null);
    };

    // 단일 삭제
    const handleDeleteOne = async (notice: Notice | null): Promise<void> => {
        if (!notice?.ntKey) return;
        if (!window.confirm('해당 공지사항을 삭제하시겠습니까?')) return;
        try {
            setIsLoading(true);
            await api.delete('/notices', {
                data: [notice.ntKey],
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('삭제되었습니다.');
            closeNoticeDetail();
            fetchNotices();
        } catch (error: unknown) {
            alert('공지사항 삭제 실패: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    // 공지사항 수정
    const handleModifyOne = async (notice: Notice | null): Promise<void> => {
        if (!notice?.ntKey) return;
        const newCategory = prompt('소분류를 입력하세요 (주문/출고/배송/제품현황):', notice.ntCategory || '');
        if (newCategory === null) return;
        const newContent = prompt('내용을 입력하세요:', notice.ntContent || '');
        if (newContent === null) return;
        try {
            setIsLoading(true);
            await api.put(`/notices/${notice.ntKey}`, {
                ntCode: notice.ntCode,
                ntCategory: newCategory,
                ntContent: newContent,
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert('수정되었습니다.');
            closeNoticeDetail();
            fetchNotices();
        } catch (error: unknown) {
            alert('공지사항 수정 실패: ' + getErrorMessage(error));
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
                                <input
                                    type="date"
                                    className={`${headStyles.select_input} ${headStyles.input_w150}`}
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)} />
                                <span>~</span>
                                <input
                                    type="date"
                                    className={`${headStyles.select_input} ${headStyles.input_w150}`}
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)} />
                                <span className={headStyles.essential}>* 2개월 후 자동 삭제</span>
                            </div>
                        </div>
                        <div className={headStyles.right_select}>
                            <button
                                className={`${headStyles.btn} ${headStyles.register} ${headStyles.bg_green}`}
                                onClick={handleRegisterNotice}>등록</button>
                        </div>
                    </div>
                    <textarea
                        className={headStyles.notice_input_text}
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
                                    <select
                                        className={headStyles.select_w120}
                                        value={searchCategory1}
                                        onChange={(e) => setSearchCategory1(e.target.value)}>
                                        <option value="0">전체</option>
                                        <option value="1">본사</option>
                                        <option value="2">물류</option>
                                        <option value="3">대리점</option>
                                    </select>
                                    <select
                                        className={headStyles.select_w120}
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
                                    <input
                                        type="date"
                                        className={`${headStyles.select_input} ${headStyles.input_w150}`}
                                        value={searchDate}
                                        onChange={(e) => setSearchDate(e.target.value)} />
                                </div>
                            </div>
                            <div className={headStyles.right_select}>
                                <button className={`${headStyles.btn} ${headStyles.search}`} onClick={handleSearch}>검색</button>
                                <button
                                    className={`${headStyles.btn} ${headStyles.reset}`}
                                    onClick={() => {
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
                                    <th className={`${headStyles.table_th_sortable} ${sortConfig.key === "atCreated"
                                        ? (sortConfig.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                        }`}>
                                        등록 날짜
                                        <button
                                            className={headStyles.table_sort_icon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSort("atCreated");
                                            }}>
                                        </button>
                                    </th>
                                    <th className={`${headStyles.table_th_sortable} ${sortConfig.key === "startDate"
                                        ? (sortConfig.direction === "asc"
                                            ? headStyles.table_th_asc
                                            : headStyles.table_th_desc)
                                        : ""
                                        }`}>
                                        노출 기간 (시작일)
                                        <button
                                            className={headStyles.table_sort_icon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSort("startDate");
                                            }}>
                                        </button>
                                    </th>
                                    <th>대분류</th>
                                    <th>소분류</th>
                                    <th>내용</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
  {isLoading && (
    <tr>
      <td colSpan={7}>로딩중...</td>
    </tr>
  )}
  {!isLoading && notices.length === 0 && (
    <tr>
      <td colSpan={7}>등록된 공지사항이 없습니다.</td>
    </tr>
  )}
  {!isLoading && notices.map((notice) => {
    const itemId = notice.ntKey ?? notice.nt_key ?? notice.id;
    if (!itemId) return null;

    const code = notice.ntCode ?? notice.code;
    const displayCategory1 = typeof code === 'number' ? category1Map[code] ?? code : code;

    return (
      <tr key={itemId}>
        <td className={headStyles.t_check_box}>
          <input
            type="checkbox"
            checked={notice.isChecked ?? false}
            onChange={() => handleSelectOne(itemId)}
          />
        </td>
        <td>{(notice.atCreated ?? notice.at_created)?.split("T")[0]}</td>
        <td>{notice.startDate}</td>
        <td>{displayCategory1}</td>
        <td>{notice.ntCategory ?? notice.category2}</td>
        <td>
          <button
            className={headStyles.btn_link}
            onClick={() => handleNoticeClick(notice)}
          >
            {notice.ntContent ?? notice.content}
          </button>
        </td>
        <td>
          <button
            className={headStyles.btn_modify}
            onClick={() => handleModifyOne(notice)}
          >
            수정
          </button>
          <button
            className={headStyles.btn_delete}
            onClick={() => handleDeleteOne(notice)}
          >
            삭제
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

                        </table>
                    </div>
                </section>

            </div>

            {showDetail && detailNotice && detailNotice.ntKey && (
                <NoticeDetail
                    // NoticeDetail 컴포넌트가 기대하는 prop 이름 noticeDetail로 넘김
                    noticeDetail={detailNotice}

                    // onClose 콜백
                    onClose={handleCloseDetail}

                    // onSaveSuccess → onSave로 이름 변경
                    onSave={handleSaveSuccess}

                    // onDeleteSuccess → onDelete로 이름 변경
                    onDelete={handleDeleteSuccess}
                />
            )}


            <HeadPopup isOpen={isPopupOpen} onClose={closeNoticeDetail}>
                <NoticeDetail
                    noticeDetail={selectedNotice}
                    readOnly={true}   // 읽기 전용이라면 이렇게
                    onClose={closeNoticeDetail}
                />
            </HeadPopup>

        </div>
    );
}

export default NoticeRegistration
