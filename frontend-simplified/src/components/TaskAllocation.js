import React from "react";
// import './TaskAllocationPanel.css';


function TaskAllocationPanel({ assignments, assignTask }) {
  return (
    <div className="task-panel">
      <h3>Task Allocation</h3>
      {assignments.map((role, i) => (
        <div key={i} className="task-row">
          <span>Task {i + 1}</span>
          <select value={role} onChange={(e) => assignTask(i, e.target.value)}>
            <option>Unassigned</option>
            <option>Human</option>
            <option>Robot</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default TaskAllocationPanel;
