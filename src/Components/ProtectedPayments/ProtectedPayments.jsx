// // src/Components/AdminProfile/ProtectedPayments.jsx
// import { useState } from 'react';
// import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
// import './ProtectedPayments.css';

// const ProtectedPayments = ({ projects, formatCurrency }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // You should replace this with your actual password
//   const ADMIN_PASSWORD = "admin123";

//   const handlePasswordSubmit = (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     // Simulate API call delay
//     setTimeout(() => {
//       if (password === ADMIN_PASSWORD) {
//         setIsAuthenticated(true);
//         setError('');
//       } else {
//         setError('Incorrect password. Please try again.');
//       }
//       setIsLoading(false);
//     }, 500);
//   };

//   const calculateTotals = () => {
//     return projects.reduce((acc, project) => {
//       return {
//         totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
//         totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
//         totalProjects: acc.totalProjects + 1,
//         completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
//       };
//     }, { totalPayments: 0, totalRemaining: 0, totalProjects: 0, completeProjects: 0 });
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="protected-payments">
//         <div className="password-container">
//           <div className="password-header">
//             <Lock className="lock-icon" />
//             <h2>Protected Area</h2>
//             <p>Please enter the admin password to view payment details</p>
//           </div>

//           <form onSubmit={handlePasswordSubmit} className="password-form">
//             <div className="password-input-group">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="password-input"
//                 placeholder="Enter password"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="toggle-password"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>

//             {error && (
//               <div className="error-message">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="submit-button"
//             >
//               {isLoading && <Loader2 className="spinner" />}
//               Access Payment Details
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   const totals = calculateTotals();

//   return (
//     <div className="payments-dashboard">
//       {/* Summary Cards */}
//       <div className="summary-cards">
//         <div className="summary-card">
//           <h3>Total Payments</h3>
//           <p className="total-payments">{formatCurrency(totals.totalPayments)}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Total Remaining</h3>
//           <p className="total-remaining">{formatCurrency(totals.totalRemaining)}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Total Projects</h3>
//           <p className="total-projects">{totals.totalProjects}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Completed Projects</h3>
//           <p className="completed-projects">{totals.completeProjects}</p>
//         </div>
//       </div>

//       {/* Payments Table */}
//       <div className="payments-table-container">
//         <div className="payments-table-header">
//           <h2>Payment Details</h2>
//         </div>
//         <div className="table-wrapper">
//           <table className="payments-table">
//             <thead>
//               <tr>
//                 <th>Project ID</th>
//                 <th>Client Name</th>
//                 <th>Total Payment</th>
//                 <th>Remaining</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.map((project) => (
//                 <tr key={project.id}>
//                   <td>{project.projectId}</td>
//                   <td>{project.clientName}</td>
//                   <td className="total-payments">
//                     {formatCurrency(project.totalPayment || 0)}
//                   </td>
//                   <td className="total-remaining">
//                     {formatCurrency(project.totalRemaining || 0)}
//                   </td>
//                   <td>
//                     <span className={`status-badge ${
//                       project.projectStatus === 'Complete' ? 'status-complete' :
//                       project.projectStatus === 'Middle' ? 'status-progress' :
//                       'status-start'
//                     }`}>
//                       {project.projectStatus || 'Start'}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProtectedPayments;

// src/Components/AdminProfile/ProtectedPayments.jsx
import { useState, useEffect } from 'react';
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { database } from '../../firebase';
import { ref, get, set } from 'firebase/database';
import './ProtectedPayments.css';

const ProtectedPayments = ({ projects, formatCurrency }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');

  // Check if password exists in Firebase
  useEffect(() => {
    const checkPassword = async () => {
      try {
        const passwordRef = ref(database, 'adminPassword');
        const snapshot = await get(passwordRef);

        if (snapshot.exists()) {
          setHasExistingPassword(true);
          setStoredPassword(snapshot.val());
        } else {
          setHasExistingPassword(false);
        }
      } catch (err) {
        console.error('Error checking password:', err);
        setError('Error checking authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkPassword();
  }, []);

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const passwordRef = ref(database, 'adminPassword');
      await set(passwordRef, password);
      setStoredPassword(password);
      setHasExistingPassword(true);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error creating password:', err);
      setError('Failed to create password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password === storedPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="protected-payments">
        <div className="password-container">
          <div className="password-header">
            <Lock className="lock-icon" />
            <h2>{hasExistingPassword ? 'Enter Password' : 'Create Password'}</h2>
            <p>
              {hasExistingPassword
                ? 'Please enter your password to view payment details'
                : 'Create a password to protect your payment details'}
            </p>
          </div>

          <form onSubmit={hasExistingPassword ? handlePasswordLogin : handleCreatePassword}
            className="password-form">
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
                placeholder={hasExistingPassword ? "Enter password" : "Create password"}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!hasExistingPassword && (
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="password-input"
                  placeholder="Confirm password"
                  required
                  minLength="6"
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading && <Loader2 className="spinner" />}
              {hasExistingPassword ? 'Access Payment Details' : 'Create Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  const calculateTotals = () => {
    return projects.reduce((acc, project) => {
      return {
        totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
        totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
        totalProjects: acc.totalProjects + 1,
        completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
      };
    }, { totalPayments: 0, totalRemaining: 0, totalProjects: 0, completeProjects: 0 });
  };
  // Rest of your existing code for displaying payments dashboard
  const totals = calculateTotals();

  return (
    <div className="payments-dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Payments</h3>
          <p className="total-payments">{formatCurrency(totals.totalPayments)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Remaining</h3>
          <p className="total-remaining">{formatCurrency(totals.totalRemaining)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Projects</h3>
          <p className="total-projects">{totals.totalProjects}</p>
        </div>
        <div className="summary-card">
          <h3>Completed Projects</h3>
          <p className="completed-projects">{totals.completeProjects}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <div className="payments-table-header">
          <h2>Payment Details</h2>
        </div>
        <div className="table-wrapper">
          <table className="payments-table">
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
                <th>Assign To</th>
                <th>Total Payment</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
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
                  <td>{project.assignedTo || 'Select Member'}</td>
                  <td className="total-payments">
                    {formatCurrency(project.totalPayment || 0)}
                  </td>
                  <td className="total-remaining">
                    {formatCurrency(project.totalRemaining || 0)}
                  </td>
                  <td>
                    <span className={`status-badge ${project.projectStatus === 'Complete' ? 'status-complete' :
                      project.projectStatus === 'Middle' ? 'status-progress' :
                        'status-start'
                      }`}>
                      {project.projectStatus || 'Start'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProtectedPayments;