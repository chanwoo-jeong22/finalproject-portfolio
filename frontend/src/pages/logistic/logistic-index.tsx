import React from "react";
import LogisticNotice from "./logistic-notice"; // 확장자 tsx로 바뀌었을 경우
import styles from "../../styles/logistic/logistic-menubox.module.css";

const LogisticIndex: React.FC = () => {
  return (
    <div className={styles.scroll_y}>
      <LogisticNotice />
    </div>
  );
};

export default LogisticIndex;
