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

  // Redux에서 상태를 조회
  const data = useSelector((state: RootState) => state.headGraph.data);
  const allAgencies = useSelector((state: RootState) => state.headGraph.allAgencies);
  const loadingData = useSelector((state: RootState) => state.headGraph.loadingData);
  const loadingAgencies = useSelector((state: RootState) => state.headGraph.loadingAgencies);
  const errorData = useSelector((state: RootState) => state.headGraph.errorData);
  const errorAgencies = useSelector((state: RootState) => state.headGraph.errorAgencies);

  // 지역 필터 상태
  const [regionFilter, setRegionFilter] = useState<string>("");
  // 대리점 필터 상태
  const [agencyFilter, setAgencyFilter] = useState<string>("");
  // 필터링 후 차트에 보여줄 데이터 상태
  const [filteredData, setFilteredData] = useState<HeadGraphDataType[]>([]);

  // 고정된 시/도 리스트 (필터에 사용)
  const REGION_LIST = [
    "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
    "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ];

  // 최근 6개월 YYYY-MM 형식 문자열 배열을 반환하는 함수
  const getLast6Months = (): string[] => {
    const months: string[] = [];
    const today = new Date();
    for(let i = 5; i >= 0; i--){
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // 예: "2025-12"
      months.push(monthStr);
    }
    return months;
  };

  // 컴포넌트 마운트 시 월별 데이터와 대리점 목록을 서버에서 불러옴
  useEffect(() => {
    dispatch(fetchMonthlyData());
    dispatch(fetchAgencies());
  }, [dispatch]);

  // 대리점 리스트에 지역(region) 정보 추가 타입 정의
  type AgencyWithRegion = AgencyType & { region: string };

  // allAgencies 데이터에 주소를 보고 시/도(region) 추가
  const allAgenciesWithRegion: AgencyWithRegion[] = allAgencies.map(agency => {
    let region = "";
    if (agency.agAddress) {
      for (const r of REGION_LIST) {
        if (agency.agAddress.includes(r)) {
          region = r;
          break;
        }
      }
    }
    return { ...agency, region };
  });

  /**
   * 필터 적용 함수
   * - 지역필터, 대리점필터 조건으로 data를 필터링
   * - 최근 6개월을 기준으로 월별 데이터를 합산하여 누락된 월은 0으로 채움
   */
  const applyFilter = () => {
    let filtered = data;

    // 지역 필터가 있으면 필터 적용
    if (regionFilter) filtered = filtered.filter(d => d.region === regionFilter);
    // 대리점 필터가 있으면 필터 적용
    if (agencyFilter) filtered = filtered.filter(d => d.agName === agencyFilter);

    // 최근 6개월 목록 구하기
    const last6Months = getLast6Months();

    // 월별 데이터 집계 (동일 월 여러 데이터가 있을 수 있으므로 합산 처리)
    const filled = last6Months.map(m => {
      // 필터된 데이터 중 해당 월에 해당하는 항목 모두 추출
      const monthlyItems = filtered.filter(d => d.month === m);
      // 주문 수량 합산
      const orderSum = monthlyItems.reduce((acc, cur) => acc + (cur.order ?? 0), 0);
      // 출고 수량 합산
      const statusSum = monthlyItems.reduce((acc, cur) => acc + (cur.status ?? 0), 0);
      // 대표 지역과 대리점 이름은 첫 번째 항목에서 가져옴 (필요시 수정 가능)
      const region = monthlyItems[0]?.region || '';
      const agName = monthlyItems[0]?.agName || '';

      return { month: m, order: orderSum, status: statusSum, region, agName };
    });

    // 필터링 후 상태 업데이트
    setFilteredData(filled);
  };

  // 필터 조건 변경 시마다 필터 적용
  useEffect(() => {
    applyFilter();
  }, [data, regionFilter, agencyFilter]);

  /**
   * 필터 초기화 함수
   * - 지역/대리점 필터 해제
   * - 최근 6개월 데이터 기반으로 누락 월 0 채움
   */
  const resetFilter = () => {
    setRegionFilter("");
    setAgencyFilter("");
    const last6Months = getLast6Months();

    // 월별 데이터 합산 (필터 해제 후 전체 데이터 기준)
    const filled = last6Months.map(m => {
      const monthlyItems = data.filter(d => d.month === m);
      const orderSum = monthlyItems.reduce((acc, cur) => acc + (cur.order ?? 0), 0);
      const statusSum = monthlyItems.reduce((acc, cur) => acc + (cur.status ?? 0), 0);
      const region = monthlyItems[0]?.region || '';
      const agName = monthlyItems[0]?.agName || '';
      return { month: m, order: orderSum, status: statusSum, region, agName };
    });

    setFilteredData(filled);
  };

  // 중복 없는 지역 리스트 (필터용)
  const uniqueRegions = [...new Set(allAgenciesWithRegion.map(d => d.region).filter(Boolean))];
  // 중복 없는 대리점 리스트 (필터용)
  const uniqueAgencies = [...new Set(allAgenciesWithRegion.map(d => d.agName).filter(Boolean))];

  // Tooltip payload 타입 정의 (필요 속성만 명시)
  interface PayloadItem {
    dataKey: string;
    value: string | number;
  }

  // Tooltip 컴포넌트 Props 타입 정의
  interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    payload?: PayloadItem[];
    label?: string | number;
  }

  // CustomTooltip 컴포넌트: 활성 상태일 때 데이터 표시
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className={"tooltip"}>
          <p className={"tool_month"}>{label}월</p>
          <p className={"tool_order"}>
            <span>주문</span>
            <span>{payload.find((p) => p.dataKey === "order")?.value ?? 0}</span>
          </p>
          <p className={"tool_status"}>
            <span>출고</span>
            <span>{payload.find((p) => p.dataKey === "status")?.value ?? 0}</span>
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
          {/* 지역 필터 셀렉트 박스 */}
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            aria-label="지역 필터"
          >
            <option value="">지역 전체</option>
            {uniqueRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          {/* 대리점 필터 셀렉트 박스 */}
          <select
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            aria-label="대리점 필터"
          >
            <option value="">대리점 전체</option>
            {uniqueAgencies.map(ag => (
              <option key={ag} value={ag}>{ag}</option>
            ))}
          </select>

          {/* 필터 초기화 버튼 */}
          <button
            className={'main_reset_btn'}
            onClick={resetFilter}
            aria-label="필터 초기화"
          >
            <img src={'/images/icon_reset.svg'} alt="초기화" />
          </button>
        </div>
      </div>

      {/* 그래프 영역 */}
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
