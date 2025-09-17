import React, { useState } from "react";
import { useRef } from "react";
import "./FileUpload.css";

import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import OutlineButton from "../buttons/Outline/OutlineButton";
import SolidButton from "../buttons/Solid/SolidButton";
import Spinner from "../Spinner/Spinner";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";

const FileUpload = ({ exId }) => {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state
  const navigate = useNavigate();
  const mobileInputRef = useRef(null);
  
  // Get current exercise status
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);
  
  // Dynamic message based on exercise status
  const getMessage = () => {
    if (currentStatus === 'Done') {
      return "Warning: This will replace ALL your code and reset progress";
    }
    return "Ready to start?";
  };
  
  const openMobileCamera = () => {
    mobileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    
    // More robust file validation
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Validate that it's a valid image
    if (!file.type.startsWith('image/')) {
      console.error("Selected file is not a valid image");
      alert("Please select a valid image");
      return;
    }

    // Verify that exId has a valid value
    if (!exId) {
      console.error("exId is not defined");
      alert("Error: Invalid exercise ID");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);
    console.log("exId:", exId);
    
    // Start loading immediately for better perceived performance
    setIsProcessing(true);
    setSelectedFile(file);

    const reader = new FileReader();
    
    // Handle reading errors
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error processing image. Please try again.");
      setIsProcessing(false);
      // Clear the input
      event.target.value = '';
    };
    
    reader.onloadend = () => {
      try {
        const buffer = reader.result;
        
        if (!buffer) {
          console.error("Empty buffer after reading file");
          alert("Error processing image. Please try again.");
          setIsProcessing(false);
          return;
        }

        const dataUrl = `data:${file.type};base64,${arrayBufferToBase64(buffer)}`;
        setImageSrc(dataUrl);

        console.log("Navigating to confirmImage...");
        
        // Navigate immediately without timeout for faster performance
        navigate(`/exerciseDashboard/${exId}/confirmImage`, {
          state: { imageData: dataUrl, imageBuffer: buffer, file },
        });
        setIsProcessing(false);
        
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Error processing image. Please try again.");
        setIsProcessing(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Clear input after use
    event.target.value = '';
  };

  // Optimized base64 conversion using browser native methods
  const arrayBufferToBase64 = (buffer) => {
    const uint8Array = new Uint8Array(buffer);
    const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binaryString);
  };

  const openUploadDialog = () => {
    const fileInput = document.getElementById("upload-input");
    if (fileInput) fileInput.click();
  };

  // Show spinner if processing
  if (isProcessing) {
    return (
      <div className="code-tab-content">
        <img src={logo} alt="Big Logo" className="big-logo" />
        <p className="text">Processing image...</p>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="code-tab-content">
      <img src={logo} alt="Big Logo" className="big-logo" />
      <p className="text">{getMessage()}</p>

      {/* MOBILE: label opens camera */}
      {isMobile && (
        <>
          <SolidButton onClick={openMobileCamera} disabled={isProcessing}>
            Take Photo
          </SolidButton>
          <input
            ref={mobileInputRef}
            id="mobile-photo"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="visually-hidden-input"
            disabled={isProcessing}
          />
        </>
      )}

      {/* UNIVERSAL: Upload button (desktop uses this) */}
      <input
        id="upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden-input"
        disabled={isProcessing}
      />
      <OutlineButton onClick={openUploadDialog} disabled={isProcessing}>
        Upload Image
      </OutlineButton>
    </div>
  );
};

export default FileUpload;