import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import headStyles from "../../styles/head/head.module.css";
import noticeStyles from "../../styles/notice.module.css";
import NoticeDetail from "../../components/common/notice-detail";
import HeadPopup from "./head-popup";
import HeadGraph from "./head-graph";

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import { fetchNotices } from "../../redux/slices/head/head-slice";

// 공지사항 타입 정의 (head-slice와 동일하게, 인덱스 시그니처 포함해 다양한 필드 대응)
export interface NoticeType {
  ntKey: number; // 공지사항 고유 키
  ntCode?: number; // 공지 코드 (옵션)
  ntCategory?: string; // 공지 카테고리 (옵션)
  ntContent?: string; // 공지 내용 (옵션)
  startDate?: string; // 공지 시작 날짜 (옵션)
  endDate?: string; // 공지 종료 날짜 (옵션)
  atCreated?: string; // 생성 시간 (옵션)
  at_created?: string; // 생성 시간 (옵션, 다른 이름 가능성 대비)
  category2?: string; // 대체 카테고리명 (옵션)
   // 기타 알 수 없는 프로퍼티 허용
}

const HeadMain: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 선택한 공지사항 상세 정보 상태 (없으면 null)
  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(null);

  // 상세 팝업 노출 여부 상태
  const [showDetail, setShowDetail] = useState<boolean>(false);

  // 팝업 내부에서 호출 가능한 리프레시 함수 등을 참조하기 위한 ref
  // (타입에 refresh 함수가 있을 수도 있으므로 타입 지정)
  const noticeRef = useRef<{ refresh?: () => void } | null>(null);

  // Redux store에서 필요한 상태 선택
  const token = useSelector((state: RootState) => state.auth.token); // 로그인 토큰
  const notices = useSelector((state: RootState) => state.head.notices); // 공지사항 리스트
  const loading = useSelector((state: RootState) => state.head.loading); // 공지사항 로딩 상태
  const error = useSelector((state: RootState) => state.head.error); // 에러 메시지

  // 컴포넌트가 마운트되거나 token이 변경될 때 공지사항 불러오기
  useEffect(() => {
    if (token) {
      // 0,1,2,3 카테고리(코드)로 공지사항 조회 요청
      dispatch(fetchNotices([0, 1, 2, 3]));
    }
  }, [dispatch, token]);

  // 공지사항 항목 클릭 시 호출되는 함수
  // 상세 정보 상태 설정하고 팝업 오픈
  const handleNoticeClick = (notice: NoticeType) => {
    setSelectedNotice(notice);
    setShowDetail(true);
  };

  // '더보기' 버튼 클릭 시 공지사항 등록 페이지로 이동
  const handleMoreClick = () => {
    navigate("/head/NoticeRegistration");
  };

  // 상세 팝업 닫기 함수
  // 팝업 내에서 리프레시 함수가 있으면 호출하고 상태 초기화
  const handleCloseDetail = () => {
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
            {/* 더보기 버튼 */}
            <button
              className={headStyles.more_btn}
              onClick={handleMoreClick}
              aria-label="공지사항 더보기"
            >
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
                  {/* 상위 5개 공지사항 목록 출력 */}
                  {notices.slice(0, 5).map((notice) => (
                    <li
                      key={notice.ntKey}
                      onClick={() => handleNoticeClick(notice)}
                      style={{ cursor: "pointer" }} // 마우스 포인터 모양 설정
                      tabIndex={0} // 키보드 접근성 확보 (탭 키 이동 가능)
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleNoticeClick(notice);
                        }
                      }}
                      aria-label={`공지사항: ${notice.ntCategory ?? notice.category2 ?? "기타"}`}
                      role="button"
                    >
                      {/* 카테고리 표시 */}
                      <div className={noticeStyles.category}>
                        <span>{notice.ntCategory ?? notice.category2 ?? "기타"}</span>
                      </div>
                      {/* 공지 시작 날짜 표시 */}
                      <div className={noticeStyles.date}>
                        {notice.startDate ?? "날짜 없음"}
                      </div>
                      {/* 공지 내용 일부 표시 */}
                      <div className={noticeStyles.nt_contents}>
                        {notice.ntContent ?? "내용 없음"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            // 비로그인 시 메시지 출력
            <div>로그인이 필요합니다.</div>
          )}
        </section>
      </div>

      {/* 공지사항 상세 팝업 */}
      {showDetail && selectedNotice && (
        <HeadPopup isOpen={showDetail} onClose={handleCloseDetail}>
          <NoticeDetail
            noticeDetail={selectedNotice}
            readOnly={true} // 읽기 전용 모드
            onClose={handleCloseDetail}
          />
        </HeadPopup>
      )}
    </div>
  );
};

export default HeadMain;
