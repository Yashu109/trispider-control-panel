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
  CreditCard,
  FileText,
  LogOut
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

  const toggleTrackOrders = (e) => {
    e.stopPropagation();
    setIsTrackOrdersOpen(!isTrackOrdersOpen);
  };

  const handleAddNew = () => {
    setShowAdminPanel(true);
    setActiveTab('new');
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-container">
        <nav className="sidebar-nav">
          {/* Add New Order */}
          <div
            className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
            onClick={handleAddNew}
          >
            <Plus size={16} className="nav-icon" />
            <span className="nav-text">Add New Order</span>
          </div>

          {/* Track Orders Folder */}
          <div className="nav-folder">
            <div
              className={`nav-folder-header ${
                (activeTab === 'orders' || activeTab === 'ready') ? 'active' : ''
              }`}
              onClick={toggleTrackOrders}
            >
              <FileText size={16} className="nav-icon" />
              <span className="nav-text">Track Orders</span>
              <span className="nav-arrow">
                {isTrackOrdersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </div>

            {isTrackOrdersOpen && (
              <div className="nav-folder-content">
                <div
                  className={`nav-item sub-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  Total Orders ({projects.length})
                </div>
                <div
                  className={`nav-item sub-item ${activeTab === 'ready' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ready')}
                >
                  Ready to Deliver ({getReadyCount()})
                </div>
                <div
                  className={`nav-item sub-item ${activeTab === 'progress' ? 'active' : ''}`}
                  onClick={() => setActiveTab('progress')}
                >
                  In Progress ({getInProgressCount()})
                </div>
              </div>
            )}
          </div>

          {/* Payments */}
          <div
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={16} className="nav-icon" />
            <span className="nav-text">All Payments(Restricted)</span>
          </div>

          {/* Nearby Submission */}
          <div
            className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            <FileText size={16} className="nav-icon" />
            <span className="nav-text">Nearby Submission ({getNearbyCount()})</span>
          </div>

          {/* Manage Employees */}
          <div
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={16} className="nav-icon" />
            <span className="nav-text">Manage Employees</span>
          </div>

          {/* Sign Out */}
          <div className="nav-item signout" onClick={handleSignOut}>
            <LogOut size={16} className="nav-icon" />
            <span className="nav-text">Sign Out</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SidebarNav;