import React from "react";
import "./RobotCommunicator.css";

const RobotCommunicator = ({ message, robotExecutionMessage, currentRobotTaskImage }) => {
  console.log("🔍 RobotCommunicator props:", { message, robotExecutionMessage, currentRobotTaskImage });
  const isNotification = message && (message.includes("⚠️") || message.includes("🤖") || message.includes("✅ All dependencies are met"));
  const isRobotInitialized = message && message.includes("Robot initialized");
  const isInitializing = message && message.includes("Initializing robot");
  const isNoMessage = !message;
  
  return (
    <div className="robot-communicator">
      <div className="robot-content-box">
        <h3>🤖 Robot Communicator</h3>
        <div className={`message-container ${isNotification ? 'notification' : ''} ${isRobotInitialized ? 'robot-initialized' : ''} ${isInitializing ? 'robot-initializing' : ''} ${isNoMessage ? 'no-message' : ''}`}>
          <p>{message || "Dependency messages will be shown here"}</p>
          {isNotification && <div className="notification-icon"></div>}
        </div>
        <div className="robot-image">
          {currentRobotTaskImage ? (
            <img src={`/${currentRobotTaskImage}`} alt="Current Robot Task" />
          ) : (
            <img src="/UR3e.png" alt="UR3e Robot" />
          )}
        </div>
        <div className="robot-execution-status">
          <p>{robotExecutionMessage || "Robot idle."}</p>
        </div>
      </div>
    </div>
  );
};

export default RobotCommunicator;
