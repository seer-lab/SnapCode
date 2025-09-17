import { useState, useEffect } from "react";
import { saveExercise } from "../utils/exerciseStorage";

export const useCodeTabLogic = (codeProcessor, currentStatus = null, exId = null) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);
  const [inputPopupOpen, setInputPopupOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [purposeOfPopUp, setPurposeOfPopUp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLineContent, setSelectedLineContent] = useState(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  
  // New states for completion protection
  const [confirmEditModal, setConfirmEditModal] = useState(false);
  const [pendingLineIndex, setPendingLineIndex] = useState(null);

  const { processedHTML, updateProcessedHTMLDirectly, validateSingleLine } = codeProcessor;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const proceedWithEdit = (lineNumber) => {
    setSelectedLineIndex(lineNumber);
    setSelectedLineContent(processedHTML[lineNumber]?.[0]);
    setMenuOpen(true);
  };

  const handleLineClick = (lineNumber) => {
    if (operationInProgress) return;
    
    // Check if exercise is completed and block editing
    if (currentStatus === 'Done') {
      setConfirmEditModal(true);
      setPendingLineIndex(lineNumber);
      return;
    }
    
    // Normal flow for non-completed exercises
    proceedWithEdit(lineNumber);
  };

  const handleUnlockAndEdit = () => {
    // Unmark as completed
    if (exId !== null) {
      saveExercise(exId, { 
        manuallyCompleted: false,
        manuallyCompletedAt: null 
      });
    }
    
    // Proceed with editing the originally clicked line
    proceedWithEdit(pendingLineIndex);
    
    // Close modal and reset
    setConfirmEditModal(false);
    setPendingLineIndex(null);
  };

  const handleKeepCompleted = () => {
    setConfirmEditModal(false);
    setPendingLineIndex(null);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setSelectedLineIndex(null);
    setSelectedLineContent(null);
    scrollToTop();
  };

  const closeInputPopup = () => {
    // Remove focus from any active element before closing
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    
    setInputPopupOpen(false);
    setSelectedLineIndex(null);
    setSelectedLineContent(null);
    setInputValue("");
    setPurposeOfPopUp(false);
    scrollToTop();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() && purposeOfPopUp !== "Deleting") {
      return;
    }

    setOperationInProgress(true);
    
    let updatedProcessedHTML = processedHTML.map(line => [line[0], line[1]]);
    
    if (purposeOfPopUp === "Editing") {
      if (selectedLineIndex !== null && selectedLineIndex < updatedProcessedHTML.length) {
        const validatedLine = validateSingleLine(inputValue);
        updatedProcessedHTML[selectedLineIndex] = validatedLine;
      }
    } else if (purposeOfPopUp === "AddingBefore") {
      if (selectedLineIndex !== null) {
        const validatedLine = validateSingleLine(inputValue);
        updatedProcessedHTML.splice(selectedLineIndex, 0, validatedLine);
      }
    } else if (purposeOfPopUp === "AddingAfter") {
      if (selectedLineIndex !== null) {
        const validatedLine = validateSingleLine(inputValue);
        updatedProcessedHTML.splice(selectedLineIndex + 1, 0, validatedLine);
      }
    } else if (purposeOfPopUp === "Deleting") {
      if (selectedLineIndex !== null && selectedLineIndex < updatedProcessedHTML.length) {
        updatedProcessedHTML.splice(selectedLineIndex, 1);
      }
    }

    // Close the input popup immediately
    closeInputPopup();

    // Delay the HTML update to allow the animation to play
    setTimeout(() => {
      try {
        updateProcessedHTMLDirectly(updatedProcessedHTML);
      } catch (error) {
        // Handle error
      }
      
      setOperationInProgress(false);
    }, 150); // Small delay before updating HTML
  };

  const openInputPopup = (purpose) => {
    if (selectedLineIndex !== null && !operationInProgress) {
      setPurposeOfPopUp(purpose);
      if (purpose === "Editing") {
        setInputValue(processedHTML[selectedLineIndex]?.[0] || "");
      } else {
        setInputValue("");
      }
      setInputPopupOpen(true);
    }
  };

  const handleDeleteLine = () => {
    setMenuOpen(false);
    setPurposeOfPopUp("Deleting");
    setInputValue("");
    setInputPopupOpen(true);
  };

  const handleAddLineBefore = () => {
    setMenuOpen(false);
    setPurposeOfPopUp("AddingBefore");
    setInputValue("");
    setInputPopupOpen(true);
  };

  const handleAddLineAfter = () => {
    setMenuOpen(false);
    setPurposeOfPopUp("AddingAfter");
    setInputValue("");
    setInputPopupOpen(true);
  };

  const handleEditLine = () => {
    setMenuOpen(false);
    setPurposeOfPopUp("Editing");
    if (selectedLineIndex !== null && processedHTML[selectedLineIndex]) {
      setInputValue(processedHTML[selectedLineIndex][0]);
    }
    setInputPopupOpen(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && menuOpen) {
      closeMenu();
    }
  };

  // Reset selection when processedHTML changes unexpectedly
  useEffect(() => {
    if (selectedLineIndex !== null && !operationInProgress) {
      const currentContent = processedHTML[selectedLineIndex]?.[0];
      if (currentContent !== selectedLineContent) {
        setSelectedLineIndex(null);
        setSelectedLineContent(null);
        setMenuOpen(false);
      }
    }
  }, [processedHTML, selectedLineIndex, selectedLineContent, operationInProgress]);

  return {
    // State
    selectedLineIndex,
    inputPopupOpen,
    inputValue,
    purposeOfPopUp,
    menuOpen,
    operationInProgress,
    
    // New completion protection states
    confirmEditModal,
    
    // Handlers
    handleLineClick,
    closeMenu,
    closeInputPopup,
    handleInputChange,
    handleInputSubmit,
    handleDeleteLine,
    handleAddLineBefore,
    handleAddLineAfter,
    handleEditLine,
    handleOverlayClick,
    
    // New completion protection handlers
    handleUnlockAndEdit,
    handleKeepCompleted
  };
};