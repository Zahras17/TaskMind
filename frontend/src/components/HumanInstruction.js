import React from "react";
import "./HumanInstruction.css";

function HumanInstruction({ instruction, image, nextStep, prevStep, finished, restart, isLast, currentTask, currentStep, totalTasks, isBlocked, blockedMessage, startPressed, robotInitialized }) {
  return (
    <div className="instruction-panel">
      {finished ? (
        <div className="completion-message">
          <h2>🎉 Well done! All your tasks are completed!</h2>
        </div>
      ) : instruction ? (
        <>
          <div className="instruction-text">
            <h4>👤 Human Task Instruction</h4>
            {currentTask && (
              <div style={{ 
                fontSize: "0.8vw", 
                color: "#666", 
                marginBottom: "0.5vw",
                fontStyle: "italic"
              }}>
                Task {currentTask.id} ({currentStep + 1} of {totalTasks})
              </div>
            )}
            <p>{instruction}</p>
            {isBlocked && (
              <div className="blocked-message">
                <div className="blocked-icon">⚠️</div>
                <div className="blocked-text">{blockedMessage}</div>
              </div>
            )}
            {!startPressed && !isBlocked && robotInitialized && (
              <div className="blocked-message">
                <div className="blocked-icon">⏸️</div>
                <div className="blocked-text">Please press the Start button to begin the task sequence</div>
              </div>
            )}
            {!robotInitialized && !isBlocked && (
              <div className="blocked-message">
                <div className="blocked-icon">🤖</div>
                <div className="blocked-text">Please wait for the robot to initialize</div>
              </div>
            )}
            <div className="button-group">
              <button onClick={prevStep}>⬅️ Back</button>
              <button 
                onClick={nextStep} 
                disabled={isBlocked || !startPressed || !robotInitialized}
                className={isBlocked || !startPressed || !robotInitialized ? "blocked-button" : ""}
              >
                {isLast ? "Finish ✅" : "Next ➡️"}
              </button>  
            </div>
          </div>
          <div className="instruction-image">
            {image && <img src={image} alt="task" className="task-image"  />}
          </div>
        </>
      ) : (
        <h3>No human tasks assigned yet.</h3>
      )}
    </div>
  );
}

export default HumanInstruction;
