import axios from "axios";
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import style from "./AgencyIndexPage.module.css";
import { AuthContext } from "../../context/AuthContext.jsx";
import Notice from "../notice/Notice.jsx";
import HeadPopup from "../headOffice/HeadPopup.jsx";
import NoticeDetail from "../headOffice/NoticeDetail.jsx";

function getNextBizDays(count = 7) {

    const days = [];
    const start = new Date();
    let d = new Date(start);
    while (days.length < count) {
        if (d.getDay() !== 0) days.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return days;
}
const fmtDate = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
const toIsoDate = (d) => d.toISOString().slice(0,10);
const KOR_DOW = ["일","월","화","수","목","금","토"];


export default function AgencyIndexPage() {
    const { token } = useContext(AuthContext);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const noticeRef = useRef(null);

    const [notices, setNotices] = useState([]);
    const [schedulesByDate, setSchedulesByDate] = useState({});

    // 입고 일정은 5일치만 보여주기
    const days = useMemo(() => getNextBizDays(7).slice(0,5), []);

    // 공지사항 API 호출
    useEffect(() => {
        if (!token) return;
        axios.get('/api/notices', { params: { codes: [0,1] } }) // 0: 본사, 1: 대리점
            .then(res => {
                const rows = res.data?.data ?? res.data ?? [];
                setNotices(rows.map(n => ({
                    ntKey: n.ntKey,
                    ntCode: n.ntCode,
                    ntCategory: n.ntCategory,
                    ntContent: n.ntContent,
                    startDate: n.startDate
                })));
            })
            .catch(err => console.error(err));
    }, [token]);

    // 입고 일정 API 호출
    useEffect(() => {
        const from = toIsoDate(days[0]);
        const to = toIsoDate(days[days.length -1]);

        axios.get('/api/agencyorder/schedule', { params: { from, to } })
            .then(res => {

                console.log("입고 일정 API 응답:", res.data);

                const rows = res.data?.data ?? res.data ?? [];
                const byDate = {};
                // 수정: 한 주문당 1건만 push
                rows.forEach(r => {

                    if (r.orStatus === "배송완료") return;

                    const iso = String(r.orReserve ?? r.or_reserve ?? '').slice(0,10);
                    if (!iso) return;
                    const key = iso.replace(/-/g,".");
                    if (!byDate[key]) byDate[key] = [];

                    const items = r.items ?? [];
                    const firstItemName = items.length > 0
                        ? (items[0].name ?? items[0].oiProducts ?? "미정")
                        : r.orProducts?.split(",")[0] ?? "미정";

                    const extraCount = Math.max((items.length || r.orProducts?.split(",").length || 1) - 1, 0);

                    const title = extraCount > 0
                        ? `📦 ${firstItemName} 외 ${extraCount}건 입고 예정 (주문번호 ${r.orderNumber})`
                        : `📦 ${firstItemName} 입고 예정 (주문번호 ${r.orderNumber})`;

                    byDate[key].push({ title });
                });


                setSchedulesByDate(byDate);
            })
            .catch(err => console.error(err));
    }, [days]);

    const handleNoticeClick = (notice) => {
        setSelectedNotice(notice);
        setShowDetail(true);
    };
    const handleCloseDetail = () => {
        if (noticeRef.current) noticeRef.current.refresh();
        setShowDetail(false);
        setSelectedNotice(null);
    };

    return (
        <div className={style.scroll_y}>
            {/* 입고 일정 */}
            <section className={style.schedule}>
                <h3 className={style.scheduleTitle}>입고 일정</h3>
                <div className={style.scheduleGrid}>
                    {days.map(d => {
                        const key = fmtDate(d);
                        const items = (schedulesByDate[key] || []).slice(0,5);
                        const dow = KOR_DOW[d.getDay()];
                        return (
                            <article key={key} className={style.scheduleCard}>
                                <div className={style.scheduleDate}>
                                    {key} <span className={style.scheduleDow}>({dow})</span>
                                </div>
                                <ul className={style.scheduleList}>
                                    {items.length === 0 ? (
                                        <li className={style.empty}>일정 없음</li>
                                    ) : (
                                        items.map((it,i) => (
                                            <li key={i} className={style.scheduleText}>{it.title}</li>
                                        ))
                                    )}
                                </ul>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* 공지 */}
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
    );
}
