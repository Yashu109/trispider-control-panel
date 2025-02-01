// export default EmployeeDashboard;
// import React, { useState, useEffect } from 'react';
// import { database } from '../../firebase';
// import { ref, onValue } from 'firebase/database';
// import { useNavigate } from 'react-router-dom';
// import {
//     Loader2,
//     Eye,
//     FileText,
//     X
// } from "lucide-react";

// const EmployeePanel = () => {
//     const navigate = useNavigate();
//     const [assignedProjects, setAssignedProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [employeeName, setEmployeeName] = useState('');
//     const [selectedProject, setSelectedProject] = useState(null);

//     useEffect(() => {
//         // Retrieve employee data from session storage
//         const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));

//         if (!currentEmployee) {
//             // Redirect to login if no employee data
//             navigate('/');
//             return;
//         }

//         // Set employee name (use the exact case from the employee data)
//         setEmployeeName(currentEmployee.name);

//         // Fetch all projects
//         const projectsRef = ref(database, 'projects');

//         const unsubscribe = onValue(projectsRef, (snapshot) => {
//             try {
//                 if (snapshot.exists()) {
//                     const projectsData = [];

//                     snapshot.forEach((childSnapshot) => {
//                         const project = childSnapshot.val();
//                         const projectId = childSnapshot.key;

//                         // Function to check if employee is assigned
//                         const getEmployeeAssignmentDetails = () => {
//                             const employeeNameLower = currentEmployee.name.toLowerCase();
//                             const assignmentDetails = [];

//                             // Check assignments if it exists
//                             if (project.assignments) {
//                                 // If assignments is an object, convert to array
//                                 const assignmentsArray = Array.isArray(project.assignments) 
//                                     ? project.assignments 
//                                     : Object.values(project.assignments);

//                                 // Check if any assignment matches exactly
//                                 assignmentsArray.forEach(assignment => {
//                                     // Handle different possible assignment structures
//                                     if (typeof assignment === 'object') {
//                                         const assigneeName = (assignment.assignee || assignment.name || '').toLowerCase();
//                                         if (assigneeName === employeeNameLower) {
//                                             assignmentDetails.push({
//                                                 type: 'assignments',
//                                                 name: assignment.assignee || assignment.name,
//                                                 taskCompleted: assignment.taskCompleted || assignment.task_completed,
//                                                 percentage: assignment.percentage || 'N/A',
//                                                 description: assignment.description || 'N/A'
//                                             });
//                                         }
//                                     }
//                                 });
//                             }

//                             return assignmentDetails;
//                         };

//                         // Get assignment details
//                         const employeeAssignments = getEmployeeAssignmentDetails();

//                         // If employee is assigned, add the project
//                         if (employeeAssignments.length > 0) {
//                             projectsData.push({
//                                 id: projectId,
//                                 ...project,
//                                 employeeAssignments
//                             });
//                         }
//                     });

//                     // Sort projects by project ID
//                     projectsData.sort((a, b) => a.id.localeCompare(b.id));

//                     setAssignedProjects(projectsData);
//                 } else {
//                     setAssignedProjects([]);
//                 }
//             } catch (error) {
//                 console.error('Error processing projects:', error);
//                 setError('Error loading projects');
//             } finally {
//                 setLoading(false);
//             }
//         });

//         return () => unsubscribe();
//     }, [navigate]);

//     const handleSignOut = () => {
//         // Clear session storage
//         sessionStorage.removeItem('currentEmployee');
//         // Redirect to login
//         navigate('/');
//     };

//     // Format date
//     const formatDate = (dateString) => {
//         return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
//     };

//     // Loading State
//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <Loader2 className="spinner" />
//                 <p>Loading your projects...</p>
//             </div>
//         );
//     }

//     // Error State
//     if (error) {
//         return (
//             <div className="error-container">
//                 <p>{error}</p>
//                 <button onClick={handleSignOut}>Back to Login</button>
//             </div>
//         );
//     }

