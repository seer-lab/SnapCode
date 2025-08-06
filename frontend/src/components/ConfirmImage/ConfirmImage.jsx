import React, { useState, useEffect } from "react";
import "./ComfirmImage.css"; // Import your stylesheet for additional styling
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/authContext";
import SolidButton from "../buttons/Solid/SolidButton";
import OutlineButton from "../buttons/Outline/OutlineButton";
const ComfirmImage = () => {
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentExercise } = useAuthContext();

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

  console.log(imageBuffer);
  console.log(imageData);
  console.log(file);

  const getOCROutput = async () => {
    setIsLoading(true);
    // Convert the image file to a FormData object
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Send the fetch request
      const response = await fetch("http://localhost:8080/outputocr", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Assuming the backend responds with text, you can read it as follows
        const jsonData = await response.json();
        console.log("OCR Output:", jsonData);
        // jsonData.map((each) => console.log(each));
        navigate(`/exerciseDashboard/${currentExercise}`, { state: { ocrOutput: jsonData } });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setIsLoading(false);
    }
  };

  const goBackToCodeTab = () => {
    // Navigate back to the exercise dashboard code tab
    navigate(`/exerciseDashboard/${currentExercise}`, { 
      state: { startOnCodeTab: true }, 
      replace: true 
    });
  };

  return (
    <div className="container">
      <div className="image-wrapper">
        <img src={imageData} alt="Your Image" className="main-image" />
      </div>

      <div className="button-container">
        {isLoading ? "fetching ocr output" : ""}
        <p className="question-text">Do you want to use this image?</p>
        <div className="button-wrapper">
        <SolidButton onClick={getOCROutput} disabled={isLoading}>
          Yes
        </SolidButton>
         <OutlineButton onClick={goBackToCodeTab} disabled={isLoading}>
          Choose another image
        </OutlineButton>
        </div>
      </div>
    </div>
  );
};

export default ComfirmImage;