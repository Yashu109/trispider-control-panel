import { useState, useEffect } from 'react';
import { ref, onValue, push, update } from 'firebase/database';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [queryStatus, setQueryStatus] = useState('');
  const navigate = useNavigate();
  const [queryType, setQueryType] = useState('');
  useEffect(() => {
    const orderId = sessionStorage.getItem('orderId');

    if (!orderId) {
      navigate('/');
      return;
    }

    const orderRef = ref(database, `projects/${orderId}`);

    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const projectData = snapshot.val();
        setOrderData(projectData);

        // Check for query status from the project
        if (projectData.queryStatus) {
          setQueryStatus(projectData.queryStatus);

          // Optional: Clear status after some time
          setTimeout(() => {
            update(orderRef, {
              queryStatus: null,
              queryActionStatus: null
            });
          }, 5000);
        }
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
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  // const handleSendQuery = () => {
  //   if (query.trim()) {
  //     const queryRef = ref(database, `queries/${orderData.projectId}`);
  //     const newQuery = {
  //       queryText: query,
  //       timestamp: new Date().toISOString(),
  //       status: 'pending'
  //     };

  //     push(queryRef, newQuery)
  //       .then(() => {
  //         setQueryStatus('Query sent successfully! Our team will review it soon.');
  //         setQuery('');
  //         setTimeout(() => setQueryStatus(''), 3000);
  //       })
  //       .catch((error) => {
  //         console.error('Error saving query:', error);
  //         setQueryStatus('Failed to send query. Please try again.');
  //         setTimeout(() => setQueryStatus(''), 3000);
  //       });
  //   } else {
  //     setQueryStatus('Please enter a query before sending.');
  //     setTimeout(() => setQueryStatus(''), 3000);
  //   }
  // };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!orderData) {
    return <div className="dashboard-error">Order not found</div>;
  }

  const handleSendQueryType = () => {
    if (!queryType) {
      setQueryStatus('Please select a query type.');
      setTimeout(() => setQueryStatus(''), 3000);
      return;
    }

    if (query.trim()) {
      const queryRef = ref(database, `queries/${orderData.projectId}`);
      const newQuery = {
        queryText: query,
        queryType: queryType,  // Add query type to the data
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      push(queryRef, newQuery)
        .then(() => {
          setQueryStatus('Query sent successfully! Our team will review it soon.');
          setQuery('');
          setQueryType(''); // Reset query type
          setTimeout(() => setQueryStatus(''), 3000);
        })
        .catch((error) => {
          console.error('Error saving query:', error);
          setQueryStatus('Failed to send query. Please try again.');
          setTimeout(() => setQueryStatus(''), 3000);
        });
    } else {
      setQueryStatus('Please enter a query before sending.');
      setTimeout(() => setQueryStatus(''), 3000);
    }
  };

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

              <div className="dashboard-form-group">
                <label>Referred By</label>
                <input
                  type="text"
                  value={orderData.referredBy || ''}
                  readOnly
                />
              </div>
              <div className="dashboard-form-group">
                <label>Total Payment</label>
                <input
                  type="text"
                  value={orderData.totalPayment || ''}
                  readOnly
                />
              </div>

              <div className="dashboard-form-group">
                <label>Total Remaining</label>
                <input
                  type="text"
                  value={orderData.totalRemaining || ''}
                  readOnly
                />
              </div>

              <div className="dashboard-form-group">
                <label>Whatsapp Number</label>
                <input
                  type="text"
                  value={orderData.whatsappNumber || ''}
                  readOnly
                />
              </div>

              <div className="dashboard-form-group">
                <label>Advance Payment</label>
                <input
                  type="text"
                  value={orderData.advancePayment || ''}
                  readOnly
                />
              </div>

              <div className="dashboard-form-group">
                <label>Alternative Number</label>
                <input
                  type="text"
                  value={orderData.alternativeNumber || ''}
                  readOnly
                />
              </div>
            </div>

            {/* Handling Assignments */}
            {orderData.assignments && Array.isArray(orderData.assignments) && (
              <div className="form-section">
                <h2>Assignments</h2>
                <div className="dashboard-form-group">
                  {orderData.assignments.map((assignment, index) => (
                    <div key={index}>
                      <p><strong>Assignee:</strong> {assignment.assignee}</p>
                      <p><strong>Percentage:</strong> {assignment.percentage}%</p>
                      {assignment.taskCompleted && (
                        <div>
                          <strong>Task Completed:</strong>
                          <p>{assignment.taskCompleted}</p>
                        </div>
                      )}
                      {assignment.description && (
                        <div>
                          <strong>Description:</strong>
                          <p>{assignment.description}</p>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If assignments is not an array, handle it as an object */}
            {orderData.assignments && !Array.isArray(orderData.assignments) && (
              <div className="form-section">
                <h2>Assignments</h2>
                <div className="dashboard-form-group">
                  {Object.entries(orderData.assignments).map(([assignment], index) => (
                    <div key={index}>
                      <p><strong>Assignee:</strong> {assignment.assignee}</p>
                      <p><strong>Percentage:</strong> {assignment.percentage}%</p>
                      {assignment.taskCompleted && (
                        <div>
                          <strong>Task Completed:</strong>
                          <p>{assignment.taskCompleted}</p>
                        </div>
                      )}
                      {assignment.description && (
                        <div>
                          <strong>Description:</strong>
                          <p>{assignment.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orderData.description && (
              <div className="form-section">
                <h2>Project Description</h2>
                <div className="dashboard-form-group">
                  <textarea
                    value={orderData.description}
                    rows="4"
                    readOnly
                  />
                </div>
              </div>
            )}
            {orderData.scopeOfWork && (
              <div className="form-section">
                <h2>Scope Of Work </h2>
                <div className="dashboard-form-group">
                  <textarea
                    value={orderData.scopeOfWork}
                    rows="4"
                    readOnly
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

            {/* Query Input Section */}
            <div className="form-section">
              <h2>Submit a Query</h2>
              {queryStatus && (
                <div className="query-status-message">
                  {queryStatus}
                </div>
              )}
              <div className="dashboard-form-group">
                <label>Query Type</label>
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  className="query-type-select"
                >
                  <option value="">Select Query Type</option>
                  <option value="quotation">Quotation Related</option>
                  <option value="payment">Payment Related</option>
                  <option value="deadline">Deadline </option>
                  <option value="projects">Prototype Related</option>
                  <option value="progress">Progress Update</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="dashboard-form-group">
                <label>Query Details</label>
                <textarea
                  value={query}
                  onChange={handleQueryChange}
                  rows="4"
                  placeholder="Enter your query details here"
                />
              </div>
              <div className="dashboard-form-group">
                <button
                  type="button"
                  onClick={handleSendQueryType}
                  className="submit-query-btn"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
