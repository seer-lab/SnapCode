import "./ExerciseLayout.css";
import { Outlet, useParams, useLocation, Navigate } from "react-router-dom";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import CameraActionModal from "../../components/BottomModal/BottomModal";
import { exercises } from "../../data/exercises";
import { useBottomNavigation } from "../../hooks/useBottomNavigation";
import { useCameraAction } from "../../hooks/useCameraAction";
import SolidButton from "../../components/buttons/Solid/SolidButton";
import OutlineButton from "../../components/buttons/Outline/OutlineButton";
import { FaPlus } from "react-icons/fa";
import { MdAutorenew } from "react-icons/md";

const ExerciseLayout = () => {
  const { exId } = useParams();
  const location = useLocation();
  const { handleTabChange } = useBottomNavigation();

  // Hook to handle camera action with completion protection
  const { 
    showModal, 
    showCompletionModal,
    currentStatus,
    handleCameraClick, 
    closeModal, 
    navigateToUpload,
    navigateToInsert,
    handleKeepCompleted
  } = useCameraAction(exId);

  // Validate if exercise exists
  const exerciseExists = exercises && exercises[exId];
  
  // If exercise doesn't exist, redirect to 404
  if (!exerciseExists) {
    return <Navigate to="/404" replace />;
  }

  // Handle Replace All click
  const handleReplaceAll = () => {
    closeModal(); // Close the modal first
    // Use the navigateToUpload function which handles clearing existing data
    navigateToUpload();
  };

  // Handle Insert New click - navigate to the insert code page
  const handleInsertNew = () => {
    closeModal(); // Close the modal first
    navigateToInsert();
  };

  // Determine title based on current route
  const getTitle = () => {
    if (location.pathname.includes('/upload')) {
      return "Upload";
    }
    if (location.pathname.includes('/confirmImage')) {
      return "Confirm Image";
    }
    if (location.pathname.includes('/insertCode')) {
      return "Insert Code";
    }
    if (location.pathname.includes('/uploadInsert')) {
      return "Upload for Insert";
    }
    if (location.pathname.includes('/confirmImageInsert')) {
      return "Confirm Insert";
    }
    return exercises[exId]?.title || "Exercise";
  };

  return (
    <div className="exercise-layout">
      <TopNavbar 
        title={getTitle()} 
        // Uses navigate(-1) by default - goes back to previous page
      />
      
      {/* This will render the child routes */}
      <div className="exercise-content">
        <Outlet context={{ exId }} />
      </div>
      
      <BottomNavbar 
        handleChange={handleTabChange}
        selectedValue="home"
        onCameraClick={handleCameraClick}
      />

      {/* Completion protection modal - ONLY SWITCH */}
      <CameraActionModal 
        isOpen={showCompletionModal} 
        onClose={handleKeepCompleted} 
        title="Exercise is Completed"
      >
        <div className="camera-action-modal-content">
          <div style={{ 
            textAlign: 'center', 
            color: '#555',
            fontSize: '1.2rem',
            fontFamily:"monospace"
          }}>
            This exercise is already marked as completed. If you want to replace or add more code, you can switch it back to incomplete at the output page.
          </div>
        </div>
      </CameraActionModal>

      {/* Regular camera action modal */}
      <CameraActionModal 
        isOpen={showModal} 
        onClose={closeModal} 
        title="Replace all code or insert new?"
      >
        <SolidButton onClick={handleReplaceAll}>
          <MdAutorenew size={28} style={{ marginRight: "5px"}} color={"white"}/> 
          Replace All
        </SolidButton>
        <div className="menu-grey-line"></div>
        <OutlineButton onClick={handleInsertNew}>
          <FaPlus size={20} style={{ marginRight: "5px"}} color={"#444ad4"}/>
          Insert New
        </OutlineButton>
      </CameraActionModal>
    </div>
  );
};

export default ExerciseLayout;