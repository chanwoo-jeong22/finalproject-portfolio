import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../../styles/head/head-popup.module.css";

// 공지사항 상세 타입 정의
interface NoticeDetailProps {
    // 공지사항 데이터 객체, 없을 수도 있음(null)
    noticeDetail: {
        ntKey: number;          // 공지사항 고유 키
        ntCode?: number;        // 본사(1), 물류(2), 대리점(3), 전체(0) 구분 코드
        ntCategory?: string;    // 소분류 (주문, 출고 등)
        ntContent?: string;     // 공지 내용
        startDate?: string;     // 노출 시작일 (YYYY-MM-DD)
        endDate?: string;       // 노출 종료일 (YYYY-MM-DD)
        atCreated?: string;     // 생성일 (ISO 문자열)
        at_created?: string;    // 백엔드 네이밍 다를 때 대비
        category2?: string;     // fallback 소분류 필드
    } | null;
    onDelete?: () => void;   // 삭제 성공 시 호출 콜백
    onSave?: () => void;     // 저장 성공 시 호출 콜백
    readOnly?: boolean;      // 읽기 전용 모드 여부
    onClose: () => void;     // 닫기 버튼 클릭 시 호출
}

const API_URL = "http://localhost:8080/api/notices";

function NoticeDetail({
                          noticeDetail,
                          onDelete,
                          onSave,
                          readOnly = false,
                          onClose,
                      }: NoticeDetailProps) {
    // noticeDetail이 없으면 컴포넌트 렌더링하지 않음
    if (!noticeDetail) return null;

    // 수정 모드 상태
    const [isEditing, setIsEditing] = useState(false);

    // 수정용 필드 상태값들
    const [editCode, setEditCode] = useState<number>(0);
    const [editCategory, setEditCategory] = useState<string>("");
    const [editContent, setEditContent] = useState<string>("");
    const [editStartDate, setEditStartDate] = useState<string>("");
    const [editEndDate, setEditEndDate] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // noticeDetail이 바뀔 때마다 수정용 상태 초기화
    useEffect(() => {
        if (noticeDetail) {
            setEditCode(Number(noticeDetail.ntCode ?? 0));
            setEditCategory(noticeDetail.ntCategory ?? "");
            setEditContent(noticeDetail.ntContent ?? "");
            setEditStartDate(noticeDetail.startDate || "");
            setEditEndDate(noticeDetail.endDate || "");
        }
    }, [noticeDetail]);

    // ntCode 숫자값에 따른 문자열 라벨 생성
    const codeLabel = useMemo(() => {
        switch (editCode) {
            case 1:
                return "본사";
            case 2:
                return "물류";
            case 3:
                return "대리점";
            default:
                return "전체";
        }
    }, [editCode]);

    // 저장 버튼 클릭 시 호출 함수
    const handleSave = async () => {
        // 필수 입력값 검증
        if (!editCategory || !editContent.trim()) {
            alert("소분류와 내용을 입력해 주세요.");
            return;
        }

        // 날짜 유효성 검증
        const now = new Date();
        now.setHours(0, 0, 0, 0); // 오늘 00:00 기준

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

        if (end && end < now) {
            alert("종료일은 오늘 이후 날짜여야 합니다.");
            return;
        }

        setIsLoading(true);

        try {
            // 업데이트할 데이터 객체
            const updateData = {
                ntCode: editCode,
                ntCategory: editCategory,
                ntContent: editContent,
                startDate: editStartDate,
                endDate: editEndDate,
            };

            // PUT 요청으로 데이터 전송
            const response = await axios.put(`${API_URL}/${noticeDetail.ntKey}`, updateData);

            // 응답에서 최신 데이터 받아서 상태 업데이트
            const updatedNotice = response.data;

            setEditContent(updatedNotice.ntContent ?? updateData.ntContent);
            setEditCategory(updatedNotice.ntCategory ?? updateData.ntCategory);
            setEditStartDate(updatedNotice.startDate ?? updateData.startDate);
            setEditEndDate(updatedNotice.endDate ?? updateData.endDate);

            alert(
                `공지사항이 성공적으로 수정되었습니다.\n새 노출기간: ${updatedNotice.startDate ?? updateData.startDate} ~ ${updatedNotice.endDate ?? updateData.endDate}`
            );

            // 잠깐 기다린 후 수정 모드 해제
            setTimeout(() => {
                setIsEditing(false);
            }, 100);

            // 성공 콜백 호출
            if (onSave) onSave();
        } catch (error: any) {
            console.error("공지사항 수정 실패:", error);
            const errorMessage =
                error.response?.data?.message || error.response?.data || error.message || "알 수 없는 오류";
            alert(`공지사항 수정에 실패했습니다: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 삭제 버튼 클릭 시 호출 함수
    const handleDelete = async () => {
        if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
            return;
        }
        setIsLoading(true);

        try {
            // DELETE 요청, 백엔드가 배열로 받는 경우
            await axios.delete(API_URL, { data: [noticeDetail.ntKey] });
            alert("공지사항이 성공적으로 삭제되었습니다.");
            if (onDelete) onDelete();
        } catch (error) {
            console.error("공지사항 삭제 실패:", error);
            alert("공지사항 삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* 팝업 헤더 */}
            <div className={styles.popupHeader}>
                <h3>공지사항</h3>
            </div>

            {/* 팝업 본문 */}
            <div className={styles.popupBody}>
                {!isEditing ? (
                    <>
                        {/* 공지사항 분류 및 소분류 */}
                        <p className={styles.pop_category}>
                            <span># {codeLabel}</span>
                            <span># {editCategory || noticeDetail.ntCategory || noticeDetail.category2 || ""}</span>
                        </p>

                        {/* 생성일 */}
                        <p className={styles.pop_date}>
                            {(noticeDetail.atCreated ?? noticeDetail.at_created ?? "").split("T")[0]}
                        </p>

                        {/* 내용 */}
                        <div className={styles.pop_content}>{editContent}</div>
                    </>
                ) : (
                    // 수정 모드 폼
                    <div className={styles.nt_editForm}>
                        <div className={`${styles.formRow} ${styles.flexRow}`}>
                            <label>분류</label>
                            <select value={editCode} onChange={(e) => setEditCode(Number(e.target.value))}>
                                <option value={0}>전체</option>
                                <option value={1}>본사</option>
                                <option value={2}>물류</option>
                                <option value={3}>대리점</option>
                            </select>
                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                                <option value="">선택</option>
                                <option value="주문">주문</option>
                                <option value="출고">출고</option>
                                <option value="배송">배송</option>
                                <option value="제품현황">제품현황</option>
                            </select>
                        </div>

                        <div className={`${styles.formRow} ${styles.flexRow}`}>
                            <label>노출 기간</label>
                            <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                            <span>~</span>
                            <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                            <span className={styles.essential}>* 종료일 후 자동 삭제</span>
                        </div>

                        <div className={`${styles.formRow} ${styles.textarea_mt}`}>
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

            {/* 팝업 푸터 */}
            <div className={styles.popupFooter}>
                {readOnly ? (
                    <button className={styles.modifyBtn} onClick={onClose}>
                        확인
                    </button>
                ) : !isEditing ? (
                    <>
                        <button className={styles.modifyBtn} onClick={() => setIsEditing(true)} disabled={isLoading}>
                            수정
                        </button>
                        <button className={styles.deleteBtn} onClick={handleDelete} disabled={isLoading}>
                            삭제
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.modifyBtn} onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "저장 중..." : "저장"}
                        </button>
                        <button className={styles.cancelBtn} onClick={() => setIsEditing(false)} disabled={isLoading}>
                            취소
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

export default NoticeDetail;
