import React from "react";
import "./ExerciseList.css"; 
import playpurple from "../../assets/play_purple.png";
import { FaClock } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { Link } from "react-router-dom";
import { useExerciseStatus } from "../../hooks/useExerciseStatus";
import { FaPlay } from "react-icons/fa";

// Status icon components mapping
const statusIcons = {
  Draft: null,                    // No status icon for draft
  Invalid: <MdError color="#F44336" size={"2rem"} />,
  Pending: <FaClock color="#FF9800" size={"1.75rem"} />,
  Done: <IoIosCheckmarkCircle color="#4CAF50" size={"2rem"} />
};

// Memoized individual exercise item to prevent unnecessary re-renders
const ExerciseItem = React.memo(({ exercise }) => (
  <Link 
    key={exercise.id} 
    to={`/exerciseDashboard/${exercise.id}`} 
    style={{ textDecoration: "none", color: "black" }}
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
  </Link>
));

ExerciseItem.displayName = 'ExerciseItem';

function ExerciseList() {
  const { exercisesWithStatus, isLoading } = useExerciseStatus();

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
        <ExerciseItem key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
}

export default React.memo(ExerciseList);