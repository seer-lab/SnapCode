import React, { useMemo, useRef, useEffect,useState } from "react";
import "./WebsiteView.css";
import DOMPurify from "dompurify";
import { MdError } from "react-icons/md";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";
import { saveExercise } from "../../utils/exerciseStorage";
import { useOutletContext } from "react-router-dom";
import Switch from "../Switch/Switch";
import PageSpinner from "../../pages/PageSpinner/PageSpinner";
import { initializeIframeSync, IFRAME_CONFIG } from "../../utils/iframeUtils";

const WebsiteView = ({ HTMLCode }) => {
  const iframeRef = useRef(null);
  const { exId } = useOutletContext();
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);

  const sanitizedHTML = useMemo(() => {
    if (!HTMLCode) return null;
    const result = DOMPurify.sanitize(HTMLCode, { USE_PROFILES: { html: true } });
    console.log('Original HTML:', HTMLCode);
    console.log('Sanitized HTML:', result);
    return result;
  }, [HTMLCode]);

  useEffect(() => {
    if (iframeRef.current && sanitizedHTML) {
      // Configure link behavior
      const linkOptions = {
        openInNewTab: false,
        smoothScroll: IFRAME_CONFIG.linkHandling.smoothScroll
      };
      
      initializeIframeSync(iframeRef.current, sanitizedHTML, linkOptions);
    }
  }, [sanitizedHTML]);

  if (!HTMLCode) {
    return (
      <div className="error-row" style={{ padding: "5px", fontSize: "1rem" }}>
        <MdError color="#F44336" size={20} className="menu-icon" />
        <div className="menu-text">Fix all errors in code tab first.</div>
      </div>
    );
  }

  const handleSwitchToggle = (isChecked) => {
    if (isChecked) {
      saveExercise(exId, {
        manuallyCompleted: true,
        manuallyCompletedAt: new Date().toISOString()
      });
    } else {
      saveExercise(exId, {
        manuallyCompleted: false,
        manuallyCompletedAt: null
      });
    }
  };

  const showCompletionControls = true;
  
  return (
    <div className="website-view-container">
      <iframe 
        ref={iframeRef}
        className="html-output-iframe"
        title="HTML Preview"
      />
      
      {showCompletionControls && (
        <>
          <div className="completion-divider"></div>
          <div className="completion-containers">
            <div className="completion-label">
              Mark exercise as completed?
            </div>
            <Switch
              checked={currentStatus === 'Done'}
              onChange={handleSwitchToggle}
              aria-labelledby="completion-label"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default WebsiteView;