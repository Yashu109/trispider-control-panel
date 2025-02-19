// import { useState, useEffect } from 'react';
// import { ref, onValue, push, update } from 'firebase/database';
// import { database } from '../../firebase';
// import { useNavigate } from 'react-router-dom';
// import './UserDashboard.css';
// import { Bell, X } from "lucide-react"; // Import the bell and close icons

// const UserDashboard = () => {
//   const [orderData, setOrderData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState('');
//   const [queryStatus, setQueryStatus] = useState('');
//   const [queryType, setQueryType] = useState('');
//   const [showNotificationModal, setShowNotificationModal] = useState(false);
//   const [acceptedQueries, setAcceptedQueries] = useState([]);
//   const navigate = useNavigate();

//   // Fetch order data and accepted queries
//   useEffect(() => {
//     const orderId = sessionStorage.getItem('orderId');

//     if (!orderId) {
//       navigate('/');
//       return;
//     }

//     const orderRef = ref(database, `projects/${orderId}`);

//     // Fetch order data
//     const unsubscribeOrder = onValue(orderRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const projectData = snapshot.val();
//         setOrderData(projectData);

//         // Check for query status
//         if (projectData.queryStatus) {
//           setQueryStatus(projectData.queryStatus);

//           // Clear status after 5 seconds
//           setTimeout(() => {
//             update(orderRef, {
//               queryStatus: null,
//               queryActionStatus: null
//             });
//           }, 5000);
//         }
//       } else {
//         console.error('Order not found');
//         navigate('/');
//       }
//       setLoading(false);
//     }, (error) => {
//       console.error('Error fetching order:', error);
//       setLoading(false);
//     });

//     // Fetch accepted queries
//     // const acceptedQueriesRef = ref(database, `Accepted_Queries/KS5066`);
//     // console.log('Reference Path:',acceptedQueriesRef);
//     // const unsubscribeAcceptedQueries = onValue(acceptedQueriesRef, (snapshot) => {
//     //   if (snapshot.exists()) {
//     //     const queriesData = [];
//     //     snapshot.forEach((childSnapshot) => {
//     //       const queryData = childSnapshot.val();

//     //       // Convert queryStatus and queryText from array of characters to string
//     //       const queryStatus = Array.isArray(queryData.queryStatus)
//     //         ? queryData.queryStatus.join('') // Convert array to string
//     //         : queryData.queryStatus || ''; // Fallback to empty string if not an array

//     //       const queryText = Array.isArray(queryData.queryText)
//     //         ? queryData.queryText.join('') // Convert array to string
//     //         : queryData.queryText || ''; // Fallback to empty string if not an array

//     //       queriesData.push({
//     //         id: childSnapshot.key,
//     //         queryStatus,
//     //         queryText,
//     //         timestamp: queryData.timestamp || ''
//     //       });
//     //     });
//     //     setAcceptedQueries(queriesData);
//     //   } else {
//     //     setAcceptedQueries([]);
//     //   }
//     // });

//     //   // Cleanup listeners
//     //   return () => {
//     //     unsubscribeOrder();
//     //     unsubscribeAcceptedQueries();
//     //   };
//     // }, [navigate]);
//     const acceptedQueriesRef = ref(database, `Accepted_Queries/${orderId}`);

//     const unsubscribeAcceptedQueries = onValue(acceptedQueriesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const queriesData = [];
//         snapshot.forEach((childSnapshot) => {
//           const queryData = childSnapshot.val();
//           if (queryData) {
//             queriesData.push({
//               id: childSnapshot.key,
//               queryStatus: queryData.queryStatus || '',
//               queryText: queryData.queryText || '',
//               timestamp: queryData.timestamp || '',
//               queryType: queryData.queryType || ''
//             });
//           }
//         });
//         setAcceptedQueries(queriesData);
//       } else {
//         setAcceptedQueries([]);
//       }
//     });


//     return () => {
//       unsubscribeAcceptedQueries();
//       unsubscribeOrder();
//     };
//   }, [navigate]);
//   // Handle query input change
//   const handleQueryChange = (e) => {
//     setQuery(e.target.value);
//   };

//   // Handle sending a query
//   const handleSendQueryType = () => {
//     if (!queryType) {
//       setQueryStatus('Please select a query type.');
//       setTimeout(() => setQueryStatus(''), 3000);
//       return;
//     }

//     if (query.trim()) {
//       const queryRef = ref(database, `queries/${orderData.projectId}`);
//       const newQuery = {
//         queryText: query,
//         queryType: queryType,
//         timestamp: new Date().toISOString(),
//         status: 'pending'
//       };

