import React from "react";
import "./ExerciseList.css"; 
import { FaClock } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";
import { FaPlay } from "react-icons/fa";
import { useUserAnalytics } from "../../hooks/useUserAnalytics";
import { useAuthContext } from "../../contexts/authContext";

// Status icon components mapping
const statusIcons = {
  Draft: null,
  Invalid: <MdError color="#F44336" size={"2rem"} />,
  Pending: <FaClock color="#FF9800" size={"1.75rem"} />,
  Done: <IoIosCheckmarkCircle color="#4CAF50" size={"2rem"} />
};

// Memoized individual exercise item to prevent unnecessary re-renders
const ExerciseItem = React.memo(({ exercise, onExerciseClick }) => {
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent immediate navigation
    
    // Execute analytics log
    await onExerciseClick(exercise.id);
    
    // Navigate after logging
    navigate(`/exerciseDashboard/${exercise.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="exercise-item">
        <div className="exercise-info">
          <span className="exercise-title">
            {`${exercise.title}`}
          </span>
        </div>
        
        <span className="exercise-icons">
          {/* Status icon (only if not Draft) */}
          {exercise.currentStatus !== 'Draft' && (
            <span className="status-icon" style={{ marginRight: "1rem" }}>
              {statusIcons[exercise.currentStatus]}
            </span>
          )}
          
          {/* Always show start/continue icon */}
          <FaPlay color="#444AD4" size={"1.75rem"} />
        </span>
      </div>
    </div>
  );
});

ExerciseItem.displayName = 'ExerciseItem';

function ExerciseList() {
  const { exercisesWithStatus, isLoading } = useExerciseStatus();
  
  // Analytics setup
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid ?? null;

  const { logExerciseEntered } = useUserAnalytics(userId);

  // Handler to log when user clicks on an exercise
  const handleExerciseClick = async (exerciseId) => {
    if (userId && exerciseId) {
      try {
        await logExerciseEntered(exerciseId);
        console.log('Exercise entered logged:', exerciseId);
      } catch (error) {
        console.error('Error logging exercise entered:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="exercises-list">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading exercises...
        </div>
      </div>
    );
  }

  return (
    <div className="exercises-list">
      {exercisesWithStatus.map((exercise) => (
        <ExerciseItem 
          key={exercise.id} 
          exercise={exercise} 
          onExerciseClick={handleExerciseClick}
        />
      ))}
    </div>
  );
}

export default React.memo(ExerciseList);