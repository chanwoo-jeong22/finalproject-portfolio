import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import headStyles from "../../../styles/head/head.module.css";

interface PdImgZoomProps {
  imageUrl?: string;
  altText?: string;
  children?: ReactNode;
}

function PdImgZoom({ imageUrl, altText, children }: PdImgZoomProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLSpanElement>(null);

  // 이미지 없을 때 기본이미지
  const placeholderImageUrl =
    "https://via.placeholder.com/200/cccccc/ffffff?text=No+Image";

  useEffect(() => {
    if (isHovered && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 10 + window.scrollX,
      });
    }
  }, [isHovered]);

  const overlay = (
    <div
      className={headStyles.pd_zoom_img}
      style={{
        position: 'fixed',
        top: position.top + 20,
        left: position.left - 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={
          imageUrl
            ? imageUrl.startsWith('http')
              ? imageUrl
              : imageUrl.startsWith('/uploads/')
              ? `http://localhost:8080${imageUrl}`
              : `http://localhost:8080/uploads/product/${imageUrl}`
            : placeholderImageUrl
        }
        alt={`${altText || "제품"} 이미지`}
      />
    </div>
  );

  return (
    <>
      <span
        ref={buttonRef}
        style={{ display: 'inline-block' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </span>

      {isHovered && createPortal(overlay, document.body)}
    </>
  );
}

export default PdImgZoom;
