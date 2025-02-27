// Update the TodayTaskDisplay component in EmployeePanel to include status updates
const TodayTaskDisplay = () => {
    if (!todayTask) return null;
  
    const handleTaskStatusUpdate = async (newStatus) => {
      const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));
      if (!currentEmployee) return;
      
      setIsLoading(true);
      try {
        const updatedTask = {
          ...todayTask,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        };
        
        // Update in the attendance node
        await update(ref(database, `attendance/${currentEmployee.employeeId}/todayTask`), updatedTask);
        
        // Find and update in all project assignments for this employee
        const projectsToUpdate = assignedProjects.filter(project => {
          return project.assignments && project.assignments.some(assignment => 
            assignment.assignee === currentEmployee.name
          );
        });
        
        for (const project of projectsToUpdate) {
          const updatedAssignments = [...project.assignments];
          
          for (let i = 0; i < updatedAssignments.length; i++) {
            if (updatedAssignments[i].assignee === currentEmployee.name) {
              updatedAssignments[i] = {
                ...updatedAssignments[i],
                todayTask: updatedTask
              };
            }
          }
          
          // Update the project with the new assignments
          await update(ref(database, `projects/${project.id}`), { 
            assignments: updatedAssignments 
          });
        }
        
        // Update local state to show changes immediately
        setTodayTask(updatedTask);
        alert(`Task status updated to ${newStatus}!`);
      } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to update task status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="today-task-display">
        <h3>Today's Task</h3>
        <div className={`task-content ${todayTask.status}`}>
          <div className="task-header">
            <h4>Today's Assignment</h4>
            <span className={`task-status ${todayTask.status}`}>
              {todayTask.status.charAt(0).toUpperCase() + todayTask.status.slice(1)}
            </span>
          </div>
          <p>{todayTask.task}</p>
          <div className="task-meta">
            <span>Assigned: {new Date(todayTask.assignedOn).toLocaleTimeString()}</span>
            <span>By: {todayTask.assignedBy || 'Admin'}</span>
          </div>
          
          {/* Status Update Buttons */}
          <div className="task-actions">
            {todayTask.status === 'pending' && (
              <button 
                onClick={() => handleTaskStatusUpdate('in-progress')}
                className="status-btn in-progress-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Start Working'}
              </button>
            )}
            
            {todayTask.status !== 'completed' && (
              <button 
                onClick={() => handleTaskStatusUpdate('completed')}
                className="status-btn complete-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
            
            {todayTask.status === 'in-progress' && (
              <div className="status-message">
                <Clock size={16} /> You're currently working on this task
              </div>
            )}
            
            {todayTask.status === 'completed' && (
              <div className="status-message completed">
                <CheckCircle size={16} /> You've completed this task
                {todayTask.lastUpdated && (
                  <span className="completion-time">
                    at {new Date(todayTask.lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };