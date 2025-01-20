// AdminDashboard.js
import { useState, useEffect } from 'react';
import { database, auth } from '../../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import './AdminProfile.css';
import ProtectedPayments from '../ProtectedPayments/ProtectedPayments';

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
    const projectStatuses = ['Start', 'Middle', 'Complete'];

    // Auth state effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user && !loading) {
                navigate('/');
            }
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, [navigate, loading]);

    // Firebase data effect
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

    // Handle edit click
    const handleEdit = (project) => {
        setEditingProject({ ...project });
        setShowEditModal(true);
    };

    // Handle form submit
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

    // Handle delete
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

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
            setError('Failed to sign out');
        }
    };

    // Clear filters handler
    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterField('all');
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Utility functions
    const getReadyCount = () => projects.filter(p => p.projectStatus === 'Complete').length;
    const getInProgressCount = () => projects.filter(p => p.projectStatus === 'Middle').length;
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

    // Filter projects
    let filteredProjects = projects.filter(project => {
        const searchLower = searchQuery.toLowerCase();

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
            project.timeline ? new Date(project.timeline).toLocaleDateString() : ''
        ];

        return searchFields.some(field =>
            String(field || '').toLowerCase().includes(searchLower)
        );
    });

    // Filter by tab
    filteredProjects = filteredProjects.filter(project => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (activeTab) {
            case 'ready':
                return project.projectStatus === 'Complete';
            case 'progress':
                return project.projectStatus === 'Middle';
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
                                            <option value="timeline">Timeline</option>
                                        </select>

                                        <div className="search-input-container">
                                            <input
                                                type="text"
                                                placeholder={filterField === 'timeline' ? "Search date (e.g., 08/02/2025)" : "Search projects..."}
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
                                    </div>
                                </div>

                                <div className="record-count">
                                    {filteredProjects.length} {filteredProjects.length === 1 ? 'Record' : 'Records'}
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
                                                    <td>{project.assignedTo || 'Select Member'}</td>
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
                                        value={editingProject.assignedTo || 'Select Member'}
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