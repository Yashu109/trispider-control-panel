// import { useState, useEffect } from 'react';
// import { Loader2, Lock, Eye, EyeOff, Edit2, Check, X } from "lucide-react";
// import { database } from '../../firebase';
// import { ref, get, set, update } from 'firebase/database';
// import './ProtectedPayments.css';

// const ProtectedPayments = ({ projects, formatCurrency }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasExistingPassword, setHasExistingPassword] = useState(false);
//   const [storedPassword, setStoredPassword] = useState('');
//   const [editingPayment, setEditingPayment] = useState(null);
//   const [editValues, setEditValues] = useState({
//     amount: '',
//     paymentMethod: 'cash'
//   });

//   const handleEditClick = (project) => {
//     setEditingPayment(project.id);
//     setEditValues({
//       amount: '',
//       paymentMethod: 'cash' 
//     });
//   };


//   const handleSaveEdit = async (projectId) => {
//     try {
//       const projectRef = ref(database, `projects/${projectId}`);
//       const currentProject = projects.find(p => p.id === projectId);
//       const newAmount = Number(editValues.amount) || 0;

//       // Calculate total remaining
//       const totalPayment = Number(currentProject.totalPayment) || 0;
//       const totalRemaining = totalPayment - newAmount;

//       let updates = {};
//       if (editValues.paymentMethod === 'cash') {
//         updates = {
//           cashAmount: newAmount,
//           paymentMethod: 'cash',
//           totalRemaining: totalRemaining,
//           advancePayment: newAmount
//         };
//       } else {
//         updates = {
//           upiAmount: newAmount,
//           paymentMethod: 'upi',
//           totalRemaining: totalRemaining,
//           advancePayment: newAmount
//         };
//       }

//       await update(projectRef, updates);
//       setEditingPayment(null);
//       setEditValues({ amount: '', paymentMethod: 'cash' });

//     } catch (error) {
//       console.error('Error updating payment:', error);
//       setError('Failed to update payment details');
//     }
//   };
//   const handleCancelEdit = () => {
//     setEditingPayment(null);
//     setEditValues({ amount: '', paymentMethod: 'cash' });
//   };

//   const calculateTotals = () => {
//     return projects.reduce((acc, project) => {
//       const amount = Number(project.advancePayment) || 0;
//       const isCash = project.paymentMethod === 'cash';

//       return {
//         totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
//         totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
//         totalProjects: acc.totalProjects + 1,
//         totalCash: acc.totalCash + (isCash ? amount : 0),
//         totalUpi: acc.totalUpi + (!isCash ? amount : 0),
//         completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
//       };
//     }, { 
//       totalPayments: 0,
//       totalRemaining: 0,
//       totalProjects: 0,
//       totalCash: 0,
//       totalUpi: 0,
//       completeProjects: 0
//     });
//   };

//   const totals = calculateTotals();
//   // Check if password exists in Firebase
//   useEffect(() => {
//     const checkPassword = async () => {
//       try {
//         const passwordRef = ref(database, 'adminPassword');
//         const snapshot = await get(passwordRef);

//         if (snapshot.exists()) {
//           setHasExistingPassword(true);
//           setStoredPassword(snapshot.val());
//         } else {
//           setHasExistingPassword(false);
//         }
//       } catch (err) {
//         console.error('Error checking password:', err);
//         setError('Error checking authentication status');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkPassword();
//   }, []);

//   const handleCreatePassword = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     // Validate password
//     if (password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       setIsLoading(false);
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const passwordRef = ref(database, 'adminPassword');
//       await set(passwordRef, password);
//       setStoredPassword(password);
//       setHasExistingPassword(true);
//       setIsAuthenticated(true);
//     } catch (err) {
//       console.error('Error creating password:', err);
//       setError('Failed to create password. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePasswordLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     if (password === storedPassword) {
//       setIsAuthenticated(true);
//       setError('');
//     } else {
//       setError('Incorrect password. Please try again.');
//     }
//     setIsLoading(false);
//   };

//   if (isLoading) {
//     return (
//       <div className="loading-container">
//         <Loader2 className="spinner" />
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="protected-payments">
//         <div className="password-container">
//           <div className="password-header">
//             <Lock className="lock-icon" />
//             <h2>{hasExistingPassword ? 'Enter Password' : 'Create Password'}</h2>
//             <p>
//               {hasExistingPassword
//                 ? 'Please enter your password to view payment details'
//                 : 'Create a password to protect your payment details'}
//             </p>
//           </div>

