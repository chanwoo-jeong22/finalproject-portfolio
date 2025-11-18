import Header from "../Layout/Header.tsx";
import HeadMenu from "./HeadMenu.jsx";
import Router from "./Router.jsx";
import layoutStyles from "../layout/layout.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useState } from "react";

// AuthContext
import { AuthContext } from "../../context/AuthContext.tsx";

function HeadIndex() {
  const navigate = useNavigate();
  const { token, hdId } = useContext(AuthContext);

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
  }, [token, hdId, currentHdId, navigate]);

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