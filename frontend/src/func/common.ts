/* =============== 일정 헬퍼 =============== */
export function getNextBizDays(count = 12) {
    const days = [];
    const d = new Date();
    while (days.length < count) {
        days.push(new Date(d));
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