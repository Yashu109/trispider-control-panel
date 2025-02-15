import { useState, useEffect } from 'react';
import { Loader2, Lock, Eye, EyeOff, Edit2, Check, X } from "lucide-react";
import { database } from '../../firebase';
import { ref, get, set, update } from 'firebase/database';
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
  const [editingPayment, setEditingPayment] = useState(null);
  const [editValues, setEditValues] = useState({
    amount: '',
    paymentMethod: 'cash'
  });

  const handleEditClick = (project) => {
    setEditingPayment(project.id);
    setEditValues({
      amount: '',
      paymentMethod: 'cash'
    });
  };

  // const handleSaveEdit = async (projectId) => {
  //   try {
  //     const projectRef = ref(database, `projects/${projectId}`);
  //     const currentProject = projects.find(p => p.id === projectId);
  //     const newAmount = Number(editValues.amount) || 0;

  //     // Get existing amounts
  //     const existingCashAmount = Number(currentProject.cashAmount) || 0;
  //     const existingUpiAmount = Number(currentProject.upiAmount) || 0;

  //     // Calculate new amounts based on payment method
  //     const newCashAmount = editValues.paymentMethod === 'cash' ? 
  //       existingCashAmount + newAmount : existingCashAmount;
  //     const newUpiAmount = editValues.paymentMethod === 'upi' ? 
  //       existingUpiAmount + newAmount : existingUpiAmount;

  //     // Calculate total collected and remaining
  //     const totalCollected = newCashAmount + newUpiAmount;
  //     const totalPayment = Number(currentProject.totalPayment) || 0;
  //     const totalRemaining = totalPayment - totalCollected;

  //     const updates = {
  //       cashAmount: newCashAmount,
  //       upiAmount: newUpiAmount,
  //       totalRemaining: totalRemaining,
  //       advancePayment: totalCollected
  //     };

  //     await update(projectRef, updates);
  //     setEditingPayment(null);
  //     setEditValues({ amount: '', paymentMethod: 'cash' });

  //   } catch (error) {
  //     console.error('Error updating payment:', error);
  //     setError('Failed to update payment details');
  //   }
  // };
  const handleSaveEdit = async (projectId) => {
    try {
      const projectRef = ref(database, `projects/${projectId}`);
      const currentProject = projects.find(p => p.id === projectId);
      const newAmount = Number(editValues.amount) || 0;

      // Calculate total remaining
      const totalPayment = Number(currentProject.totalPayment) || 0;
      const totalRemaining = totalPayment - newAmount;

      let updates = {};
      if (editValues.paymentMethod === 'cash') {
        updates = {
          cashAmount: newAmount,
          paymentMethod: 'cash',
          totalRemaining: totalRemaining,
          advancePayment: newAmount
        };
      } else {
        updates = {
          upiAmount: newAmount,
          paymentMethod: 'upi',
          totalRemaining: totalRemaining,
          advancePayment: newAmount
        };
      }

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

  const calculateTotals = () => {
    return projects.reduce((acc, project) => {
      const amount = Number(project.advancePayment) || 0;
      const isCash = project.paymentMethod === 'cash';
      
      return {
        totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
        totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
        totalProjects: acc.totalProjects + 1,
        totalCash: acc.totalCash + (isCash ? amount : 0),
        totalUpi: acc.totalUpi + (!isCash ? amount : 0),
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

  const totals = calculateTotals();
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
  // const calculateTotals1 = () => {
  //   return projects.reduce((acc, project) => {
  //     const cashAmount = Number(project.cashAmount) || 0;
  //     const upiAmount = Number(project.upiAmount) || 0;

  //     return {
  //       totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
  //       totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
  //       totalProjects: acc.totalProjects + 1,
  //       totalCash: acc.totalCash + cashAmount,
  //       totalUpi: acc.totalUpi + upiAmount,
  //       completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
  //     };
  //   }, {
  //     totalPayments: 0,
  //     totalRemaining: 0,
  //     totalProjects: 0,
  //     totalCash: 0,
  //     totalUpi: 0,
  //     completeProjects: 0
  //   });
  // };
  // Rest of your existing code for displaying payments dashboard
  // const calculateTotals1 = () => {
  //   return projects.reduce((acc, project) => {
  //     const amount = Number(project.advancePayment) || 0;
  //     const isCash = project.paymentMethod === 'cash';
      
  //     return {
  //       totalPayments: acc.totalPayments + (Number(project.totalPayment) || 0),
  //       totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
  //       totalProjects: acc.totalProjects + 1,
  //       totalCash: acc.totalCash + (isCash ? amount : 0),
  //       totalUpi: acc.totalUpi + (!isCash ? amount : 0),
  //       completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
  //     };
  //   }, { 
  //     totalPayments: 0,
  //     totalRemaining: 0,
  //     totalProjects: 0,
  //     totalCash: 0,
  //     totalUpi: 0,
  //     completeProjects: 0
  //   });
  // };
  // const totals1 = calculateTotals1();

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
          <p>{formatCurrency(totals.totalCash)}</p>
        </div>
        <div className="summary-card">
          <h3>Total UPI Collected</h3>
          <p>{formatCurrency(totals.totalUpi)}</p>
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
                <th>Collected Amount</th>
                <th>Cash Amount</th>
                <th>UPI Amount</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <td>{project.Assign_To || 'Select Member'}</td>
                  <td className="total-payments">
                    {formatCurrency(project.totalPayment || 0)}
                  </td>
                  <td className="total-remaining">
                    {formatCurrency(project.totalRemaining || 0)}
                  </td>
                  <td>{project.advancePayment}</td>
                  <td className="cash-amount">
                    {project.paymentMethod === 'cash' ?
                      formatCurrency(project.advancePayment || 0) :
                      formatCurrency(0)}
                  </td>
                  <td className="upi-amount">
                    {project.paymentMethod === 'upi' ?
                      formatCurrency(project.advancePayment || 0) :
                      formatCurrency(0)}
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
                    {editingPayment === project.id ? (
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
                        <div className="payment-summary">
                          Current {editValues.paymentMethod}: {formatCurrency(
                            editValues.paymentMethod === 'cash' ?
                              project.cashAmount || 0 :
                              project.upiAmount || 0
                          )}
                        </div>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleSaveEdit(project.id)}
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