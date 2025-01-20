import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = sessionStorage.getItem('orderId');
    
    if (!orderId) {
      navigate('/');
      return;
    }

    const orderRef = ref(database, `projects/${orderId}`);
    
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrderData(snapshot.val());
      } else {
        console.error('Order not found');
        navigate('/');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching order:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!orderData) {
    return <div className="dashboard-error">Order not found</div>;
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-content">
        <div className="user-dashboard-header">
          <h1>Project Details</h1>
          <span className={`status-badge status-${orderData.status?.toLowerCase()}`}>
            {orderData.status}
          </span>
        </div>

        <div className="form-container">
          <form className="project-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="dashboard-form-group">
                <label>Project ID</label>
                <input 
                  type="text" 
                  value={orderData.projectId || ''} 
                  readOnly 
                />
              </div>

              <div className="dashboard-form-group">
                <label>Client Name</label>
                <input 
                  type="text" 
                  value={orderData.clientName || ''} 
                  readOnly 
                />
              </div>

              <div className="dashboard-form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={orderData.phoneNumber || ''} 
                  readOnly 
                />
              </div>

              <div className="dashboard-form-group">
                <label>Project Selection</label>
                <input 
                  type="text" 
                  value={orderData.projectSelection || ''} 
                  readOnly 
                />
              </div>

              <div className="dashboard-form-group">
                <label>Order Date</label>
                <input 
                  type="text" 
                  value={orderData.timeline || ''} 
                  readOnly 
                />
              </div>
            </div>

            {orderData.description && (
              <div className="form-section">
                <h2>Project Description</h2>
                <div className="dashboard-form-group">
                  <textarea 
                    value={orderData.description} 
                    // readOnly 
                    rows="4"
                  />
                </div>
              </div>
            )}

            {orderData.requirements && (
              <div className="form-section">
                <h2>Requirements</h2>
                <div className="dashboard-form-group">
                  <textarea 
                    value={orderData.requirements} 
                    readOnly 
                    rows="4"
                  />
                </div>
              </div>
            )}

            {orderData.documents && (
              <div className="form-section">
                <h2>Project Documents</h2>
                <div className="documents-list">
                  {Object.entries(orderData.documents).map(([key, url]) => (
                    <div key={key} className="document-item">
                      <span>{key}</span>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orderData.milestones && (
              <div className="form-section">
                <h2>Project Milestones</h2>
                <div className="milestones-list">
                  {orderData.milestones.map((milestone, index) => (
                    <div key={index} className="milestone-item">
                      <div className="milestone-header">
                        <span className="milestone-title">{milestone.title}</span>
                        <span className={`milestone-status status-${milestone.status?.toLowerCase()}`}>
                          {milestone.status}
                        </span>
                      </div>
                      <p className="milestone-description">{milestone.description}</p>
                      {milestone.dueDate && (
                        <p className="milestone-date">Due: {milestone.dueDate}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;