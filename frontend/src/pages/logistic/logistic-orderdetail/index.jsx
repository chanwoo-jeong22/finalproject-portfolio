import {useContext, useEffect, useMemo, useState} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../../../styles/logistic/logistic-order-detail.module.css";
import {AuthContext} from "../../../context/auth-context.tsx";


export default function LogisticOrderDetail() {
    const { orKey } = useParams();
    const { token } = useContext(AuthContext);
    const auth = useMemo(
        () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        [token]
    )

    // 읽기 전용 상단 폼/헤더
    const [header, setHeader] = useState({
        orKey: "",
        orStatus: "",
        orProducts: "",
        orQuantity: "",
        orTotal: "",
        orPrice: "",
        orDate: "",
        orReserve: "",
        orGu: "",
        agName: "",
        pdProducts: "",
        dvName: "",

        pdNum: "",
        agPhone: "",
    });

    const getSelectedDriver = () => drivers.find(d => d.name === driverName) || null;

    const handleUpdateStatusWithDriver = async (status) => {
        if (!driverName) { alert("운전기사를 선택해주세요."); return; }
        const sel = getSelectedDriver();
        if (!sel) { alert("선택한 운전기사를 찾을 수 없습니다."); return; }

        try {
            await axios.put(`/api/agencyorder/${header.orKey}/status-with-driver`, {
                status,
                dvName: sel.name,   // ← agencyorder.dv_name 에 저장
                dvKey : sel.id      // (선택) FK도 함께 저장
            },auth);

            await axios.put(
                `/api/deliveries/${sel.id}/status`,
                null,
                { ...auth, params: { status: status === "배송중" ? "운행중" : "대기중", delivery: false } }
            );

            // 낙관적 업데이트(화면 즉시 반영)
            setHeader(h => ({ ...h, dvName: sel.name }));
            alert(`상태가 ${status}로 변경되고 기사(${sel.name})가 저장되었습니다.`);
        } catch (e) {
            console.error(e);
            alert("처리에 실패했습니다.");
        }
    };

    const isCompleted = ["배송중", "배송완료"].includes(header.orStatus);




    // 품목 테이블
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // 운전기사(상세에서 편집 가능하게 유지하려면 필요한 상태)
    const [driverName, setDriverName] = useState("");
    const [driverPhone, setDriverPhone] = useState("");
    const [driverCar, setDriverCar] = useState("");
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {


        if (!driverName) {
            setDriverPhone("");
            setDriverCar("");
            return;
        }
        const sel = drivers.find(d => d.name === driverName);
        if (sel) {
            setDriverPhone(sel.phone || "");
            setDriverCar(sel.car || "");
        } else {
            setDriverPhone("");
            setDriverCar("");
        }
    }, [drivers, driverName]);

    useEffect(() => {
        let mounted = true;


        // ✅ 공통 헤더 객체

        async function fetchDetail() {
            if (!token) return; // 토큰 준비 전엔 호출 안 함
            try {
                setLoading(true);

                // 1) 헤더 조회: 우선 full 엔드포인트를 시도
                //    (프로젝트에 따라 /api/agencyorder/:orKey 로 바꿔도 됨)
                const tryUrls = [
                    // `/api/agencyorder/items/${orKey}`
                    `/api/agencyorder/${orKey}`,
                    `/api/agencyorder/full/${orKey}`,     // 프로젝트에 존재한다면 보조 후보
                    `/api/agencyorder?id=${orKey}`
                ];

                const tryItemUrls =
                    [
                        `/api/agencyorder/items/${orKey}`,
                        `/api/agencyitems/${orKey}`,          // 프로젝트에 따라 있는 경우
                        `/api/agencyorder/${orKey}/items`
                    ];

                let headerData = null;
                for (const u of tryUrls) {
                    try {
                        const r = await axios.get(u,auth);
                        // 백엔드 응답 포맷에 맞춰 추출
                        const h = r.data?.data ?? r.data;
                        if (h && Object.keys(h).length) {
                            headerData = Array.isArray(h) ? h[0] : h;
                            break;
                        }
                    } catch  {
                        /* 다음 후보 URL 시도 */
                    }
                }
                if (!headerData) throw new Error("주문 헤더 데이터를 불러오지 못했습니다.");

                // 2) 품목 조회(여러 후보 엔드포인트 순차 시도)

                let itemData = [];
                for (const u of tryItemUrls) {
                    try {
                        const r = await axios.get(u, auth);
                        const d = r.data?.data ?? r.data ?? [];
                        if (Array.isArray(d)) {
                            itemData = d;
                            break;
                        }
                    } catch  {

                    }
                }

                const tryDriverUrls = ["/api/deliveries"];
                let driverList = [];
                for (const u of tryDriverUrls) {
                    try {
                        const r = await axios.get(u, auth);
                        const d = r.data?.data ?? r.data ?? [];
                        if (Array.isArray(d)) {
                            driverList = d.map((x, i) => ({
                                id : x.dvKey ?? x.dv_key ?? i + 1,
                                name : x.dvName ?? x.dv_name ?? "",
                                phone: x.dvPhone ?? x.dv_phone ?? x.phone ?? x.tel ?? x.mobile ?? "",
                                car : x.dvCar ?? x.dv_car ?? "",
                                delivery : x.dvDelivery ?? x.dv_delivery ?? false,
                            }));
                            break;
                        }
                    } catch {}
                }


                // 3) 프론트에서 쓰는 키로 매핑(네가 쓰는 agencyorderForm 기준)
                const mappedHeader = {
                    orKey: headerData.orKey ?? headerData.or_key ?? "",
                    orStatus: headerData.orStatus ?? headerData.or_status ?? "",
                    orProducts: headerData.orProducts ?? headerData.or_products ?? "",
                    orQuantity: headerData.orQuantity ?? headerData.or_quantity ?? "",
                    orTotal: headerData.orTotal ?? headerData.or_total ?? "",
                    orPrice: headerData.orPrice ?? headerData.or_price ?? "",
                    orDate: headerData.orDate ?? headerData.or_date ?? "",
                    orReserve: headerData.orReserve ?? headerData.or_reserve ?? "",
                    orGu: headerData.orGu ?? headerData.or_gu ?? "",
                    agName: headerData.agName ?? headerData.ag_name ?? headerData.agencyName ?? "",
                    pdProducts: headerData.pdProducts ?? headerData.pd_products ?? "",
                    dvName: headerData.dvName ?? headerData.dv_name ?? "",
                    pdNum: headerData.pdNum ?? headerData.pd_num ?? "",
                    agPhone: headerData.agPhone ?? headerData.ag_phone ?? "",
                    agAddress: headerData.agAddress ?? headerData.ag_Address ?? "",
                };

                const mappedItems = itemData.map((it, idx) => {
                       const qty   = Number(it.oiQuantity ?? it.oi_quantity ?? 0);
                       const price = Number(it.oiPrice    ?? it.oi_price    ?? 0);
                       const total = Number(it.oiTotal    ?? it.oi_total    ?? (price * qty));
                       return {
                             id:         it.oiKey ?? it.oi_key ?? idx + 1,
                             pdNum:      it.pdNum ?? it.pd_num ?? "",          // DTO에 없으면 공란
                             oiProducts: it.oiProducts ?? it.oi_products ?? "",
                             oiQuantity: qty,
                             oiPrice:    price,
                             oiTotal:    total,
                             stock:      it.stock ?? "ok",
                           };
                     });

                if (mounted) {
                    setHeader(mappedHeader);
                    setItems(mappedItems);
                    setDriverName(mappedHeader.dvName || "");
                    setDrivers(driverList);
                    setErr("");
                }
            } catch (e) {
                if (mounted) setErr(e?.message || "상세 조회 중 오류가 발생했습니다.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchDetail();
        return () => {
            mounted = false;
        };
    }, [orKey, auth]);

    const rows = useMemo(() => items, [items]);

    if (loading) {
        return <div className={styles.fixedRoot}><div className={styles.content}>불러오는 중…</div></div>;
    }
    if (err) {
        return <div className={styles.fixedRoot}><div className={styles.content}>에러: {err}</div></div>;
    }

    return (
        <div className={styles.fixedRoot}>
            <div className={styles.content}>
                <h2 className={styles.title}>주문 관리 (출고)</h2>

                {/* ─── 상단 폼: 읽기 전용 + 운전기사 편집 가능 ─── */}
                <div className={styles.headerGridWrap}>
                <div className={styles.headerGrid}>
                    {/* 1행 */}
                    <label className={`${styles.label} ${styles.labelOrderDate}`}>주문일</label>
                    <input className={`${styles.input} ${styles.inputOrderDate}`} type="text" value={header.orDate} disabled readOnly />

                    <label className={`${styles.label} ${styles.labelShipDate}`}>출고날짜</label>
                    <input className={`${styles.input} ${styles.inputShipDate}`} type="text" value={header.orReserve} disabled readOnly />

                    {/* 왕버튼 */}
                    <div className={styles.kingBtns}>
                        <button
                            className={`${styles.king} ${styles.black}`}
                            onClick={() => {
                                if (isCompleted) {
                                    alert("이미 완료된 주문내역입니다");
                                    return;
                                }
                                handleUpdateStatusWithDriver("배송중");
                            }}
                        >
                            출고<br/>등록
                        </button>
                    </div>

                    {/* 2행 */}
                    <label className={`${styles.label} ${styles.labelAgency}`}>대리점</label>
                    <input className={`${styles.input} ${styles.inputAgency}`} type="text" value={header.agName} disabled readOnly />

                    <label className={`${styles.label} ${styles.labelAgencyPhone}`}>전화번호</label>
                    <input className={`${styles.input} ${styles.inputAgencyPhone}`} type="text" value={header.agPhone} disabled readOnly />

                    {/* 3행 (운전기사 — 편집 가능) */}
                    <label className={`${styles.label} ${styles.labelDriver}`}>운전기사</label>
                     <select
                       className={`${styles.input} ${styles.selectDriver}`}
                       value={driverName}
                       disabled={isCompleted}
                       onChange={(e) => setDriverName(e.target.value)}
                     >
                       <option value="">-- 운전기사 선택 --</option>
                       {drivers.map(d => (
                         <option key={d.id}
                                 value={d.name}
                                 disabled={!d.delivery}
                         >
                               {/*{d.name}{d.car ? ` (${d.car})` : ""}*/}

                             {d.delivery
                                 ? "🟢 " + d.name + " (" + d.car + ")"
                                 : "🔴 " + d.name + " (" + d.car + ")"
                             }

                             </option>
                       ))}
                     </select>

                    <label className={`${styles.label} ${styles.labelDriverPhone}`}>기사 전화</label>
                    <input
                        className={`${styles.input} ${styles.inputDriverPhone}`}
                        type="text"
                        value={driverPhone} disabled readOnly
                        onChange={(e) => setDriverPhone(e.target.value)}
                    />

                    <div className={styles.driverCarGroup}>
                        <label className={styles.inlineLabel}>차량번호</label>
                        <input
                            className={`${styles.input} ${styles.inlineInput}`}
                            type="text"
                            value={driverCar} disabled readOnlyf
                            onChange={(e) => setDriverCar(e.target.value) }
                        />
                    </div>

                    {/* 4행: 지역 */}
                    <label className={`${styles.label} ${styles.labelZip}`}>지역</label>
                    <input
                        className={`${styles.input} ${styles.wide}`}
                        type="text"
                        value={header.agAddress}
                        disabled readOnly
                    />
                </div>
                </div>


                {/* ─── 물건 테이블(이제 DB) ─── */}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>

                            <th className={styles.thSort}>품번</th>
                            <th className={styles.thSort}>제품명</th>
                            <th className={`${styles.thSort} ${styles.right}`}>수량</th>
                            <th className={`${styles.thSort} ${styles.right}`}>단가</th>
                            <th className={`${styles.thSort} ${styles.right}`}>총액</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((r) => (
                            <tr key={r.id}>

                                <td>{r.pdNum}</td>                              {/* 품번 */}
                                <td>{r.oiProducts}</td>                         {/* 제품명 */}
                                <td className={styles.right}>{r.oiQuantity.toLocaleString()}</td>
                                <td className={styles.right}>{r.oiPrice.toLocaleString()}</td>
                                <td className={styles.right}>{r.oiTotal.toLocaleString()}</td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.right}>품목이 없습니다.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
