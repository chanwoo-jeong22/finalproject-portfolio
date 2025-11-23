import axios from "axios";
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useContext,
} from "react";
import style from "./AgencyIndexPage.module.css";
import { AuthContext } from "../../context/AuthContext";
import Notice from "../notice/Notice";
import HeadPopup from "../headOffice/HeadPopup";
import NoticeDetail from "../headOffice/NoticeDetail";

// NoticeData 타입 정의 (notice.tsx와 동일하게)
interface NoticeData {
    ntKey: number;
    ntCategory: string;
    atCreated?: string;
    ntContent: string;
}

interface ScheduleItem {
    title: string;
}

interface SchedulesByDate {
    [date: string]: ScheduleItem[];
}

// 입고 일정 관련 유틸 함수들 생략 (동일)

export default function AgencyIndexPage() {
    const { token } = useContext(AuthContext);

    // selectedNotice 타입 NoticeData로 변경
    const [selectedNotice, setSelectedNotice] = useState<NoticeData | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const noticeRef = useRef<any>(null);

    const [schedulesByDate, setSchedulesByDate] = useState<SchedulesByDate>({});

    // 입고 일정 5일만 표시
    const days = useMemo(() => getNextBizDays(7).slice(0, 5), []);

    // 공지사항 API 대신 Notice 컴포넌트가 담당하므로 삭제해도 됨

    // 입고 일정 API 호출 (기존 코드 유지)
    useEffect(() => {
        const from = toIsoDate(days[0]);
        const to = toIsoDate(days[days.length - 1]);

        axios
            .get("/api/agencyorder/schedule", { params: { from, to } })
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
            .catch((err) => console.error(err));
    }, [days]);

    // 타입 맞춘 핸들러
    const handleNoticeClick = (notice: NoticeData) => {
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
            {/* 입고 일정 섹션 동일 */}

            {/* 공지사항 */}
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
