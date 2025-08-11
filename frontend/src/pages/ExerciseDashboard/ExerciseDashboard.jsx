import React, { useState } from "react";
import "./ExerciseDashboard.css";
import Tabs from "../../components/Tabs/Tabs";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import CodeTabContent from "../../components/CodeTabContent/CodeTabContent";
import WebsiteView from "../../components/WebsiteView/WebsiteView";
import { exercises } from "../../data/exercises";
import ExerciseInformation from "../../components/ExerciseInformation/ExerciseInformation";
import CodeViewer from "../../components/CodeViewer/CodeViewer";
const ExerciseDashboard = () => {
  const { state } = useLocation();
  const { exId } = useOutletContext(); // Get exId from parent layout
  const navigate = useNavigate();
  
  // Exercise-specific states
  const [activeExerciseTab, setActiveExerciseTab] = useState(() => {
    if (state?.ocrOutput) return "code";
    if (state?.startOnCodeTab) return "code";
    return "exercise";
  });
  const [HTMLCode, setHTMLCode] = useState(false);
  const [ocrOutput, setOCROutput] = useState(state?.ocrOutput);
  const [hasUploadedImage, setHasUploadedImage] = useState(!!state?.ocrOutput);

  // Navigate to nested upload route
  const handleUploadClick = () => {
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  // Render exercise content (tabs: exercise, code, output)
  const renderExerciseContent = () => {
    switch (activeExerciseTab) {
      case "exercise":
        return <ExerciseInformation exId={exId} />
      case "code":
        if (!hasUploadedImage) {
          // If no image uploaded, show message to use camera
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
              <p>Please use the upload button to upload an image first</p>

            </div>
          );
        }
        // Show code viewer when image is uploaded
        if (!ocrOutput || ocrOutput == undefined || ocrOutput == null) {
          return <div>Processing image...</div>;
        } else {
          return (
            <CodeViewer
              ocrOutput={ocrOutput}
              setHTMLCode={setHTMLCode}
            />
          );
        }
      case "output":
        return hasUploadedImage ? <WebsiteView HTMLCode={HTMLCode} /> : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '50vh',
            textAlign: 'center'
          }}>
            <p>Upload an image first to see the output</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Handle exercise tab changes
  const handleExerciseTabChange = (tab) => {
    setActiveExerciseTab(tab);
  };

  return (
    <>
      <Tabs 
        activeTab={activeExerciseTab} 
        onTabChange={handleExerciseTabChange} 
      />
      {renderExerciseContent()}
    </>
  );
};

export default ExerciseDashboard;