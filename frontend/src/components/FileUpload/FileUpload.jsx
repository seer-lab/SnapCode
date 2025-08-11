import React, { useState } from "react";
import "./FileUpload.css"; // Keep original CSS
import cameraIcon from "../../assets/camera.png";
import logo from "../../assets/logo.png";
import camera from "../camera";
import { useNavigate } from "react-router-dom";
import OutlineButton from "../buttons/Outline/OutlineButton";
import SolidButton from "../buttons/Solid/SolidButton";
import { FaCamera } from "react-icons/fa";

const FileUpload = ({ exId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    console.log("Selected file:", file);
    if (file) {
      // Read the file content as a buffer
      const reader = new FileReader();

      reader.onloadend = () => {
        const buffer = reader.result; // This is the buffer containing the file content
        console.log("File Content as Buffer:", buffer);
        // Convert ArrayBuffer to Data URL
        const dataUrl = `data:${file.type};base64,${arrayBufferToBase64(
          buffer
        )}`;
        setImageSrc(dataUrl);
        
        // Navigate to nested confirmation page
        navigate(`/exerciseDashboard/${exId}/confirmImage`, {
          state: {
            imageData: dataUrl,
            imageBuffer: buffer,
            file: file,
          },
        });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  };

  const handleUpload = () => {
    // Open the file input dialog when the button is clicked
    const fileInput = document.getElementById("upload-input");
    fileInput.click();
    console.log("Selected file:", selectedFile);
  };

  const handleCaptureButtonClick = async () => {
    camera.startCamera();
    camera.takeSnapshot();
  };

  return (
    <div className="code-tab-content">
      <img src={logo} alt="Big Logo" className="big-logo" />
      <p className="text">Ready to start?</p>
      <SolidButton onClick={handleCaptureButtonClick}>
        Take Photo
      </SolidButton>
      <input
        type="file"
        id="upload-input"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <OutlineButton onClick={handleUpload}>Upload Image</OutlineButton>
      {imageSrc && (
        <div>
          <p>Selected Image:</p>
          <img
            src={imageSrc}
            alt="Selected"
            style={{ maxWidth: "100%", maxHeight: "300px" }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;