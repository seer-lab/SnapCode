import React from "react";
import "./ExerciseLayout.css";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import CameraActionModal from "../../components/CameraActionModal/BottomModal";
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
  const navigate = useNavigate();
  const { handleTabChange } = useBottomNavigation();

  // Hook to handle camera action
  const { showModal, handleCameraClick, closeModal, navigateToUpload } = useCameraAction(exId);

  // Handle Replace All click
  const handleReplaceAll = () => {
    closeModal(); // Close the modal first
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  // Determine title based on current route
  const getTitle = () => {
    if (location.pathname.includes('/upload')) {
      return "Upload";
    }
    if (location.pathname.includes('/confirmImage')) {
      return "Confirm Image";
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

      {/* Camera action modal */}
      <CameraActionModal isOpen={showModal} onClose={closeModal} title={"Replace all code or insert new?"}>
        <SolidButton onClick={handleReplaceAll}>
          <MdAutorenew size={28} style={{ marginRight: "5px"}} color={"white"}/> 
          Replace All
        </SolidButton>
        <div className="menu-grey-line"></div>
        <OutlineButton>
          <FaPlus size={20} style={{ marginRight: "5px"}} color={"#444ad4"}/>
          Insert New
        </OutlineButton>
      </CameraActionModal>
    </div>
  );
};

export default ExerciseLayout;