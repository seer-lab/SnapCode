import React, { useState, useEffect } from "react";
import "./ComfirmImage.css";

import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useAuthContext } from "../../contexts/authContext";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";
import { saveExercise } from "../../utils/exerciseStorage";
import SolidButton from "../buttons/Solid/SolidButton";
import OutlineButton from "../buttons/Outline/OutlineButton";

const ComfirmImage = () => {
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

  // Get current exercise status
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);

  // Dynamic message based on exercise status
  const getConfirmationMessage = () => {
    if (currentStatus === 'Done') {
      return "⚠️ This will replace ALL your code and reset progress. Continue?";
    }
    return "Upload the above code?";
  };

  // Handle case where state is null (when navigating back)
  useEffect(() => {
    if (!state || !state.imageData) {
      // If no state or no imageData, redirect to dashboard (exercise list)
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [state, navigate]);

  // Early return if state is null or doesn't have required data
  if (!state || !state.imageData || !state.imageBuffer || !state.file) {
    return <div>Redirecting...</div>; // Redirect is happening
  }

  const { imageData, imageBuffer, file } = state;

  const getOCROutput = async () => {
    setIsLoading(true);
    
    // If exercise is completed, unmark it before processing new code
    if (currentStatus === 'Done') {
      saveExercise(exId, { 
        manuallyCompleted: false,
        manuallyCompletedAt: null 
      });
    }
    
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
        // Assuming the backend responds with text, you can read it as follows
        const jsonData = await response.json();
        console.log("OCR Output:", jsonData);
        
        // Navigate back to the main exercise dashboard with OCR data
        navigate(`/exerciseDashboard/${exId}`, { state: { ocrOutput: jsonData } });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setIsLoading(false);
    }
  };

  const goBackToUpload = () => {
    // Navigate back to nested upload route
    navigate(`/exerciseDashboard/${exId}`, { replace: true });
  };

  return (
    <>
      <div className="container">
        <div className="image-wrapper">
          <img src={imageData} alt="Your Image" className="main-image" />
        </div>

        <div className="button-container">
          {isLoading ? "fetching ocr output" : ""}
          <p className="question-text">{getConfirmationMessage()}</p>
          <div className="button-wrapper">
            <SolidButton onClick={getOCROutput} disabled={isLoading}>
              Upload
            </SolidButton>
            <OutlineButton onClick={goBackToUpload} disabled={isLoading}>
              Cancel
            </OutlineButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComfirmImage;