import React, { useState, useEffect } from "react";
import "./ExerciseDashboard.css";
import Tabs from "../../components/Tabs/Tabs";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import CodeTabContent from "../../components/CodeTabContent/CodeTabContent";
import WebsiteView from "../../components/WebsiteView/WebsiteView";
import ExerciseInformation from "../../components/ExerciseInformation/ExerciseInformation";
import { useCodeProcessor } from "../../hooks/useCodeProcessor";
import { getExercise } from "../../utils/exerciseStorage";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";

const ExerciseDashboard = () => {
  const { state } = useLocation();
  const { exId } = useOutletContext();
  const navigate = useNavigate();
  
  // Get current exercise status
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);
  
  // States for handling OCR data
  const [initialCode, setInitialCode] = useState(null);
  const [insertData, setInsertData] = useState(null);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  
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
    if (state?.ocrOutput) {
      const { ocrOutput, insertMode = false, insertPosition = null } = state;
      
      if (insertMode && insertPosition) {
        // Handle insert mode
        console.log("Insert mode detected:", { ocrOutput, insertPosition });
        setInsertData({ ocrOutput, insertPosition });
        setActiveExerciseTab("code");
      } else {
        // Handle regular replace mode
        console.log("Replace mode detected:", ocrOutput);
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

  // Clear insert data after it's been processed
  useEffect(() => {
    if (insertData && codeProcessor.processedHTML.length > 0) {
      setInsertData(null);
    }
  }, [insertData, codeProcessor.processedHTML]);

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