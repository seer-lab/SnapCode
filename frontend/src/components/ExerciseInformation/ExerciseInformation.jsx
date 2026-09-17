import React, { useState } from "react";
import "./ExerciseInformation.css"; 
import { exercises } from "../../data/exercises";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

const ExerciseInformation = ({exId}) => {

  const sanitizedOutput = DOMPurify.sanitize(exercises[exId].expectedOutput, {
    ADD_TAGS: ["body", "iframe"],
    ADD_ATTR: ["style", "bgcolor", "src", "width", "height", "allow", "allowfullscreen"],
    FORCE_BODY: false
  });


  return (
    <div className="exercise-container">
    <section className="description">
      <h2 className="exercise-heading">Description</h2>
      <p>{exercises[exId].description}</p>
    </section>
    
    <section className="expected-output">
      <h2 className="exercise-heading">Expected Output</h2>
      <div className="expected-output-div">
      {parse(sanitizedOutput)}
      </div>
      
    </section>
    
    <section className="get-started">
      <h2 className="exercise-heading">Get Started</h2>
      <p>Click on the upload button to get started!</p>
    </section>
  </div>
  );
};

export default ExerciseInformation;
