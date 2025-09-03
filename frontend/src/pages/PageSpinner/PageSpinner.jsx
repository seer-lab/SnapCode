
import React from "react";
import "./PageSpinner.css";
import Spinner from "../../components/Spinner/Spinner";

const PageSpinner = () => {
  return (
    <div className="page-spinner-container">
      <div className="page-spinner-content">
        <Spinner />
      </div>
    </div>
  );
};

export default PageSpinner;