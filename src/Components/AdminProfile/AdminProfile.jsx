import { useState, useEffect } from 'react';
import { database, auth } from '../../firebase';
import { ref, get, onValue, update, remove, getDatabase } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Loader2, Pencil, Trash2, X, Bell } from "lucide-react";
import './AdminProfile.css';
import ProtectedPayments from '../ProtectedPayments/ProtectedPayments';
import { Download } from 'lucide-react';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterField, setFilterField] = useState('all');
    const [authChecked, setAuthChecked] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const teamMembers = ['Select Member', 'Yashwanth', 'Manu', 'Tanush'];
    const projectStatuses = ['Start', 'PartiallyComplete', 'Complete'];

    const [queries, setQueries] = useState([]);
    const [showQueriesModal, setShowQueriesModal] = useState(false);
    const [queriesCount, setQueriesCount] = useState(0);
    // const [action, setAction] = useState('');
    const [editedQueryText, setEditedQueryText] = useState('');

    const [editableQueryText, setEditableQueryText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        const queriesRef = ref(database, 'queries'); // Reference to the 'queries' node

        const unsubscribe = onValue(queriesRef, (snapshot) => {
            if (snapshot.exists()) {
                const allQueries = [];
                let totalPendingCount = 0;

                snapshot.forEach((keySnapshot) => {
                    const dynamicKey = keySnapshot.key; // e.g., 'KS5000', 'KS5001'
                    keySnapshot.forEach((querySnapshot) => {
                        const queryData = querySnapshot.val();
                        if (queryData.status === 'pending') {
                            totalPendingCount++;
                            allQueries.push({
                                id: querySnapshot.key,
                                parentKey: dynamicKey, // Include the dynamic key for reference
                                queryText: queryData.queryText,
                                status: queryData.status,
                                timestamp: queryData.timestamp,
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
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user && !loading) {
                navigate('/');
            }
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, [navigate, loading]);

    useEffect(() => {
        if (!authChecked) return;

        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const projectsRef = ref(database, 'projects');

        const unsubscribe = onValue(projectsRef, (snapshot) => {
            try {
                if (snapshot.exists()) {
                    const projectsData = [];
                    snapshot.forEach((childSnapshot) => {
                        const project = childSnapshot.val();
                        projectsData.push({
                            id: childSnapshot.key,
                            ...project
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
    }, [authChecked, navigate]);

    // ReferralMessage Component
    // const ReferralMessage = ({ referredBy, projects }) => {
    //     if (!referredBy) return null;

    //     const searchLower = referredBy.toLowerCase();
    //     const matchingProjects = projects.filter(p =>
    //         p.clientName && p.clientName.toLowerCase() === searchLower
    //     );

    //     return (
    //         <div className="referral-info">
    //             {matchingProjects.length > 0 ? (
    //                 <>
    //                     <p className="referral-status success">
    //                         "{referredBy}" found as a client with following project details:
    //                     </p>
    //                     {matchingProjects.map(project => (
    //                         <div key={project.id} className="referral-details">
    //                             <p>Project ID: {project.projectId}</p>
    //                             <p>Project Type: {project.ProjectType}</p>
    //                             <p>College: {project.collegeName}</p>
    //                             <p>Timeline: {project.timeline ?
    //                                 new Date(project.timeline).toLocaleDateString() :
    //                                 'Not set'}</p>
    //                         </div>
    //                     ))}
    //                 </>
    //             ) : (
    //                 <p className="referral-status warning">
    //                     "{referredBy}" is not found as a client in any project
    //                 </p>
    //             )}
    //         </div>
    //     );
    // };

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
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                const projectRef = ref(database, `projects/${projectId}`);
                await remove(projectRef);
            } catch (error) {
                console.error('Error deleting project:', error);
                setError('Failed to delete project');
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
            setError('Failed to sign out');
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterField('all');
    };

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

    let filteredProjects = projects.filter(project => {
        const searchLower = searchQuery.toLowerCase();

        // Special handling for referredBy search
        if (filterField === 'referredBy' && searchLower) {
            // First look for the name in clientName to display info
            const isRefererAClient = projects.some(p =>
                p.clientName && p.clientName.toLowerCase() === searchLower
            );

            if (isRefererAClient) {
                // If they are a client, return any project where they match the clientName
                return project.clientName && project.clientName.toLowerCase() === searchLower;
            } else {
                // If not a client, show no results
                return false;
            }
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

            return dateFormats.some(format =>
                format.toLowerCase().includes(searchLower)
            );
        }

        if (filterField !== 'all') {
            const fieldValue = String(project[filterField] || '').toLowerCase();
            return fieldValue.includes(searchLower);
        }

        const searchFields = [
            project.projectId,
            project.clientName,
            project.ProjectType,
            project.collegeName,
            project.email,
            project.phoneNumber,
            project.whatsappNumber,
            project.referredBy,
            project.timeline ? new Date(project.timeline).toLocaleDateString() : ''
        ];

        return searchFields.some(field =>
            String(field || '').toLowerCase().includes(searchLower)
        );
    });
console.log(filteredProjects,'filteredProjects')
    // Filter by tab
    filteredProjects = filteredProjects.filter(project => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (activeTab) {
            case 'ready':
                return project.projectStatus === 'Complete';
            case 'progress':
                return project.projectStatus === 'PartiallyComplete';
            case 'nearby':
                if (!project.timeline) return false;
                const projectDate = new Date(project.timeline);
                projectDate.setHours(0, 0, 0, 0);
                const timeDifference = Math.floor((projectDate - today) / (1000 * 3600 * 24));
                return timeDifference >= 0 && timeDifference <= 10;
            default:
                return true;
        }
    });

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

    // const handleQueryAction = (queryId, action) => {
    //     const database = getDatabase();

    //     const queriesRef = ref(database, 'queries');
    //     get(queriesRef)
    //         .then(snapshot => {
    //             if (snapshot.exists()) {
    //                 snapshot.forEach((keySnapshot) => {
    //                     const dynamicKey = keySnapshot.key;
    //                     const childSnapshot = keySnapshot.child(queryId);

    //                     if (childSnapshot.exists()) {
    //                         const queryRef = ref(database, `queries/${dynamicKey}/${queryId}`);
    //                         const projectRef = ref(database, `projects/${dynamicKey}/querylist`);

    //                         if (action === 'accepted') {
    //                             const queryData = childSnapshot.val();

    //                             update(projectRef, {
    //                                 queryText: queryData.queryText,
    //                                 queryStatus: 'Your query has been accepted and will be addressed soon.'
    //                             })
    //                                 .then(() => remove(queryRef))
    //                                 .then(() => setShowQueriesModal(false))
    //                                 .catch(error => console.error('Upload error:', error));
    //                         } else if (action === 'rejected') {
    //                             update(projectRef, {
    //                                 queryStatus: 'Query Rejected'
    //                             })
    //                                 .then(() => remove(queryRef))
    //                                 .then(() => setShowQueriesModal(false))
    //                                 .catch(error => console.error('Upload error:', error));
    //                         }
    //                     }
    //                 });
    //             }
    //         })
    //         .catch(error => console.error('Queries fetch error:', error));
    // };

    const handleQueryAction = (query, action) => {
        const database = getDatabase();
        
        if (action === 'accepted') {
            // Simple acceptance path
            const projectRef = ref(database, `projects/${query.parentKey}`);
            update(projectRef, {
                queryStatus: 'Your query has been accepted and will be addressed soon.'
            })
            .then(() => {
                // Remove the specific query
                const queryRef = ref(database, `queries/${query.parentKey}/${query.id}`);
                return remove(queryRef);
            })
            .then(() => setShowQueriesModal(false))
            .catch(error => console.error('Acceptance error:', error));
        } else if (action === 'rejected') {
            // Editing path
            setEditableQueryText(query.queryText);
            setIsEditing(true);
        }
    };

    const handleDownloadPDF = async (projectId) => {
        try {
            const storage = getStorage();
            const pdfRef = storageRef(storage, `quotations/${projectId}.pdf`);
            const url = await getDownloadURL(pdfRef);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                },
                mode: 'cors',
                cache: 'no-cache'
            });

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${projectId}_quotation.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF. Please try again.');
        }
    };
    const handleSendEditedQuery = () => {
        if (editableQueryText.trim()) {
            const database = getDatabase();
            const projectRef = ref(database, `projects/${query.parentKey}`);
            
            update(projectRef, {
                queryStatus: 'Your query has been reviewed and updated.'
            })
            .then(() => {
                // Remove the old query
                const oldQueryRef = ref(database, `queries/${query.parentKey}/${query.id}`);
                return remove(oldQueryRef);
            })
            .then(() => {
                // Push new query
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
    
    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="admin-info">
                    <h2>Admin Dashboard</h2>
                    <p>{auth.currentUser?.email}</p>
                </div>
                <nav className="sidebar-nav">
                    <div
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Admin Profile
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Total Orders ({projects.length})
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'ready' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ready')}
                    >
                        Ready to Deliver ({getReadyCount()})
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        In Progress ({getInProgressCount()})
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        All Payments(Restricted)
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`}
                        onClick={() => setActiveTab('nearby')}
                    >
                        Nearby Submission ({getNearbyCount()})
                    </div>
                    <div className="nav-item signout" onClick={handleSignOut}>
                        Sign Out
                    </div>
                </nav>
            </div>

            <div className="main-content">
                <div className="table-section">
                    {activeTab === 'payments' ? (
                        <ProtectedPayments
                            projects={projects}
                            formatCurrency={formatCurrency}
                        />
                    ) : (
                        <>
                            <div className="table-header">
                                <h2>
                                    {activeTab === 'profile' ? 'All Projects' :
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
                                            <option value="projectId">Project ID</option>
                                            <option value="clientName">Client Name</option>
                                            <option value="collegeName">College</option>
                                            <option value="ProjectType">Project Type</option>
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
                                                Clear All Filters
                                            </button>
                                        )}
                                        {/* {filterField === 'referredBy' && searchQuery && (
                                            <ReferralMessage 
                                                referredBy={searchQuery}
                                                projects={projects}
                                            />
                                        )} */}
                                    </div>
                                </div>
                                <div className='notification-record'>
                                    <div className="notification-icon">
                                        <button onClick={() => setShowQueriesModal(true)} className="bell-button">
                                            <Bell />
                                            {queriesCount > 0 && <span className="notification-badge">{queriesCount}</span>}
                                        </button>
                                    </div>
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
                                                                    <input
                                                                        type="text"
                                                                        value={query.parentKey}
                                                                    // readOnly    
                                                                    />
                                                                </div>
                                                                <div className="dashboard-form-group">
                                                                    <label>Timestamp:</label>
                                                                    <input
                                                                        type="text"
                                                                        value={new Date(query.timestamp).toLocaleString()}
                                                                    // readOnly
                                                                    />
                                                                </div>
                                                                <div className="dashboard-form-group">
                                                                    <label>Query:</label>
                                                                    <textarea
                                                                        rows="4"
                                                                        value={query.queryText}
                                                                    // readOnly
                                                                    />
                                                                </div>
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
                                                                        <button
                                                                            onClick={handleSendEditedQuery}
                                                                            className="btn-send"
                                                                        >
                                                                            Send Updated Query
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
                                                                            onClick={handleSendEditedQuery}
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
                                    <div className="record-count">
                                        {filteredProjects.length} {filteredProjects.length === 1 ? 'Record' : 'Records'}
                                    </div>
                                </div>
                            </div>

                            {filteredProjects.length === 0 ? (
                                <div className="no-data">No matching projects found</div>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Project ID</th>
                                                <th>Client Name</th>
                                                <th>Project Type</th>
                                                <th>College</th>
                                                <th>Email</th>
                                                <th>Phone Number</th>
                                                <th>WhatsApp Number</th>
                                                <th>Referred By</th>
                                                <th>Timeline</th>
                                                <th>Project Status</th>
                                                <th>Assign To</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProjects.map((project) => (
                                                <tr key={project.id}>
                                                    <td>{project.projectId}</td>
                                                    <td>{project.clientName}</td>
                                                    <td>{project.ProjectType}</td>
                                                    <td>{project.collegeName}</td>
                                                    <td>{project.email}</td>
                                                    <td>{project.phoneNumber}</td>
                                                    <td>{project.whatsappNumber}</td>
                                                    <td>{project.referredBy}</td>
                                                    <td>{project.timeline ? new Date(project.timeline).toLocaleDateString() : 'Not set'}</td>
                                                    <td>{project.projectStatus || 'Start'}</td>
                                                    <td>{project.Assign_To|| 'Select Member'}</td>
                                                    <td className="actions-column">
                                                        <button
                                                            onClick={() => handleEdit(project)}
                                                            className="action-button edit"
                                                            title="Edit project"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(project.id)}
                                                            className="action-button delete"
                                                            title="Delete project"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadPDF(project.projectId)}
                                                            className="action-button download"
                                                            title="Download PDF"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

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
                                        value={editingProject.ProjectType || ''}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            ProjectType: e.target.value
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

                                <div className="form-group">
                                    <label>Assign To</label>
                                    <select
                                        value={editingProject.Assign_To || 'Select Member'}
                                        onChange={(e) => setEditingProject({
                                            ...editingProject,
                                            assignedTo: e.target.value
                                        })}
                                    >
                                        {teamMembers.map(member => (
                                            <option key={member} value={member}>
                                                {member}
                                            </option>
                                        ))}
                                    </select>
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
        </div>
    );
};

export default AdminDashboard;