//     // Render Project Details Modal
//     const ProjectDetailsModal = ({ project, onClose }) => {
//         return (
//             <div className="modal-overlay">
//                 <div className="modal-content project-details-modal">
//                     <div className="modal-header">
//                         <h2>Project Details - {project.id}</h2>
//                         <button onClick={onClose} className="close-button">
//                             <X size={20} />
//                         </button>
//                     </div>
//                     <div className="modal-body">
//                         <div className="project-details-grid">
//                             <div className="detail-group">
//                                 <label>Project Type</label>
//                                 <p>{project.ProjectType || project.projectType || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Client Name</label>
//                                 <p>{project.clientName || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Timeline</label>
//                                 <p>{formatDate(project.timeline)}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Advance Payment</label>
//                                 <p>{project.advancePayment || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Alternative Number</label>
//                                 <p>{project.alternativeNumber || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Project Status</label>
//                                 <p>{project.projectStatus || 'Start'}</p>
//                             </div>
//                         </div>

//                         <div className="your-assignment-details">
//                             <h3>Your Assignment Details</h3>
//                             {project.employeeAssignments.map((assignment, index) => (
//                                 <div key={index} className="assignment-detail">
//                                     <div className="detail-group">
//                                         <label>Task Description</label>
//                                         <p>{assignment.description}</p>
//                                     </div>
//                                     <div className="detail-group">
//                                         <label>Task Completion</label>
//                                         <p>{assignment.taskCompleted || 'N/A'}</p>
//                                     </div>
//                                     <div className="detail-group">
//                                         <label>Assignment Percentage</label>
//                                         <p>{assignment.percentage}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="employee-dashboard-container">
//             <div className="dashboard-header">
//                 <h1>Welcome, {employeeName}</h1>
//                 <button onClick={handleSignOut} className="signout-button">Sign Out</button>
//             </div>

//             <div className="assigned-projects-section">
//                 <h2>Your Assigned Projects</h2>
//                 {assignedProjects.length === 0 ? (
//                     <div className="no-projects-message">
//                         No projects have been assigned to you yet.
//                     </div>
//                 ) : (
//                     <div className="projects-table-container">
//                         <table className="projects-table">
//                             <thead>
//                                 <tr>
//                                     <th>Project ID</th>
//                                     <th>Project Type</th>
//                                     <th>Timeline</th>
//                                     <th>Advance Payment</th>
//                                     <th>Project Status</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {assignedProjects.map((project) => (
//                                     <tr key={project.id}>
//                                         <td>{project.id}</td>
//                                         <td>{project.ProjectType || project.projectType || 'N/A'}</td>
//                                         <td>{formatDate(project.timeline)}</td>
//                                         <td>{project.advancePayment || 'N/A'}</td>
//                                         <td>{project.projectStatus || 'Start'}</td>
//                                         <td className="actions-column">
//                                             <button
//                                                 className="action-button view"
//                                                 title="View Project Details"
//                                                 onClick={() => setSelectedProject(project)}
//                                             >
//                                                 <Eye size={16} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* Project Details Modal */}
//             {selectedProject && (
//                 <ProjectDetailsModal 
//                     project={selectedProject} 
//                     onClose={() => setSelectedProject(null)} 
//                 />
//             )}
//         </div>
//     );
// };

// export default EmployeePanel;


// import React, { useState, useEffect } from 'react';
// import { database } from '../../firebase';
// import { ref, onValue } from 'firebase/database';
// import { useNavigate } from 'react-router-dom';
// import {
//     Loader2,
//     Eye,
//     X
// } from "lucide-react";

// const EmployeePanel = () => {
//     const navigate = useNavigate();
//     const [assignedProjects, setAssignedProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [employeeName, setEmployeeName] = useState('');
//     const [selectedProject, setSelectedProject] = useState(null);

//     useEffect(() => {
//         // Retrieve employee data from session storage
//         const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));

//         if (!currentEmployee) {
//             // Redirect to login if no employee data
//             navigate('/');
//             return;
//         }

