import React, { useState, useEffect, useRef } from "react";
import "./ExerciseDashboard.css";
import Tabs from "../../components/Tabs/Tabs";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import CodeTabContent from "../../components/CodeTabContent/CodeTabContent";
import WebsiteView from "../../components/WebsiteView/WebsiteView";
import ExerciseInformation from "../../components/ExerciseInformation/ExerciseInformation";
import { useCodeProcessor } from "../../hooks/useCodeProcessor";
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
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  
  // Track if upload has been logged to prevent duplicate logs
  const hasLoggedUpload = useRef(false);
  
  // Exercise-specific states
  const [activeExerciseTab, setActiveExerciseTab] = useState(() => {
    if (state?.ocrOutput) return "code";
    if (state?.startOnCodeTab) return "code";
    
    // Check if there's existing code in localStorage
    const savedExercise = getExercise(exId);
    if (savedExercise && savedExercise.rawCode) {
      return "code";
    }
    
    return "exercise";
  });

  // Handle incoming state from OCR operations
  useEffect(() => {
    if (state?.ocrOutput && !hasLoggedUpload.current) {
      const { ocrOutput, insertMode = false, insertPosition = null } = state;
      
      if (insertMode && insertPosition) {
        // Handle insert mode - add code at specific position
        setInsertData({ ocrOutput, insertPosition });
        setActiveExerciseTab("code");
      } else {
        // Handle regular replace mode - replace all code
        setInitialCode(ocrOutput);
        setActiveExerciseTab("code");
      }
      
      setHasUploadedImage(true);
      
      // Clear the location state to prevent re-processing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  // Use custom hook for code processing with insert data
  const codeProcessor = useCodeProcessor(initialCode, exId, insertData);

  // Log uploads and insertions to Firebase after code is processed
  useEffect(() => {
    if (
      analyticsReady && // Wait for analytics to be ready
      exId &&
      codeProcessor.processedHTML?.length > 0 && 
      !hasLoggedUpload.current &&
      (initialCode || insertData)
    ) {
      
      // Mark as logged immediately to prevent duplicate executions
      hasLoggedUpload.current = true;
      
      console.log('Logging code change to Firebase...');
      
      const currentErrors = codeProcessor.htmlHintErrors || {};
      const afterErrors = getAllErrorsFrom(currentErrors);

      if (insertData) {
        // Log code insertion at specific position
        logCodeChanged(exId, 'code_inserted', {
          lineIndex: insertData.insertPosition.lineIndex,
          insertPosition: insertData.insertPosition,
          insertedLines: insertData.ocrOutput
        }, codeProcessor.processedHTML, [], afterErrors);
      } else if (initialCode) {
        // Log full code replacement/upload
        logCodeChanged(exId, 'code_uploaded', {
          lineIndex: 0,
          sourceType: 'ocr'
        }, codeProcessor.processedHTML, [], afterErrors);
      }
    }
  }, [
    analyticsReady, // Changed from userId and readableUserId
    exId, 
    codeProcessor.isLoading,
    initialCode, 
    insertData, 
    logCodeChanged,
    codeProcessor.processedHTML,
    codeProcessor.htmlHintErrors
  ]);

  // Clear insert data after it's been processed
  useEffect(() => {
    if (insertData && codeProcessor.processedHTML.length > 0) {
      // Wait a bit before clearing to allow logging to complete
      setTimeout(() => {
        setInsertData(null);
      }, 500);
    }
  }, [insertData, codeProcessor.processedHTML]);

  // Reset flag when exercise changes
  useEffect(() => {
    hasLoggedUpload.current = false;
  }, [exId]);

  const handleUploadClick = () => {
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  const renderExerciseContent = () => {
    switch (activeExerciseTab) {
      case "exercise":
        return <ExerciseInformation exId={exId} />
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
            currentStatus={currentStatus}
            exId={exId}
          />
        );
        
      case "output":
        return (hasUploadedImage || codeProcessor.rawCode) ? (
          <WebsiteView HTMLCode={codeProcessor.finalHTMLOutput} />
        ) : (
          <div>Upload an image first to see the output</div>
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