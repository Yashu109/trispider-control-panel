// import { useState, useEffect } from 'react';
// import { database } from '../../firebase';
// import { ref, onValue, set, getDatabase } from 'firebase/database';
// import { useNavigate } from 'react-router-dom';
// import './DraftQuotations.css'; // Optional CSS file for styling

// const DraftQuotations = () => {
//   const navigate = useNavigate();
//   const [drafts, setDrafts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDrafts = () => {
//       try {
//         const db = getDatabase();
//         const draftsRef = ref(db, 'drafts');
//         onValue(draftsRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             const draftsArray = Object.values(data).map(draft => ({
//               ...draft,
//               draftId: draft.draftId || Object.keys(data).find(key => data[key] === draft) // Ensure draftId is set
//             }));
//             setDrafts(draftsArray);
//           } else {
//             setDrafts([]);
//           }
//           setLoading(false);
//         }, (error) => {
//           setError('Failed to fetch drafts');
//           setLoading(false);
//           console.error('Error fetching drafts:', error);
//         });
//       } catch (error) {
//         setError('Failed to fetch drafts');
//         setLoading(false);
//         console.error('Error setting up Firebase listener:', error);
//       }
//     };

//     fetchDrafts();
//   }, []);

//   const handleReviewDraft = (draft) => {
//     navigate('/admin-dashboard', { state: { draft } }); // Navigate back to AdminDashboard with draft data
//   };

//   const handleDeleteDraft = async (draftId) => {
//     try {
//       const db = getDatabase();
//       const draftRef = ref(db, `drafts/${draftId}`);
//       await set(draftRef, null);
//       setDrafts(drafts.filter(draft => draft.draftId !== draftId));
//       setMessage('Draft deleted successfully!');
//     } catch (error) {
//       setError('Failed to delete draft');
//       console.error('Error deleting draft:', error);
//     }
//   };

//   const handleEditDraft = (draft) => {
//     navigate('/admin-dashboard', { state: { draft, edit: true } }); // Navigate back to edit the draft
//   };

//   if (loading) return <div>Loading drafts...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="draft-quotations-container">
//       <h1>Draft Quotations</h1>
//       {drafts.length === 0 ? (
//         <p>No drafts found.</p>
//       ) : (
//         <ul className="drafts-list">
//           {drafts.map(draft => (
//             <li key={draft.draftId} className="draft-item">
//               <h3>{draft.title}</h3>
//               <p>Client: {draft.clientName}</p>
//               <p>Created: {new Date(draft.timestamp).toLocaleDateString()}</p>
//               <div className="draft-actions">
//                 <button onClick={() => handleReviewDraft(draft)}>Review</button>
//                 <button onClick={() => handleEditDraft(draft)}>Edit</button>
//                 <button onClick={() => handleDeleteDraft(draft.draftId)}>Delete</button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//       <button onClick={() => navigate('/admin-dashboard')} className="back-button">Back to Dashboard</button>
//     </div>
//   );
// };

// export default DraftQuotations;