//           <form onSubmit={hasExistingPassword ? handlePasswordLogin : handleCreatePassword}
//             className="password-form">
//             <div className="password-input-group">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="password-input"
//                 placeholder={hasExistingPassword ? "Enter password" : "Create password"}
//                 required
//                 minLength="6"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="toggle-password"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>

//             {!hasExistingPassword && (
//               <div className="password-input-group">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="password-input"
//                   placeholder="Confirm password"
//                   required
//                   minLength="6"
//                 />
//               </div>
//             )}

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
//               {hasExistingPassword ? 'Access Payment Details' : 'Create Password'}
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

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
//           <h3>Total Cash Collected</h3>
//           <p>{formatCurrency(totals.totalCash)}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Total UPI Collected</h3>
//           <p>{formatCurrency(totals.totalUpi)}</p>
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
//                 <th>Project Type</th>
//                 <th>College</th>
//                 <th>Email</th>
//                 <th>Phone Number</th>
//                 <th>WhatsApp Number</th>
//                 <th>Referred By</th>
//                 <th>Timeline</th>
//                 <th>Assign To</th>
//                 <th>Total Payment</th>
//                 <th>Remaining</th>
//                 <th>Collected Amount</th>
//                 <th>Cash Amount</th>
//                 <th>UPI Amount</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.map((project) => (
//                 <tr key={project.id}>
//                   <td>{project.projectId}</td>
//                   <td>{project.clientName}</td>
//                   <td>{project.ProjectType}</td>
//                   <td>{project.collegeName}</td>
//                   <td>{project.email}</td>
//                   <td>{project.phoneNumber}</td>
//                   <td>{project.whatsappNumber}</td>
//                   <td>{project.referredBy}</td>
//                   <td>{project.timeline ? new Date(project.timeline).toLocaleDateString() : 'Not set'}</td>
//                   <td>{project.Assign_To || 'Select Member'}</td>
//                   <td className="total-payments">
//                     {formatCurrency(project.totalPayment || 0)}
//                   </td>
//                   <td className="total-remaining">
//                     {formatCurrency(project.totalRemaining || 0)}
//                   </td>
//                   <td>{project.advancePayment}</td>
//                   <td className="cash-amount">
//                     {project.advancePaymentMethod === 'cash' ?
//                       formatCurrency(project.advancePayment || 0) :
//                       formatCurrency(0)}
//                   </td>
//                   <td className="upi-amount">
//                     {project.advancePaymentMethod === 'upi' ?
//                       formatCurrency(project.advancePayment || 0) :
//                       formatCurrency(0)}
//                   </td>
//                   <td>
//                     <span className={`status-badge ${project.projectStatus === 'Complete' ? 'status-complete' :
//                       project.projectStatus === 'Middle' ? 'status-progress' :
//                         'status-start'
//                       }`}>
//                       {project.projectStatus || 'Start'}
//                     </span>
//                   </td>
//                   <td>
//                     {editingPayment === project.id ? (
//                       <div className="payment-edit-container">
//                         <div className="payment-inputs">
//                           <select
//                             value={editValues.paymentMethod}
//                             onChange={(e) => setEditValues({
//                               ...editValues,
//                               paymentMethod: e.target.value
//                             })}
//                             className="payment-method-select"
//                           >
//                             <option value="cash">Cash</option>
//                             <option value="upi">UPI</option>
//                           </select>
//                           <input
//                             type="number"
//                             value={editValues.amount}
//                             onChange={(e) => setEditValues({
//                               ...editValues,
//                               amount: e.target.value
//                             })}
//                             placeholder="Add amount"
//                             className="amount-input"
//                           />
//                         </div>
//                         <div className="payment-summary">
//                           Current {editValues.paymentMethod}: {formatCurrency(
//                             editValues.paymentMethod === 'cash' ?
//                               project.cashAmount || 0 :
//                               project.upiAmount || 0
//                           )}
//                         </div>
//                         <div className="action-buttons">
//                           <button
//                             onClick={() => handleSaveEdit(project.id)}
//                             className="action-button save"
//                             title="Save Payment"
//                           >
//                             <Check size={16} />
//                           </button>
//                           <button
//                             onClick={handleCancelEdit}
//                             className="action-button cancel"
//                             title="Cancel"
//                           >
//                             <X size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <button
//                         onClick={() => handleEditClick(project)}
//                         className="action-button edit"
//                         title="Add Payment"
//                       >
//                         <Edit2 size={16} />
//                         <span className="button-text">Add Payment</span>
//                       </button>
//                     )}
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

