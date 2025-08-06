import React, { useState } from "react";
import "./ExerciseDashboard.css";
import Tabs from "../../components/Tabs/Tabs";
import CodeTabContent from "../../components/CodeTabContent/CodeTabContent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CodeViewer from "../../components/CodeViewer/CodeViewer";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import WebsiteView from "../../components/WebsiteView/WebsiteView";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import { exercises } from "../../data/exercises";
import ExerciseInformation from "../../components/ExerciseInformation/ExerciseInformation";
import { useBottomNavigation } from "../../hooks/useBottomNavigation";

const ExerciseDashboard = () => {
  const { state } = useLocation();
  const { exId } = useParams();
  
  // Exercise-specific states
  const [activeExerciseTab, setActiveExerciseTab] = useState(() => {
    if (state?.ocrOutput) return "code";
    if (state?.startOnCodeTab) return "code"; // Start on code tab when coming from ConfirmImage
    return "exercise";
  });
  const [HTMLCode, setHTMLCode] = useState(false);
  const [showExerciseTabs, setShowExerciseTabs] = useState(true);
  const [topNavbarTitle, setTopNavbarTitle] = useState(exercises[exId].title);
  const [ocrOutput, setOCROutput] = useState(state?.ocrOutput);
  
  // Bottom navigation
  const { handleTabChange } = useBottomNavigation();

  // Render exercise content (tabs: exercise, code, output)
  const renderExerciseContent = () => {
    switch (activeExerciseTab) {
      case "exercise":
        return <ExerciseInformation exId={exId} />
      case "code":
        if (!ocrOutput || ocrOutput == undefined || ocrOutput == null) {
          return <CodeTabContent />;
        } else {
          return (
            <CodeViewer
              ocrOutput={ocrOutput}
              setShowTabs={setShowExerciseTabs}
              setTopNavbarTitle={setTopNavbarTitle}
              setHTMLCode={setHTMLCode}
            />
          );
        }
      case "output":
        return <WebsiteView HTMLCode={HTMLCode} />;
      default:
        return null;
    }
  };

  // Handle exercise tab changes
  const handleExerciseTabChange = (tab) => {
    setActiveExerciseTab(tab);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <TopNavbar 
        title={topNavbarTitle} 
        // Uses navigate(-1) by default - goes back to previous page
      />
      
      {showExerciseTabs && (
        <Tabs 
          activeTab={activeExerciseTab} 
          onTabChange={handleExerciseTabChange} 
        />
      )}
      
      <div className="content-container">
        {renderExerciseContent()}
      </div>
      
      <BottomNavbar 
        handleChange={handleTabChange}
        selectedValue="home" // Always "home" since exercises are part of home
      />
    </div>
  );
};

export default ExerciseDashboard;