import React, {useState, useEffect, useContext} from "react";
import headStyles from "../../styles/head/head.module.css";
import "../../styles/head/head-graph.css";
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";


function HeadGraph() {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [regionFilter, setRegionFilter] = useState("");
    const [agencyFilter, setAgencyFilter] = useState("");
    const [allAgencies, setAllAgencies] = useState([]);

    // 고정된 시/도 목록
    const REGION_LIST = [
        "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
        "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    ];

    // 최근 6개월 구하기
    const getLast6Months = () => {
        const months = [];
        const today = new Date();
        for(let i = 5; i >= 0; i--){
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            months.push(monthStr);
        }
        return months;
    }

    // 데이터 가져오기
    useEffect(() => {
        if (!token) return;
        
        axios.get("/api/dashboard/monthly", {headers: {Authorization: `Bearer ${token}`}})
            .then(res => {
                console.log("monthly 응답:", res.data);

                const formatted = res.data.map(d => {
                    let month = d.month;
                    if (month && /^\d{4}-\d{1}$/.test(month)) {
                        // 2025-9 → 2025-09 변환
                        const [y, m] = month.split("-");
                        month = `${y}-${m.padStart(2, "0")}`;
                    }
                    return {
                        ...d,
                        month,
                        order: Number(d.order),
                        status: Number(d.status)
                    };
                });
                setData(formatted);
            })
            .catch(err => console.error(err));
    }, [token]);

    // 전체 대리점 목록 가져오기
    useEffect(() => {
        if (!token) return;
        
        axios.get("/api/dashboard/agencies", {headers: {Authorization: `Bearer ${token}`}})
            .then(res => {
                // 서버에서 받은 agAddress에서 시/도만 추출
                const formatted = res.data.map(d => {
                    let region = "";
                    if (d.agAddress) {
                        for (let r of REGION_LIST) {
                            if (d.agAddress.includes(r)) {
                                region = r;
                                break;
                            }
                        }
                    }
                    return {
                        ...d,
                        region,
                        agName: d.agName,
                    };
                });
                setAllAgencies(formatted);
            })
            .catch(err => console.error(err));
    }, [token]);

    // 필터링 및 6개월 채우기
    const applyFilter = () => {
        let filtered = data;
        if (regionFilter) filtered = filtered.filter(d => d.region === regionFilter);
        if (agencyFilter) filtered = filtered.filter(d => d.agName === agencyFilter);

        // 없는 달 데이터도 0으로 채우기
        const last6Months = getLast6Months();
        const filled = last6Months.map(m => {
            const found = filtered.find(d => d.month === m);
            return found || { month: m, order: 0, status: 0, region: '', agName: '' };
        });
        setFilteredData(filled);
    };

    useEffect(() => {
        applyFilter();
    }, [data, regionFilter, agencyFilter]);

    // 초기화 버튼 함수
    const resetFilter = () => {
        setRegionFilter("");
        setAgencyFilter("");
        // 필터 초기화 후 전체 데이터 표시
        const last6Months = getLast6Months();
        const filled = last6Months.map(m => {
            const found = data.find(d => d.month === m);
            return found || { month: m, order: 0, status: 0, region: '', agName: '' };
        });
        setFilteredData(filled);
    };

    // 옵션 리스트 생성
    // 지역별
    const uniqueRegions = [...new Set(allAgencies.map(d => d.region).filter(Boolean))];
    // 대리점별
    const uniqueAgencies = [...new Set(allAgencies.map(d => d.agName).filter(Boolean))];


    // 그래프 Tooltip 스타일
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={'tooltip'}>
                    <p className={'tool_month'}>{label}월</p>
                    <p className={'tool_order'}>
                        <span>주문</span>
                        <span>{payload.find(p => p.dataKey === 'order')?.value}</span>
                    </p>
                    <p className={'tool_status'}>
                        <span>출고</span>
                        <span>{payload.find(p => p.dataKey === 'status')?.value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className={'main_inner_grid'}>
            <div className={`${headStyles.left_select} ${headStyles.gap10}`}>
                <div className={headStyles.section}>
                    <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                        <option value="">지역 전체</option>
                        {uniqueRegions.map(region => <option key={region}>{region}</option>)}
                    </select>
                    <select value={agencyFilter} onChange={e => setAgencyFilter(e.target.value)}>
                        <option value="">대리점 전체</option>
                        {uniqueAgencies.map(ag => <option key={ag}>{ag}</option>)}
                    </select>
                    {/*<button className={headStyles.small_btn} onClick={applyFilter}>검색</button>*/}
                    <button className={'main_reset_btn'} onClick={resetFilter}>
                        <img src={'/images/icon_reset.svg'}/>
                    </button>
                </div>
            </div>

            <div className={'graph_area'}>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={filteredData}
                        margin={{top: 0, right: 0, left: 0, bottom: 0}}
                        barCategoryGap="30%"
                        style={{
                            outline: 'none',
                            boxShadow: 'none'
                        }}
                        className={'noOutline'}
                    >
                        <Legend verticalAlign="top" align="right" height={36} />
                        <CartesianGrid
                            stroke="#eee"          // 선 색상
                            strokeDasharray="0"  // 점선 패턴: 5px 선, 5px 공백
                            vertical={false}        // 세로선 표시 여부
                            horizontal={true}>
                       </CartesianGrid>
                        <XAxis
                            dataKey="month"
                            type="category"
                            ticks={getLast6Months()}
                            tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }} // 글자 색상, 크기, 굵기
                            axisLine={{ stroke: "#000", strokeWidth: 1 }} // X축 선
                            tickLine={false} // 틱 선
                            tickMargin={10}
                        />
                        <YAxis
                            width={40}
                            domain={[0, 100]}
                            ticks={[0,10,20,30,40,50,60,70,80,90,100]}
                            tick={{ fill: "#333", fontSize: 12, fontWeight: "bold" }}
                            axisLine={false} // y축 선 색상
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128,128,128,0.05)" }} />
                        <Bar dataKey="order" fill="#5367EA" name="주문" stroke="none" radius={[0, 0, 0, 0]} /> {/*진경 수정*/}
                        <Bar dataKey="status" fill="#2AC9A3" name="출고" stroke="none" radius={[0, 0, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default HeadGraph
