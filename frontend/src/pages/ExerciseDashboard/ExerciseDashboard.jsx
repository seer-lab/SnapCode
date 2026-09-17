import React, { useState, useEffect, useRef } from "react";
import "./ExerciseDashboard.css";
import Tabs from "../../components/Tabs/Tabs";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import CodeTabContent from "../../components/CodeTabContent/CodeTabContent";
import WebsiteView from "../../components/WebsiteView/WebsiteView";
import ExerciseInformation from "../../components/ExerciseInformation/ExerciseInformation";
import { useCodeProcessor } from "../../hooks/useCodeProcessor";
import { useCSSCodeProcessor } from "../../hooks/useCSSCodeProcessor";
import { getExercise } from "../../utils/exerciseStorage";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";
import { useUserAnalytics } from "../../hooks/useUserAnalytics";
import { getAllErrorsFrom } from "../../utils/analytics/errorComparison";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "../../config/firebase";

const ExerciseDashboard = () => {
  const { state } = useLocation();
  const { exId } = useOutletContext();
  const navigate = useNavigate();

  // Get current exercise status
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);
  
  // Analytics setup - get current user ID from Firebase Auth
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  const { logCodeChanged, isReady: analyticsReady } = useUserAnalytics(userId);
  
  // States for handling OCR data
  const [initialCode, setInitialCode] = useState(null);
  const [insertData, setInsertData] = useState(null);

  const [initialCSS, setInitialCSS] = useState(null);
  const [insertCSSData, setInsertCSSData] = useState(null);

  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  
  // Track if upload has been logged to prevent duplicate logs
  const hasLoggedUpload = useRef(false);
  
  // Exercise-specific states
  const [activeExerciseTab, setActiveExerciseTab] = useState(() => {
    if (state?.ocrOutput) return "code";
    if (state?.startOnCodeTab) return "code";
    
    // Check if there's existing code in localStorage
    const savedExercise = getExercise(exId);
    if (savedExercise && (savedExercise.rawCode || savedExercise.rawCSS)) {
      return "code";
    }
    
    return "exercise";
  });

  // Handle incoming state from OCR operations
  useEffect(() => {
    if (state?.ocrOutput && !hasLoggedUpload.current) {
      const { ocrOutput, insertMode = false, insertPosition = null, codeType = 'html' } = state;

      if (codeType === 'css') {
        if (insertMode && insertPosition) {
          setInsertCSSData({ ocrOutput, insertPosition });
        } else {
          setInitialCSS(ocrOutput);
        }
      } else {
        if (insertMode && insertPosition) {
          setInsertData({ ocrOutput, insertPosition });
        } else {
          setInitialCode(ocrOutput);
        }
      }
      
      setActiveExerciseTab("code");
      setHasUploadedImage(true);
      
      // Clear the location state to prevent re-processing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  // Use custom hooks for code processing
  const codeProcessor = useCodeProcessor(initialCode, exId, insertData);
  const cssProcessor = useCSSCodeProcessor(initialCSS, exId, insertCSSData);

  // Log HTML uploads and insertions to Firebase
  useEffect(() => {
    if (
      analyticsReady &&
      exId &&
      codeProcessor.processedHTML?.length > 0 && 
      !hasLoggedUpload.current &&
      (initialCode || insertData)
    ) {
      hasLoggedUpload.current = true;
      
      const currentErrors = codeProcessor.cssErrors || {};
      const afterErrors = getAllErrorsFrom(currentErrors);

      if (insertData) {
        logCodeChanged(exId, 'code_inserted', {
          lineIndex: insertData.insertPosition.lineIndex,
          insertPosition: insertData.insertPosition,
          insertedLines: insertData.ocrOutput
        }, codeProcessor.processedHTML, [], afterErrors);
      } else if (initialCode) {
        logCodeChanged(exId, 'code_uploaded', {
          lineIndex: 0,
          sourceType: 'ocr'
        }, codeProcessor.processedHTML, [], afterErrors);
      }
    }
  }, [
    analyticsReady,
    exId, 
    codeProcessor.isLoading,
    initialCode, 
    insertData, 
    logCodeChanged,
    codeProcessor.processedHTML,
    codeProcessor.htmlHintErrors
  ]);

  // Log CSS uploads and insertions to Firebase
  const hasLoggedCSSUpload = useRef(false);
  useEffect(() => {
    if (
      analyticsReady &&
      exId &&
      cssProcessor.processedCSS?.length > 0 &&
      !hasLoggedCSSUpload.current
    ) {
      hasLoggedCSSUpload.current = true;

      const currentErrors = cssProcessor.cssErrors || {};
      const afterErrors = getAllErrorsFrom(currentErrors);

      if (insertCSSData) {
        logCodeChanged(exId, 'css_inserted', {
          lineIndex: insertCSSData.insertPosition.lineIndex,
          insertPosition: insertCSSData.insertPosition,
          insertedLines: insertCSSData.ocrOutput
        }, cssProcessor.processedCSS, [], afterErrors);
      } else if (initialCSS) {
        logCodeChanged(exId, 'css_uploaded', {
          lineIndex: 0,
          sourceType: 'ocr'
        }, cssProcessor.processedCSS, [], afterErrors);
      }
    }
  }, [
    analyticsReady,
    exId,
    cssProcessor.isLoading,
    initialCSS,
    insertCSSData,
    logCodeChanged,
    cssProcessor.processedCSS,
    cssProcessor.cssHintErrors
  ]);

  // Clear insert data after processing
  useEffect(() => {
    if (insertData && codeProcessor.processedHTML.length > 0) {
      setTimeout(() => setInsertData(null), 500);
    }
  }, [insertData, codeProcessor.processedHTML]);

  useEffect(() => {
    if (insertCSSData && cssProcessor.processedCSS.length > 0) { 
      setTimeout(() => setInsertCSSData(null), 500);
    }
  }, [insertCSSData, cssProcessor.processedCSS]);

  // Reset flag when exercise changes
  useEffect(() => {
    hasLoggedUpload.current = false;
    hasLoggedCSSUpload.current = false;
  }, [exId]);

  const handleUploadClick = () => {
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  const renderExerciseContent = () => {
    switch (activeExerciseTab) {
      case "exercise":
        return <ExerciseInformation exId={exId} />;

      case "code":
        if (!hasUploadedImage && !codeProcessor.rawCode) {
          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '50vh',
              textAlign: 'center',
              gap: '20px'
            }}>
              <p>Please use the upload button first</p>
            </div>
          );
        }
        
        if (!codeProcessor.rawCode) {
          return <div>Processing image...</div>;
        }
        
        return (
          <CodeTabContent
            codeProcessor={codeProcessor}
            cssProcessor={cssProcessor}
            currentStatus={currentStatus}
            exId={exId}
          />
        );

      case "output":
        return hasUploadedImage || codeProcessor.rawCode ? (
          <WebsiteView HTMLCode={codeProcessor.finalHTMLOutput} />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            Upload an image first to see the output
          </div>
        );

      default:
        return null;
    }
  };

  const handleExerciseTabChange = (tab) => {
    setActiveExerciseTab(tab);
  };

  return (
    <div className="exercise-dashboard-container">
      <div className="exercise-dashboard-header">
        <Tabs 
          activeTab={activeExerciseTab} 
          onTabChange={handleExerciseTabChange} 
        />
      </div>
      <div className="exercise-dashboard-content">
        {renderExerciseContent()}
      </div>
    </div>
  );
};

export default ExerciseDashboard;