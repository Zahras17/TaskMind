import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./TaskSequenceView.css";

function SortableTask({ task, updateTaskRole, editable }) {
  const getColorClass = () => {
    if (task.assignedTo === "Human") return "human";
    if (task.assignedTo === "Robot") return "robot";
    return "unassigned";
  };

  const getSliderValue = () => {
    if (task.sliderValue !== undefined) return task.sliderValue;
    return 5; // Default center value
  };

  const handleChange = (e) => {
    if (!editable || task.fixedToHuman) return;
    const val = parseInt(e.target.value);
    const assignedTo = val > 5 ? "Robot" : "Human";
    updateTaskRole(task.id, assignedTo, val);
  };

  return (
    <div className={`task-card ${getColorClass()}`}>
      <div className="task-inline">
        <span className="task-name">
          Task {task.id}: {task.name}
          {task.fixedToHuman && <span className="lock-icon">🔒</span>}
        </span>
        <div className="slider-inline">
          <label>human</label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={getSliderValue()}
            onChange={handleChange}
            disabled={!editable ||task.fixedToHuman}
          />
          <label>robot</label>
          <span style={{ marginLeft: "0.2vw" }}>{getSliderValue()}</span>
        </div>
      </div>
    </div>
  );
}

function SortableDependencyGroup({ group, tasks, updateTaskRole, editable, groupNames }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `group-${group.join('-')}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const groupTasks = tasks.filter(task => group.includes(task.name));
  
  // Get the group name from the first task in the group
  const groupName = groupTasks.length > 0 ? groupNames[groupTasks[0].name] || "" : "";

  return (
    <div
      ref={setNodeRef}
      className="dependency-group-container"
      {...attributes}
      {...listeners}
      style={style}
      data-dragging={isDragging}
    >
      {groupName && (
        <div className="dependency-group-header">
          <div className="dependency-group-label">{groupName}</div>
        </div>
      )}
      <div className="dependency-group-content">
        {groupTasks.map((task) => (
          <SortableTask
            key={task.id}
            task={task}
            updateTaskRole={updateTaskRole}
            editable={editable}
          />
        ))}
      </div>
    </div>
  );
}

function SortableIndependentTask({ task, updateTaskRole, editable, groupNames }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${task.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const groupName = groupNames[task.name] || "";

  return (
    <div
      ref={setNodeRef}
      className="independent-task-container"
      {...attributes}
      {...listeners}
      style={style}
      data-dragging={isDragging}
    >
      {groupName && (
        <div className="dependency-group-header">
          <div className="dependency-group-label">{groupName}</div>
        </div>
      )}
      <div className="dependency-group-content">
        <SortableTask
          task={task}
          updateTaskRole={updateTaskRole}
          editable={editable}
        />
      </div>
    </div>
  );
}

function TaskSequenceView({ tasks, setTasks, updateTaskRole, editable, robotStarted }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );
  const [allSortableItems, setAllSortableItems] = useState([]);
  const [groupNames, setGroupNames] = useState({});

  // Function to group dependent tasks
  const groupDependentTasks = (tasks) => {
    const groups = [];
    const visited = new Set();
    
    // Helper function to find all connected tasks (dependencies)
    const findConnectedTasks = (taskName, currentGroup) => {
      if (visited.has(taskName)) return;
      visited.add(taskName);
      currentGroup.push(taskName);
      
      // Find tasks that depend on this task
      tasks.forEach(task => {
        if (task.dependencies && task.dependencies.includes(taskName)) {
          findConnectedTasks(task.name, currentGroup);
        }
      });
      
      // Find tasks that this task depends on
      const currentTask = tasks.find(t => t.name === taskName);
      if (currentTask && currentTask.dependencies) {
        currentTask.dependencies.forEach(dep => {
          findConnectedTasks(dep, currentGroup);
        });
      }
    };
    
    // Find groups for each unvisited task
    tasks.forEach(task => {
      if (!visited.has(task.name)) {
        const group = [];
        findConnectedTasks(task.name, group);
        if (group.length > 1) { // Only create groups for dependent tasks
          groups.push([...new Set(group)]); // Remove duplicates
        }
      }
    });
    
    return groups;
  };

  // Fetch dependencies and create unified sortable list
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/get-task-dependencies');
        const data = await response.json();
        
        // Add dependencies to tasks
        const tasksWithDeps = tasks.map(task => ({
          ...task,
          dependencies: data.dependencies[task.name] || []
        }));
        
        const groups = groupDependentTasks(tasksWithDeps);
        setGroupNames(data.group_names || {});
        
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
        
        setAllSortableItems(unifiedBlocks);
        
        // Debug: Log the unified blocks
        console.log('Unified blocks created:', unifiedBlocks.map(block => ({
          type: block.type,
          taskNames: block.tasks.map(t => t.name),
          originalOrder: block.originalOrder
        })));
      } catch (error) {
        console.error('Failed to fetch dependencies:', error);
      }
    };
    
    fetchDependencies();
  }, [tasks]);

  const handleDragEnd = (event) => {
    // Prevent dragging when robot has started
    if (!editable) return;
    
    // Allow dragging even when not in applied mode, but show a warning
    const { active, over } = event;
    if (!over) return;
    
    // Handle complex dependency mode
    // Find old and new indices in the unified list
    let oldIndex = -1;
    let newIndex = -1;
    
    // Find the dragged item
    for (let i = 0; i < allSortableItems.length; i++) {
      const item = allSortableItems[i];
      let itemId;
      
      if (item.type === 'group') {
        itemId = `group-${item.tasks.map(t => t.name).join('-')}`;
      } else {
        itemId = `task-${item.tasks[0].id}`;
      }
      
      if (itemId === active.id) {
        oldIndex = i;
      }
      
      if (itemId === over.id) {
        newIndex = i;
      }
    }
    
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedItems = arrayMove(allSortableItems, oldIndex, newIndex);
      setAllSortableItems(reorderedItems);
      
      // Create new task order based on the reordered blocks
      const newTasksOrder = [];
      
      reorderedItems.forEach(item => {
        // Add all tasks from this block in their original order within the block
        item.tasks.forEach(task => {
          newTasksOrder.push(task);
        });
      });
      
      // Update the main tasks array with the new order
      // This will trigger a re-render of the GraphicalTaskFlow component
      setTasks(newTasksOrder);
      
      // Debug: Log the reordering
      console.log('Tasks reordered:', newTasksOrder.map(t => t.name));
      console.log('New task order IDs:', newTasksOrder.map(t => t.id));
    }
  };

  // Create sortable items from unified list
  const sortableItems = allSortableItems.map(item => {
    if (item.type === 'group') {
      return `group-${item.tasks.map(t => t.name).join('-')}`;
    } else {
      return `task-${item.tasks[0].id}`;
    }
  });

  return (
    <div className="sequence-view">
      <h3>Task Allocation</h3>
      <div className="allocation-legend">
        {/* <strong>0 = Human ———— 10 = Robot</strong> */}
      </div>
      {editable && (
        <div style={{ 
          fontSize: "0.7vw", 
          color: "#666", 
          marginBottom: "0.3vw",
          fontStyle: "italic"
        }}>
          ⋮⋮ Drag and drop to reorder
        </div>
      )}
      {!editable && robotStarted && (
        <div style={{ 
          fontSize: "0.7vw", 
          color: "#ff6b6b", 
          marginBottom: "0.3vw",
          fontStyle: "italic"
        }}>
          Order locked - robot has started
        </div>
      )}
      {!editable && !robotStarted && (
        <div style={{ 
          fontSize: "0.7vw", 
          color: "#ff6b6b", 
          marginBottom: "0.3vw",
          fontStyle: "italic"
        }}>
          Click 'Apply' to enable reordering
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          {/* Render all sortable items */}
          {allSortableItems.map((item) => {
            if (item.type === 'group') {
              return (
                <SortableDependencyGroup
                  key={`group-${item.tasks.map(t => t.name).join('-')}`}
                  group={item.tasks.map(t => t.name)}
                  tasks={tasks}
                  updateTaskRole={updateTaskRole}
                  editable={editable}
                  groupNames={groupNames}
                />
              );
            } else {
              return (
                <SortableIndependentTask
                  key={`task-${item.tasks[0].id}`}
                  task={item.tasks[0]}
                  updateTaskRole={updateTaskRole}
                  editable={editable}
                  groupNames={groupNames}
                />
              );
            }
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default TaskSequenceView;
