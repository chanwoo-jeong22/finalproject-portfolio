import Header from "../../layouts/header.js";
import HeadMenu from "../../components/head/head-menu.jsx";
import Router from "../../components/head/router/index.jsx";
import layoutStyles from "../../styles/layout.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useState } from "react";
import { useSelector } from "react-redux";
import {RootState} from "../../redux/store";

function HeadIndex() {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token)
  const hdId = useSelector((state: RootState) => state.auth.hdId)

  // 새로고침 시 hdId가 아직 없으면 localStorage에서 가져오기
  const [currentHdId, setCurrentHdId] = useState(hdId || localStorage.getItem("hdId"));

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      // hdId 상태가 없으면 localStorage에서 가져오기
      if (!currentHdId) {
        const storedHdId = localStorage.getItem("hdId");
        if (storedHdId) setCurrentHdId(storedHdId);
      }
      console.log("로그인 상태임", "userId : ", currentHdId);
    }
  }, [token, hdId, currentHdId]);

  return (
    <div className={layoutStyles.wrap}>
      <Header />
      <div className={layoutStyles.container}>
        <HeadMenu />
        <main>
          <Router />
        </main>
      </div>
    </div>
  );
}

export default HeadIndex;