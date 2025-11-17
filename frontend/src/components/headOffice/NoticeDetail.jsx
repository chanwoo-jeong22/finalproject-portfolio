import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import popupStyles from './HeadPopup.module.css';

const API_URL = 'http://localhost:8080/api/notices';

function NoticeDetail ({ noticeDetail, onDelete, onSave, readOnly = false, onClose }) {
    if (!noticeDetail) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editCode, setEditCode] = useState(0);
    const [editCategory, setEditCategory] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (noticeDetail) {
            setEditCode(Number(noticeDetail.ntCode ?? 0));
            setEditCategory(noticeDetail.ntCategory ?? '');
            setEditContent(noticeDetail.ntContent ?? '');
            setEditStartDate(noticeDetail.startDate || '');
            setEditEndDate(noticeDetail.endDate || '');
        }
    }, [noticeDetail]);

    const codeLabel = useMemo(() => {
        const code = Number(editCode);
        return code === 1 ? '본사' : (code === 2 ? '물류' : (code === 3 ? '대리점' : '전체'));
    }, [editCode]);

    const handleSave = async () => {
        if (!editCategory || !editContent.trim()) {
            alert('소분류와 내용을 입력해 주세요.');
            return;
        }

        // 날짜 유효성 검증
        const now = new Date();
        now.setHours(0, 0, 0, 0); // 오늘 기준

        const start = editStartDate ? new Date(editStartDate) : null;
        const end = editEndDate ? new Date(editEndDate) : null;

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

        setIsLoading(true);
        try {
            const updateData = {
                ntCode: Number(editCode),
                ntCategory: editCategory,
                ntContent: editContent,
                startDate: editStartDate,
                endDate: editEndDate,
            };

            // 서버에 수정 요청
            const response = await axios.put(`${API_URL}/${noticeDetail.ntKey}`, updateData);
            console.log('서버 응답:', response.data);
            console.log('수정 전 데이터:', updateData);
            
            // 서버에서 반환된 실제 데이터로 상태 업데이트
            const updatedNotice = response.data;
            setEditContent(updatedNotice.ntContent || updateData.ntContent);
            setEditCategory(updatedNotice.ntCategory || updateData.ntCategory);
            setEditStartDate(updatedNotice.startDate || updateData.startDate);
            setEditEndDate(updatedNotice.endDate || updateData.endDate);
            
            // 알림창 표시
            alert(`공지사항이 성공적으로 수정되었습니다.\n새 노출기간: ${updatedNotice.startDate || updateData.startDate} ~ ${updatedNotice.endDate || updateData.endDate}`);
            
            // 수정 모드 해제 (화면 업데이트를 위해 약간 지연)
            setTimeout(() => {
                setIsEditing(false);
            }, 100);
            
            // 부모 컴포넌트에 수정 완료 알림
            onSave && onSave();
        } catch (error) {
            console.error('공지사항 수정 실패:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || '알 수 없는 오류';
            alert(`공지사항 수정에 실패했습니다: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 공지사항 삭제
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            return;
        }

        setIsLoading(true);
        try {
            await axios.delete(API_URL, { data: [noticeDetail.ntKey] });
            alert('공지사항이 성공적으로 삭제되었습니다.');
            onDelete && onDelete();
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            alert('공지사항 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={popupStyles.popupHeader}>
                <h3>공지사항</h3>
            </div>
            <div className={popupStyles.popupBody}>
                {!isEditing ? (
                    <>
                        <p className={popupStyles.pop_category}>
                            <span># {codeLabel}</span>
                            <span># {editCategory || noticeDetail.ntCategory || noticeDetail.category2}</span>
                        </p>
                        <p className={popupStyles.pop_date}>{(noticeDetail.atCreated ?? noticeDetail.at_created)?.split("T")[0]}</p>
                        <div className={popupStyles.pop_content}>{editContent}</div>
                    </>
                ) : (
                    <div className={popupStyles.nt_editForm}>
                        <div className={`${popupStyles.formRow} ${popupStyles.flexRow}`}>
                            <label>분류</label>
                            <select value={editCode} onChange={(e) => setEditCode(Number(e.target.value))}>
                                <option value="0">전체</option>
                                <option value="1">본사</option>
                                <option value="2">물류</option>
                                <option value="3">대리점</option>
                            </select>
                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                                <option value="">선택</option>
                                <option value="주문">주문</option>
                                <option value="출고">출고</option>
                                <option value="배송">배송</option>
                                <option value="제품현황">제품현황</option>
                            </select>
                        </div>

                        <div className={`${popupStyles.formRow} ${popupStyles.flexRow}`}>
                            <label>노출 기간</label>
                            <input 
                                type="date" 
                                value={editStartDate}
                                onChange={(e) => setEditStartDate(e.target.value)}
                            />
                            <span>~</span>
                            <input 
                                type="date" 
                                value={editEndDate}
                                onChange={(e) => setEditEndDate(e.target.value)}
                            />
                            <span className={popupStyles.essential}>* 종료일 후 자동 삭제</span>
                        </div>

                        <div className={`${popupStyles.formRow} ${popupStyles.textarea_mt}`}>
                            <textarea 
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)} 
                                placeholder="공지사항 내용을 입력해주세요."
                                rows={8} 
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className={popupStyles.popupFooter}>
                {readOnly ? (
                    <button 
                        className={popupStyles.modifyBtn} 
                        onClick={onClose}
                    >
                        확인
                    </button>
                ) : !isEditing ? (
                    <>
                        <button 
                            className={popupStyles.modifyBtn} 
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                        >
                            수정
                        </button>
                        <button 
                            className={popupStyles.deleteBtn} 
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            삭제
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            className={popupStyles.modifyBtn} 
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? '저장 중...' : '저장'}
                        </button>
                        <button 
                            className={popupStyles.cancelBtn} 
                            onClick={() => setIsEditing(false)}
                            disabled={isLoading}
                        >
                            취소
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

export default NoticeDetail