//         // Set employee name (use the exact case from the employee data)
//         setEmployeeName(currentEmployee.name);

//         // Fetch all projects
//         const projectsRef = ref(database, 'projects');

//         const unsubscribe = onValue(projectsRef, (snapshot) => {
//             try {
//                 if (snapshot.exists()) {
//                     const projectsData = [];

//                     snapshot.forEach((childSnapshot) => {
//                         const project = childSnapshot.val();
//                         const projectId = childSnapshot.key;

//                         // Function to get all assignees
//                         const getProjectAssignees = () => {
//                             const employeeNameLower = currentEmployee.name.toLowerCase();
//                             const assignees = [];
//                             let employeeSpecificAssignments = [];

//                             // Check Assign_To field
//                             if (project.Assign_To) {
//                                 const assignToNames = project.Assign_To.split(',').map(name => name.trim());
//                                 assignees.push(...assignToNames);
//                             }

//                             // Check assignedTo field
//                             if (project.assignedTo) {
//                                 const assignedToNames = project.assignedTo.split(',').map(name => name.trim());
//                                 assignees.push(...assignedToNames);
//                             }

//                             // Check assignments if it exists
//                             if (project.assignments) {
//                                 // If assignments is an object, convert to array
//                                 const assignmentsArray = Array.isArray(project.assignments) 
//                                     ? project.assignments 
//                                     : Object.values(project.assignments);

//                                 // Collect all assignee names and find employee-specific assignments
//                                 assignmentsArray.forEach(assignment => {
//                                     if (typeof assignment === 'object') {
//                                         const assigneeName = (assignment.assignee || assignment.name || '').trim();

//                                         // Add to assignees list
//                                         if (assigneeName) {
//                                             assignees.push(assigneeName);
//                                         }

//                                         // Check for employee-specific assignment
//                                         if (assigneeName.toLowerCase() === employeeNameLower) {
//                                             employeeSpecificAssignments.push({
//                                                 name: assigneeName,
//                                                 taskCompleted: assignment.taskCompleted || assignment.task_completed,
//                                                 percentage: assignment.percentage || 'N/A',
//                                                 description: assignment.description || 'N/A'
//                                             });
//                                         }
//                                     }
//                                 });
//                             }

//                             // Remove duplicates and standardize
//                             const uniqueAssignees = [...new Set(assignees)];

//                             return {
//                                 allAssignees: uniqueAssignees,
//                                 employeeAssignments: employeeSpecificAssignments
//                             };
//                         };

//                         // Get assignees and employee assignments
//                         const { allAssignees, employeeAssignments } = getProjectAssignees();

//                         // If the current employee is among assignees
//                         if (employeeAssignments.length > 0) {
//                             projectsData.push({
//                                 id: projectId,
//                                 ...project,
//                                 allAssignees,
//                                 employeeAssignments
//                             });
//                         }
//                     });

//                     // Sort projects by project ID
//                     projectsData.sort((a, b) => a.id.localeCompare(b.id));

//                     setAssignedProjects(projectsData);
//                 } else {
//                     setAssignedProjects([]);
//                 }
//             } catch (error) {
//                 console.error('Error processing projects:', error);
//                 setError('Error loading projects');
//             } finally {
//                 setLoading(false);
//             }
//         });

//         return () => unsubscribe();
//     }, [navigate]);

//     const handleSignOut = () => {
//         // Clear session storage
//         sessionStorage.removeItem('currentEmployee');
//         // Redirect to login
//         navigate('/');
//     };

//     // Format date
//     const formatDate = (dateString) => {
//         return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
//     };

//     // Loading State
//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <Loader2 className="spinner" />
//                 <p>Loading your projects...</p>
//             </div>
//         );
//     }

//     // Error State
//     if (error) {
//         return (
//             <div className="error-container">
//                 <p>{error}</p>
//                 <button onClick={handleSignOut}>Back to Login</button>
//             </div>
//         );
//     }

