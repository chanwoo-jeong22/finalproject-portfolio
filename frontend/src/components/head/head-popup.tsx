import popupStyles from '../../styles/head/head-popup.module.css';

interface HeadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function HeadPopup({ isOpen, onClose, children }: HeadPopupProps) {
  if (!isOpen) return null; // 팝업이 닫혀있으면 렌더링 안함

  return (
    // 배경 클릭 시 팝업 닫기 (이벤트 전파 방지 포함)
    <div className={popupStyles.overlay} onClick={onClose}>
      <div
        className={popupStyles.modalContent}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button
          className={popupStyles.closeButton}
          onClick={onClose}
          aria-label="닫기"
          type="button"
        />
        {children}
      </div>
    </div>
  );
}

export default HeadPopup;
