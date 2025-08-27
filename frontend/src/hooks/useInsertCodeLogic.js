import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const useInsertCodeLogic = (codeProcessor) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { exId } = useParams();

  const { processedHTML } = codeProcessor;

  const handleLineClick = (lineNumber) => {
    setSelectedLineIndex(lineNumber);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLineIndex(null);
  };

  const handleInsertBefore = () => {
    // Store the insertion position in sessionStorage for the upload page
    sessionStorage.setItem('insertPosition', JSON.stringify({
      type: 'before',
      lineIndex: selectedLineIndex,
      exId: exId
    }));
    
    closeModal();
    // Navigate to a specific upload route for insertion
    navigate(`/exerciseDashboard/${exId}/uploadInsert`);
  };

  const handleInsertAfter = () => {
    // Store the insertion position in sessionStorage for the upload page
    sessionStorage.setItem('insertPosition', JSON.stringify({
      type: 'after',
      lineIndex: selectedLineIndex,
      exId: exId
    }));
    
    closeModal();
    // Navigate to a specific upload route for insertion
    navigate(`/exerciseDashboard/${exId}/uploadInsert`);
  };

  return {
    selectedLineIndex,
    modalOpen,
    handleLineClick,
    closeModal,
    handleInsertBefore,
    handleInsertAfter
  };
};