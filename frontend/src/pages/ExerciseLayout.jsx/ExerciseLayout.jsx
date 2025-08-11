import React, { useState } from "react";
import "./ExerciseLayout.css"; // Import the CSS file
import { Outlet, useParams, useLocation } from "react-router-dom";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import { exercises } from "../../data/exercises";
import { useBottomNavigation } from "../../hooks/useBottomNavigation";

const ExerciseLayout = () => {
  const { exId } = useParams();
  const location = useLocation();
  const { handleTabChange } = useBottomNavigation();

  // Determine title based on current route
  const getTitle = () => {
    if (location.pathname.includes('/upload')) {
      return "Upload";
    }
    if (location.pathname.includes('/confirmImage')) {
      return "Confirm Image";
    }
    return exercises[exId]?.title || "Exercise";
  };

  // Camera click handler
  const handleCameraClick = () => {
    // Navigate to nested upload route
    window.location.href = `/exerciseDashboard/${exId}/upload`;
  };

  return (
    <div className="exercise-layout">
      <TopNavbar 
        title={getTitle()} 
        // Uses navigate(-1) by default - goes back to previous page
      />
      
      {/* This will render the child routes */}
      <div className="exercise-content">
        <Outlet context={{ exId }} />
      </div>
      
      <BottomNavbar 
        handleChange={handleTabChange}
        selectedValue="home"
        onCameraClick={handleCameraClick}
      />
    </div>
  );
};

export default ExerciseLayout;