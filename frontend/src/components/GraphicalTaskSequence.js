import React, { useState, useEffect } from "react";
import "./GraphicalTaskSequence.css";

function GraphicalTaskSequence({ tasks, currentHumanStep, currentRobotTask, executedRobotTasks, finishedTasks }) {
  console.log("GraphicalTaskSequence - currentRobotTask:", currentRobotTask);
  console.log("GraphicalTaskSequence - executedRobotTasks:", executedRobotTasks);
  console.log("GraphicalTaskSequence - finishedTasks:", finishedTasks);
  console.log("GraphicalTaskSequence - tasks:", tasks);
  console.log("GraphicalTaskSequence - tasks order:", tasks.map(t => ({ id: t.id, name: t.name })));
  const humanTaskIds = tasks.filter(t => t.assignedTo === "Human").map(t => t.id);
  const [taskDependencies, setTaskDependencies] = useState({});
  const [groupNames, setGroupNames] = useState({});

  // Fetch dependencies
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/get-task-dependencies');
        const data = await response.json();
        setTaskDependencies(data.dependencies || {});
        setGroupNames(data.group_names || {});
      } catch (error) {
        console.error('Failed to fetch dependencies:', error);
      }
    };
    
    fetchDependencies();
  }, [tasks]);

  // Function to get task class based on assignment and state
  const getTaskClass = (task, assignedTo) => {
    if (assignedTo === "Human") {
      // Check if task is in finished tasks list
      const normalizedTaskName = task.name?.trim().toLowerCase();
      const normalizedFinishedList = (finishedTasks?.human_finished || []).map(task => task.trim().toLowerCase());
      
      if (normalizedFinishedList.includes(normalizedTaskName)) {
        return "completed-task";
      } else {
        const currentIndexInHuman = humanTaskIds.indexOf(task.id);
        if (currentIndexInHuman < currentHumanStep) {
          return "completed-task";
        } else if (currentIndexInHuman === currentHumanStep) {
          return "current-task";
        } else {
          return "future-task";
        }
      }
    } else if (assignedTo === "Robot") {
      const normalizedRobotCode = task.RobotCode?.trim().toLowerCase();
      const normalizedTaskName = task.name?.trim().toLowerCase();
      const normalizedExecutedList = executedRobotTasks.map(code => code.trim().toLowerCase());
      const normalizedFinishedList = (finishedTasks?.robot_finished || []).map(task => task.trim().toLowerCase());

      if (currentRobotTask?.trim().toLowerCase() === normalizedRobotCode) {
        return "robot-current";
      } else if (normalizedExecutedList.includes(normalizedRobotCode) || 
                 normalizedExecutedList.includes(normalizedTaskName) ||
                 normalizedFinishedList.includes(normalizedRobotCode) ||
                 normalizedFinishedList.includes(normalizedTaskName)) {
        return "robot-done";
      } else {
        return "robot-future";
      }
    }
    return "placeholder";
  };

  // Function to group dependent tasks
  const groupDependentTasks = () => {
    const groups = [];
    const visited = new Set();
    
    // Helper function to find all connected tasks (dependencies)
    const findConnectedTasks = (taskName, currentGroup) => {
      if (visited.has(taskName)) return;
      visited.add(taskName);
      currentGroup.push(taskName);
      
      // Find tasks that depend on this task
      Object.entries(taskDependencies).forEach(([task, deps]) => {
        if (deps.includes(taskName)) {
          findConnectedTasks(task, currentGroup);
        }
      });
      
      // Find tasks that this task depends on
      const currentTaskDeps = taskDependencies[taskName] || [];
      currentTaskDeps.forEach(dep => {
        findConnectedTasks(dep, currentGroup);
      });
    };
    
    // Find groups for each unvisited task
    Object.keys(taskDependencies).forEach(taskName => {
      if (!visited.has(taskName)) {
        const group = [];
        findConnectedTasks(taskName, group);
        if (group.length > 1) { // Only create groups for dependent tasks
          groups.push([...new Set(group)]); // Remove duplicates
        }
      }
    });
    
    return groups;
  };

  // Function to render dependency groups spanning both rows
  const renderDependencyGroups = () => {
    const result = [];
    
    // Add null checks to prevent errors when tasks is empty or undefined
    if (!tasks || tasks.length === 0) {
      return result;
    }
    
    // Create unified blocks like in TaskSequenceView
    const groups = groupDependentTasks();
    
    // Find independent tasks (not in any group)
    const groupedTaskNames = new Set();
    groups.forEach(group => {
      group.forEach(taskName => groupedTaskNames.add(taskName));
    });
    
    const independent = tasks.filter(task => !groupedTaskNames.has(task.name));
    
    // Create a unified list where each red box is a single block
    const unifiedBlocks = [];
    
    // Add dependent groups as blocks
    groups.forEach(group => {
      const groupTasks = tasks.filter(task => group.includes(task.name));
      // Sort group tasks by their original order
      groupTasks.sort((a, b) => {
        const indexA = tasks.findIndex(t => t.id === a.id);
        const indexB = tasks.findIndex(t => t.id === b.id);
        return indexA - indexB;
      });
      
      unifiedBlocks.push({
        type: 'group',
        tasks: groupTasks,
        originalOrder: Math.min(...groupTasks.map(t => tasks.findIndex(task => task.id === t.id)))
      });
    });
    
    // Add independent tasks as individual blocks
    independent.forEach(task => {
      unifiedBlocks.push({
        type: 'independent',
        tasks: [task],
        originalOrder: tasks.findIndex(t => t.id === task.id)
      });
    });
    
    // Sort blocks by their original order to maintain initial sequence
    unifiedBlocks.sort((a, b) => a.originalOrder - b.originalOrder);
    
    // Render blocks in the unified order
    unifiedBlocks.forEach((block, blockIndex) => {
      if (block.type === 'group') {
        const groupName = groupNames[block.tasks[0].name] || "";
        result.push(
          <div key={`group-${blockIndex}`} className="dependency-group-container">
            {groupName && (
              <div className="dependency-group-header">
                <div className="dependency-group-label">{groupName}</div>
              </div>
            )}
            <div className="dependency-group-content">
              {/* Human Row */}
              <div className="flow-row-label">👤 Human</div>
              <div className="flow-row">
                {block.tasks.map(task => (
                  <div
                    key={`human-${task.id}`}
                    className={`task-box ${task.assignedTo === "Human" ? getTaskClass(task, "Human") : 'placeholder'}`}
                    title={task.name}
                  >
                    {task.assignedTo === "Human" ? `Task ${task.id}` : ''}
                  </div>
                ))}
              </div>
              
              {/* Robot Row */}
              <div className="flow-row-label">🤖 Robot</div>
              <div className="flow-row">
                {block.tasks.map(task => (
                  <div
                    key={`robot-${task.id}`}
                    className={`task-box ${task.assignedTo === "Robot" ? getTaskClass(task, "Robot") : 'placeholder'}`}
                    title={task.name}
                  >
                    {task.assignedTo === "Robot" ? `Task ${task.id}` : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      } else {
        // Independent task block
        const task = block.tasks[0];
        const groupName = groupNames[task.name] || "No Group";
        result.push(
          <div key={`independent-${task.id}`} className="dependency-group-container">
            <div className="dependency-group-header">
              <div className="dependency-group-label">{groupName}</div>
            </div>
            <div className="dependency-group-content">
              {/* Human Row */}
              <div className="flow-row-label">👤 Human</div>
              <div className="flow-row">
                <div
                  className={`task-box ${task.assignedTo === "Human" ? getTaskClass(task, "Human") : 'placeholder'}`}
                  title={task.name}
                >
                  {task.assignedTo === "Human" ? `Task ${task.id}` : ''}
                </div>
              </div>
              
              {/* Robot Row */}
              <div className="flow-row-label">🤖 Robot</div>
              <div className="flow-row">
                <div
                  className={`task-box ${task.assignedTo === "Robot" ? getTaskClass(task, "Robot") : 'placeholder'}`}
                  title={task.name}
                >
                  {task.assignedTo === "Robot" ? `Task ${task.id}` : ''}
                </div>
              </div>
            </div>
          </div>
        );
      }
    });

    return result;
  };

  return (
    <div className="graphical-flow">
      <h3>Graphical Task Sequence</h3>

      {/* Render dependency groups and independent tasks */}
      <div className="dependency-groups-container">
        {renderDependencyGroups()}
      </div>
    </div>
  );
}

export default GraphicalTaskSequence;
