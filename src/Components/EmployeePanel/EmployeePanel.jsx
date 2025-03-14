import { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update, push, get, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import {
    Loader2, Clock, CheckCircle, XCircle, History
} from "lucide-react";
import './EmployeePanel.css';

const EmployeePanel = () => {
    const navigate = useNavigate();
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employeeName, setEmployeeName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState('out');
    const [currentShift, setCurrentShift] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showCheckInSummary, setShowCheckInSummary] = useState(false);
    const [showCheckOutSummary, setShowCheckOutSummary] = useState(false);
    const [checkInSummary, setCheckInSummary] = useState('');
    const [checkOutSummary, setCheckOutSummary] = useState('');
    const [todayTask, setTodayTask] = useState(null);
    const [scheduledTasks, setScheduledTasks] = useState([]);
    const [workStatusUpdates, setWorkStatusUpdates] = useState({});

    useEffect(() => {
        const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));

        if (!currentEmployee) {
            navigate('/');
            return;
        }

        setEmployeeName(currentEmployee.name);
        setEmployeeId(currentEmployee.employeeId);

        const attendanceRef = ref(database, `attendance/${currentEmployee.employeeId}/current`);
        set(attendanceRef, null)
            .then(() => {
                setAttendanceStatus('out');
                setCurrentShift(null);
                console.log('Forced Checked Out state on login');
            })
            .catch(error => {
                console.error('Error clearing current shift:', error);
                setError('Error initializing attendance status. Please try again or contact support.');
            });

        const projectsRef = ref(database, 'projects');
        const scheduledTasksRef = ref(database, 'scheduledTasks');
        const historyRef = ref(database, `attendance/${currentEmployee.employeeId}/history`);
        const todayTaskRef = ref(database, `attendance/${currentEmployee.employeeId}/todayTask`);

        const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
            try {
                if (snapshot.exists()) {
                    const projectsData = [];
                    snapshot.forEach((childSnapshot) => {
                        const project = childSnapshot.val();
                        const projectId = childSnapshot.key;

                        const getProjectAssignees = () => {
                            const employeeNameLower = currentEmployee.name.toLowerCase();
                            const assignees = [];
                            let employeeSpecificAssignments = [];

                            if (project.Assign_To) {
                                assignees.push(...project.Assign_To.split(',').map(name => name.trim()));
                            }
                            if (project.assignedTo) {
                                assignees.push(...project.assignedTo.split(',').map(name => name.trim()));
                            }
                            if (project.assignments) {
                                const assignmentsArray = Array.isArray(project.assignments)
                                    ? project.assignments
                                    : Object.values(project.assignments);

                                assignmentsArray.forEach((assignment, index) => {
                                    if (typeof assignment === 'object') {
                                        const assigneeName = (assignment.assignee || assignment.name || '').trim();
                                        if (assigneeName) {
                                            assignees.push(assigneeName);
                                        }
                                        if (assigneeName.toLowerCase() === employeeNameLower) {
                                            employeeSpecificAssignments.push({
                                                index,
                                                name: assigneeName,
                                                taskCompleted: assignment.taskCompleted || assignment.task_completed || '',
                                                percentage: assignment.percentage || 'N/A',
                                                description: assignment.description || 'N/A',
                                                taskOrder: assignment.taskOrder || '',
                                                todayTask: assignment.todayTask || null
                                            });
                                        }
                                    }
                                });
                            }

                            const uniqueAssignees = [...new Set(assignees)];
                            return { allAssignees: uniqueAssignees, employeeAssignments: employeeSpecificAssignments };
                        };

                        const { allAssignees, employeeAssignments } = getProjectAssignees();
                        if (employeeAssignments.length > 0) {
                            projectsData.push({
                                id: projectId,
                                ...project,
                                allAssignees,
                                employeeAssignments
                            });
                        }
                    });

                    projectsData.sort((a, b) => a.id.localeCompare(b.id));
                    setAssignedProjects(projectsData);
                } else {
                    setAssignedProjects([]);
                }
            } catch (error) {
                console.error('Error processing projects:', error);
                setError('Error loading projects');
            } finally {
                setLoading(false);
            }
        });

        const unsubscribeScheduledTasks = onValue(scheduledTasksRef, (snapshot) => {
            if (snapshot.exists()) {
                const tasksData = [];
                snapshot.forEach((childSnapshot) => {
                    const task = childSnapshot.val();
                    if (task.employeeId === employeeId) {
                        tasksData.push({
                            id: childSnapshot.key,
                            ...task
                        });
                    }
                });
                setScheduledTasks(tasksData);
            } else {
                setScheduledTasks([]);
            }
        });

        const unsubscribeCurrent = onValue(attendanceRef, (snapshot) => {
            if (snapshot.exists()) {
                const currentData = snapshot.val();
                setCurrentShift(currentData || null);
                setAttendanceStatus('in');
            } else {
                setCurrentShift(null);
                setAttendanceStatus('out');
            }
        });

        const unsubscribeHistory = onValue(historyRef, (snapshot) => {
            if (snapshot.exists()) {
                const historyData = Object.entries(snapshot.val()).map(([key, value]) => ({
                    id: key,
                    ...value
                }));
                historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAttendanceHistory(historyData);
            } else {
                setAttendanceHistory([]);
            }
        });

        const unsubscribeTodayTask = onValue(todayTaskRef, (snapshot) => {
            if (snapshot.exists()) {
                const taskData = snapshot.val();
                const today = new Date().toISOString().split('T')[0];
                if (taskData.date === today) {
                    setTodayTask(taskData);
                } else {
                    setTodayTask(null);
                }
            } else {
                setTodayTask(null);
            }
        });

        return () => {
            unsubscribeProjects();
            unsubscribeScheduledTasks();
            unsubscribeCurrent();
            unsubscribeHistory();
            unsubscribeTodayTask();
        };
    }, [navigate, employeeId]);

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        if (!employeeId) return;
    
        setIsLoading(true);
        try {
            const now = new Date().toISOString();
            let updatedTask = todayTask && todayTask.taskId === taskId
                ? { ...todayTask }
                : scheduledTasks.find(t => t.id === taskId);
    
            if (!updatedTask) {
                throw new Error('Task not found');
            }
    
            if (newStatus === 'completed') {
                const completionNote = workStatusUpdates[taskId] || checkOutSummary || 'Task completed';
                updatedTask = {
                    ...updatedTask,
                    status: 'pending-verification',
                    completionRequest: {
                        employeeName: employeeName,
                        requestedAt: now,
                        completionNote: completionNote,
                        lastUpdated: now
                    },
                    lastUpdated: now,
                    rejected: false,
                    rejectionReason: null,
                    rejectedAt: null
                };
    
                if (!updatedTask.startedOn) {
                    updatedTask.startedOn = now;
                }
            } else {
                updatedTask = {
                    ...updatedTask,
                    status: newStatus,
                    lastUpdated: now
                };
    
                if (newStatus === 'in-progress') {
                    updatedTask.startedOn = now;
                }
            }
    
            if (taskId) {
                await update(ref(database, `scheduledTasks/${taskId}`), updatedTask);
            }
    
            if (newStatus === 'in-progress') {
                alert('You have started working on this task!');
            } else if (newStatus === 'completed') {
                alert('Task marked for verification. Awaiting admin approval.');
                setWorkStatusUpdates(prev => ({ ...prev, [taskId]: '' })); // Clear textarea after submission
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleSaveWorkStatus = async (projectId, assignmentIndex) => {
        try {
            const statusUpdate = workStatusUpdates[`${projectId}-${assignmentIndex}`] || '';
            if (!statusUpdate.trim()) {
                alert('Please enter a status update before saving.');
                return;
            }

            setIsLoading(true);
            const now = new Date().toISOString();
            const projectRef = ref(database, `projects/${projectId}`);
            const currentProject = assignedProjects.find(p => p.id === projectId);

            if (!currentProject) {
                throw new Error('Project not found');
            }

            const currentAssignments = currentProject.assignments
                ? (Array.isArray(currentProject.assignments)
                    ? [...currentProject.assignments]
                    : Object.values(currentProject.assignments))
                : [];

            if (currentAssignments[assignmentIndex]) {
                const wasRejected = currentAssignments[assignmentIndex].rejected ||
                    currentAssignments[assignmentIndex].taskCompleted === 'Rejected';

                currentAssignments[assignmentIndex] = {
                    ...currentAssignments[assignmentIndex],
                    taskCompleted: `Pending Verification: ${statusUpdate}`,
                    // taskCompleted: `Pending Verification: ${statusUpdate}`,
                    completedTimestamp: now,
                    rejected: false, // Clear rejection flag
                    rejectionReason: null, // Clear rejection reason
                    rejectionTimestamp: null, // Clear rejection timestamp
                    completionRequest: {
                        employeeName: employeeName,
                        requestedAt: now,
                        completionNote: statusUpdate,
                        wasResubmission: wasRejected // Flag to indicate this was a resubmission
                    }
                };
            }

            await update(projectRef, { assignments: currentAssignments });

            setWorkStatusUpdates(prev => ({
                ...prev,
                [`${projectId}-${assignmentIndex}`]: ''
            }));

            alert(currentAssignments[assignmentIndex].rejected ?
                'Work resubmitted for admin verification!' :
                'Work status submitted for admin verification!');
        } catch (error) {
            console.error('Error updating work status:', error);
            alert(`Failed to update work status: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const TodayTaskDisplay = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = [];
    
        scheduledTasks.forEach(task => {
            console.log("Checking task:", task.id, task.type, task.task, 
                        task.date, task.startDate, task.endDate);
            
            if (
                (task.type === 'daily' && task.date === today) ||
                (task.type === 'daily' && task.date > today) ||
                (task.type === 'weekly') ||
                (task.type === 'monthly' && task.startDate <= today && task.endDate >= today)
            ) {
                console.log("Task passed filter:", task.id, task.type);
                todayTasks.push({ ...task, source: 'scheduled' });
            }
        });
    
        const uniqueTasks = [];
        const taskIds = new Set();
        todayTasks.forEach(task => {
            if (!taskIds.has(task.id)) {
                taskIds.add(task.id);
                uniqueTasks.push(task);
            }
        });
    
        if (uniqueTasks.length === 0) return null;
    
        return (
            <div className="today-task-section">
                <h3>Tasks Updates</h3>
                <div className="tasks-table-container">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Task Type</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th>Assigned</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueTasks.map((task) => (
                                <tr key={task.id} className={`task-row ${task.status} ${task.rejected ? 'rejected' : ''}`}>
                                    <td className="task-type-cell">
                                        {task.type === 'daily' && task.date === today ? 'Daily Task' : 
                                         task.type === 'daily' && task.date > today ? `Scheduled for ${new Date(task.date).toLocaleDateString()}` :
                                         task.type === 'weekly' ? 
                                            (task.startDate && task.endDate ? 
                                                `Weekly (${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()})` : 
                                                'Weekly Task') : 
                                         task.type === 'monthly' ? 
                                            (task.startDate && task.endDate ? 
                                                `Monthly (${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()})` : 
                                                'Monthly Task') :
                                         'Task'}
                                    </td>
                                    <td className="status-cell">
                                        <span className={`table-status-badge ${task.status} ${task.rejected ? 'rejected' : ''}`}>
                                            {task.status === 'rejected' || task.rejected ? 'Rejected' :
                                             task.status === 'pending' ? 'Not Started' :
                                             task.status === 'in-progress' ? 'In Progress' :
                                             task.status === 'pending-verification' ? 'Pending Verification' :
                                             'Completed'}
                                        </span>
                                    </td>
                                    <td className="description-cell">
                                        {task.task}
                                        {(task.status === 'rejected' || task.rejected) && (task.rejectionReason || task.rejectedAt) && (
                                            <div className="rejection-details">
                                                {task.rejectionReason && (
                                                    <div className="rejection-reason">
                                                        <strong>Rejection reason:</strong> {task.rejectionReason}
                                                    </div>
                                                )}
                                                {task.rejectedAt && (
                                                    <div className="rejection-time">
                                                        Rejected: {new Date(task.rejectedAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="assigned-cell">
                                        <div>{new Date(task.assignedOn).toLocaleTimeString()}</div>
                                        <div className="assigned-by">By: {task.assignedBy || 'Admin'}</div>
                                    </td>
                                    <td className="actions-cell">
                                        {(task.status === 'pending' || task.status === 'rejected' || task.rejected) && (
                                            <button
                                                onClick={() => handleTaskStatusUpdate(task.id, 'in-progress')}
                                                className="table-status-btn in-progress-btn"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Updating...' : 'Start'}
                                            </button>
                                        )}
                                        {(task.status === 'in-progress' || task.status === 'rejected' || task.rejected) && (
                                            <>
                                                <textarea
                                                    placeholder="Enter updated work details to resubmit..."
                                                    value={workStatusUpdates[task.id] || ''}
                                                    onChange={(e) => setWorkStatusUpdates(prev => ({
                                                        ...prev,
                                                        [task.id]: e.target.value
                                                    }))}
                                                    rows={3}
                                                    className="work-status-textarea"
                                                    style={{ display: (task.status === 'rejected' || task.rejected) ? 'block' : 'none' }}
                                                />
                                                <button
                                                    onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                                                    className="table-status-btn complete-btn"
                                                    disabled={isLoading || ((task.status === 'rejected' || task.rejected) && !workStatusUpdates[task.id])}
                                                >
                                                    {isLoading ? 'Updating...' : (task.status === 'rejected' || task.rejected) ? 'Resubmit' : 'Complete'}
                                                </button>
                                            </>
                                        )}
                                        {task.status === 'pending-verification' && (
                                            <div className="table-status-message">
                                                Awaiting Admin Verification
                                            </div>
                                        )}
                                        {task.status === 'completed' && !task.rejected && task.lastUpdated && (
                                            <div className="table-status-message">
                                                <CheckCircle size={16} /> Completed at {new Date(task.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };


    const handleClockIn = async () => {
        setShowCheckInSummary(true);
    };

    const submitCheckInSummary = async () => {
        const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));
        if (!currentEmployee || !checkInSummary) return;

        setIsLoading(true);
        try {
            const now = new Date();
            const clockInData = {
                employeeId: currentEmployee.employeeId,
                employeeName: currentEmployee.name,
                date: now.toISOString().split('T')[0],
                clockIn: now.toISOString(),
                status: 'active',
                checkInSummary: checkInSummary
            };

            const attendanceRef = ref(database, `attendance/${currentEmployee.employeeId}/current`);
            await set(attendanceRef, clockInData);
            const historyRef = ref(database, `attendance/${currentEmployee.employeeId}/history`);
            await push(historyRef, clockInData);

            setAttendanceStatus('in');
            setCurrentShift(clockInData);
            setShowCheckInSummary(false);
            setCheckInSummary('');
        } catch (error) {
            console.error('Error clocking in:', error);
            alert('Failed to clock in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (attendanceStatus === 'out') {
            alert('Please check in first before checking out.');
            return;
        }
        setShowCheckOutSummary(true);
    };

    const submitCheckOutSummary = async () => {
        const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));
        if (!currentEmployee || !currentShift || !checkOutSummary) return;

        setIsLoading(true);
        try {
            const now = new Date();
            const clockOutTime = now.toISOString();
            const duration = (new Date(clockOutTime) - new Date(currentShift.clockIn)) / (1000 * 60 * 60);

            const historyRef = ref(database, `attendance/${currentEmployee.employeeId}/history`);
            const snapshot = await get(historyRef);

            if (snapshot.exists()) {
                const histories = Object.entries(snapshot.val());
                const activeEntry = histories.find(([_, record]) =>
                    record.status === 'active' && record.clockIn === currentShift.clockIn
                );

                if (activeEntry) {
                    const [activeKey] = activeEntry;
                    await update(ref(database, `attendance/${currentEmployee.employeeId}/history/${activeKey}`), {
                        clockOut: clockOutTime,
                        duration: duration.toFixed(2),
                        status: 'completed',
                        checkOutSummary: checkOutSummary
                    });
                }
            }

            const attendanceRef = ref(database, `attendance/${currentEmployee.employeeId}/current`);
            await set(attendanceRef, null);
            setAttendanceStatus('out');
            setCurrentShift(null);
            setShowCheckOutSummary(false);
            setCheckOutSummary('');
        } catch (error) {
            console.error('Error clocking out:', error);
            alert('Failed to clock out. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = () => {
        const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));
        if (currentEmployee) {
            const attendanceRef = ref(database, `attendance/${currentEmployee.employeeId}/current`);
            set(attendanceRef, null);
        }
        sessionStorage.removeItem('currentEmployee');
        navigate('/');
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" />
                <p>Loading your projects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={handleSignOut}>Back to Login</button>
            </div>
        );
    }

    const getSortedAssignments = (project) => {
        if (!project.assignments || !Array.isArray(project.assignments)) {
            return [];
        }
        return [...project.assignments]
            .filter(assignment => assignment && assignment.assignee)
            .sort((a, b) => {
                const orderA = parseInt(a.taskOrder) || Number.MAX_SAFE_INTEGER;
                const orderB = parseInt(b.taskOrder) || Number.MAX_SAFE_INTEGER;
                return orderA - orderB;
            });
    };

    const AttendanceHistoryView = () => (
        <div className="history-page">
            <div className="history-header">
                <button className="back-button" onClick={() => setShowHistory(false)}>
                    Back to Dashboard
                </button>
                <h2>Attendance History</h2>
            </div>
            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Duration (hrs)</th>
                            <th>Check-In Summary</th>
                            <th>Check-Out Summary</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceHistory.map((record) => (
                            <tr key={record.id}>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>{new Date(record.clockIn).toLocaleTimeString()}</td>
                                <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-'}</td>
                                <td>{record.duration || '-'}</td>
                                <td>{record.checkInSummary || '-'}</td>
                                <td>{record.checkOutSummary || '-'}</td>
                                <td><span className={`status-badge ${record.status}`}>{record.status}</span></td>
                            </tr>
                        ))}
                        {attendanceHistory.length === 0 && (
                            <tr>
                                <td colSpan="7" className="no-records">No attendance records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAttendanceSection = () => (
        <div className="attendance-section">
            <div className="attendance-header">
                <div className="attendance-info">
                    <h2>Attendance Tracking</h2>
                    <div className="current-status">
                        <Clock className="clock-icon" />
                        <span>Current Status:</span>
                        <span className={`checkIn-Out ${attendanceStatus === 'in' ? 'checked-in' : 'checked-out'}`}>
                            {attendanceStatus === 'in' ? 'Checked In' : 'Checked Out'}
                        </span>
                    </div>
                </div>
                <button className="view-history-button" onClick={() => setShowHistory(true)}>
                    <History size={20} />
                    View History
                </button>
            </div>
            <div className="attendance-actions">
                {attendanceStatus === 'out' ? (
                    <button
                        onClick={handleClockIn}
                        disabled={isLoading}
                        className="clock-button clock-in"
                    >
                        {isLoading ? <Loader2 className="spinner" /> : <CheckCircle />}
                        Check In
                    </button>
                ) : (
                    <button
                        onClick={handleClockOut}
                        disabled={isLoading}
                        className="clock-button clock-out"
                    >
                        {isLoading ? <Loader2 className="spinner" /> : <XCircle />}
                        Check Out
                    </button>
                )}
            </div>
        </div>
    );

    const renderSummaryModal = () => {
        if (showCheckInSummary) {
            return (
                <div className="summary-modal">
                    <div className="summary-content">
                        <h3>Check-In Task Summary</h3>
                        <textarea
                            value={checkInSummary}
                            onChange={(e) => setCheckInSummary(e.target.value)}
                            placeholder="Enter your tasks/goals for this shift..."
                            rows={5}
                            className="summary-textarea"
                        />
                        <div className="summary-buttons">
                            <button
                                onClick={submitCheckInSummary}
                                disabled={isLoading || !checkInSummary}
                                className="submit-summary-btn"
                            >
                                {isLoading ? <Loader2 className="spinner" /> : 'Submit'}
                            </button>
                            <button
                                onClick={() => setShowCheckInSummary(false)}
                                className="cancel-summary-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (showCheckOutSummary) {
            return (
                <div className="summary-modal">
                    <div className="summary-content">
                        <h3>Check-Out Work Summary</h3>
                        <textarea
                            value={checkOutSummary}
                            onChange={(e) => setCheckOutSummary(e.target.value)}
                            placeholder="Enter what you accomplished during this shift..."
                            rows={5}
                            className="summary-textarea"
                        />
                        <div className="summary-buttons">
                            <button
                                onClick={submitCheckOutSummary}
                                disabled={isLoading || !checkOutSummary}
                                className="submit-summary-btn"
                            >
                                {isLoading ? <Loader2 className="spinner" /> : 'Submit'}
                            </button>
                            <button
                                onClick={() => setShowCheckOutSummary(false)}
                                className="cancel-summary-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderProjectRow = (project) => (
        <tr key={project.id}>
            <td>{project.id}</td>
            <td className="employee-assignees-cell">
                {getSortedAssignments(project).map((assignment, index) => (
                    <div
                        key={index}
                        className={`assignee-row ${assignment.assignee.toLowerCase() === employeeName.toLowerCase() ? 'current-employee' : ''}`}
                    >
                        <span className="task-order">
                            {assignment.taskOrder ? (
                                assignment.taskOrder === '1' ? '1st Task: ' :
                                    assignment.taskOrder === '2' ? '2nd Task: ' :
                                        assignment.taskOrder === '3' ? '3rd Task: ' :
                                            `${assignment.taskOrder}th Task: `
                            ) : ''}
                        </span>
                        <span className="assignee-name">{assignment.assignee}</span>
                        {assignment.percentage && (
                            <span className="assignee-percentage">({assignment.percentage}%)</span>
                        )}
                    </div>
                ))}
            </td>
            <td>{project.ProjectType || project.projectType || 'N/A'}</td>
            <td>{formatDate(project.timeline)}</td>
            <td>
                {project.employeeAssignments.length > 0 ? (
                    project.employeeAssignments.map((assignment) => (
                        <textarea key={assignment.index} readOnly>{assignment.description}</textarea>
                    ))
                ) : 'N/A'}
            </td>
            <td>
                {project.employeeAssignments.map((assignment) => (
                    <div key={assignment.index} className="work-status-section">
                        {assignment.taskCompleted === 'Rejected' || assignment.rejected ? (
                            <div className="rejected-status">
                                <div className="status-text">
                                    <span className="rejection-badge">⚠️</span>
                                    <span>Status: Rejected by Admin</span>
                                </div>
                                {(assignment.rejectionReason || assignment.rejectionTimestamp) && (
                                    <div className="rejection-details">
                                        {assignment.rejectionReason && (
                                            <div className="rejection-reason">
                                                Reason: {assignment.rejectionReason}
                                            </div>
                                        )}
                                        {assignment.rejectionTimestamp && (
                                            <div className="rejection-time">
                                                Rejected on: {new Date(assignment.rejectionTimestamp).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <textarea
                                    placeholder="Enter updated work details to resubmit..."
                                    value={workStatusUpdates[`${project.id}-${assignment.index}`] || ''}
                                    onChange={(e) => setWorkStatusUpdates(prev => ({
                                        ...prev,
                                        [`${project.id}-${assignment.index}`]: e.target.value
                                    }))}
                                    rows={3}
                                    className="work-status-textarea"
                                />
                                <button
                                    onClick={() => handleSaveWorkStatus(project.id, assignment.index)}
                                    className="save-status-btn resubmit-btn"
                                    disabled={isLoading || !workStatusUpdates[`${project.id}-${assignment.index}`]}
                                >
                                    {isLoading ? 'Saving...' : 'Resubmit Work'}
                                </button>
                            </div>
                        ) : assignment.taskCompleted ? (
                            <div className="completed-status">
                                <div className="status-text">
                                    <span className="completion-badge">
                                        {assignment.taskCompleted.includes('Pending Verification') ? '⏳' : '✓'}
                                    </span>
                                    Status: {assignment.taskCompleted}
                                </div>
                                <div className="completion-info">
                                    Updated on: {assignment.completedTimestamp
                                        ? new Date(assignment.completedTimestamp).toLocaleString()
                                        : formatDate(new Date())}
                                </div>
                            </div>
                        ) : (
                            <>
                                <textarea
                                    placeholder="Enter work completed details..."
                                    value={workStatusUpdates[`${project.id}-${assignment.index}`] || ''}
                                    onChange={(e) => setWorkStatusUpdates(prev => ({
                                        ...prev,
                                        [`${project.id}-${assignment.index}`]: e.target.value
                                    }))}
                                    rows={3}
                                    className="work-status-textarea"
                                />
                                <button
                                    onClick={() => handleSaveWorkStatus(project.id, assignment.index)}
                                    className="save-status-btn"
                                    disabled={isLoading || !workStatusUpdates[`${project.id}-${assignment.index}`]}
                                >
                                    {isLoading ? 'Saving...' : 'Mark Complete'}
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </td>
        </tr>
    );
    return (
        <div className="employee-dashboard-container">
            {showHistory ? (
                <AttendanceHistoryView />
            ) : (
                <>
                    <div className="dashboard-header">
                        <h1>Welcome, {employeeName}</h1>
                        <button onClick={handleSignOut} className="signout-button">Sign Out</button>
                    </div>
                    {renderAttendanceSection()}
                    {renderSummaryModal()}
                    <TodayTaskDisplay />
                    <div className="assigned-projects-section">
                        <h2>Your Assigned Projects</h2>
                        {assignedProjects.length === 0 ? (
                            <div className="no-projects-message">
                                No projects have been assigned to you yet.
                            </div>
                        ) : (
                            <div className="projects-table-container">
                                <table className="projects-table">
                                    <thead>
                                        <tr>
                                            <th>Project ID</th>
                                            <th>Assigned To</th>
                                            <th>Project Type</th>
                                            <th>Timeline</th>
                                            <th>Project Description</th>
                                            <th>Project Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedProjects.map(renderProjectRow)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default EmployeePanel;