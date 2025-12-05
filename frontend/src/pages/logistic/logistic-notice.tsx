import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import style from "../../styles/logistic/logistic-notice.module.css";
import Notice from "../../components/notice";
import HeadPopup from "../../components/head/head-popup";
import NoticeDetail from "../../components/common/notice-detail";
import { fmtDate, getNextBizDays } from "../../func/common";
import { toIsoDate } from "../../func/parse";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchNotices, fetchSchedules } from "../../redux/slices/logistic/logistic-slice";

const KOR_DOW = ["일", "월", "화", "수", "목", "금", "토"];

function LogisticNotice() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const notices = useSelector((state: RootState) => state.logistic.notices);
  const schedulesByDate = useSelector((state: RootState) => state.logistic.schedulesByDate);

  const [selectedNotice, setSelectedNotice] = useState<null | typeof notices[0]>(null);
  const [showDetail, setShowDetail] = useState(false);
  const noticeRef = useRef<{ refresh: () => void }>(null);

  const days = useMemo(() => getNextBizDays(5), []);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchNotices());
  }, [token, dispatch]);


  useEffect(() => {
    if (!token) return;
    dispatch(
      fetchSchedules({
        from: toIsoDate(days[0]),
        to: toIsoDate(days[days.length - 1]),
      })
    );
  }, [dispatch, token]);

  const handleNoticeClick = (notice: typeof notices[0]) => {
    setSelectedNotice(notice);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    if (noticeRef.current) {
      noticeRef.current.refresh();
    }
    setShowDetail(false);
    setSelectedNotice(null);
  };

  return (
    <>
      {/* 도착 일정표 */}
      <section className={style.schedule}>
        <h2 className={style.scheduleTitle}>도착 예정일</h2>
        <div className={style.scheduleGrid}>
          {days.map((d) => {
            const key = fmtDate(d);
            const items = schedulesByDate[key] || [];
            const dow = KOR_DOW[d.getDay()];
            return (
              <article key={key} className={style.scheduleCard}>
                <div className={style.scheduleDate}>
                  {key} <span className={style.scheduleDow}>({dow})</span>
                </div>
                <ul className={style.scheduleList}>
                  {items.length === 0 ? (
                    <li className={style.empty}>일정이 없습니다.</li>
                  ) : (
                    items.map((it, i) => (
                      <li key={i}>
                        <span className={style.scheduleText}>{it.title}</span>
                      </li>
                    ))
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* 공지사항 */}
      <section className={style.notice_lg}>
        <div className={style.noticeheader}>
          <h1 className={style.noticetitle}>공지사항</h1>
        </div>

        {token ? (
          <Notice ref={noticeRef} role="logistic" onNoticeClick={handleNoticeClick} />
        ) : (
          <div>현재 공지사항이 없습니다.</div>
        )}

        {showDetail && selectedNotice && (
          <HeadPopup isOpen={showDetail} onClose={handleCloseDetail}>
            <NoticeDetail noticeDetail={selectedNotice} readOnly={true} onClose={handleCloseDetail} />
          </HeadPopup>
        )}
      </section>
    </>
  );
}

export default LogisticNotice;