//       push(queryRef, newQuery)
//         .then(() => {
//           setQueryStatus('Query sent successfully! Our team will review it soon.');
//           setQuery('');
//           setQueryType('');
//           setTimeout(() => setQueryStatus(''), 3000);
//         })
//         .catch((error) => {
//           console.error('Error saving query:', error);
//           setQueryStatus('Failed to send query. Please try again.');
//           setTimeout(() => setQueryStatus(''), 3000);
//         });
//     } else {
//       setQueryStatus('Please enter a query before sending.');
//       setTimeout(() => setQueryStatus(''), 3000);
//     }
//   };

//   // Loading state
//   if (loading) {
//     return <div className="dashboard-loading">Loading...</div>;
//   }

//   // Error state
//   if (!orderData) {
//     return <div className="dashboard-error">Order not found</div>;
//   }

//   return (
//     <div className="user-dashboard-container">
//       <div className="user-dashboard-content">
//         {/* Header with notification icon */}
//         <div className="user-dashboard-header">
//           <h1>Project Details</h1>
//           <span className={`status-badge status-${orderData.status?.toLowerCase()}`}>
//             {orderData.status}
//           </span>
//           {/* Only show notification icon and badge if there are accepted queries */}
//           {acceptedQueries.length > 0 && (
//             <div className="notification-icon" onClick={() => setShowNotificationModal(true)}>
//               <Bell size={24} />
//               <span className="notification-badge">{acceptedQueries.length}</span>
//             </div>
//           )}
//         </div>

//         {/* Project details form */}
//         <div className="form-container">
//           <form className="project-form">
//             {/* Basic Information */}
//             <div className="form-section">
//               <h2>Basic Information</h2>
//               <div className="dashboard-form-group">
//                 <label>Project ID</label>
//                 <input
//                   type="text"
//                   value={orderData.projectId || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Client Name</label>
//                 <input
//                   type="text"
//                   value={orderData.clientName || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Phone Number</label>
//                 <input
//                   type="text"
//                   value={orderData.phoneNumber || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Project Selection</label>
//                 <input
//                   type="text"
//                   value={orderData.projectSelection || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Order Date</label>
//                 <input
//                   type="text"
//                   value={orderData.timeline || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Referred By</label>
//                 <input
//                   type="text"
//                   value={orderData.referredBy || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Total Payment</label>
//                 <input
//                   type="text"
//                   value={orderData.totalPayment || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Total Remaining</label>
//                 <input
//                   type="text"
//                   value={orderData.totalRemaining || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Whatsapp Number</label>
//                 <input
//                   type="text"
//                   value={orderData.whatsappNumber || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Advance Payment</label>
//                 <input
//                   type="text"
//                   value={orderData.advancePayment || ''}
//                   readOnly
//                 />
//               </div>

//               <div className="dashboard-form-group">
//                 <label>Alternative Number</label>
//                 <input
//                   type="text"
//                   value={orderData.alternativeNumber || ''}
//                   readOnly
//                 />
//               </div>
//             </div>

