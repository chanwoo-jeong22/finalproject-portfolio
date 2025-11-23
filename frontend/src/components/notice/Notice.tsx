import React, {
    useEffect,
    useMemo,
    useState,
    forwardRef,
    useImperativeHandle,
    useContext,
    Ref,
} from "react";
import axios from "axios";
import styles from "./notice.module.css";
import { AuthContext } from "../../context/AuthContext";

// 타입 정의
interface NoticeData {
    ntKey: number;
    ntCategory: string;
    atCreated?: string;
    ntContent: string;
}

interface NoticeItem {
    id: number;
    category: string;
    date: string;
    content: string;
    originalNotice: NoticeData;
}

interface NoticeProps {
    role?: "head_office" | "logistic" | "agency";
    limit?: number;
    onNoticeClick?: (notice: NoticeData) => void;
}

export interface NoticeHandle {
    refresh: () => void;
}

const API_URL = "http://localhost:8080/api/notices";

const Notice = forwardRef<NoticeHandle, NoticeProps>(function Notice(
    { role = "head_office", limit = Infinity, onNoticeClick },
    ref: Ref<NoticeHandle>
) {
    const [items, setItems] = useState<NoticeItem[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const { token } = useContext(AuthContext);

    const codes = useMemo(() => {
        const map = { head_office: 1, logistic: 2, agency: 3 };
        const code = map[role] ?? 1;
        return [0, code];
    }, [role]);

    const fetchList = async () => {
        try {
            const res = await axios.get(API_URL, {
                params: { codes },
                headers: { Authorization: `Bearer ${token}` },
            });

            const rawData: NoticeData[] = res.data?.data ?? res.data ?? [];
            // 최신 등록 순 (내림차순)
            const sortedData = [...rawData].sort((a, b) => {
                const dateA = new Date(a.atCreated || 0).getTime();
                const dateB = new Date(b.atCreated || 0).getTime();
                return dateB - dateA;
            });

            const mappedItems = sortedData.map((n) => ({
                id: n.ntKey,
                category: n.ntCategory,
                date: (n.atCreated || "").split("T")[0],
                content: n.ntContent,
                originalNotice: n,
            }));

            setItems(mappedItems);
            setError(null);
        } catch (e: any) {
            setError(e);
        }
    };

    useEffect(() => {
        if (token) {
            fetchList();
        }
    }, [codes, token]);

    useImperativeHandle(
        ref,
        () => ({
            refresh: () => {
                fetchList();
            },
        }),
        [codes, token]
    );

    if (error) {
        return (
            <div className={styles.noticeList}>공지 로드 실패: {error.message}</div>
        );
    }

    if (!items.length) {
        return <div className={styles.noticeList}>등록된 공지가 없습니다.</div>;
    }

    const effectiveLimit = role === "head_office" ? limit ?? 5 : Infinity;
    const limitedItems = items.slice(0, effectiveLimit);

    return (
        <div className={`${styles.noticeList} ${styles[`noticeList_${role}`] || ""}`}>
            <ul>
                {limitedItems.map((n) => (
                    <li
                        key={n.id}
                        onClick={() => onNoticeClick && onNoticeClick(n.originalNotice)}
                        style={{ cursor: "pointer" }}
                    >
                        <p className={styles.category}>
                            <span>{n.category}</span>
                        </p>
                        <p className={styles.date}>{n.date}</p>
                        <p className={styles.nt_contents}>{n.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default Notice;
