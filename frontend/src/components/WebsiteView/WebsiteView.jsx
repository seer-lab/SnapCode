import React, { useMemo, useRef, useEffect } from "react";
import "./WebsiteView.css";
import DOMPurify from "dompurify";
import { MdError } from "react-icons/md";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";
import { saveExercise } from "../../utils/exerciseStorage";
import { useOutletContext } from "react-router-dom";
import Switch from "../Switch/Switch";

const WebsiteView = ({ HTMLCode }) => {
  const iframeRef = useRef(null);
  const { exId } = useOutletContext();
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);

  const sanitizedHTML = useMemo(() => {
    return HTMLCode ? DOMPurify.sanitize(HTMLCode, { USE_PROFILES: { html: true } }) : null;
  }, [HTMLCode]);

useEffect(() => {
  if (iframeRef.current && sanitizedHTML) {
    const iframeDoc = iframeRef.current.contentDocument;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 8px; /* Keep default margin */
            
          }
        </style>
      </head>
      <body>
        ${sanitizedHTML}
      </body>
      </html>
    `);
    iframeDoc.close();
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

  const showCompletionControls = currentStatus !== 'Draft' && currentStatus !== 'Invalid';
  
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