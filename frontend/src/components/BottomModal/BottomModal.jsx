import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "./BottomModal.css";

const BottomModal = forwardRef(({ isOpen, onClose, children, title }, ref) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) setClosing(false);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); 
  };

  // Expose handleClose to parent component
  useImperativeHandle(ref, () => ({
    handleClose
  }));

  if (!isOpen && !closing) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="camera-action-modal-overlay"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div
        className="camera-action-modal-popup"
        style={{
          zIndex: 10000,
          animation: closing
            ? "slideDownToBottom 0.3s ease-out forwards"
            : "slideUpFromBottom 0.3s ease-out forwards",
        }}
      >
        <div className="camera-action-modal-header">
          <h4 className="camera-action-modal-title">{title}</h4>
          <span onClick={handleClose} className="camera-action-modal-close-btn">
            &times;
          </span>
        </div>
        <div className="camera-action-modal-content">{children}</div>
      </div>
    </div>
  );
});

BottomModal.displayName = 'BottomModal';

export default BottomModal;