//     // Render Project Details Modal
//     const ProjectDetailsModal = ({ project, onClose }) => {
//         return (
//             <div className="modal-overlay">
//                 <div className="modal-content project-details-modal">
//                     <div className="modal-header">
//                         <h2>Project Details - {project.id}</h2>
//                         <button onClick={onClose} className="close-button">
//                             <X size={20} />
//                         </button>
//                     </div>
//                     <div className="modal-body">
//                         <div className="project-details-grid">
//                             <div className="detail-group">
//                                 <label>Project Type</label>
//                                 <p>{project.ProjectType || project.projectType || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>All Assignees</label>
//                                 <p>{project.allAssignees.join(', ')}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Timeline</label>
//                                 <p>{formatDate(project.timeline)}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Advance Payment</label>
//                                 <p>{project.advancePayment || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Alternative Number</label>
//                                 <p>{project.alternativeNumber || 'N/A'}</p>
//                             </div>
//                             <div className="detail-group">
//                                 <label>Project Status</label>
//                                 <p>{project.projectStatus || 'Start'}</p>
//                             </div>
//                         </div>

//                         <div className="your-assignment-details">
//                             <h3>Your Assignment Details</h3>
//                             {project.employeeAssignments.map((assignment, index) => (
//                                 <div key={index} className="assignment-detail">
//                                     <div className="detail-group">
//                                         <label>Task Description</label>
//                                         <p>{assignment.description}</p>
//                                     </div>
//                                     <div className="detail-group">
//                                         <label>Task Completion</label>
//                                         <p>{assignment.taskCompleted || 'N/A'}</p>
//                                     </div>
//                                     <div className="detail-group">
//                                         <label>Assignment Percentage</label>
//                                         <p>{assignment.percentage}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="employee-dashboard-container">
//             <div className="dashboard-header">
//                 <h1>Welcome, {employeeName}</h1>
//                 <button onClick={handleSignOut} className="signout-button">Sign Out</button>
//             </div>

//             <div className="assigned-projects-section">
//                 <h2>Your Assigned Projects</h2>
//                 {assignedProjects.length === 0 ? (
//                     <div className="no-projects-message">
//                         No projects have been assigned to you yet.
//                     </div>
//                 ) : (
//                     <div className="projects-table-container">
//                         <table className="projects-table">
//                             <thead>
//                                 <tr>
//                                     <th>Project ID</th>
//                                     <th>Project Type</th>
//                                     <th>Timeline</th>
//                                     <th>Advance Payment</th>
//                                     <th>Project Status</th>
//                                     <th>Assigned To</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {assignedProjects.map((project) => (
//                                     <tr key={project.id}>
//                                         <td>{project.id}</td>

//                                         <td>{project.ProjectType || project.projectType || 'N/A'}</td>
//                                         <td>{formatDate(project.timeline)}</td>
//                                         <td>{project.advancePayment || 'N/A'}</td>
//                                         <td>{project.projectStatus || 'Start'}</td>
//                                         <td>
//                                             {project.allAssignees.map((assignee, index) => (
//                                                 <div 
//                                                     key={index} 
//                                                     style={{
//                                                         fontWeight: assignee.toLowerCase() === employeeName.toLowerCase() 
//                                                             ? 'bold' 
//                                                             : 'normal'
//                                                     }}
//                                                 >
//                                                     {assignee}
//                                                 </div>
//                                             ))}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* Project Details Modal */}
//             {selectedProject && (
//                 <ProjectDetailsModal 
//                     project={selectedProject} 
//                     onClose={() => setSelectedProject(null)} 
//                 />
//             )}
//         </div>
//     );
// };

// export default EmployeePanel;

import { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import {
    Loader2,
} from "lucide-react";
import './EmployeePanel.css'
const EmployeePanel = () => {
    const navigate = useNavigate();
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employeeName, setEmployeeName] = useState('');
    const [workStatusUpdates, setWorkStatusUpdates] = useState({});

    useEffect(() => {
        // Retrieve employee data from session storage
        const currentEmployee = JSON.parse(sessionStorage.getItem('currentEmployee'));

        if (!currentEmployee) {
            // Redirect to login if no employee data
            navigate('/');
            return;
        }

        // Set employee name (use the exact case from the employee data)
        setEmployeeName(currentEmployee.name);

        // Fetch all projects
        const projectsRef = ref(database, 'projects');

        const unsubscribe = onValue(projectsRef, (snapshot) => {
            try {
                if (snapshot.exists()) {
                    const projectsData = [];

                    snapshot.forEach((childSnapshot) => {
                        const project = childSnapshot.val();
                        const projectId = childSnapshot.key;

                        // Function to get all assignees
                        const getProjectAssignees = () => {
                            const employeeNameLower = currentEmployee.name.toLowerCase();
                            const assignees = [];
                            let employeeSpecificAssignments = [];

                            // Check Assign_To field
                            if (project.Assign_To) {
                                const assignToNames = project.Assign_To.split(',').map(name => name.trim());
                                assignees.push(...assignToNames);
                            }

                            // Check assignedTo field
                            if (project.assignedTo) {
                                const assignedToNames = project.assignedTo.split(',').map(name => name.trim());
                                assignees.push(...assignedToNames);
                            }

                            // Check assignments if it exists
                            if (project.assignments) {
                                // If assignments is an object, convert to array
                                const assignmentsArray = Array.isArray(project.assignments)
                                    ? project.assignments
                                    : Object.values(project.assignments);

                                // Collect all assignee names and find employee-specific assignments
                                assignmentsArray.forEach((assignment, index) => {
                                    if (typeof assignment === 'object') {
                                        const assigneeName = (assignment.assignee || assignment.name || '').trim();

                                        // Add to assignees list
                                        if (assigneeName) {
                                            assignees.push(assigneeName);
                                        }

                                        // Check for employee-specific assignment
                                        if (assigneeName.toLowerCase() === employeeNameLower) {
                                            employeeSpecificAssignments.push({
                                                index,
                                                name: assigneeName,
                                                taskCompleted: assignment.taskCompleted || assignment.task_completed || '',
                                                percentage: assignment.percentage || 'N/A',
                                                description: assignment.description || 'N/A'
                                            });
                                        }
                                    }
                                });
                            }

                            // Remove duplicates and standardize
                            const uniqueAssignees = [...new Set(assignees)];

                            return {
                                allAssignees: uniqueAssignees,
                                employeeAssignments: employeeSpecificAssignments
                            };
                        };

                        // Get assignees and employee assignments
                        const { allAssignees, employeeAssignments } = getProjectAssignees();

                        // If the current employee is among assignees
                        if (employeeAssignments.length > 0) {
                            projectsData.push({
                                id: projectId,
                                ...project,
                                allAssignees,
                                employeeAssignments
                            });
                        }
                    });

                    // Sort projects by project ID
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

        return () => unsubscribe();
    }, [navigate]);

    const handleSaveWorkStatus = async (projectId, assignmentIndex) => {
        try {
            const statusUpdate = workStatusUpdates[`${projectId}-${assignmentIndex}`] || '';

            // Reference to the specific project
            const projectRef = ref(database, `projects/${projectId}`);

            // Get the current project data
            const currentProject = assignedProjects.find(p => p.id === projectId);

            if (!currentProject) {
                throw new Error('Project not found');
            }

            // Create a copy of the current assignments
            const currentAssignments = currentProject.assignments
                ? (Array.isArray(currentProject.assignments)
                    ? [...currentProject.assignments]
                    : Object.values(currentProject.assignments))
                : [];

            // Update the specific assignment's taskCompleted
            if (currentAssignments[assignmentIndex]) {
                currentAssignments[assignmentIndex] = {
                    ...currentAssignments[assignmentIndex],
                    taskCompleted: statusUpdate
                };
            }

            // Update the entire assignments array
            await update(projectRef, {
                assignments: currentAssignments
            });

            // Clear the status update input
            setWorkStatusUpdates(prev => ({
                ...prev,
                [`${projectId}-${assignmentIndex}`]: ''
            }));

            alert('Work status updated successfully!');
        } catch (error) {
            console.error('Error updating work status:', error);
            alert(`Failed to update work status: ${error.message}`);
        }
    };

    const handleSignOut = () => {
        // Clear session storage
        sessionStorage.removeItem('currentEmployee');
        // Redirect to login
        navigate('/');
    };

    // Format date
    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    };

    // Loading State
    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" />
                <p>Loading your projects...</p>
            </div>
        );
    }

    // Error State
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
    return (
        <div className="employee-dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome, {employeeName}</h1>
                <button onClick={handleSignOut} className="signout-button">Sign Out</button>
            </div>

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

                                {assignedProjects.map((project) => (
                                    <tr key={project.id}>
                                        <td>{project.id}</td>
                                        {/* <td>
                                            {project.allAssignees.map((assignee, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        fontWeight: assignee.toLowerCase() === employeeName.toLowerCase()
                                                            ? 'bold'
                                                            : 'normal'
                                                    }}
                                                >
                                                    {assignee}
                                                </div>
                                            ))}
                                        </td> */}
                                        <td className="employee-assignees-cell">
                                            {getSortedAssignments(project).map((assignment, index) => (
                                                <div
                                                    key={index}
                                                    className={`assignee-row ${assignment.assignee.toLowerCase() === employeeName.toLowerCase()
                                                            ? 'current-employee'
                                                            : ''
                                                        }`}
                                                >
                                                    <span className="task-order">
                                                        {assignment.taskOrder ? (
                                                            assignment.taskOrder === '1' ? '1st Task: ' :
                                                                assignment.taskOrder === '2' ? '2nd Task: ' :
                                                                    assignment.taskOrder === '3' ? '3rd Task: ' :
                                                                        `${assignment.taskOrder}th Task: `
                                                        ) : ''}
                                                    </span>
                                                    <span className="assignee-name">
                                                        {assignment.assignee}
                                                    </span>
                                                    {assignment.percentage && (
                                                        <span className="assignee-percentage">
                                                            ({assignment.percentage}%)
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Display any assignees from Assign_To that aren't in assignments */}
                                            {project.Assign_To &&
                                                !project.assignments?.some(a => a.assignee === project.Assign_To) && (
                                                    <div className="assignee-row">
                                                        {project.Assign_To}
                                                    </div>
                                                )}
                                        </td>
                                        <td>{project.ProjectType || project.projectType || 'N/A'}</td>
                                        <td>{formatDate(project.timeline)}</td>
                                        <td>
                                            {project.employeeAssignments.length > 0 ? (
                                                project.employeeAssignments.map((assignment) => (
                                                    <textarea key={assignment.index} readOnly>
                                                        {assignment.description}
                                                    </textarea>
                                                ))
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td>{project.projectStatus }</td>
                                        {/* <td>
                                            
                                            {project.employeeAssignments.map((assignment) => (
                                                <div key={assignment.index} className="work-status-section">
                                                    <textarea
                                                        placeholder="Enter work status"
                                                        value={
                                                            workStatusUpdates[`${project.id}-${assignment.index}`] ||
                                                            assignment.taskCompleted
                                                        }
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
                                                    >
                                                        
                                                        Complete
                                                    </button>
                                                </div>
                                            ))}
                                        </td> */}
 <td>
                                            {project.employeeAssignments.map((assignment) => (
                                                <div key={assignment.index} className="work-status-section">
                                                    {assignment.taskCompleted ? (
                                                        <div className="completed-status">
                                                            <div className="status-text">
                                                                Status: {assignment.taskCompleted}
                                                            </div>
                                                            <div className="completion-info">
                                                                ✓ Completed on: {formatDate(assignment.assignee)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <textarea
                                                                placeholder="Enter your work status/progress"
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
                                                            >
                                                                Mark Complete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeePanel;