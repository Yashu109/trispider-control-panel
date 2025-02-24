// // SidebarNav.js
// import React, { useState } from 'react';
// import { ChevronDown, ChevronRight, Plus, Users } from "lucide-react";

// const SidebarNav = ({
//     activeTab,
//     setActiveTab,
//     projects,
//     getReadyCount,
//     getInProgressCount,
//     getNearbyCount,
//     handleSignOut,
//     setShowAdminPanel
// }) => {
//     const [isTrackOrdersOpen, setIsTrackOrdersOpen] = useState(false);

//     const toggleTrackOrders = () => {
//         setIsTrackOrdersOpen(!isTrackOrdersOpen);
//     };

//     const handleAddNew = () => {
//         setShowAdminPanel(true);
//         setActiveTab('new');
//     };

//     return (
//         <nav className="sidebar-nav">
//             <div 
//                 className={`nav-item   ${ activeTab === 'new' ? 'active' : ''}`}
//                 onClick={handleAddNew}
//             >
//                 <Plus size={16} />
//                 <span>Add New Order</span>
//             </div>

//             <div className="nav-folder">
//                 <div
//                     className={`nav-folder-header ${(activeTab === 'orders' || activeTab === 'ready') ? 'active' : ''}`}
//                     onClick={toggleTrackOrders}
//                 >
//                     <span>Track Orders</span>
//                     {isTrackOrdersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//                 </div>
                
//                 {isTrackOrdersOpen && (
//                     <div className="nav-folder-content">
//                         <div
//                             className={`nav-item sub-item ${activeTab === 'orders' ? 'active' : ''}`}
//                             onClick={() => setActiveTab('orders')}
//                         >
//                             Total Orders ({projects.length})
//                         </div>
//                         <div
//                             className={`nav-item sub-item ${activeTab === 'ready' ? 'active' : ''}`}
//                             onClick={() => setActiveTab('ready')}
//                         >
//                             Ready to Deliver ({getReadyCount()})
//                         </div>
//                         <div
//                             className={`nav-item sub-item ${activeTab === 'progress' ? 'active' : ''}`}
//                             onClick={() => setActiveTab('progress')}
//                         >
//                             In Progress ({getInProgressCount()})
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <div
//                 className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('payments')}
//             >
//                 All Payments(Restricted)
//             </div>
            
//             <div
//                 className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('nearby')}
//             >
//                 Nearby Submission ({getNearbyCount()})
//             </div>

//             <div
//                 className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('employees')}
//             >
//                 <Users size={16} />
//                 <span>Manage Employees</span>
//             </div>
            
//             <div className="nav-item signout" onClick={handleSignOut}>
//                 Sign Out
//             </div>
//         </nav>
//     );
// };

// export default SidebarNav;


import React, { useState } from 'react';
import { 
    ChevronDown, 
    ChevronRight, 
    Plus, 
    Users,
    FileText,
    CreditCard,
    Clock,
    LogOut,
    Menu,
    ClipboardList  // Added for Tasks tab
} from "lucide-react";

const SidebarNav = ({
    activeTab,
    setActiveTab,
    projects,
    getReadyCount,
    getInProgressCount,
    getNearbyCount,
    handleSignOut,
    setShowAdminPanel
}) => {
    const [isTrackOrdersOpen, setIsTrackOrdersOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleTrackOrders = (e) => {
        e.stopPropagation();
        setIsTrackOrdersOpen(!isTrackOrdersOpen);
    };

    const handleAddNew = () => {
        setShowAdminPanel(true);
        setActiveTab('new');
    };

    // Function to calculate total tasks (you'll implement this in the Tasks management component)
    const getTotalTasksCount = () => {
        // This will be replaced with actual task counting logic
        return 0;
    };

    return (
        <nav className={`sidebar-nav ${isExpanded ? 'expanded' : ''}`}
             onMouseEnter={() => setIsExpanded(true)}
             onMouseLeave={() => setIsExpanded(false)}>
            <div className="sidebar-header">
                <button className="menu-toggle" onClick={() => setIsExpanded(!isExpanded)}>
                    <Menu size={20} />
                </button>
                <span className="header-text">Admin Dashboard</span>
            </div>

            <div className="nav-item-container">
                <div className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
                     onClick={handleAddNew}>
                    <Plus size={20} className="nav-icon" />
                    <span className="nav-text">Add New Order</span>
                </div>

                <div className="nav-folder">
                    <div className={`nav-folder-header ${(activeTab === 'orders' || activeTab === 'ready') ? 'active' : ''}`}
                         onClick={toggleTrackOrders}>
                        <FileText size={20} className="nav-icon" />
                        <span className="nav-text">Track Orders</span>
                        <span className="arrow-icon">
                            {isTrackOrdersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    </div>

                    {isTrackOrdersOpen && (
                        <div className="nav-folder-content">
                            <div className={`nav-item sub-item ${activeTab === 'orders' ? 'active' : ''}`}
                                 onClick={() => setActiveTab('orders')}>
                                <span className="nav-text">Total Orders ({projects.length})</span>
                            </div>
                            <div className={`nav-item sub-item ${activeTab === 'ready' ? 'active' : ''}`}
                                 onClick={() => setActiveTab('ready')}>
                                <span className="nav-text">Ready to Deliver ({getReadyCount()})</span>
                            </div>
                            <div className={`nav-item sub-item ${activeTab === 'progress' ? 'active' : ''}`}
                                 onClick={() => setActiveTab('progress')}>
                                <span className="nav-text">In Progress ({getInProgressCount()})</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                     onClick={() => setActiveTab('payments')}>
                    <CreditCard size={20} className="nav-icon" />
                    <span className="nav-text">All Payments(Restricted)</span>
                </div>

                <div className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`}
                     onClick={() => setActiveTab('nearby')}>
                    <Clock size={20} className="nav-icon" />
                    <span className="nav-text">Nearby Submission ({getNearbyCount()})</span>
                </div>

                <div className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
                     onClick={() => setActiveTab('employees')}>
                    <Users size={20} className="nav-icon" />
                    <span className="nav-text">Manage Employees</span>
                </div>

                <div className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
                     onClick={() => setActiveTab('tasks')}>
                    <ClipboardList size={20} className="nav-icon" />
                    <span className="nav-text">Manage Tasks </span>
                </div>

                <div className="nav-item signout" onClick={handleSignOut}>
                    <LogOut size={20} className="nav-icon" />
                    <span className="nav-text">Sign Out</span>
                </div>
            </div>
        </nav>
    );
};

export default SidebarNav;