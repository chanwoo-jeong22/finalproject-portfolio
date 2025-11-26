import axios from "axios";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store"; // store.ts에서 RootState import
import style from "../../styles/agency/agency-indexpage.module.css";
import Notice from "../../components/notice/index";
import HeadPopup from "../../components/head/head-popup";
import NoticeDetail from "../../components/common/notice-detail";
import { toIsoDate } from "../../func/parse";
import { getNextBizDays } from "../../func/common";

const KOR_DOW = ["일", "월", "화", "수", "목", "금", "토"];

interface ScheduleItem {
  title: string;
}

interface SchedulesByDate {
  [date: string]: ScheduleItem[];
}

export default function Index() {
  // Redux에서 토큰 조회
  const token = useSelector((state: RootState) => state.auth.token);

  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const noticeRef = useRef<any>(null);

  const days = useMemo(() => getNextBizDays(7).slice(0, 5), []);

  const [schedulesByDate, setSchedulesByDate] = useState<SchedulesByDate>({});

  useEffect(() => {
    if (!token) return;

    const from = toIsoDate(days[0]);
    const to = toIsoDate(days[days.length - 1]);

    axios
      .get("/api/agencyorder/schedule", {
        params: { from, to },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const rows = res.data?.data ?? res.data ?? [];
        const byDate: SchedulesByDate = {};

        rows.forEach((r: any) => {
          if (r.orStatus === "배송완료") return;

          const iso = String(r.orReserve ?? r.or_reserve ?? "").slice(0, 10);
          if (!iso) return;

          const key = iso.replace(/-/g, ".");
          if (!byDate[key]) byDate[key] = [];

          const items = r.items ?? [];
          const firstItemName =
            items.length > 0
              ? items[0].name ?? items[0].oiProducts ?? "미정"
              : r.orProducts?.split(",")[0] ?? "미정";

          const extraCount = Math.max(
            (items.length || r.orProducts?.split(",").length || 1) - 1,
            0
          );

          const title =
            extraCount > 0
              ? `📦 ${firstItemName} 외 ${extraCount}건 입고 예정 (주문번호 ${r.orderNumber})`
              : `📦 ${firstItemName} 입고 예정 (주문번호 ${r.orderNumber})`;

          byDate[key].push({ title });
        });

        setSchedulesByDate(byDate);
      })
      .catch(console.error);
  }, [days, token]);

  const handleNoticeClick = (notice: any) => {
    setSelectedNotice(notice);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    if (noticeRef.current) noticeRef.current.refresh();
    setShowDetail(false);
    setSelectedNotice(null);
  };

  return (
    <>
      <div className={style.container}>
        {/* ===== 도착 일정표 섹션 ===== */}
        <section className={style.schedule}>
          <h2 className={style.scheduleTitle}>입고 예정일</h2>
          <div className={style.scheduleGrid}>
            {days.map((d) => {
              const key = d
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, ".");
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

        {/* ===== 공지사항 섹션 ===== */}
        <section className={style.notice}>
          <h3 className={style.noticetitle}>공지사항</h3>
          {token ? (
            <Notice
              ref={noticeRef}
              role="agency"
              onNoticeClick={handleNoticeClick}
            />
          ) : (
            <div>현재 공지사항이 없습니다.</div>
          )}

          {showDetail && selectedNotice && (
            <HeadPopup isOpen={showDetail} onClose={handleCloseDetail}>
              <NoticeDetail
                noticeDetail={selectedNotice}
                readOnly={true}
                onClose={handleCloseDetail}
              />
            </HeadPopup>
          )}
        </section>
      </div>
    </>
  );
}
