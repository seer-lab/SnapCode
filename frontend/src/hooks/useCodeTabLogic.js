import { useState, useEffect } from "react";

export const useCodeTabLogic = (codeProcessor) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);
  const [inputPopupOpen, setInputPopupOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [purposeOfPopUp, setPurposeOfPopUp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLineContent, setSelectedLineContent] = useState(null);
  const [operationInProgress, setOperationInProgress] = useState(false);

  const { processedHTML, updateProcessedHTMLDirectly, validateSingleLine } = codeProcessor;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLineClick = (lineNumber) => {
    if (operationInProgress) return;
    
    setSelectedLineIndex(lineNumber);
    setSelectedLineContent(processedHTML[lineNumber]?.[0]);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setSelectedLineIndex(null);
    setSelectedLineContent(null);
    scrollToTop();
  };

  const closeInputPopup = () => {
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

    closeInputPopup();
    updateProcessedHTMLDirectly(updatedProcessedHTML);
    setOperationInProgress(false);
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
    handleOverlayClick
  };
};