import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Eye, EyeOff, Edit2, Check, X, DollarSign, PlusCircle } from "lucide-react";
import { database } from '../../firebase';
import { ref, get, set, update } from 'firebase/database';
import './ProtectedPayments.css';

const ProtectedPayments = ({ projects, formatCurrency }) => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');

  // Payment states
  const [editingPayment, setEditingPayment] = useState(null);
  const [editValues, setEditValues] = useState({
    amount: '',
    paymentMethod: 'cash'
  });

  // Spend states
  const [showSpendPage, setShowSpendPage] = useState(false);
  const [spends, setSpends] = useState([]);
  const [newSpend, setNewSpend] = useState({ 
    amount: '', 
    purpose: '', 
    employeeId: '' 
  });
  const [showAddSpendForm, setShowAddSpendForm] = useState(false);
  const [spendSummary, setSpendSummary] = useState('');
  const [employees, setEmployees] = useState([]);

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchSpends();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (spends.length > 0) {
      generateSpendSummary();
    }
  }, [spends]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesRef = ref(database, 'employeesList');
        const snapshot = await get(employeesRef);
  
        console.log('Raw snapshot:', snapshot.val()); // Logs the raw data from Firebase
  
        if (snapshot.exists()) {
          const employeesData = snapshot.val();
  
          // Ensure `employees` exists within `employeesList`
          if (employeesData.employees) {
            const employeesArray = Object.keys(employeesData.employees).map(key => ({
              ...employeesData.employees[key],
              index: key
            }));
  
            console.log('Converted employees array:', employeesArray); // Logs the transformed array
  
            const validEmployees = employeesArray
              .filter(emp => emp && emp.name) // Ensure valid employee objects
              .sort((a, b) => a.name.localeCompare(b.name));
  
            console.log('Filtered & sorted employees:', validEmployees); // Logs the final processed employees
  
            setEmployees(validEmployees);
          } else {
            console.log('No employees found');
            setEmployees([]);
          }
        } else {
          console.log('No data found');
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to fetch employees');
      }
    };
  
    if (isAuthenticated) {
      console.log('User is authenticated, fetching data...');
      fetchSpends?.(); // Ensure fetchSpends exists before calling
      fetchEmployees();
    } else {
      console.log('User is not authenticated');
    }
  }, [isAuthenticated]);
  
  
  
  useEffect(() => {
    if (spends.length > 0) {
      generateSpendSummary();
    }
  }, [spends]);
  useEffect(() => {
    const checkPassword = async () => {
      try {
        const passwordRef = ref(database, 'adminPassword');
        const snapshot = await get(passwordRef);

        if (snapshot.exists()) {
          setHasExistingPassword(true);
          setStoredPassword(snapshot.val());
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

  // Payment functions
  const handleEditClick = (project) => {
    setEditingPayment(project.projectId);
    setEditValues({
      amount: '',
      paymentMethod: 'cash'
    });
  };

  const handleSaveEdit = async (projectId) => {
    try {
      const project = projects.find(p => p.projectId === projectId);
      if (!project) return;

      const newAmount = Number(editValues.amount) || 0;
      const totalPayment = Number(project.totalPayment) || 0;

      // Calculate current total collected (cash + upi)
      const currentCashAmount = Number(project.cashAmount) || 0;
      const currentUpiAmount = Number(project.advancePayment) || 0;

      // Calculate new remaining amount
      let updates = {};

      if (editValues.paymentMethod === 'cash') {
        const newCashAmount = currentCashAmount + newAmount;
        const newRemaining = totalPayment - (newCashAmount + currentUpiAmount);
        updates = {
          cashAmount: newCashAmount,
          totalRemaining: newRemaining,
          paymentMethod: 'cash'
        };
      } else {
        const newUpiAmount = currentUpiAmount + newAmount;
        const newRemaining = totalPayment - (currentCashAmount + newUpiAmount);
        updates = {
          advancePayment: newUpiAmount,
          advancePaymentMethod: 'upi',
          totalRemaining: newRemaining,
          paymentMethod: 'upi'
        };
      }

      const projectRef = ref(database, `projects/${projectId}`);
      await update(projectRef, updates);

      setEditingPayment(null);
      setEditValues({ amount: '', paymentMethod: 'cash' });
    } catch (error) {
      console.error('Error updating payment:', error);
      setError('Failed to update payment details');
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditValues({ amount: '', paymentMethod: 'cash' });
  };

  // Spend functions
  const fetchSpends = async () => {
    try {
      const spendsRef = ref(database, 'spends');
      const snapshot = await get(spendsRef);

      if (snapshot.exists()) {
        const spendsData = snapshot.val();
        const spendsArray = Object.keys(spendsData).map(key => ({
          id: key,
          ...spendsData[key]
        }));
        setSpends(spendsArray.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setSpends([]);
      }
    } catch (error) {
      console.error('Error fetching spends:', error);
      setError('Failed to fetch spends');
    }
  };

  const generateSpendSummary = () => {
    const latestSpends = spends.slice(0, 3);

    if (latestSpends.length === 0) {
      setSpendSummary('No recent spends');
      return;
    }

  };

  const handleAddSpend = async () => {
    if (!newSpend.amount || !newSpend.purpose || !newSpend.employeeId) {
      setError('Please fill in all fields including employee name');
      return;
    }

    try {
      const employee = employees.find(emp => emp.employeeId === newSpend.employeeId);
      if (!employee) {
        setError('Selected employee not found');
        return;
      }

      const newSpendRef = ref(database, `spends/${Date.now()}`);
      await set(newSpendRef, {
        amount: Number(newSpend.amount),
        purpose: newSpend.purpose,
        date: new Date().toISOString(),
        employeeId: newSpend.employeeId,
        employeeName: employee.name
      });

      setNewSpend({ amount: '', purpose: '', employeeId: '' });
      fetchSpends();
      setShowAddSpendForm(false);
      setError('');
    } catch (error) {
      console.error('Error adding spend:', error);
      setError('Failed to add spend');
    }
  };


  const calculateTotalSpend = () => {
    return spends.reduce((total, spend) => total + (Number(spend.amount) || 0), 0);
  };

  // Authentication functions
  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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

  // Calculate totals for summary cards
  const calculateTotals = () => {
    return projects.reduce((acc, project) => {
      const cashAmount = Number(project.cashAmount) || 0;
      const upiAmount = Number(project.advancePayment) || 0;

      return {
        totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
        totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
        totalProjects: acc.totalProjects + 1,
        totalCash: acc.totalCash + cashAmount,
        totalUpi: acc.totalUpi + upiAmount,
        completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
      };
    }, {
      totalPayments: 0,
      totalRemaining: 0,
      totalProjects: 0,
      totalCash: 0,
      totalUpi: 0,
      completeProjects: 0
    });
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
                className="protected-toggle-password"
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

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading && <Loader2 className="spinner" />}
              {hasExistingPassword ? 'Access Payment Details' : 'Create Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showSpendPage) {
    return (
      <div className="spend-page">
        <div className="spend-header">
          <button
            className="back-button"
            onClick={() => setShowSpendPage(false)}
          >
            Back to Dashboard
          </button>
          <h1>Spend Management</h1>
          <p>Total Spend: {formatCurrency(calculateTotalSpend())}</p>
        </div>

        {showAddSpendForm ? (
          <div className="add-spend-form">
            <h3>Add New Spend</h3>
            <div className="spend-input-container">
              <input
                type="number"
                placeholder="Enter amount"
                value={newSpend.amount}
                onChange={(e) => setNewSpend({ ...newSpend, amount: e.target.value })}
                className="spend-amount-input"
              />
              <input
                type="text"
                placeholder="Enter purpose"
                value={newSpend.purpose}
                onChange={(e) => setNewSpend({ ...newSpend, purpose: e.target.value })}
                className="spend-purpose-input"
              />
              <div className="select-wrapper">
                <select
                  value={newSpend.employeeId}
                  onChange={(e) => setNewSpend({ ...newSpend, employeeId: e.target.value })}
                  className="employee-select bg-white border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option 
                      key={employee.employeeId} 
                      value={employee.employeeId}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddSpend}
                className="add-spend-button"
              >
                Add Spend
              </button>
              <button
                onClick={() => {
                  setShowAddSpendForm(false);
                  setNewSpend({ amount: '', purpose: '', employeeId: '' });
                  setError('');
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <button
            className="show-add-spend-button"
            onClick={() => setShowAddSpendForm(true)}
          >
            <PlusCircle size={16} />
            Add New Spend
          </button>
        )}

        <div className="spends-table-container">
          <h3>Spend History</h3>
          <table className="spends-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Added By</th>
              </tr>
            </thead>
            <tbody>
              {spends.map((spend) => (
                <tr key={spend.id}>
                  <td>{new Date(spend.date).toLocaleDateString()}</td>
                  <td className="spend-amount">{formatCurrency(spend.amount)}</td>
                  <td>{spend.purpose}</td>
                  <td>{spend.employeeName || 'Unknown'}</td>
                </tr>
              ))}
              {spends.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-spends">No spends recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
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
          <h3>Total Cash Collected</h3>
          <p>{formatCurrency(totals.totalUpi)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Upi Collected</h3>
          <p>{formatCurrency(totals.totalCash)}</p>
        </div>
        <div className="summary-card">
          <h3>Completed Projects</h3>
          <p className="completed-projects">{totals.completeProjects}</p>
        </div>
        <div
          className="summary-card clickable spend-summary-card"
          onClick={() => setShowSpendPage(true)}
        >
          <h3>Total Spend</h3>
          <p className="total-spend">{formatCurrency(calculateTotalSpend())}</p>

          {spendSummary && <p className="spend-summary-text">{spendSummary}</p>}
          <div className="spend-actions">
            <button
              className="quick-add-spend"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpendPage(true);
                setShowAddSpendForm(true);
              }}
            >
              <PlusCircle size={16} />
              Add Spend
            </button>
          </div>

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
                <th>Collected Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.projectId}>
                  <td>{project.projectId}</td>
                  <td>{project.clientName}</td>
                  <td>{project.ProjectType}</td>
                  <td>{project.collegeName}</td>
                  <td>{project.email}</td>
                  <td>{project.phoneNumber}</td>
                  <td>{project.whatsappNumber}</td>
                  <td>{project.referredBy}</td>
                  <td>{project.timeline ? new Date(project.timeline).toLocaleDateString() : 'Not set'}</td>
                  <td>{project.Assign_To || 'Select Member'}</td>
                  <td className="total-payments">
                    {formatCurrency(project.totalPayment || 0)}
                  </td>
                  <td className="total-remaining">
                    {formatCurrency(project.totalRemaining || 0)}
                  </td>
                  <td className="collected-amount">
                    <div className="amount-breakdown">
                      <div className="amount-row">
                        <span className="amount-label">Cash:</span>
                        <span className="amount-value">
                          {formatCurrency(project.cashAmount || 0)}
                        </span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">UPI:</span>
                        <span className="amount-value">
                          {formatCurrency(project.advancePayment || 0)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${project.projectStatus === 'Complete' ? 'status-complete' :
                      project.projectStatus === 'Middle' ? 'status-progress' :
                        'status-start'
                      }`}>
                      {project.projectStatus || 'Start'}
                    </span>
                  </td>
                  <td>
                    {editingPayment === project.projectId ? (
                      <div className="payment-edit-container">
                        <div className="payment-inputs">
                          <select
                            value={editValues.paymentMethod}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              paymentMethod: e.target.value
                            })}
                            className="payment-method-select"
                          >
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                          </select>
                          <input
                            type="number"
                            value={editValues.amount}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              amount: e.target.value
                            })}
                            placeholder="Add amount"
                            className="amount-input"
                          />
                        </div>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleSaveEdit(project.projectId)}
                            className="action-button save"
                            title="Save Payment"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="action-button cancel"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(project)}
                        className="action-button edit"
                        title="Add Payment"
                      >
                        <Edit2 size={16} />
                        <span className="button-text">Add Payment</span>
                      </button>
                    )}
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