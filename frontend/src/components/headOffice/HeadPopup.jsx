import popupStyles from './HeadPopup.module.css';
import React from "react";


function HeadPopup({isOpen, onClose, children}) {
    if (!isOpen) return null; // 팝업이 닫혀있으면 아무것도 렌더링 안 함

    return (
        // 배경 클릭 시 팝업 닫기 (이벤트 전파 방지 포함)
        <div className={popupStyles.overlay} onClick={onClose}>
            <div className={popupStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={popupStyles.closeButton} onClick={onClose}></button>
                {/* 모든 내용은 children으로 받아서 뿌려줌! */}
                {children}
            </div>
        </div>
    );
}

export default HeadPopup