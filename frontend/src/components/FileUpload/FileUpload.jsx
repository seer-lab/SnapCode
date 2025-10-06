import React, { useState, useRef } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  // Refs separados para cámara y galería
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const { getExerciseStatus } = useExerciseStatus();
  const currentStatus = getExerciseStatus(exId);
  
  const getMessage = () => {
    if (currentStatus === 'Done') {
      return "Warning: This will replace ALL your code and reset progress";
    }
    return "Ready to start?";
  };
  
  const openMobileCamera = () => {
    cameraInputRef.current?.click();
  };
  
  const openMobileGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.error("Selected file is not a valid image");
      alert("Please select a valid image");
      return;
    }

    if (!exId) {
      console.error("exId is not defined");
      alert("Error: Invalid exercise ID");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);
    console.log("exId:", exId);
    
    setIsProcessing(true);
    setSelectedFile(file);

    const reader = new FileReader();
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error processing image. Please try again.");
      setIsProcessing(false);
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
    event.target.value = '';
  };

  const arrayBufferToBase64 = (buffer) => {
    const uint8Array = new Uint8Array(buffer);
    const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binaryString);
  };

  const openUploadDialog = () => {
    const fileInput = document.getElementById("upload-input");
    if (fileInput) fileInput.click();
  };

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

      {/* MOBILE: Botones separados para cámara y galería */}
      {isMobile && (
        <>
          {/* Input para CÁMARA con capture */}
          <SolidButton onClick={openMobileCamera} disabled={isProcessing}>
            Take Photo
          </SolidButton>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="visually-hidden-input"
            disabled={isProcessing}
          />
          
          {/* Input para GALERÍA sin capture */}
          <OutlineButton onClick={openMobileGallery} disabled={isProcessing}>
            Choose from Gallery
          </OutlineButton>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="visually-hidden-input"
            disabled={isProcessing}
          />
        </>
      )}

      {/* DESKTOP: Upload button */}
      {!isMobile && (
        <>
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
        </>
      )}
    </div>
  );
};

export default FileUpload;