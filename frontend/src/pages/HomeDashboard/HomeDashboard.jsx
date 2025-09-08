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
        leftimage={false}  
      />
      <div className="content-container">
        <ExerciseList />
      </div>
      <BottomNavbar 
        handleChange={handleTabChange}
        selectedValue="home" 
      />
    </div>
  );
};

export default HomeDashboard;