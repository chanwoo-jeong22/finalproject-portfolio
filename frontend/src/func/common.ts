/* =============== 일정 헬퍼 =============== */
// 오늘부터 월~토만 집계해서 N칸 반환(일요일 제외)
export function getNextBizDays(count = 12) {
    const days = [];
    const start = new Date();
    const d = new Date(start);
    while (days.length < count) {
        if (d.getDay() !== 0) days.push(new Date(d)); // 0=일요일 제외
        d.setDate(d.getDate() + 1);
    }
    return days;
}
export const fmtDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
};