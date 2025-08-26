import React, { useState, useEffect } from "react";
import "../ConfirmImage/ComfirmImage.css"; // Reutilizar los mismos estilos
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useAuthContext } from "../../contexts/authContext";
import SolidButton from "../buttons/Solid/SolidButton";
import OutlineButton from "../buttons/Outline/OutlineButton";

const ConfirmImageInsert = () => {
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentExercise } = useAuthContext();
  
  // Try to get exId from nested route context, fallback to auth context
  let exId;
  try {
    const context = useOutletContext();
    exId = context?.exId || currentExercise;
  } catch {
    exId = currentExercise;
  }

  // Handle case where state is null (when navigating back)
  useEffect(() => {
    if (!state || !state.imageData || !state.insertPosition) {
      // If no state or no imageData or insertPosition, redirect to dashboard
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [state, navigate]);

  // Early return if state is null or doesn't have required data
  if (!state || !state.imageData || !state.imageBuffer || !state.file || !state.insertPosition) {
    return <div>Redirecting...</div>; // Redirect is happening
  }

  const { imageData, imageBuffer, file, insertPosition } = state;

  const getOCROutputAndInsert = async () => {
    setIsLoading(true);
    
    // Convert the image file to a FormData object
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Send the fetch request
      const response = await fetch(`${process.env.REACT_APP_API_URL}/outputocr`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Get OCR output
        const jsonData = await response.json();
        console.log("OCR Output for insertion:", jsonData);
        
        // Clear the insertion position from sessionStorage since we're done with it
        sessionStorage.removeItem('insertPosition');
        
        // Navigate back to the main exercise dashboard with OCR data and insertion position
        navigate(`/exerciseDashboard/${exId}`, { 
          state: { 
            ocrOutput: jsonData,
            insertMode: true,
            insertPosition: insertPosition
          } 
        });
      } else {
        console.error("OCR request failed");
        alert("Failed to process image. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error processing image. Please try again.");
      setIsLoading(false);
    }
  };



  const cancelInsertion = () => {
    // Clear the insertion position and go back to main dashboard
    sessionStorage.removeItem('insertPosition');
    navigate(`/exerciseDashboard/${exId}`, { replace: true });
  };

  return (
    <div className="container">
      <div className="image-wrapper">
        <img src={imageData} alt="Code to Insert" className="main-image" />
      </div>

      <div className="button-container">
        {isLoading && <p className="question-text">Processing and inserting code...</p>}
        
        {!isLoading && (
          <>
            <p className="question-text">
              Insert this code {insertPosition.type} line {insertPosition.lineIndex + 1}?
            </p>
            <div className="button-wrapper">
              <SolidButton onClick={getOCROutputAndInsert} disabled={isLoading}>
                Insert Code
              </SolidButton>

              <OutlineButton onClick={cancelInsertion} disabled={isLoading}>
                Cancel
              </OutlineButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmImageInsert;