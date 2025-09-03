import React from "react";
import "./HomeDashboard.css";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import ExerciseList from "../../components/ExerciseList/ExerciseList";
import { useBottomNavigation } from "../../hooks/useBottomNavigation";

const HomeDashboard = () => {
  const { handleTabChange } = useBottomNavigation();

  return (
    <div className="home-dashboard-container"> {/* Agregar clase contenedora */}
      <TopNavbar 
        title="Dashboard" 
        leftimage={false}  // No back arrow in HomeDashboard
      />
      <div className="content-container">
        <ExerciseList />
      </div>
      <BottomNavbar 
        handleChange={handleTabChange}
        selectedValue="home" // Always "home" since we're on home page
      />
    </div>
  );
};

export default HomeDashboard;