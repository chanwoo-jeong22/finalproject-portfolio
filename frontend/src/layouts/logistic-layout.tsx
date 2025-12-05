import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./topbar";
import style from "../styles/logistic/logistic-menubox.module.css";
import LogisticSideBar from "../components/logistic/sidebar";

const LogisticLayout: React.FC = () => {
  return (
    <div className={style.wrap}>
      <LogisticSideBar />
      <div className={style.container}>
        <TopBar />
        <div className={style.lg_main}>
          <div className={style.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticLayout;
