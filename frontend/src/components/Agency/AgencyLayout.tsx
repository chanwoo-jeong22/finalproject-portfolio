import { Outlet, useLocation } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "../Layout/TopBar";
import { useState, useEffect } from "react";
import api from "../../api/api";
import type { JSX } from "react";
import style from "../Agency/MenuBox.module.css";

interface Item {
    pdKey: number;
    name: string;
    sku: string;
    quantity: number;
    price: number;
}

interface AgencyOrderDTO {
    orKey: number;
    orderNumber: string;
    orStatus: string;
    orProducts: string;
    orPrice: number;
    orQuantity: number;
    orTotal: number;
    orDate: string;
    orReserve: string;
    orGu: string;
    agName: string;
    pdProducts: string;
    dvName: string;
    items: Item[];
    agPhone: string;
    agAddress: string;
}

export default function AgencyLayout(): JSX.Element {
    const location = useLocation();

    const [orders, setOrders] = useState<AgencyOrderDTO[]>([]);
    const [drafts, setDrafts] = useState<AgencyOrderDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const ordersRes = await api.get<AgencyOrderDTO[]>("/agencyorder/full");
                setOrders(ordersRes.data);

                // 필요시 임시 저장 데이터도 받아오세요
                // const draftsRes = await api.get<AgencyOrderDTO[]>("/agencyorder/draft");
                // setDrafts(draftsRes.data);
            } catch (err) {
                console.error("AgencyLayout API 호출 실패", err);
                setError("데이터 불러오기 실패");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={style.wrap}>
            <SideBar />

            <div className={style.container}>
                <TopBar />
                <div className={style.ag_main}>
                    <div className={style.content}>
                        {loading && <div>로딩 중...</div>}
                        {error && <div style={{ color: "red" }}>{error}</div>}

                        <Outlet
                            key={location.pathname + location.search}
                            context={{ orders, setOrders, drafts, setDrafts }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
