import {useEffect, useMemo, useState, forwardRef, useImperativeHandle, useContext} from 'react';
import axios from 'axios';
import styles from './notice.module.css';

// 정환 추가
import { AuthContext } from '../../context/AuthContext.tsx';
// 정환 추가

const API_URL = 'http://localhost:8080/api/notices';

// role: 'head_office' | 'logistic' | 'agency'
const Notice = forwardRef(function Notice({ role = 'head_office', limit = Infinity, onNoticeClick }, ref) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    // 정환 추가
    const { token } = useContext(AuthContext);
    // 정환 추가

    const codes = useMemo(() => {
        const map = { head_office: 1, logistic: 2, agency: 3 };
        const code = map[role] ?? 1;
        return [0, code];
    }, [role]);

    const fetchList = async () => {
        try {
            const res = await axios.get(API_URL, {
                params: { codes },

                // 정환 추가
                headers: { Authorization: `Bearer ${token}` }
                // 정환 추가
            });
            
            // 최신 등록 순으로 정렬 (내림차순)
            const sortedData = [...(res.data || [])].sort((a, b) => {
                const dateA = new Date(a.atCreated);
                const dateB = new Date(b.atCreated);
                return dateB - dateA; // 최신 → 오래된 순
            });

            const mappedItems = sortedData.map(n => ({
                id: n.ntKey,
                category: n.ntCategory,
                date: (n.atCreated || '').split('T')[0],
                content: n.ntContent,
                originalNotice: n, // 원본 데이터 저장
            }));
            setItems(mappedItems);
            setError(null); // 성공 시 에러 상태 초기화
        } catch (e) {
            setError(e);
        }
    };

    // 정환 수정
    useEffect(() => {
        if (token) {
            console.log('fetchList 실행', token);
            fetchList();
        }
    }, [codes, token]);
    // 정환 수정

    // ref를 통해 부모 컴포넌트에서 새로고침할 수 있도록 메서드 노출
    useImperativeHandle(ref, () => ({
        refresh: () => {
            fetchList();
        }
    }), [codes, token]); // 정환 수정

    if (error) {
        return <div className={styles.noticeList}>공지 로드 실패: {error.message}</div>;
    }

    if (!items.length) {
        return <div className={styles.noticeList}>등록된 공지가 없습니다.</div>;
    }

    // role 값에 따라 limit 자동 설정
    const effectiveLimit = role === 'head_office' ? (limit ?? 5) : Infinity;
    const limitedItems = items.slice(0, effectiveLimit);

    return (
        // 진경 수정 : 물류와 대리점 css 다르게 적용
        <div className={`${styles.noticeList} ${styles[`noticeList_${role}`] || ''}`}>
            <ul>
                {limitedItems.map(n => (
                    <li key={n.id} onClick={() => onNoticeClick && onNoticeClick(n.originalNotice)} style={{ cursor: 'pointer' }}>
                        <p className={styles.category}><span>{n.category}</span></p>
                        <p className={styles.date}>{n.date}</p>
                        <p className={styles.nt_contents}>{n.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
});

export default Notice