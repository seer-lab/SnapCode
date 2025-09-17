import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveExercise, getExercise, hasExerciseCode, saveExerciseCode } from "../utils/exerciseStorage";
import { useExerciseStatus } from "./useExerciseStatus";

/**
 * Hook to manage camera action behavior
 * Shows modal if code exists in localStorage, navigates to upload if not
 * Also protects completed exercises from accidental modification
 * @param {string} exId - Exercise ID
 * @returns {Object} Functions and state to handle camera actions
 */
export const useCameraAction = (exId) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);

  /**
   * Check if there's existing code for the current exercise
   * @returns {boolean} True if code exists
   */
  const hasExistingCode = () => {
    // Check if we're currently in the exercise dashboard (not upload pages)
    const currentPath = window.location.pathname;
    const isInDashboard = currentPath.includes(`/exerciseDashboard/${exId}`) && 
                         !currentPath.includes('/upload') && 
                         !currentPath.includes('/confirmImage') &&
                         !currentPath.includes('/insertCode');
    
    if (!isInDashboard) {
      return false;
    }

    // Check localStorage for existing code
    return hasExerciseCode(exId);
  };

  /**
   * Handle camera button click
   * Checks completion status first, then shows appropriate modal
   */
  const handleCameraClick = () => {
    // If exercise is completed, show completion protection modal
    if (currentStatus === 'Done') {
      setShowCompletionModal(true);
      return;
    }

    // Normal flow for non-completed exercises
    if (hasExistingCode()) {
      setShowModal(true);
    } else {
      navigate(`/exerciseDashboard/${exId}/upload`);
    }
  };

  /**
   * Handle proceeding with camera action after completion confirmation
   */
  const handleProceedWithAction = () => {
    // First unmark as completed
    saveExercise(exId, {
      manuallyCompleted: false,
      manuallyCompletedAt: null
    });

    setShowCompletionModal(false);

    // Then proceed with normal camera action flow
    if (hasExistingCode()) {
      setShowModal(true);
    } else {
      navigate(`/exerciseDashboard/${exId}/upload`);
    }
  };

  /**
   * Handle keeping exercise as completed
   */
  const handleKeepCompleted = () => {
    setShowCompletionModal(false);
    setPendingAction(null);
  };

  /**
   * Close the regular modal
   */
  const closeModal = () => {
    setShowModal(false);
  };

  /**
   * Navigate to upload page (for use in modal actions)
   * This will replace all existing code
   */
  const navigateToUpload = () => {
    setShowModal(false);
    // Clear any existing data before navigating to upload
    console.log("Clearing existing code for replace all");
    
    // Optional: Clear existing code from localStorage to ensure clean replacement
    // Uncomment the next line if you want to clear storage immediately
    // saveExerciseCode(exId, null, [], false);
    
    navigate(`/exerciseDashboard/${exId}/upload`);
  };

  /**
   * Navigate to insert code page
   */
  const navigateToInsert = () => {
    setShowModal(false);
    navigate(`/exerciseDashboard/${exId}/insertCode`);
  };

  return {
    showModal,
    showCompletionModal,
    currentStatus,
    handleCameraClick,
    closeModal,
    navigateToUpload,
    navigateToInsert,
    handleProceedWithAction,
    handleKeepCompleted,
    hasExistingCode: hasExistingCode()
  };
};