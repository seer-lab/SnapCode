import React from "react";
import { useNavigate } from "react-router-dom";
import "./PageNotFound.css";
import SolidButton from "../../components/buttons/Solid/SolidButton";
import { IoArrowBack } from "react-icons/io5";
import { FiHome } from "react-icons/fi";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="page-not-found-container">
      <div className="page-not-found-content">
        <div className="error-code">404</div>
        <div className="error-title">Page Not Found</div>
        <div className="error-message">
          Oh Snap! the page you're looking for doesn't exist.
        </div>
        
        <div className="error-actions">
          <SolidButton onClick={handleGoBack} color="#444AD4">
            <IoArrowBack size={20} style={{ marginRight: '8px' }} />
            Go Back
          </SolidButton>
          

        </div>
      </div>
    </div>
  );
};

export default PageNotFound;