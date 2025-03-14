import { useState, useEffect } from 'react';
import { database, auth } from '../../firebase';
import { ref, onValue, update, remove, getDatabase, push, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
    Loader2, Pencil, Trash2, X, Bell, Eye, ArrowUpDown,
    ArrowUp, ArrowDown, FileText, Clock, CheckCircle
} from "lucide-react";
import './AdminProfile.css';
import ProtectedPayments from '../ProtectedPayments/ProtectedPayments';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import SidebarNav from './Sidebar';
import AdminPanel from '../AdminPanel/Adminpanel';
import PDFViewer from '../PDFviewer/PDFviewer';
import EmployeeManagement from '../EmployeeManagement/EmployeeManagement';
import Invoice from '../InVoice/InVoice';

// Custom hooks to separate concerns
const useAuth = (navigate) => {
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/');
            }
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return { authChecked, handleSignOut };
};

const useProjects = (authChecked) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authChecked || !auth.currentUser) {
            setLoading(false);
            return () => { };
        }

        const projectsRef = ref(database, 'projects');

        const unsubscribe = onValue(projectsRef, (snapshot) => {
            try {
                if (snapshot.exists()) {
                    const projectsData = [];
                    snapshot.forEach((childSnapshot) => {
                        const project = childSnapshot.val();
                        const assignments = Array.isArray(project.assignments) ? project.assignments : [];

                        projectsData.push({
                            id: childSnapshot.key,
                            ...project,
                            assignments
                        });
                    });

                    projectsData.sort((a, b) => {
                        const dateA = a.timeline ? new Date(a.timeline) : new Date(0);
                        const dateB = b.timeline ? new Date(b.timeline) : new Date(0);
                        return dateB - dateA;
                    });

                    setProjects(projectsData);
                } else {
                    setProjects([]);
                }
            } catch (error) {
                console.error('Error processing projects:', error);
                setError('Error loading projects');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [authChecked]);

    return { projects, loading, error, setError };
};

const useQueries = () => {
    const [queries, setQueries] = useState([]);
    const [queriesCount, setQueriesCount] = useState(0);

    useEffect(() => {
        const queriesRef = ref(database, 'queries');

        const unsubscribe = onValue(queriesRef, (snapshot) => {
            if (snapshot.exists()) {
                const allQueries = [];
                let totalPendingCount = 0;

                snapshot.forEach((keySnapshot) => {
                    const dynamicKey = keySnapshot.key;
                    keySnapshot.forEach((querySnapshot) => {
                        const queryData = querySnapshot.val();
                        if (queryData.status === 'pending') {
                            totalPendingCount++;
                            allQueries.push({
                                id: querySnapshot.key,
                                parentKey: dynamicKey,
                                queryText: queryData.queryText,
                                status: queryData.status,
                                timestamp: queryData.timestamp,
                                queryType: queryData.queryType,
                            });
                        }
                    });
                });

                setQueries(allQueries);
                setQueriesCount(totalPendingCount);
            } else {
                setQueries([]);
                setQueriesCount(0);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleQueryAction = (query, action) => {
        const database = getDatabase();

        if (action === 'accepted') {
            const projectRef = ref(database, `Accepted_Queries/${query.parentKey}`);
            const newAcceptedQuery = {
                queryStatus: 'Your query has been accepted and will be addressed soon.',
                queryText: query.queryText,
                timestamp: new Date().toISOString(),
                queryType: query.queryType
            };

            push(projectRef, newAcceptedQuery)
                .then(() => {
                    const queryRef = ref(database, `queries/${query.parentKey}/${query.id}`);
                    return remove(queryRef);
                })
                .catch(error => console.error('Acceptance error:', error));
        } else if (action === 'rejected') {
            const queryRef = ref(database, `queries/${query.parentKey}/${query.id}`);
            remove(queryRef)
                .catch(error => console.error('Rejection error:', error));
        }
    };

    return { queries, queriesCount, handleQueryAction };
};
const handleTaskVerification = async (taskId, projectId, employeeName, action) => {
    try {
        const now = new Date().toISOString();
        const taskRef = ref(database, `scheduledTasks/${taskId}`);
        const taskSnapshot = await get(taskRef);

        if (!taskSnapshot.exists()) {
            throw new Error('Task not found');
        }

        const taskData = taskSnapshot.val();

        if (action === 'verify') {
            const updatedTask = {
                ...taskData,
                status: 'completed',
                verifiedBy: 'Admin',
                verifiedAt: now,
                lastUpdated: now
            };

            await update(taskRef, updatedTask);

            // Update project assignment if applicable
            if (projectId) {
                const projectRef = ref(database, `projects/${projectId}`);
                const projectSnapshot = await get(projectRef);
                if (projectSnapshot.exists()) {
                    const projectData = projectSnapshot.val();
                    const updatedAssignments = projectData.assignments.map(assignment => {
                        if (assignment.assignee === employeeName && assignment.todayTask?.taskId === taskId) {
                            return {
                                ...assignment,
                                taskCompleted: 'Complete',
                                todayTask: {
                                    ...assignment.todayTask,
                                    status: 'completed',
                                    lastUpdated: now
                                }
                            };
                        }
                        return assignment;
                    });
                    await update(projectRef, { assignments: updatedAssignments });
                }
            }

            alert('Task verified and marked as completed!');
        } else if (action === 'reject') {
            const updatedTask = {
                ...taskData,
                status: 'in-progress', // Revert to in-progress or pending if rejected
                completionRequest: null,
                lastUpdated: now
            };
            await update(taskRef, updatedTask);
            alert('Task completion rejected. Employee must continue work.');
        }
    } catch (error) {
        console.error('Error verifying task:', error);
        alert('Failed to verify task. Please try again.');
    }
};
const useEmployees = (authChecked) => {
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);
    const [attendanceHistory, setAttendanceHistory] = useState({});
    const [scheduledTasks, setScheduledTasks] = useState([]);

    useEffect(() => {
        if (!authChecked) return () => { };

        const db = getDatabase();
        const employeesRef = ref(db, 'employeesList/employees');

        const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
            if (snapshot.exists()) {
                const employeeData = [];
                snapshot.forEach((childSnapshot) => {
                    const employee = childSnapshot.val();
                    employeeData.push({
                        id: employee.employeeId,
                        name: employee.name
                    });
                });
                setEmployees(employeeData);

                const attendanceData = {};
                employeeData.forEach(employee => {
                    const currentRef = ref(db, `attendance/${employee.id}/current`);
                    const historyRef = ref(db, `attendance/${employee.id}/history`);
                    const todayTaskRef = ref(db, `attendance/${employee.id}/todayTask`);

                    onValue(currentRef, (currentSnapshot) => {
                        if (currentSnapshot.exists()) {
                            attendanceData[employee.id] = {
                                ...attendanceData[employee.id],
                                current: currentSnapshot.val()
                            };
                        } else {
                            attendanceData[employee.id] = {
                                ...attendanceData[employee.id],
                                current: null
                            };
                        }
                        setAttendanceHistory({ ...attendanceData });
                    }, { onlyOnce: false });

                    onValue(historyRef, (historySnapshot) => {
                        if (historySnapshot.exists()) {
                            const history = Object.entries(historySnapshot.val()).map(([key, value]) => ({
                                id: key,
                                ...value,
                                employeeId: employee.id,
                                employeeName: employee.name
                            }));
                            history.sort((a, b) => new Date(b.date) - new Date(a.date));
                            attendanceData[employee.id] = {
                                ...attendanceData[employee.id],
                                history: history
                            };
                        } else {
                            attendanceData[employee.id] = {
                                ...attendanceData[employee.id],
                                history: []
                            };
                        }
                        setAttendanceHistory({ ...attendanceData });
                    }, { onlyOnce: false });

                    onValue(todayTaskRef, (taskSnapshot) => {
                        if (taskSnapshot.exists()) {
                            attendanceData[employee.id] = {
                                ...attendanceData[employee.id],
                                todayTask: taskSnapshot.val()
                            };
                        } else {
                            attendanceData[employee.id] = {
                                ...attendanceData[employee.id],
                                todayTask: null
                            };
                        }
                        setAttendanceHistory({ ...attendanceData });
                    }, { onlyOnce: false });
                });
            }
            setEmployeesLoading(false);
        });

        // Fetch Scheduled Tasks
        const scheduledTasksRef = ref(db, 'scheduledTasks');
        const unsubscribeTasks = onValue(scheduledTasksRef, (snapshot) => {
            if (snapshot.exists()) {
                const tasksData = [];
                snapshot.forEach((childSnapshot) => {
                    const task = childSnapshot.val();
                    tasksData.push({
                        id: childSnapshot.key,
                        ...task,
                    });
                });
                setScheduledTasks(tasksData);
            } else {
                setScheduledTasks([]);
            }
        });

        return () => {
            unsubscribeEmployees();
            unsubscribeTasks();
        };
    }, [authChecked]);

    return { employees, employeesLoading, attendanceHistory, scheduledTasks };
};

// Utility components
const AssignmentRow = ({ assignment, index, totalAssignments, employees, employeesLoading, updateAssignment, removeAssignment }) => (
    <div className={`assignment-row ${assignment.taskOrder ? 'has-order' : ''}`}>
        {assignment.taskCompleted && (
            <div className="task-completed-display">
                <strong>Task Status:</strong> {assignment.taskCompleted}
            </div>
        )}
        <div className="assignment-inputs">
            <div className="assignment-main-inputs">
                <select
                    value={assignment.assignee || ''}
                    onChange={(e) => updateAssignment(index, 'assignee', e.target.value)}
                    className="assignee-input"
                    disabled={employeesLoading}
                >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.name}>
                            {employee.name}
                        </option>
                    ))}
                </select>

                {assignment.assignee && (
                    <select
                        value={assignment.taskOrder || ''}
                        onChange={(e) => updateAssignment(index, 'taskOrder', e.target.value)}
                        className={`task-order-select ${!assignment.taskOrder ? 'required' : ''}`}
                    >
                        <option value="">Select Task Order *</option>
                        {[...Array(totalAssignments)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i === 0 ? '1st - Do First' :
                                    i === 1 ? '2nd - Do Second' :
                                        i === 2 ? '3rd - Do Third' :
                                            `${i + 1}th - Do ${i + 1}th`}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <textarea
                placeholder="Task description"
                value={assignment.description || ''}
                onChange={(e) => updateAssignment(index, 'description', e.target.value)}
                className="description-input"
                rows="3"
            />

            <div className="task-info">
                <div className="percentage-display">
                    Percentage: {assignment.percentage}%
                </div>
                {assignment.taskOrder && (
                    <div className="order-display">
                        Task Order: #{assignment.taskOrder}
                    </div>
                )}
            </div>

            {index > 0 && (
                <button
                    type="button"
                    onClick={() => removeAssignment(index)}
                    className="remove-assignment-btn"
                >
                    Remove
                </button>
            )}
        </div>
    </div>
);

// Main component
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { authChecked, handleSignOut } = useAuth(navigate);
    const { projects, loading, error, setError } = useProjects(authChecked);
    const { queries, queriesCount, handleQueryAction } = useQueries();
    const { employees, employeesLoading, attendanceHistory, scheduledTasks } = useEmployees(authChecked);

    // UI state
    const [activeTab, setActiveTab] = useState('profile');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterField, setFilterField] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showQueriesModal, setShowQueriesModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [editableQueryText, setEditableQueryText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceProject, setSelectedInvoiceProject] = useState(null);

    // Tasks state
    const [viewingPDF, setViewingPDF] = useState({ show: false, url: null, projectId: null });
    const [detailsModal, setDetailsModal] = useState({ show: false, assignment: null });
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [todayTask, setTodayTask] = useState('');
    const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState('');
    const [taskScheduleType, setTaskScheduleType] = useState('today');
    const [taskScheduleDate, setTaskScheduleDate] = useState('');
    const [taskScheduleWeek, setTaskScheduleWeek] = useState('');
    const [taskScheduleMonth, setTaskScheduleMonth] = useState('');

    // Constants
    const projectStatuses = ['Start', 'PartiallyComplete', 'Complete'];

    // Event handlers
    const handleEdit = (project) => {
        setEditingProject({ ...project });
        setShowEditModal(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!editingProject?.id) return;

        try {
            const projectRef = ref(database, `projects/${editingProject.id}`);
            const updateData = { ...editingProject };
            delete updateData.id;
            await update(projectRef, updateData);
            setShowEditModal(false);
            setEditingProject(null);
        } catch (error) {
            console.error('Error updating project:', error);
            setError('Failed to update project');
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const projectRef = ref(database, `projects/${projectId}`);
                await remove(projectRef);
            } catch (error) {
                console.error('Error deleting project:', error);
                setError('Failed to delete project');
            }
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterField('all');
    };

    const handleSendEditedQuery = (query) => {
        if (editableQueryText.trim()) {
            const database = getDatabase();
            const projectRef = ref(database, `Accepted_Queries/${query.parentKey}`);

            update(projectRef, {
                queryStatus: 'Your query has been reviewed and updated.',
                queryText: query.queryText,
            })
                .then(() => {
                    const oldQueryRef = ref(database, `queries/${query.parentKey}/${query.id}`);
                    return remove(oldQueryRef);
                })
                .then(() => {
                    const newQueryRef = ref(database, `queries/${query.parentKey}`);
                    return push(newQueryRef, {
                        queryText: editableQueryText,
                        timestamp: new Date().toISOString(),
                        status: 'pending'
                    });
                })
                .then(() => {
                    setIsEditing(false);
                    setShowQueriesModal(false);
                })
                .catch(error => console.error('Edit and send error:', error));
        }
    };

    const assignTodayTask = async () => {
        if (!selectedEmployeeForTask || !todayTask.trim()) {
            alert('Please select an employee and enter a task.');
            return;
        }

        try {
            const selectedEmployeeData = employees.find(emp => emp.name === selectedEmployeeForTask);
            if (!selectedEmployeeData) {
                alert('Employee not found.');
                return;
            }

            const employeeId = selectedEmployeeData.id;
            const db = getDatabase();
            const todayDate = new Date().toISOString().split('T')[0];

            let scheduleDetails = {};
            if (taskScheduleType === 'today') {
                scheduleDetails = { date: todayDate, type: 'daily' };
            } else if (taskScheduleType === 'date') {
                if (!taskScheduleDate) {
                    alert('Please select a date for the task.');
                    return;
                }
                scheduleDetails = { date: taskScheduleDate, type: 'daily' };
            } else if (taskScheduleType === 'week') {
                if (!taskScheduleWeek) {
                    alert('Please select a week for the task.');
                    return;
                }
                const [year, week] = taskScheduleWeek.split('-W');
                const startDate = new Date(year, 0, 1 + (week - 1) * 7);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                scheduleDetails = {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    type: 'weekly',
                };
            } else if (taskScheduleType === 'month') {
                if (!taskScheduleMonth) {
                    alert('Please select a month for the task.');
                    return;
                }
                const [year, month] = taskScheduleMonth.split('-');
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                scheduleDetails = {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    type: 'monthly',
                };
            }

            const employeeProjects = projects.filter(project =>
                project.assignments?.some(assignment => assignment.assignee === selectedEmployeeForTask)
            );

            if (employeeProjects.length === 0 && taskScheduleType === 'today') {
                alert('No projects assigned to this employee for todays task.');
                return;
            }

            const taskData = {
                task: todayTask,
                assignedOn: new Date().toISOString(),
                assignedBy: 'Admin',
                status: 'pending',
                employeeId,
                employeeName: selectedEmployeeForTask,
                ...scheduleDetails,
            };

            const scheduledTasksRef = ref(db, 'scheduledTasks');
            const newTaskRef = await push(scheduledTasksRef, taskData);

            if (taskScheduleType === 'today') {
                for (const project of employeeProjects) {
                    const assignments = [...project.assignments];
                    for (let i = 0; i < assignments.length; i++) {
                        if (assignments[i].assignee === selectedEmployeeForTask) {
                            assignments[i] = {
                                ...assignments[i],
                                todayTask: {
                                    task: todayTask,
                                    assignedOn: new Date().toISOString(),
                                    status: 'pending',
                                    date: todayDate,
                                    taskId: newTaskRef.key,
                                },
                            };
                        }
                    }
                    const projectRef = ref(db, `projects/${project.id}`);
                    await update(projectRef, { assignments });
                }

                await update(ref(db, `attendance/${employeeId}/todayTask`), {
                    task: todayTask,
                    assignedOn: new Date().toISOString(),
                    assignedBy: 'Admin',
                    status: 'pending',
                    date: todayDate,
                    taskId: newTaskRef.key,
                });
            }

            alert(`Task assigned to ${selectedEmployeeForTask} successfully!`);
            setTodayTask('');
            setSelectedEmployeeForTask('');
            setTaskScheduleDate('');
            setTaskScheduleWeek('');
            setTaskScheduleMonth('');
        } catch (error) {
            console.error('Error assigning task:', error);
            alert('Failed to assign task. Please try again.');
        }
    };

    const handleViewPDF = async (projectId) => {
        try {
            const storage = getStorage();
            const pdfRef = storageRef(storage, `quotations/${projectId}.pdf`);
            const url = await getDownloadURL(pdfRef);
            setViewingPDF({
                show: true,
                url: url,
                projectId: projectId
            });
        } catch (error) {
            console.error('Error viewing PDF:', error);
            alert('Error viewing PDF. Please try again.');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== 'new') {
            setShowAdminPanel(false);
        }
    };

    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getReadyCount = () => projects.filter(p => p.projectStatus === 'Complete').length;
    const getInProgressCount = () => projects.filter(p => p.projectStatus === 'PartiallyComplete').length;
    const getNearbyCount = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return projects.filter(project => {
            if (!project.timeline) return false;
            const projectDate = new Date(project.timeline);
            projectDate.setHours(0, 0, 0, 0);
            const timeDifference = Math.floor((projectDate - today) / (1000 * 3600 * 24));
            return timeDifference >= 0 && timeDifference <= 10;
        }).length;
    };

    const getTodayTasks = () => {
        const todayTasksData = [];
        const today = new Date().toISOString().split('T')[0];

        employees.forEach(employee => {
            const employeeAttendance = attendanceHistory[employee.id] || {};

            const employeeProjects = projects.filter(project =>
                project.assignments?.some(assignment =>
                    assignment.assignee === employee.name &&
                    assignment.todayTask &&
                    assignment.todayTask.date === today
                )
            );

            if (employeeProjects.length > 0) {
                const project = employeeProjects[0];
                const assignment = project.assignments.find(a =>
                    a.assignee === employee.name && a.todayTask && a.todayTask.date === today
                );

                if (assignment && assignment.todayTask) {
                    todayTasksData.push({
                        employeeId: employee.id,
                        employeeName: employee.name,
                        task: assignment.todayTask.task,
                        status: assignment.todayTask.status || 'pending',
                        assignedOn: assignment.todayTask.assignedOn,
                        lastUpdated: assignment.todayTask.lastUpdated,
                        projectId: project.id,
                        projectTitle: project.title || project.projectId,
                        taskId: assignment.todayTask.taskId,
                    });
                }
            } else if (
                employeeAttendance.todayTask &&
                employeeAttendance.todayTask.date === today
            ) {
                todayTasksData.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    task: employeeAttendance.todayTask.task,
                    status: employeeAttendance.todayTask.status || 'pending',
                    assignedOn: employeeAttendance.todayTask.assignedOn,
                    lastUpdated: employeeAttendance.todayTask.lastUpdated,
                    projectId: 'N/A',
                    projectTitle: 'General Task',
                    taskId: employeeAttendance.todayTask.taskId,
                });
            }
        });

        scheduledTasks.forEach(task => {
            if (
                (task.type === 'daily' && task.date === today) ||
                (task.type === 'weekly' && task.startDate <= today && task.endDate >= today) ||
                (task.type === 'monthly' && task.startDate <= today && task.endDate >= today)
            ) {
                todayTasksData.push({
                    employeeId: task.employeeId,
                    employeeName: task.employeeName,
                    task: task.task,
                    status: task.status || 'pending',
                    assignedOn: task.assignedOn,
                    lastUpdated: task.lastUpdated,
                    projectId: 'Scheduled',
                    projectTitle: `Scheduled ${task.type} Task`,
                    taskId: task.id,
                });
            }
        });

        return todayTasksData;
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUpDown size={16} className="sort-icon" />;
        }
        return sortConfig.direction === 'asc' ?
            <ArrowUp size={16} className="sort-icon active" /> :
            <ArrowDown size={16} className="sort-icon active" />;
    };

    // Filter and sort projects
    const getFilteredProjects = () => {
        let filtered = projects.filter(project => {
            const searchLower = searchQuery.toLowerCase();

            if (filterField === 'referredBy' && searchLower) {
                return (
                    (project.referredBy && project.referredBy.toLowerCase().includes(searchLower)) ||
                    (project.clientName && project.clientName.toLowerCase() === searchLower)
                );
            }

            if (filterField === 'timeline') {
                const projectDate = project.timeline ? new Date(project.timeline) : null;
                if (!projectDate) return false;

                const dateFormats = [
                    projectDate.toLocaleDateString(),
                    projectDate.toLocaleDateString('en-GB'),
                    projectDate.toLocaleDateString('en-US'),
                    projectDate.toISOString().split('T')[0],
                ];

                return dateFormats.some(format => format.toLowerCase().includes(searchLower));
            }

            if (filterField !== 'all') {
                const fieldValue = String(project[filterField] || '').toLowerCase();
                return fieldValue.includes(searchLower);
            }

            const searchFields = [
                project.projectId,
                project.timestamp,
                project.clientName,
                project.title,
                project.collegeName,
                project.email,
                project.phoneNumber,
                project.whatsappNumber,
                project.referredBy,
                project.timeline ? new Date(project.timeline).toLocaleDateString() : ''
            ];

            return searchFields.some(field => String(field || '').toLowerCase().includes(searchLower));
        });

        filtered = filtered.filter(project => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (activeTab) {
                case 'ready':
                    return project.projectStatus === 'Complete';
                case 'progress':
                    return project.projectStatus === 'PartiallyComplete';
                case 'nearby': {
                    if (!project.timeline) return false;
                    const projectDate = new Date(project.timeline);
                    projectDate.setHours(0, 0, 0, 0);
                    const timeDifference = Math.floor((projectDate - today) / (1000 * 3600 * 24));
                    return timeDifference >= 0 && timeDifference <= 10;
                }
                case 'tasks':
                    return true;
                default:
                    return true;
            }
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (!aValue && !bValue) return 0;
                if (!aValue) return 1;
                if (!bValue) return -1;

                if (sortConfig.key === 'timeline' || sortConfig.key === 'timestamp') {
                    const dateA = new Date(aValue);
                    const dateB = new Date(bValue);
                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }

                return sortConfig.direction === 'asc' ?
                    aValue.toString().localeCompare(bValue.toString()) :
                    bValue.toString().localeCompare(aValue.toString());
            });
        }

        return filtered;
    };

    const filteredProjects = getFilteredProjects();

    // Render components
    const renderTableHeader = () => (
        <div className="table-header">
            <h2>
                {activeTab === 'new' ? 'Total Orders' :
                    activeTab === 'orders' ? 'Total Orders' :
                        activeTab === 'ready' ? 'Ready to Deliver' :
                            activeTab === 'progress' ? 'In Progress' :
                                'Nearby Submissions'}
            </h2>
            <div className="filters-container">
                <div className="search-controls">
                    <select
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Fields</option>
                        <option value="createdtime">Created Time</option>
                        <option value="projectId">Project ID</option>
                        <option value="clientName">Client Name</option>
                        <option value="collegeName">College</option>
                        <option value="title">Project Name</option>
                        <option value="email">Email</option>
                        <option value="phoneNumber">Phone</option>
                        <option value="referredBy">Referred By</option>
                        <option value="timeline">Timeline</option>
                    </select>

                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder={filterField === 'timeline'
                                ? "Search date (e.g., 08/02/2025)"
                                : filterField === 'referredBy'
                                    ? "Enter referrer name..."
                                    : "Search projects..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchQuery('')}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {searchQuery && (
                        <button
                            className="clear-filters"
                            onClick={handleClearFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>
            <div className='notification-record'>
                <div className="notification-icon">
                    <button onClick={() => setShowQueriesModal(true)} className="bell-button">
                        <Bell />
                        {queriesCount > 0 && <span className="notification-badge">{queriesCount}</span>}
                    </button>
                </div>
                <div className="record-count">
                    {filteredProjects.length} {filteredProjects.length === 1 ? 'Record' : 'Records'}
                </div>
            </div>
        </div>
    );

    const renderProjectsTable = () => (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('projectId')} className="sortable-header">
                            Project ID {getSortIcon('projectId')}
                        </th>
                        <th onClick={() => handleSort('timestamp')} className="sortable-header">
                            Created Time {getSortIcon('timestamp')}
                        </th>
                        <th onClick={() => handleSort('clientName')} className="sortable-header">
                            Client Name {getSortIcon('clientName')}
                        </th>
                        <th onClick={() => handleSort('title')} className="sortable-header">
                            Project Name {getSortIcon('title')}
                        </th>
                        <th onClick={() => handleSort('collegeName')} className="sortable-header">
                            College {getSortIcon('collegeName')}
                        </th>
                        <th onClick={() => handleSort('email')} className="sortable-header">
                            Email {getSortIcon('email')}
                        </th>
                        <th onClick={() => handleSort('phoneNumber')} className="sortable-header">
                            Phone Number {getSortIcon('phoneNumber')}
                        </th>
                        <th onClick={() => handleSort('whatsappNumber')} className="sortable-header">
                            WhatsApp Number {getSortIcon('whatsappNumber')}
                        </th>
                        <th onClick={() => handleSort('referredBy')} className="sortable-header">
                            Referred By {getSortIcon('referredBy')}
                        </th>
                        <th onClick={() => handleSort('timeline')} className="sortable-header">
                            Timeline {getSortIcon('timeline')}
                        </th>
                        <th onClick={() => handleSort('projectStatus')} className="sortable-header">
                            Project Status {getSortIcon('projectStatus')}
                        </th>
                        <th onClick={() => handleSort('Assign_To')} className="sortable-header">
                            Assign To {getSortIcon('Assign_To')}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProjects.map((project) => (
                        <tr key={project.id}>
                            <td>{project.projectId}</td>
                            <td>{project.timestamp}</td>
                            <td className="truncate-cell" data-full-text={project.clientName}>{project.clientName}</td>
                            <td className="truncate-cell" data-full-text={project.title}>{project.title}</td>
                            <td className="truncate-cell" data-full-text={project.collegeName}>{project.collegeName}</td>
                            <td className="truncate-cell email-cell" data-full-text={project.email}>{project.email}</td>
                            <td>{project.phoneNumber}</td>
                            <td>{project.whatsappNumber}</td>
                            <td className="truncate-cell" data-full-text={project.referredBy}>{project.referredBy}</td>
                            <td>{project.timeline ? new Date(project.timeline).toLocaleDateString() : 'Not set'}</td>
                            <td>{project.projectStatus || 'Start'}</td>
                            <td className="assignee-cell">
                                {project.assignments && project.assignments.length > 0 ? (
                                    <div className="assignments-container">
                                        {[...project.assignments]
                                            .filter((assignment) => assignment.assignee && assignment.assignee.trim() !== '')
                                            .sort((a, b) => Number(a.taskOrder) - Number(b.taskOrder))
                                            .map((assignment, index) => (
                                                <div key={index} className={`assignment-badge ${assignment.taskCompleted?.toLowerCase().includes('complete') ? 'completed-assignment' : ''}`}>
                                                    <div className="assignment-summary">
                                                        <button
                                                            className="details-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDetailsModal({
                                                                    show: true,
                                                                    assignment: assignment
                                                                });
                                                            }}
                                                        >
                                                            {assignment.taskCompleted?.toLowerCase().includes('complete') && (
                                                                <span className="completion-checkmark">✓</span>
                                                            )}
                                                            {/* {assignment.taskCompleted?.includes('Pending Verification') && (
                                                                <span className="pending-verification">⏳</span>
                                                            )} */}
                                                            <span className="task-order">#{assignment.taskOrder}</span>
                                                            <span className="assignee-name">{assignment.assignee}</span>
                                                            <span className="percentage-badge">{assignment.percentage}%</span>
                                                            {assignment.taskCompleted?.includes('Pending Verification') && (
                                                                <span className="pending-verification">⏳</span>
                                                            )}
                                                            {/* {assignment.taskCompleted && (
                                                                <span className="task-status">
                                                                    {assignment.taskCompleted}
                                                                </span>
                                                            )} */}
                                                            <span className="details-icon">ⓘ</span>
                                                        </button>
                                                        {assignment.taskCompleted?.includes('Pending Verification') && (
                                                            <div className="verification-actions">
                                                                <button
                                                                    onClick={() => handleProjectAssignmentVerification(project.id, assignment, assignment.assignee, 'verify')}
                                                                    className="verify-btn"
                                                                >
                                                                    Verify
                                                                </button>
                                                                <button
                                                                    onClick={() => handleProjectAssignmentVerification(project.id, assignment, assignment.assignee, 'reject')}
                                                                    className="reject-btn"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : null}
                            </td>
                            <td className="actions-column">
                                <button onClick={() => handleEdit(project)} className="action-button edit" title="Edit project">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(project.id)} className="action-button delete" title="Delete project">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => handleViewPDF(project.projectId)} className="action-button view" title="View PDF">
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedInvoiceProject(project);
                                        setShowInvoiceModal(true);
                                    }}
                                    className="action-button invoice"
                                    title="Generate Invoice"
                                >
                                    <FileText size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );


   
    const handleProjectAssignmentVerification = async (projectId, assignment, employeeName, action) => {
        try {
            const now = new Date().toISOString();
            const projectRef = ref(database, `projects/${projectId}`);
            const projectSnapshot = await get(projectRef);

            if (!projectSnapshot.exists()) {
                throw new Error('Project not found');
            }

            const projectData = projectSnapshot.val();
            const updatedAssignments = projectData.assignments.map(a => {
                if (a.assignee === employeeName && a.taskOrder === assignment.taskOrder) {
                    if (action === 'verify') {
                        return {
                            ...a,
                            taskCompleted: 'Complete',
                            completedTimestamp: now,
                            completionRequest: null
                        };
                    } else if (action === 'reject') {
                        // Prompt for rejection reason
                        const rejectionReason = window.prompt("Please provide a reason for rejection:", "");

                        return {
                            ...a,
                            taskCompleted: 'Rejected',  // Clear indicator that it was rejected
                            completedTimestamp: null,
                            completionRequest: null,
                            rejected: true,  // Add explicit rejection flag
                            rejectionReason: rejectionReason || "No reason provided", // Store the reason
                            rejectionTimestamp: now
                        };
                    }
                }
                return a;
            });

            await update(projectRef, { assignments: updatedAssignments });

            // If this is a scheduled task, also update that record
            if (assignment.todayTask && assignment.todayTask.taskId) {
                const taskRef = ref(database, `scheduledTasks/${assignment.todayTask.taskId}`);
                const taskSnapshot = await get(taskRef);

                if (taskSnapshot.exists()) {
                    const taskData = taskSnapshot.val();

                    if (action === 'verify') {
                        await update(taskRef, {
                            status: 'completed',
                            verifiedBy: 'Admin',
                            verifiedAt: now,
                            lastUpdated: now
                        });
                    } else if (action === 'reject') {
                        await update(taskRef, {
                            status: 'rejected',
                            rejectedBy: 'Admin',
                            rejectedAt: now,
                            lastUpdated: now,
                            rejected: true,
                            rejectionReason: rejectionReason || "No reason provided"
                        });
                    }
                }
            }

            alert(action === 'verify'
                ? 'Assignment verified and marked as completed!'
                : 'Assignment has been rejected. Employee will be notified.');
        } catch (error) {
            console.error('Error verifying project assignment:', error);
            alert('Failed to verify assignment. Please try again.');
        }
    };

    const renderTasksTab = () => {
        const selectedEmployeeData = employees.find(emp => emp.name === selectedEmployee);
        let attendanceData = [];
        const todayTasks = getTodayTasks();
        const pendingVerificationTasks = scheduledTasks.filter(task => task.status === 'pending-verification');
        const pendingProjectAssignments = projects.flatMap(project =>
            project.assignments
                ?.filter(assignment => assignment.taskCompleted?.includes('Pending Verification') && assignment.completionRequest)
                .map(assignment => ({
                    projectId: project.id,
                    assignment,
                    employeeName: assignment.assignee
                })) || []
        );
        if (selectedEmployeeData) {
            const employeeId = selectedEmployeeData.id;
            const employeeAttendance = attendanceHistory[employeeId] || { current: null, history: [] };

            if (employeeAttendance.current) {
                attendanceData.push({
                    type: 'attendance',
                    employeeName: selectedEmployeeData.name,
                    date: employeeAttendance.current.date,
                    checkIn: employeeAttendance.current.clockIn,
                    checkOut: employeeAttendance.current.clockOut || '-',
                    duration: employeeAttendance.current.duration || '0.00',
                    status: employeeAttendance.current.status || 'active',
                    checkInSummary: employeeAttendance.current.checkInSummary || '-',
                    checkOutSummary: employeeAttendance.current.checkOutSummary || '-',
                    todayTask: employeeAttendance.todayTask || null
                });
            }

            (employeeAttendance.history || []).forEach(record => {
                attendanceData.push({
                    type: 'attendance',
                    employeeName: selectedEmployeeData.name,
                    date: record.date,
                    checkIn: record.clockIn,
                    checkOut: record.clockOut || '-',
                    duration: record.duration || '0.00',
                    status: record.status || 'completed',
                    checkInSummary: record.checkInSummary || '-',
                    checkOutSummary: record.checkOutSummary || '-',
                    todayTask: record.todayTask || null
                });
            });
        }

        attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
            <div className="attendance-history">
                <h2>Employee Tasks & Attendance</h2>

                <div className="today-task-section">
                    <h3>Assign New Task</h3>
                    <div className="task-assignment-form">
                        <select
                            value={selectedEmployeeForTask}
                            onChange={(e) => setSelectedEmployeeForTask(e.target.value)}
                            className="employee-select"
                        >
                            <option value="">Select Employee</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.name}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>

                        <textarea
                            placeholder="Enter task details..."
                            value={todayTask}
                            onChange={(e) => setTodayTask(e.target.value)}
                            className="task-input"
                            rows="3"
                        />

                        <div className="schedule-options">
                            <label>Schedule Type:</label>
                            <select
                                value={taskScheduleType}
                                onChange={(e) => setTaskScheduleType(e.target.value)}
                            >
                                <option value="today">Today</option>
                                <option value="date">Specific Date</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                            </select>

                            {taskScheduleType === 'date' && (
                                <input
                                    type="date"
                                    value={taskScheduleDate}
                                    onChange={(e) => setTaskScheduleDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            )}
                            {taskScheduleType === 'week' && (
                                <input
                                    type="week"
                                    value={taskScheduleWeek}
                                    onChange={(e) => setTaskScheduleWeek(e.target.value)}
                                />
                            )}
                            {taskScheduleType === 'month' && (
                                <input
                                    type="month"
                                    value={taskScheduleMonth}
                                    onChange={(e) => setTaskScheduleMonth(e.target.value)}
                                />
                            )}
                        </div>

                        <button onClick={assignTodayTask} className="assign-task-btn">
                            Assign Task
                        </button>
                    </div>
                </div>

                <div className="today-tasks-overview">
                    <h3>Today's Tasks Overview</h3>
                    <div className="tasks-cards-container">
                        {getTodayTasks().length > 0 ? (
                            getTodayTasks().map((taskData, index) => (
                                <div key={index} className={`task-card ${taskData.status}`}>
                                    <div className="task-card-header">
                                        <h4>{taskData.employeeName}</h4>
                                        <span className={`status-badge ${taskData.status}`}>
                                            {taskData.status === 'pending'
                                                ? 'Not Started'
                                                : taskData.status === 'in-progress'
                                                    ? 'In Progress'
                                                    : 'Completed'}
                                        </span>
                                    </div>
                                    <div className="task-card-content">
                                        <p>{taskData.task}</p>
                                        <div className="status-timeline">
                                            <div className="timeline-item">
                                                <div className="timeline-icon assigned">📋</div>
                                                <div className="timeline-content">
                                                    <div className="timeline-title">Assigned</div>
                                                    <div className="timeline-time">
                                                        {new Date(taskData.assignedOn).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {taskData.status !== 'pending' && (
                                                <div className="timeline-item">
                                                    <div className="timeline-icon started">▶️</div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-title">Started</div>
                                                        <div className="timeline-time">
                                                            {taskData.startedOn
                                                                ? new Date(taskData.startedOn).toLocaleTimeString()
                                                                : new Date(taskData.lastUpdated || taskData.assignedOn).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {taskData.status === 'completed' && (
                                                <div className="timeline-item">
                                                    <div className="timeline-icon completed">✓</div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-title">Completed</div>
                                                        <div className="timeline-time">
                                                            {new Date(taskData.lastUpdated).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="task-card-footer">
                                        <div className="task-meta">
                                            <div>
                                                <small>Project:</small> {taskData.projectTitle || taskData.projectId}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-tasks-message">No tasks assigned for today.</div>
                        )}
                    </div>
                </div>
                <div className="pending-verification-section">
                    <h3>Tasks Pending Verification</h3>
                    <table className="pending-tasks-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Task</th>
                                <th>Requested At</th>
                                <th>Note</th>
                                {/* <th>Project ID</th> */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingVerificationTasks.map(task => (
                                <tr key={task.id}>
                                    <td>{task.employeeName}</td>
                                    <td>{task.task}</td>
                                    <td>{new Date(task.completionRequest.requestedAt).toLocaleString()}</td>
                                    <td>{task.completionRequest.completionNote}</td>
                                    <td>{task.projectId || 'N/A'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleTaskVerification(task.id, task.projectId, task.employeeName, 'verify')}
                                            className="verify-btn"
                                        >
                                            Verify
                                        </button>
                                        <button
                                            onClick={() => handleTaskVerification(task.id, task.projectId, task.employeeName, 'reject')}
                                            className="reject-btn"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingProjectAssignments.map(({ projectId, assignment, employeeName }, index) => (
                                <tr key={`${projectId}-${index}`}>
                                    <td>{employeeName}</td>
                                    <td>{assignment.description || 'Project Assignment'}</td>
                                    <td>{assignment.completionRequest && new Date(assignment.completionRequest.requestedAt).toLocaleString() || 'N/A'}</td>
                                    <td>{assignment.completionRequest && assignment.completionRequest.completionNote || 'N/A'}</td>
                                    {/* <td>{projectId}</td> */}
                                    <td>
                                        <button
                                            onClick={() => handleProjectAssignmentVerification(projectId, assignment, employeeName, 'verify')}
                                            className="verify-btn"
                                        >
                                            Verify
                                        </button>
                                        <button
                                            onClick={() => handleProjectAssignmentVerification(projectId, assignment, employeeName, 'reject')}
                                            className="reject-btn"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingVerificationTasks.length === 0 && pendingProjectAssignments.length === 0 && (
                                <tr>
                                    <td colSpan="6">No tasks or assignments pending verification</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="scheduled-tasks-overview">
                    <h3>Scheduled Tasks</h3>
                    <table className="scheduled-tasks-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Task</th>
                                <th>Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduledTasks.map((task) => (
                                <tr key={task.id}>
                                    <td>{task.employeeName}</td>
                                    <td>{task.task}</td>
                                    <td>{task.type}</td>
                                    <td>{task.date || task.startDate}</td>
                                    <td>{task.type === 'daily' ? '-' : task.endDate}</td>
                                    <td>
                                        <span className={`status-badge ${task.status}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {scheduledTasks.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="no-records">
                                        No scheduled tasks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="tasks-filter">
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="employee-select"
                    >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.name}>
                                {employee.name}
                            </option>
                        ))}
                    </select>
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
                            {attendanceData.map((record, index) => (
                                <tr key={index}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{new Date(record.checkIn).toLocaleTimeString()}</td>
                                    <td>{record.checkOut === '-' ? '-' : new Date(record.checkOut).toLocaleTimeString()}</td>
                                    <td>{record.duration}</td>
                                    <td>{record.checkInSummary}</td>
                                    <td>{record.checkOutSummary}</td>
                                    <td><span className={`status-badge ${record.status.toLowerCase()}`}>{record.status}</span></td>
                                </tr>
                            ))}
                            {attendanceData.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="no-records">No attendance records found for selected employee</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderMainContent = () => {
        if (showAdminPanel) {
            return (
                <div className="admin-panel-container">
                    {/* <div className="admin-panel-header">
                       <h2>Add New Order</h2>
                        <button
                            className="close-panel-btn"
                            onClick={() => setShowAdminPanel(false)}
                        >
                            Close
                        </button>
                    </div>  */}
                    <div className="admin-panel-content">
                        <AdminPanel onComplete={() => setShowAdminPanel(false)} />
                    </div>
                </div>
            );
        }

        if (activeTab === 'payments') {
            return (
                <ProtectedPayments
                    projects={projects}
                    formatCurrency={formatCurrency}
                />
            );
        }

        if (activeTab === 'employees') {
            return <EmployeeManagement />;
        }

        if (activeTab === 'tasks') {
            return renderTasksTab();
        }

        return (
            <>
                {renderTableHeader()}
                {renderProjectsTable()}
            </>
        );
    };

    if (loading || !authChecked) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" />
                <p>Loading projects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <SidebarNav
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    projects={projects}
                    getReadyCount={getReadyCount}
                    getInProgressCount={getInProgressCount}
                    getNearbyCount={getNearbyCount}
                    handleSignOut={handleSignOut}
                    setShowAdminPanel={setShowAdminPanel}
                />
            </aside>

            <main className="main-content">
                <div className="table-section">
                    {renderMainContent()}
                </div>
            </main>

            {/* Edit Modal */}
            {showEditModal && editingProject && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Project</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="close-button"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="edit-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Client Name</label>
                                    <input
                                        type="text"
                                        value={editingProject.clientName || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            clientName: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Project Type</label>
                                    <input
                                        type="text"
                                        value={editingProject.title || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            title: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>College Name</label>
                                    <input
                                        type="text"
                                        value={editingProject.collegeName || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            collegeName: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editingProject.email || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            email: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editingProject.phoneNumber || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            phoneNumber: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        value={editingProject.whatsappNumber || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            whatsappNumber: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Referred By</label>
                                    <input
                                        type="text"
                                        value={editingProject.referredBy || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            referredBy: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Timeline</label>
                                    <input
                                        type="date"
                                        value={editingProject.timeline || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            timeline: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Project Status</label>
                                    <select
                                        value={editingProject.projectStatus || 'Start'}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            projectStatus: e.target.value
                                        })}
                                    >
                                        {projectStatuses.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group assignments-section">
                                    <label>Assignments (Task Order Required)</label>
                                    {(editingProject.assignments || [{
                                        assignee: '',
                                        description: '',
                                        percentage: '100',
                                        taskOrder: ''
                                    }]).map((assignment, index, array) => (
                                        <AssignmentRow
                                            key={index}
                                            assignment={assignment}
                                            index={index}
                                            totalAssignments={array.length}
                                            employees={employees}
                                            employeesLoading={employeesLoading}
                                            updateAssignment={(index, field, value) => {
                                                const updatedAssignments = [...(editingProject.assignments || [])];

                                                if (field === 'taskOrder') {
                                                    updatedAssignments.forEach((a, i) => {
                                                        if (i !== index && a.taskOrder === value) {
                                                            a.taskOrder = '';
                                                        }
                                                    });
                                                }

                                                updatedAssignments[index] = {
                                                    ...updatedAssignments[index],
                                                    [field]: value
                                                };

                                                if (field === 'assignee') {
                                                    const totalAssignees = updatedAssignments.filter(a => a.assignee.trim() !== '').length;
                                                    if (totalAssignees > 0) {
                                                        const equalPercentage = Math.floor(100 / totalAssignees);
                                                        const remainder = 100 - (equalPercentage * totalAssignees);

                                                        updatedAssignments.forEach((a, i) => {
                                                            if (a.assignee.trim() !== '') {
                                                                a.percentage = i === 0 ?
                                                                    (equalPercentage + remainder).toString() :
                                                                    equalPercentage.toString();
                                                            } else {
                                                                a.percentage = '0';
                                                            }
                                                        });
                                                    }
                                                }

                                                setEditingProject({
                                                    ...editingProject,
                                                    assignments: updatedAssignments,
                                                    Assign_To: updatedAssignments
                                                        .map(a => a.assignee)
                                                        .filter(name => name.trim() !== '')
                                                        .join(', ')
                                                });
                                            }}
                                            removeAssignment={(index) => {
                                                let updatedAssignments = editingProject.assignments.filter((_, i) => i !== index);
                                                const totalRemaining = updatedAssignments.filter(a => a.assignee.trim() !== '').length;

                                                if (totalRemaining > 0) {
                                                    const equalPercentage = Math.floor(100 / totalRemaining);
                                                    const remainder = 100 - (equalPercentage * totalRemaining);

                                                    updatedAssignments.forEach((a, i) => {
                                                        if (a.assignee.trim() !== '') {
                                                            a.percentage = i === 0 ?
                                                                (equalPercentage + remainder).toString() :
                                                                equalPercentage.toString();
                                                        } else {
                                                            a.percentage = '0';
                                                        }
                                                    });
                                                }

                                                updatedAssignments = updatedAssignments.map(a => ({
                                                    ...a,
                                                    taskOrder: a.taskOrder > index ? (parseInt(a.taskOrder) - 1).toString() : a.taskOrder
                                                }));

                                                setEditingProject({
                                                    ...editingProject,
                                                    assignments: updatedAssignments,
                                                    Assign_To: updatedAssignments
                                                        .map(a => a.assignee)
                                                        .filter(name => name.trim() !== '')
                                                        .join(', ')
                                                });
                                            }}
                                        />
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentAssignments = editingProject.assignments || [];
                                            const updatedAssignments = [
                                                ...currentAssignments,
                                                {
                                                    assignee: '',
                                                    description: '',
                                                    percentage: '0',
                                                    taskOrder: ''
                                                }
                                            ];

                                            const totalAssignees = updatedAssignments.filter(a => a.assignee.trim() !== '').length;
                                            if (totalAssignees > 0) {
                                                const equalPercentage = Math.floor(100 / totalAssignees);
                                                const remainder = 100 - (equalPercentage * totalAssignees);

                                                updatedAssignments.forEach((a, i) => {
                                                    if (a.assignee.trim() !== '') {
                                                        a.percentage = i === 0 ?
                                                            (equalPercentage + remainder).toString() :
                                                            equalPercentage.toString();
                                                    } else {
                                                        a.percentage = '0';
                                                    }
                                                });
                                            }

                                            setEditingProject({
                                                ...editingProject,
                                                assignments: updatedAssignments
                                            });
                                        }}
                                        className="add-assignment-btn"
                                    >
                                        Add Assignment
                                    </button>

                                    <div className="validation-warning">
                                        * Task order must be selected for each assignee
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View PDF Modal */}
            {viewingPDF.show && (
                <PDFViewer
                    pdfUrl={viewingPDF.url}
                    projectId={viewingPDF.projectId}
                    onClose={() => setViewingPDF({ show: false, url: null, projectId: null })}
                />
            )}

            {/* Queries Modal */}
            {showQueriesModal && (
                <div className="modal-overlay">
                    <div className="modal-content queries-modal">
                        <div className="modal-header">
                            <h2>Pending Queries ({queriesCount})</h2>
                            <button onClick={() => setShowQueriesModal(false)} className="close-button">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="queries-list">
                            {queries.map((query) => (
                                <div key={query.id} className="query-item">
                                    <div className="query-info">
                                        <div className="dashboard-form-group">
                                            <label>Project ID:</label>
                                            <input type="text" value={query.parentKey} readOnly />
                                        </div>
                                        <div className="dashboard-form-group">
                                            <label>Timestamp:</label>
                                            <input type="text" value={new Date(query.timestamp).toLocaleString()} readOnly />
                                        </div>
                                        <div className="dashboard-form-group">
                                            <label>Query:</label>
                                            <textarea rows="4" value={query.queryText} readOnly />
                                        </div>
                                    </div>
                                    <div className="dashboard-form-group">
                                        <label>Query Type:</label>
                                        <input type="text" value={query.queryType || 'N/A'} readOnly />
                                    </div>
                                    <div className="query-actions">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => handleQueryAction(query, 'accepted')}
                                                    className="btn-accept"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleQueryAction(query, 'rejected')}
                                                    className="btn-reject"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <textarea
                                                    value={editableQueryText}
                                                    onChange={(e) => setEditableQueryText(e.target.value)}
                                                    rows="4"
                                                    placeholder="Edit query text"
                                                />
                                                <button
                                                    onClick={() => handleSendEditedQuery(query)}
                                                    className="btn-send"
                                                >
                                                    Send Updated Query
                                                </button>
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="btn-cancel"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {queries.length === 0 && (
                                <div className="no-queries">No pending queries</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && selectedInvoiceProject && (
                <Invoice
                    project={selectedInvoiceProject}
                    onClose={() => {
                        setShowInvoiceModal(false);
                        setSelectedInvoiceProject(null);
                    }}
                />
            )}

            {/* Assignment Details Modal */}
            {detailsModal.show && detailsModal.assignment && (
                <div className="modal-overlay" onClick={() => setDetailsModal({ show: false, assignment: null })}>
                    <div className="modal-content assignment-details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Assignment Details</h3>
                            <button onClick={() => setDetailsModal({ show: false, assignment: null })} className="close-button">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="details-row">
                                <strong>Task Order:</strong>
                                {detailsModal.assignment.taskOrder === '1' ? '1st Task' :
                                    detailsModal.assignment.taskOrder === '2' ? '2nd Task' :
                                        detailsModal.assignment.taskOrder === '3' ? '3rd Task' :
                                            `${detailsModal.assignment.taskOrder}th Task`}
                            </div>
                            <div className="details-row">
                                <strong>Assigned to:</strong> {detailsModal.assignment.assignee}
                            </div>
                            <div className="details-row">
                                <strong>Percentage:</strong> {detailsModal.assignment.percentage}%
                            </div>
                            {detailsModal.assignment.taskCompleted && (
                                <div className="details-row">
                                    <strong>Task Status:</strong> {detailsModal.assignment.taskCompleted}
                                </div>
                            )}
                            {detailsModal.assignment.description && (
                                <div className="details-row">
                                    <strong>Description:</strong> {detailsModal.assignment.description}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;