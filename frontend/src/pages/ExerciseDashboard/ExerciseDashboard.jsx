import React, { useState } from "react";
import "./ExerciseDashboard.css";
import Tabs from "../../components/Tabs/Tabs";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import CodeTabContent from "../../components/CodeTabContent/CodeTabContent";
import WebsiteView from "../../components/WebsiteView/WebsiteView";
import ExerciseInformation from "../../components/ExerciseInformation/ExerciseInformation";
import { useCodeProcessor } from "../../hooks/useCodeProcessor";


const ExerciseDashboard = () => {
  const { state } = useLocation();
  const { exId } = useOutletContext();
  const navigate = useNavigate();
  
  // Exercise-specific states
  const [activeExerciseTab, setActiveExerciseTab] = useState(() => {
    if (state?.ocrOutput) return "code";
    if (state?.startOnCodeTab) return "code";
    return "exercise";
  });
  const [ocrOutput, setOCROutput] = useState(state?.ocrOutput);
  const [hasUploadedImage, setHasUploadedImage] = useState(!!state?.ocrOutput);
  
  // Use custom hook for code processing
  const codeProcessor = useCodeProcessor(ocrOutput);

  const handleUploadClick = () => {
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  const renderExerciseContent = () => {
    switch (activeExerciseTab) {
      case "exercise":
        return <ExerciseInformation exId={exId} />
      case "code":
        if (!hasUploadedImage) {
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
            codeProcessor={codeProcessor} // Pass entire processor
          />
        );
        
      case "output":
        return hasUploadedImage ? (
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