//             {/* Assignments */}
//             {orderData.assignments && Array.isArray(orderData.assignments) && (
//               <div className="form-section">
//                 <h2>Assignments</h2>
//                 <div className="dashboard-form-group">
//                   {orderData.assignments.map((assignment, index) => (
//                     <div key={index}>
//                       <p><strong>Assignee:</strong> {assignment.assignee}</p>
//                       <p><strong>Percentage:</strong> {assignment.percentage}%</p>
//                       {assignment.taskCompleted && (
//                         <div>
//                           <strong>Task Completed:</strong>
//                           <p>{assignment.taskCompleted}</p>
//                         </div>
//                       )}
//                       {assignment.description && (
//                         <div>
//                           <strong>Description:</strong>
//                           <p>{assignment.description}</p>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Project Description */}
//             {orderData.description && (
//               <div className="form-section">
//                 <h2>Project Description</h2>
//                 <div className="dashboard-form-group">
//                   <textarea
//                     value={orderData.description}
//                     rows="4"
//                     readOnly
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Scope of Work */}
//             {orderData.scopeOfWork && (
//               <div className="form-section">
//                 <h2>Scope Of Work</h2>
//                 <div className="dashboard-form-group">
//                   <textarea
//                     value={orderData.scopeOfWork}
//                     rows="4"
//                     readOnly
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Requirements */}
//             {orderData.requirements && (
//               <div className="form-section">
//                 <h2>Requirements</h2>
//                 <div className="dashboard-form-group">
//                   <textarea
//                     value={orderData.requirements}
//                     readOnly
//                     rows="4"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Documents */}
//             {orderData.documents && (
//               <div className="form-section">
//                 <h2>Project Documents</h2>
//                 <div className="documents-list">
//                   {Object.entries(orderData.documents).map(([key, url]) => (
//                     <div key={key} className="document-item">
//                       <span>{key}</span>
//                       <a href={url} target="_blank" rel="noopener noreferrer">
//                         View Document
//                       </a>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Milestones */}
//             {orderData.milestones && (
//               <div className="form-section">
//                 <h2>Project Milestones</h2>
//                 <div className="milestones-list">
//                   {orderData.milestones.map((milestone, index) => (
//                     <div key={index} className="milestone-item">
//                       <div className="milestone-header">
//                         <span className="milestone-title">{milestone.title}</span>
//                         <span className={`milestone-status status-${milestone.status?.toLowerCase()}`}>
//                           {milestone.status}
//                         </span>
//                       </div>
//                       <p className="milestone-description">{milestone.description}</p>
//                       {milestone.dueDate && (
//                         <p className="milestone-date">Due: {milestone.dueDate}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Query Input Section */}
//             <div className="form-section">
//               <h2>Submit a Query</h2>
//               {queryStatus && (
//                 <div className="query-status-message">
//                   {queryStatus}
//                 </div>
//               )}
//               <div className="dashboard-form-group">
//                 <label>Query Type</label>
//                 <select
//                   value={queryType}
//                   onChange={(e) => setQueryType(e.target.value)}
//                   className="query-type-select"
//                 >
//                   <option value="">Select Query Type</option>
//                   <option value="quotation">Quotation Related</option>
//                   <option value="payment">Payment Related</option>
//                   <option value="deadline">Deadline</option>
//                   <option value="projects">Prototype Related</option>
//                   <option value="progress">Progress Update</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>
//               <div className="dashboard-form-group">
//                 <label>Query Details</label>
//                 <textarea
//                   value={query}
//                   onChange={handleQueryChange}
//                   rows="4"
//                   placeholder="Enter your query details here"
//                 />
//               </div>
//               <div className="dashboard-form-group">
//                 <button
//                   type="button"
//                   onClick={handleSendQueryType}
//                   className="submit-query-btn"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Notification Modal */}
//         {showNotificationModal && acceptedQueries.length > 0 && (
//           <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
//             <div className="modal-content" onClick={e => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2>Accepted Queries for Project {orderData.projectId}</h2>
//                 <button
//                   onClick={() => setShowNotificationModal(false)}
//                   className="close-button"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <div className="queries-list">
//                 {acceptedQueries.map((query) => (
//                   <div key={query.id} className="query-item">
//                     <div className="query-info">
//                       <div className="dashboard-form-group">
//                         <label>Query Status:</label>
//                         <input
//                           type="text"
//                           value={query.queryStatus}
//                           readOnly
//                         />
//                       </div>
//                       <div className="dashboard-form-group">
//                         <label>Query Text:</label>
//                         <textarea
//                           rows="4"
//                           value={query.queryText}
//                           readOnly
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;

import { useState, useEffect } from 'react';
import { ref, onValue, push, update } from 'firebase/database';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { Bell, X } from "lucide-react";


