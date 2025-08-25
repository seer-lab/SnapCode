import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveExercise,getExercise,hasExerciseCode,saveExerciseCode } from "../utils/exerciseStorage";

/**
 * Hook to manage camera action behavior
 * Shows modal if code exists in localStorage, navigates to upload if not
 * @param {string} exId - Exercise ID
 * @returns {Object} Functions and state to handle camera actions
 */
export const useCameraAction = (exId) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  /**
   * Check if there's existing code for the current exercise
   * @returns {boolean} True if code exists
   */
  const hasExistingCode = () => {
    // Check if we're currently in the exercise dashboard (not upload pages)
    const currentPath = window.location.pathname;
    const isInDashboard = currentPath.includes(`/exerciseDashboard/${exId}`) && 
                         !currentPath.includes('/upload') && 
                         !currentPath.includes('/confirmImage');
    
    if (!isInDashboard) {
      return false;
    }

    // Check localStorage for existing code
    return hasExerciseCode(exId);
  };

  /**
   * Handle camera button click
   * Shows modal if code exists, navigates to upload otherwise
   */
  const handleCameraClick = () => {
    if (hasExistingCode()) {
      setShowModal(true);
    } else {
      navigate(`/exerciseDashboard/${exId}/upload`);
    }
  };

  /**
   * Close the modal
   */
  const closeModal = () => {
    setShowModal(false);
  };

  /**
   * Navigate to upload page (for use in modal actions)
   */
  const navigateToUpload = () => {
    setShowModal(false);
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  return {
    showModal,
    handleCameraClick,
    closeModal,
    navigateToUpload,
    hasExistingCode: hasExistingCode()
  };
};