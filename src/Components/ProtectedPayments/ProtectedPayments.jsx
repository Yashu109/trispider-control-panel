import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Eye, EyeOff, Edit2, Check, X, DollarSign, PlusCircle, Search, ArrowUpDown } from "lucide-react";
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
    employeeId: '',
    paymentMethod: 'cash'
  });
  const [showAddSpendForm, setShowAddSpendForm] = useState(false);
  const [spendSummary, setSpendSummary] = useState('');
  const [employees, setEmployees] = useState([]);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Date filter state
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
    preset: 'all'
  });

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
    let result = [...projects];
    if (searchTerm) {
      result = result.filter(project =>
        Object.entries(project).some(([key, value]) => {
          if (['projectId', 'totalPayment', 'totalRemaining', 'cashAmount', 'advancePayment'].includes(key)) {
            return false;
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (['totalPayment', 'totalRemaining', 'cashAmount', 'advancePayment'].includes(sortConfig.key)) {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = String(aVal || '').toLowerCase();
          bVal = String(bVal || '').toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredProjects(result);
  }, [projects, searchTerm, sortConfig]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesRef = ref(database, 'employeesList');
        const snapshot = await get(employeesRef);
        if (snapshot.exists()) {
          const employeesData = snapshot.val();
          if (employeesData.employees) {
            const employeesArray = Object.keys(employeesData.employees).map(key => ({
              ...employeesData.employees[key],
              index: key
            }));
            const validEmployees = employeesArray
              .filter(emp => emp && emp.name)
              .sort((a, b) => a.name.localeCompare(b.name));
            setEmployees(validEmployees);
          } else {
            setEmployees([]);
          }
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to fetch employees');
      }
    };

    if (isAuthenticated) {
      fetchSpends();
      fetchEmployees();
    }
  }, [isAuthenticated]);

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

  // Date filtering functions
  const handleDatePreset = (preset) => {
    const now = new Date();
    let startDate, endDate;
    
    switch (preset) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'week':
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case 'month':
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case 'all':
        startDate = null;
        endDate = null;
        break;
        
      default:
        return;
    }
    
    setDateFilter({ startDate, endDate, preset });
  };

  const handleCustomDateChange = (type, date) => {
    if (type === 'start') {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      setDateFilter(prev => ({
        ...prev,
        startDate,
        preset: 'custom'
      }));
    } else {
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      setDateFilter(prev => ({
        ...prev,
        endDate,
        preset: 'custom'
      }));
    }
  };

  // Calculate total payments with date filtering
  const calculateTotalPayments = () => {
    let filteredProjects = [...projects];

    if (dateFilter.startDate && dateFilter.endDate) {
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);

      filteredProjects = filteredProjects.filter(project => {
        if (!project.paymentDate) {
          return false;
        }

        const paymentDate = new Date(project.paymentDate);
        if (isNaN(paymentDate.getTime())) {
          return false;
        }

        // Normalize to noon to avoid timezone issues
        paymentDate.setHours(12, 0, 0, 0);
        
        return paymentDate >= start && paymentDate <= end;
      });
    }

    return filteredProjects.reduce((sum, project) => {
      return sum + (Number(project.totalPayment) || 0);
    }, 0);
  };

  // Spend related functions
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
    setSpendSummary(`Last ${latestSpends.length} spends: ${formatCurrency(latestSpends.reduce((sum, spend) => sum + Number(spend.amount), 0))}`);
  };

  const handleAddSpend = async () => {
    if (!newSpend.amount || !newSpend.purpose || !newSpend.employeeId || !newSpend.paymentMethod) {
      setError('Please fill in all fields including employee name and payment method');
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
        employeeName: employee.name,
        paymentMethod: newSpend.paymentMethod
      });
      setNewSpend({ amount: '', purpose: '', employeeId: '', paymentMethod: 'cash' });
      fetchSpends();
      setShowAddSpendForm(false);
      setError('');
    } catch (error) {
      console.error('Error adding spend:', error);
      setError('Failed to add spend');
    }
  };

  const calculateSpendTotals = () => {
    return spends.reduce((acc, spend) => {
      const amount = Number(spend.amount) || 0;
      return {
        total: acc.total + amount,
        cash: spend.paymentMethod === 'cash' ? acc.cash + amount : acc.cash,
        upi: spend.paymentMethod === 'upi' ? acc.upi + amount : acc.upi
      };
    }, {
      total: 0,
      cash: 0,
      upi: 0
    });
  };

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
      const currentCashAmount = Number(project.cashAmount) || 0;
      const currentUpiAmount = Number(project.advancePayment) || 0;

      let updates = {};
      if (editValues.paymentMethod === 'cash') {
        const newCashAmount = currentCashAmount + newAmount;
        const newRemaining = totalPayment - (newCashAmount + currentUpiAmount);
        updates = {
          cashAmount: newCashAmount,
          totalRemaining: newRemaining,
          paymentMethod: 'cash',
          paymentDate: new Date().toISOString()
        };
      } else {
        const newUpiAmount = currentUpiAmount + newAmount;
        const newRemaining = totalPayment - (currentCashAmount + newUpiAmount);
        updates = {
          advancePayment: newUpiAmount,
          advancePaymentMethod: 'upi',
          totalRemaining: newRemaining,
          paymentMethod: 'upi',
          paymentDate: new Date().toISOString()
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

  // Sorting functions
  const handleSort = (key) => {
    setSortConfig(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortableHeader = (key, label) => (
    <th>
      <button
        className="protected-sortable-header"
        onClick={() => handleSort(key)}
      >
        {label}
        <ArrowUpDown
          size={14}
          className={`sort-icon ${sortConfig.key === key
            ? sortConfig.direction === 'asc'
              ? 'asc'
              : 'desc'
            : ''
            }`}
        />
      </button>
    </th>
  );

  const renderSearchBar = () => (
    <div className="search-container">
      <div className="search-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="protected-search-input"
        />
      </div>
      <span className="results-count">
        Showing {filteredProjects.length} of {projects.length} projects
      </span>
    </div>
  );

  // Authentication functions
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

  // Calculate other totals
  const calculateOtherTotals = () => {
    return projects.reduce((acc, project) => {
      const cashAmount = Number(project.cashAmount) || 0;
      const upiAmount = Number(project.advancePayment) || 0;
      return {
        totalRemaining: acc.totalRemaining + (Number(project.totalRemaining) || 0),
        totalProjects: acc.totalProjects + 1,
        totalCash: acc.totalCash + cashAmount,
        totalUpi: acc.totalUpi + upiAmount,
        completeProjects: acc.completeProjects + (project.projectStatus === 'Complete' ? 1 : 0)
      };
    }, {
      totalRemaining: 0,
      totalProjects: 0,
      totalCash: 0,
      totalUpi: 0,
      completeProjects: 0
    });
  };

  // Render date filters
  const renderDateFilters = () => {
    return (
      <div className="date-filter-container">
        <h3>Filter Total Payments by Date</h3>
        <div className="date-filter-controls">
          <div className="preset-buttons">
            <button
              className={`filter-btn ${dateFilter.preset === 'day' ? 'active' : ''}`}
              onClick={() => handleDatePreset('day')}
            >
              Today
            </button>
            <button
              className={`filter-btn ${dateFilter.preset === 'week' ? 'active' : ''}`}
              onClick={() => handleDatePreset('week')}
            >
              Last 7 Days
            </button>
            <button
              className={`filter-btn ${dateFilter.preset === 'month' ? 'active' : ''}`}
              onClick={() => handleDatePreset('month')}
            >
              Last 30 Days
            </button>
            <button
              className={`filter-btn ${dateFilter.preset === 'all' ? 'active' : ''}`}
              onClick={() => handleDatePreset('all')}
            >
              All Time
            </button>
          </div>
          
          <div className="custom-date-range">
            <input
              type="date"
              value={dateFilter.startDate ? dateFilter.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateFilter.endDate ? dateFilter.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Authentication screen
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
            <button type="submit" disabled={isLoading} className="protected-submit-button">
              {isLoading && <Loader2 className="spinner" />}
              {hasExistingPassword ? 'Access Payment Details' : 'Create Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Spend page
  if (showSpendPage) {
    const spendTotals = calculateSpendTotals();
    return (
      <div className="spend-page">
        <div className="spend-header">
          <button
            className="back-button"
            onClick={() => setShowSpendPage(false)}
          >
            Back to Dashboard
          </button>
          <h2>Spend Management</h2>
        </div>
        <div className="spend-totals-summary">
          <div className="summary-card">
            <h3>Total Spend</h3>
            <p>{formatCurrency(spendTotals.total)}</p>
          </div>
          <div className="summary-card">
            <h3>Cash Spend</h3>
            <p>{formatCurrency(spendTotals.cash)}</p>
          </div>
          <div className="summary-card">
            <h3>UPI Spend</h3>
            <p>{formatCurrency(spendTotals.upi)}</p>
          </div>
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
                  className="employee-select"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.employeeId} value={employee.employeeId}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="select-wrapper">
                <select
                  value={newSpend.paymentMethod}
                  onChange={(e) => setNewSpend({ ...newSpend, paymentMethod: e.target.value })}
                  className="payment-method-select"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <button onClick={handleAddSpend} className="add-spend-button">
                Add Spend
              </button>
              <button
                onClick={() => {
                  setShowAddSpendForm(false);
                  setNewSpend({ amount: '', purpose: '', employeeId: '', paymentMethod: 'cash' });
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
                <th>Payment Method</th>
                <th>Added By</th>
              </tr>
            </thead>
            <tbody>
              {spends.map((spend) => (
                <tr key={spend.id}>
                  <td>{new Date(spend.date).toLocaleDateString()}</td>
                  <td className="spend-amount">{formatCurrency(spend.amount)}</td>
                  <td>{spend.purpose}</td>
                  <td>{spend.paymentMethod || 'Not specified'}</td>
                  <td>{spend.employeeName || 'Unknown'}</td>
                </tr>
              ))}
              {spends.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-spends">No spends recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Main dashboard
  const otherTotals = calculateOtherTotals();
  const totalPayments = calculateTotalPayments();

  // Main dashboard return
  return (
    <div className="payments-dashboard">
      {renderDateFilters()}
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Payments</h3>
          <p className="total-payments">{formatCurrency(totalPayments)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Remaining</h3>
          <p className="total-remaining">{formatCurrency(otherTotals.totalRemaining)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Projects</h3>
          <p className="total-projects">{otherTotals.totalProjects}</p>
        </div>
        <div className="summary-card">
          <h3>Total Upi Collected</h3>
          <p>{formatCurrency(otherTotals.totalUpi)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Cash Collected</h3>
          <p>{formatCurrency(otherTotals.totalCash)}</p>
        </div>
        <div className="summary-card">
          <h3>Completed Projects</h3>
          <p className="completed-projects">{otherTotals.completeProjects}</p>
        </div>
        <div
          className="summary-card clickable spend-summary-card"
          onClick={() => setShowSpendPage(true)}
        >
          <h3>Total Spend</h3>
          <p className="total-spend">{formatCurrency(calculateSpendTotals().total)}</p>
          {/* {spendSummary && <p className="spend-summary-text">{spendSummary}</p>} */}
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

      <div className="payments-table-container">
        <div className="payments-table-header">
          <h2>Payment Details</h2>
          {renderSearchBar()}
        </div>
        <div className="table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                {renderSortableHeader('projectId', 'Project ID')}
                {renderSortableHeader('clientName', 'Client Name')}
                {renderSortableHeader('ProjectType', 'Project Type')}
                {renderSortableHeader('collegeName', 'College')}
                {renderSortableHeader('phoneNumber', 'Phone Number')}
                {renderSortableHeader('referredBy', 'Referred By')}
                {renderSortableHeader('timeline', 'Timeline')}
                {renderSortableHeader('Assign_To', 'Assign To')}
                {renderSortableHeader('totalPayment', 'Total Payment')}
                {renderSortableHeader('totalRemaining', 'Remaining')}
                <th>Collected Amount</th>
                {renderSortableHeader('projectStatus', 'Status')}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.projectId}>
                  <td>{project.projectId}</td>
                  <td>{project.clientName}</td>
                  <td>{project.ProjectType}</td>
                  <td>{project.collegeName}</td>
                  <td>{project.phoneNumber}</td>
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
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan="13" className="text-center py-4 text-gray-500">
                    No projects found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProtectedPayments;