import {Outlet, useLocation} from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "../Layout/TopBar";
import {useState, useEffect} from "react";
import api from "../../api/api.js";
import style from "../Agency/MenuBox.module.css"; // 진경 수정

export default function AgencyLayout() {
    const location = useLocation();

    // ✅ Agency 하위 모든 페이지에서 공유할 상태
    const [orders, setOrders] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null);     // 에러 상태

    // =========================
    // 상위 Layout에서 API 호출
    // =========================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // ✅ 주문 현황
                const ordersRes = await api.get("/agencyorder/full");
                setOrders(ordersRes.data);

                // // ✅ 임시 저장 (ReadyOrder) 가져오기
                // const draftsRes = await api.get("/agencyorder/draft"); // GET 방식 필요 시 백엔드 확인
                // setDrafts(draftsRes.data);

            } catch (err) {
                console.error("AgencyLayout API 호출 실패", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Layout 마운트 시 한 번만 호출

    return (
        // 진경 수정
        <div className={style.wrap}>
            <SideBar/>

            <div className={style.container}>
                <TopBar/>
                <div className={style.ag_main}>
                    <div className={style.content}>
                        {loading && <div>로딩 중...</div>}
                        {error && <div style={{color: "red"}}>데이터 불러오기 실패</div>}

                        {/* Outlet에 context로 orders + drafts 전달 */}
                        <Outlet
                            key={location.pathname + location.search}
                            context={{orders, setOrders, drafts, setDrafts}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