const UserDashboard = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [queryStatus, setQueryStatus] = useState('');
  const [queryType, setQueryType] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [acceptedQueries, setAcceptedQueries] = useState([]);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = sessionStorage.getItem('orderId');

    if (!orderId) {
      navigate('/');
      return;
    }

    const orderRef = ref(database, `projects/${orderId}`);

    const unsubscribeOrder = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const projectData = snapshot.val();
        setOrderData(projectData);

        if (projectData.queryStatus) {
          setQueryStatus(projectData.queryStatus);
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

    const acceptedQueriesRef = ref(database, `Accepted_Queries/${orderId}`);

    const unsubscribeAcceptedQueries = onValue(acceptedQueriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const queriesData = [];
        snapshot.forEach((childSnapshot) => {
          const queryData = childSnapshot.val();
          if (queryData) {
            queriesData.push({
              id: childSnapshot.key,
              queryStatus: queryData.queryStatus || '',
              queryText: queryData.queryText || '',
              timestamp: queryData.timestamp || '',
              queryType: queryData.queryType || ''
            });
          }
        });
        setAcceptedQueries(queriesData);
      } else {
        setAcceptedQueries([]);
      }
    });

    return () => {
      unsubscribeAcceptedQueries();
      unsubscribeOrder();
    };
  }, [navigate]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

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
        queryType: queryType,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      push(queryRef, newQuery)
        .then(() => {
          setQueryStatus('Query sent successfully! Our team will review it soon.');
          setQuery('');
          setQueryType('');
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


const fetchPDF = async () => {
  if (!orderData || !orderData.projectId) {
    setQueryStatus('Project data not available.');
    setTimeout(() => setQueryStatus(''), 3000);
    return;
  }

  try {
    const pdfRef = storageRef(storage, `quotations/${orderData.projectId}.pdf`);
    const url = await getDownloadURL(pdfRef);
    
    if (url) {
      setPdfUrl(url);
      setShowPDFModal(true);
    } else {
      throw new Error("PDF URL not found.");
    }
  } catch (error) {
    console.error('Error fetching PDF from Storage:', error);

    let errorMessage = 'Failed to load PDF.';
    if (error.code === 'storage/object-not-found') {
      errorMessage = 'PDF not found in storage.';
    } else if (error.code === 'storage/unauthorized') {
      errorMessage = 'You do not have permission to access this PDF.';
    }

    setQueryStatus(errorMessage);
    setPdfUrl(null); // Reset state to avoid showing a previous PDF
    setTimeout(() => setQueryStatus(''), 3000);
  }
};


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
          {acceptedQueries.length > 0 && (
            <div className="notification-icon" onClick={() => setShowNotificationModal(true)}>
              <Bell size={24} />
              <span className="notification-badge">{acceptedQueries.length}</span>
            </div>
          )}
          <button className="pdf-button" onClick={fetchPDF}>
            View Quotation PDF
          </button>
        </div>

        <div className="form-container">
          <form className="project-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="dashboard-form-group">
                <label>Project ID</label>
                <input type="text" value={orderData.projectId || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Client Name</label>
                <input type="text" value={orderData.clientName || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Phone Number</label>
                <input type="text" value={orderData.phoneNumber || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Project Selection</label>
                <input type="text" value={orderData.projectSelection || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Order Date</label>
                <input type="text" value={orderData.timeline || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Referred By</label>
                <input type="text" value={orderData.referredBy || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Total Payment</label>
                <input type="text" value={orderData.totalPayment || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Total Remaining</label>
                <input type="text" value={orderData.totalRemaining || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Whatsapp Number</label>
                <input type="text" value={orderData.whatsappNumber || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Advance Payment</label>
                <input type="text" value={orderData.advancePayment || ''} readOnly />
              </div>

              <div className="dashboard-form-group">
                <label>Alternative Number</label>
                <input type="text" value={orderData.alternativeNumber || ''} readOnly />
              </div>
            </div>

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

            {orderData.description && (
              <div className="form-section">
                <h2>Project Description</h2>
                <div className="dashboard-form-group">
                  <textarea value={orderData.description} rows="4" readOnly />
                </div>
              </div>
            )}

            {orderData.scopeOfWork && (
              <div className="form-section">
                <h2>Scope Of Work</h2>
                <div className="dashboard-form-group">
                  <textarea value={orderData.scopeOfWork} rows="4" readOnly />
                </div>
              </div>
            )}

            {orderData.requirements && (
              <div className="form-section">
                <h2>Requirements</h2>
                <div className="dashboard-form-group">
                  <textarea value={orderData.requirements} readOnly rows="4" />
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

            <div className="form-section">
              <h2>Submit a Query</h2>
              {queryStatus && <div className="query-status-message">{queryStatus}</div>}
              <div className="dashboard-form-group">
                <label>Query Type</label>
                <select value={queryType} onChange={(e) => setQueryType(e.target.value)} className="query-type-select">
                  <option value="">Select Query Type</option>
                  <option value="quotation">Quotation Related</option>
                  <option value="payment">Payment Related</option>
                  <option value="deadline">Deadline</option>
                  <option value="projects">Prototype Related</option>
                  <option value="progress">Progress Update</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="dashboard-form-group">
                <label>Query Details</label>
                <textarea value={query} onChange={handleQueryChange} rows="4" placeholder="Enter your query details here" />
              </div>
              <div className="dashboard-form-group">
                <button type="button" onClick={handleSendQueryType} className="submit-query-btn">
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>

        {showNotificationModal && acceptedQueries.length > 0 && (
          <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
            <div className="user-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Accepted Queries for Project {orderData.projectId}</h2>
                <button onClick={() => setShowNotificationModal(false)} className="close-button">
                  <X size={20} />
                </button>
              </div>
              <div className="queries-list">
                {acceptedQueries.map((query) => (
                  <div key={query.id} className="query-item">
                    <div className="query-info">
                      <div className="dashboard-form-group">
                        <label>Query Status:</label>
                        <input type="text" value={query.queryStatus} readOnly />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Query Text:</label>
                        <textarea rows="4" value={query.queryText} readOnly />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showPDFModal && pdfUrl && (
          <div className="modal-overlay" onClick={() => setShowPDFModal(false)}>
            <div className="user-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Quotation PDF</h2>
                <button onClick={() => setShowPDFModal(false)} className="close-button">
                  <X size={20} />
                </button>
              </div>
              <div className="pdf-viewer">
                <iframe src={pdfUrl} width="100%" height="500px" title="Quotation PDF" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
