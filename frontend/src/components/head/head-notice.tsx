import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import headStyles from "../../styles/head/head.module.css";
import noticeStyles from "../../styles/notice.module.css"
import NoticeDetail from "../../components/common/notice-detail";
import HeadPopup from "./head-popup";
import HeadGraph from "./head-graph";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import { fetchNotices } from "../../redux/slices/head/head-slice";

// 공지사항 타입 정의 (head-slice와 동일하게)
export interface NoticeType {
  ntKey: number;
  ntCode?: number;
  ntCategory?: string;
  ntContent?: string;
  startDate?: string;
  endDate?: string;
  atCreated?: string;
  at_created?: string;
  category2?: string;
  [key: string]: any;
}

const HeadMain: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 공지사항 상세 팝업 상태 관리
  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // 팝업 내부에서 호출할 수 있는 리프레시 함수 등 참조용 ref
  const noticeRef = useRef<{ refresh?: () => void } | null>(null);

  // Redux 상태에서 필요한 데이터 선택
  const token = useSelector((state: RootState) => state.auth.token);
  const notices = useSelector((state: RootState) => state.head.notices);
  const loading = useSelector((state: RootState) => state.head.loading);
  const error = useSelector((state: RootState) => state.head.error);

  // 토큰이 있을 때 공지사항 리스트 조회 요청 디스패치
  useEffect(() => {
    if (token) {
      dispatch(fetchNotices([0, 1, 2, 3]));
    }
  }, [dispatch, token]);

  // 공지사항 리스트 항목 클릭 시 상세 팝업 열기
  const handleNoticeClick = (notice: NoticeType) => {
    setSelectedNotice(notice);
    setShowDetail(true);
  };

  // 더보기 버튼 클릭 시 공지사항 등록 페이지로 이동
  const handleMoreClick = () => {
    navigate("/head/NoticeRegistration");
  };

  // 상세 팝업 닫기 핸들러
  const handleCloseDetail = () => {
    // 팝업 내에서 새로고침 함수가 있으면 호출
    if (noticeRef.current?.refresh) {
      noticeRef.current.refresh();
    }
    setShowDetail(false);
    setSelectedNotice(null);
  };

  return (
    <div className={headStyles.content}>
      <div className={headStyles.main_inner_grid}>
        {/* 주문/출고 요약 섹션 */}
        <section className={headStyles.main_sec1}>
          <h1 className={`${headStyles.title} ${headStyles.main_title1}`}>
            주문/출고 요약
          </h1>
          <HeadGraph />
        </section>

        {/* 공지사항 섹션 */}
        <section className={headStyles.main_sec2}>
          <div className={headStyles.notice_header}>
            <h1 className={`${headStyles.title} ${headStyles.main_title2}`}>
              공지사항
            </h1>
            <button className={headStyles.more_btn} onClick={handleMoreClick}>
              더보기
            </button>
          </div>

          {/* 로그인 여부에 따른 조건부 렌더링 */}
          {token ? (
            loading ? (
              <div>공지사항 로딩 중...</div>
            ) : error ? (
              <div>공지사항 로딩 실패: {error}</div>
            ) : notices.length === 0 ? (
              <div>공지사항이 없습니다.</div>
            ) : (
              <div className={noticeStyles.noticeList}>
                <ul>
                  {notices.slice(0, 5).map((notice) => (
                    <li
                      key={notice.ntKey}
                      onClick={() => handleNoticeClick(notice)}
                      style={{ cursor: "pointer" }} // pointer만 남김
                    >
                      <div className={noticeStyles.category}>
                        <span>{notice.ntCategory ?? notice.category2 ?? "기타"}</span>
                      </div>
                      <div className={noticeStyles.date}>
                        {notice.startDate ?? "날짜 없음"}
                      </div>
                      <div className={noticeStyles.nt_contents}>
                        {notice.ntContent ?? "내용 없음"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            <div>로그인이 필요합니다.</div>
          )}
        </section>
      </div>

      {/* 공지사항 상세 팝업 */}
      {showDetail && selectedNotice && (
        <HeadPopup isOpen={showDetail} onClose={handleCloseDetail}>
          <NoticeDetail
            noticeDetail={selectedNotice}
            readOnly={true}
            onClose={handleCloseDetail}
          />
        </HeadPopup>
      )}
    </div>
  );
};

export default HeadMain;
