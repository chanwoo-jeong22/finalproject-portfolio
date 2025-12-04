import React from "react";
import LogisticNotice from "./logistic-notice";
import styles from "../../styles/logistic/logistic-menubox.module.css";

const LogisticIndex: React.FC = () => {
  return (
    <div className={styles.scroll_y}>
      <LogisticNotice />
    </div>
  );
};

export default LogisticIndex;
