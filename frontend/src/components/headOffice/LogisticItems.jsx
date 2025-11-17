import headStyles from "./Head_jin.module.css";

function LogisticItems() {
    return (
        <div className={`${headStyles.content} ${headStyles.content_grid3}`}>
            <h1 className={headStyles.title}>물류업체 취급 품목</h1>

            {/*검색영역*/}
            <div className={`${headStyles.select_wrap} ${headStyles.select_bg}`}>
                <div className={headStyles.left_select}>
                    {/*물류업체 선택 시 물류업체 취급 품목 목록에 선택된 물류업체의 취급 품목 리스트가 출력됨*/}
                    <div className={headStyles.section}>
                        <h5>물류업체</h5>
                        <select>
                            <option value="">전체</option>
                            <option value="">물류업체1</option>
                            <option value="">물류업체2</option>
                            <option value="">물류업체3</option>
                            <option value="">물류업체4</option>
                        </select>
                    </div>

                    {/*품번과 제품명은 각 리스트 모두 공통으로 사용
                     : 제품목록에 물류업체 취급품목은 제외되므로 각 리스트에 중복되는 상품이 없으므로 검색 시 상품이 있는 쪽에 리스트 출력 */}
                    <div className={headStyles.section}>
                        <h5>품번</h5>
                        <input type="text" className={`${headStyles.select_input} ${headStyles.input_w150}`}/>
                    </div>

                    <div className={headStyles.section}>
                        <h5>제품명</h5>
                        <input type="text" className={headStyles.select_input}/>
                    </div>
                </div>

                <div className={headStyles.right_select}>
                    <button className={`${headStyles.btn} ${headStyles.search}`}>검색</button>
                    <button className={`${headStyles.btn} ${headStyles.reset}`}>초기화</button>
                </div>
            </div>

            {/*리스트 영역*/}
            <div className={headStyles.column_grid3}>
                {/*전체 제품 리스트(물류업체 취급 품목은 제외)*/}
                <section className={headStyles.sec_grid}>
                    <h1 className={headStyles.s_title}>제품 목록</h1>
                    <div className={headStyles.table_container}>
                        <table className={`${headStyles.table} ${headStyles.table_agPdReg}`}>
                            <thead>
                            <tr>
                                <th className={headStyles.t_check_box}>
                                    <input type="checkbox" id="checkAll"/>
                                    <label htmlFor="checkAll"></label>
                                </th>
                                <th>업체명</th>
                                <th>품번</th>
                                <th>제품명</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className={headStyles.t_check_box}>
                                    <input type="checkbox" id="check"/>
                                    <label htmlFor="check"></label>
                                </td>
                                <td>물류업체 서울</td>
                                <td>S01250918-1001</td>
                                <td>농심 너구리 라면</td>
                            </tr>
                            <tr>
                                <td className={headStyles.t_check_box}>
                                    <input type="checkbox" id="check"/>
                                    <label htmlFor="check"></label>
                                </td>
                                <td>물류업체 부산경남</td>
                                <td>B01250918-1002</td>
                                <td>오뚜기 쇠고기미역국 라면</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    {/*리스트 초기화 버튼*/}
                    <button className={headStyles.list_reset_btn}></button>
                </section>

                {/*본사에 등록된 제품을 취급품목으로 등록/취급품목에서 제외(삭제) 버튼*/}
                <div className={headStyles.middle_btnArea}>
                    <button className={`${headStyles.border_btn} ${headStyles.add_btn}`}>등록</button>
                    <button className={`${headStyles.border_btn} ${headStyles.del_btn}`}>삭제</button>
                </div>

                {/*각 물류업체 취급품목 리스트 : 검색창에서 물류업체 선택 시에 리스트 출력됨*/}
                <section className={headStyles.sec_grid}>
                    <h1 className={headStyles.s_title}>부산경남지역 취급품목 목록</h1>

                    <div className={headStyles.table_container}>
                        <table className={`${headStyles.table} ${headStyles.table_agPdReg}`}>
                            <thead>
                            <tr>
                                <th className={headStyles.t_check_box}>
                                    <input type="checkbox" id="checkAll"/>
                                    <label htmlFor="checkAll"></label>
                                </th>
                                <th>업체명</th>
                                <th>품번</th>
                                <th>제품명</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className={headStyles.t_check_box}>
                                    <input type="checkbox" id="check"/>
                                    <label htmlFor="check"></label>
                                </td>
                                <td>물류업체 서울</td>
                                <td>10020250918-1</td>
                                <td>농심 너구리 라면</td>
                            </tr>
                            <tr>
                                <td className={headStyles.t_check_box}>
                                    <input type="checkbox" id="check"/>
                                    <label htmlFor="check"></label>
                                </td>
                                <td>물류업체 부산경남</td>
                                <td>10020250918-1</td>
                                <td>오뚜기 쇠고기미역국 라면</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    {/*리스트 초기화 버튼*/}
                    <button className={headStyles.list_reset_btn}></button>
                </section>
            </div>
        </div>
    )
}

export default LogisticItems