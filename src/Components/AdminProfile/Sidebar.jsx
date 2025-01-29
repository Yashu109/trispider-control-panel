// SidebarNav.js
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Users } from "lucide-react";

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

    const toggleTrackOrders = () => {
        setIsTrackOrdersOpen(!isTrackOrdersOpen);
    };

    const handleAddNew = () => {
        setShowAdminPanel(true);
        setActiveTab('');
    };

    return (
        <nav className="sidebar-nav">
            <div 
                className={`nav-item   ${ activeTab === 'new' ? 'active' : ''}`}
                onClick={handleAddNew}
            >
                <Plus size={16} />
                <span>Add New Order</span>
            </div>

            <div className="nav-folder">
                <div
                    className={`nav-folder-header ${(activeTab === 'orders' || activeTab === 'ready') ? 'active' : ''}`}
                    onClick={toggleTrackOrders}
                >
                    <span>Track Orders</span>
                    {isTrackOrdersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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

            <div
                className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveTab('employees')}
            >
                <Users size={16} />
                <span>Manage Employees</span>
            </div>
            
            <div className="nav-item signout" onClick={handleSignOut}>
                Sign Out
            </div>
        </nav>
    );
};

export default SidebarNav;