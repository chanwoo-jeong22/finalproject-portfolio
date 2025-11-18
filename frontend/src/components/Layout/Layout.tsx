import React from "react";
import type { JSX } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import styles from "../Agency/Orders.module.css";

// Layout 컴포넌트
export default function Layout(): JSX.Element {
    const location = useLocation();

    // 현재 경로와 비교해서 메뉴 활성화 클래스 반환
    const getActive = (path: string): string =>
        location.pathname === path ? styles.activeMenu : "";

    return (
        <div className={styles.wrapper}>
            {/* ===== 왼쪽 사이드바 ===== */}
            <div className={styles.sidebar}>
                {/* 로고 영역 */}
                <div className={styles.logo}>LO123GO</div>

                {/* 메뉴 목록 */}
                <div className={styles.menuContainer}>
                    {/* 주문 등록 메뉴 */}
                    <Link
                        to="/order-registration"
                        className={`${styles.menuItem} ${getActive("/order-registration")}`}
                    >
                        주문 등록
                        <span className={styles.menuDot}></span>
                    </Link>

                    {/* 주문 현황 메뉴 */}
                    <Link
                        to="/order-status"
                        className={`${styles.menuItem} ${getActive("/order-status")}`}
                    >
                        주문 현황
                        <span className={styles.menuDot}></span>
                    </Link>

                    {/* 재고 관리 메뉴 */}
                    <Link
                        to="/inventory-management"
                        className={`${styles.menuItem} ${getActive("/inventory-management")}`}
                    >
                        재고 관리
                        <span className={styles.menuDot}></span>
                    </Link>
                </div>
            </div>

            {/* ===== 오른쪽 메인 영역 ===== */}
            <div className={styles.main}>
                {/* 상단바 */}
                <div className={styles.topbar}>
                    <div className={styles.topbarName}>
                        <img src="https://via.placeholder.com/50" alt="프로필" />
                        <span>정찬우</span>
                    </div>

                    <span className={styles.topbarText}>팀장</span>
                    <span className={styles.topbarText}>2025-09-16</span>
                </div>

                {/* 본문 영역: 라우트에 따른 컴포넌트가 여기에 출력됨 */}
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
