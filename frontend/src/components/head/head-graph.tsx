import { useState, useEffect } from "react";
import headStyles from "../../styles/head/head.module.css";
import "../../styles/head/head-graph.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  fetchMonthlyData,
  fetchAgencies,
  HeadGraphDataType,
  AgencyType,
} from "../../redux/slices/head/headgraph-slice";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

function HeadGraph() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux 상태 조회
  const data = useSelector((state: RootState) => state.headGraph.data);
  const allAgencies = useSelector((state: RootState) => state.headGraph.allAgencies);
  const loadingData = useSelector((state: RootState) => state.headGraph.loadingData);
  const loadingAgencies = useSelector((state: RootState) => state.headGraph.loadingAgencies);
  const errorData = useSelector((state: RootState) => state.headGraph.errorData);
  const errorAgencies = useSelector((state: RootState) => state.headGraph.errorAgencies);

  // 로컬 상태 (필터)
  const [regionFilter, setRegionFilter] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [filteredData, setFilteredData] = useState<HeadGraphDataType[]>([]);

  // 고정 시/도 목록 (필터 용)
  const REGION_LIST = [
    "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
    "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ];

  // 최근 6개월 구하기
  const getLast6Months = (): string[] => {
    const months: string[] = [];
    const today = new Date();
    for(let i = 5; i >= 0; i--){
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      months.push(monthStr);
    }
    return months;
  };

  // 컴포넌트 마운트 시 데이터 호출
  useEffect(() => {
    dispatch(fetchMonthlyData());
    dispatch(fetchAgencies());
  }, [dispatch]);

  // 지역 정보 포함해서 allAgencies 전처리
  const allAgenciesWithRegion = allAgencies.map(agency => {
    let region = "";
    if (agency.agAddress) {
      for (const r of REGION_LIST) {
        if (agency.agAddress.includes(r)) {
          region = r;
          break;
        }
      }
    }
    return {...agency, region};
  });

  // 필터링 함수
  const applyFilter = () => {
    let filtered = data;
    if (regionFilter) filtered = filtered.filter(d => d.region === regionFilter);
    if (agencyFilter) filtered = filtered.filter(d => d.agName === agencyFilter);

    // 없는 달은 0으로 채움
    const last6Months = getLast6Months();
    const filled = last6Months.map(m => {
      const found = filtered.find(d => d.month === m);
      return found || { month: m, order: 0, status: 0, region: '', agName: '' };
    });
    setFilteredData(filled);
  };

  // 필터 조건 변경 시마다 필터 적용
  useEffect(() => {
    applyFilter();
  }, [data, regionFilter, agencyFilter]);

  // 필터 초기화
  const resetFilter = () => {
    setRegionFilter("");
    setAgencyFilter("");
    const last6Months = getLast6Months();
    const filled = last6Months.map(m => {
      const found = data.find(d => d.month === m);
      return found || { month: m, order: 0, status: 0, region: '', agName: '' };
    });
    setFilteredData(filled);
  };

  // 유니크 지역 및 대리점 리스트
  const uniqueRegions = [...new Set(allAgenciesWithRegion.map(d => d.region).filter(Boolean))];
  const uniqueAgencies = [...new Set(allAgenciesWithRegion.map(d => d.agName).filter(Boolean))];

  // payload 내부 아이템 타입 정의 (tooltip의 payload 배열 요소)
  interface PayloadItem {
    dataKey: string;
    value: number | string;
    [key: string]: any;
  }

  // CustomTooltip Props 타입 정의
  interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    payload?: PayloadItem[];
    label?: string | number;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className={"tooltip"}>
          <p className={"tool_month"}>{label}월</p>
          <p className={"tool_order"}>
            <span>주문</span>
            <span>{payload.find((p) => p.dataKey === "order")?.value}</span>
          </p>
          <p className={"tool_status"}>
            <span>출고</span>
            <span>{payload.find((p) => p.dataKey === "status")?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={"main_inner_grid"}>
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
          <button className={'main_reset_btn'} onClick={resetFilter}>
            <img src={'/images/icon_reset.svg'} alt="초기화" />
          </button>
        </div>
      </div>

      <div className={"graph_area"}>
        {loadingData || loadingAgencies ? (
          <p>로딩 중...</p>
        ) : errorData || errorAgencies ? (
          <p>에러 발생: {errorData || errorAgencies}</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={filteredData}
              margin={{top: 0, right: 0, left: 0, bottom: 0}}
              barCategoryGap="30%"
              className={"noOutline"}
              style={{ outline: "none", boxShadow: "none" }}
            >
              <Legend verticalAlign="top" align="right" height={36} />
              <CartesianGrid
                stroke="#eee"
                strokeDasharray="0"
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="month"
                type="category"
                ticks={getLast6Months()}
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                axisLine={{ stroke: "#000", strokeWidth: 1 }}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                width={40}
                domain={[0, 100]}
                ticks={[0,10,20,30,40,50,60,70,80,90,100]}
                tick={{ fill: "#333", fontSize: 12, fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128,128,128,0.05)" }} />
              <Bar dataKey="order" fill="#5367EA" name="주문" stroke="none" radius={[0, 0, 0, 0]} />
              <Bar dataKey="status" fill="#2AC9A3" name="출고" stroke="none" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default HeadGraph;
