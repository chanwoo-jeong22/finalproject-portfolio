// src/components/common/notice-detail.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks"; // hooks.ts 경로 맞게
import {
  updateNotice,
  deleteNotices,
  clearError,
  setNoticeDetail,
  NoticeDetail as NoticeDetailType,
} from "../../redux/slices/notice/notice-slice";
import styles from "../../styles/head/head-popup.module.css";

interface NoticeDetailProps {
  noticeDetail: NoticeDetailType | null;
  onDelete?: () => void;
  onSave?: () => void;
  readOnly?: boolean;
  onClose: () => void;
}

const NoticeDetail: React.FC<NoticeDetailProps> = ({
  noticeDetail,
  onDelete,
  onSave,
  readOnly = false,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  // Redux 상태 (loading, error) 가져오기
  const loading = useAppSelector((state) => state.notice.loading);
  const error = useAppSelector((state) => state.notice.error);

  // 내부 수정 모드 및 수정용 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [editStartDate, setEditStartDate] = useState<string>("");
  const [editEndDate, setEditEndDate] = useState<string>("");

  // noticeDetail prop 변경 시 상태 초기화
  useEffect(() => {
    if (noticeDetail) {
      setEditCode(Number(noticeDetail.ntCode ?? 0));
      setEditCategory(noticeDetail.ntCategory ?? "");
      setEditContent(noticeDetail.ntContent ?? "");
      setEditStartDate(noticeDetail.startDate || "");
      setEditEndDate(noticeDetail.endDate || "");
    }
    dispatch(clearError());
  }, [noticeDetail, dispatch]);

  // ntCode 숫자값에 따른 라벨
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

  // 저장 처리
  const handleSave = async () => {
    if (!editCategory || !editContent.trim()) {
      alert("소분류와 내용을 입력해 주세요.");
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

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

    if (!noticeDetail) return;

    try {
      const resultAction = await dispatch(
        updateNotice({
          ntKey: noticeDetail.ntKey,
          data: {
            ntCode: editCode,
            ntCategory: editCategory,
            ntContent: editContent,
            startDate: editStartDate,
            endDate: editEndDate,
          },
        })
      );

      if (updateNotice.fulfilled.match(resultAction)) {
        alert(
          `공지사항이 성공적으로 수정되었습니다.\n새 노출기간: ${editStartDate} ~ ${editEndDate}`
        );
        setIsEditing(false);
        if (onSave) onSave();
      } else {
        alert("공지사항 수정에 실패했습니다.");
      }
    } catch {
      alert("공지사항 수정 중 오류가 발생했습니다.");
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!noticeDetail) return;
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) return;

    try {
      const resultAction = await dispatch(deleteNotices([noticeDetail.ntKey]));
      if (deleteNotices.fulfilled.match(resultAction)) {
        alert("공지사항이 성공적으로 삭제되었습니다.");
        if (onDelete) onDelete();
      } else {
        alert("공지사항 삭제에 실패했습니다.");
      }
    } catch {
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    }
  };

  if (!noticeDetail) return null;

  return (
    <>
      <div className={styles.popupHeader}>
        <h3>공지사항</h3>
      </div>

      <div className={styles.popupBody}>
        {!isEditing ? (
          <>
            <p className={styles.pop_category}>
              <span># {codeLabel}</span>
              <span>
                #{" "}
                {editCategory ||
                  noticeDetail.ntCategory ||
                  noticeDetail.category2 ||
                  ""}
              </span>
            </p>

            <p className={styles.pop_date}>
              {(noticeDetail.atCreated ?? noticeDetail.at_created ?? "")
                .split("T")[0]}
            </p>

            <div className={styles.pop_content}>{editContent}</div>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        ) : (
          <div className={styles.nt_editForm}>
            <div className={`${styles.formRow} ${styles.flexRow}`}>
              <label>분류</label>
              <select
                value={editCode}
                onChange={(e) => setEditCode(Number(e.target.value))}
              >
                <option value={0}>전체</option>
                <option value={1}>본사</option>
                <option value={2}>물류</option>
                <option value={3}>대리점</option>
              </select>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="">선택</option>
                <option value="주문">주문</option>
                <option value="출고">출고</option>
                <option value="배송">배송</option>
                <option value="제품현황">제품현황</option>
              </select>
            </div>

            <div className={`${styles.formRow} ${styles.flexRow}`}>
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

            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        )}
      </div>

      <div className={styles.popupFooter}>
        {readOnly ? (
          <button className={styles.modifyBtn} onClick={onClose}>
            확인
          </button>
        ) : !isEditing ? (
          <>
            <button
              className={styles.modifyBtn}
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              수정
            </button>
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={loading}
            >
              삭제
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.modifyBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              취소
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default NoticeDetail;
