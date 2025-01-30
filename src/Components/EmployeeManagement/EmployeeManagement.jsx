// import { useState, useEffect } from 'react';
// import { database } from '../../firebase';
// import { ref, set, onValue, remove, get } from 'firebase/database';
// import { Trash2 } from 'lucide-react';
// import './EmployeeManagement.css';

// const EmployeeManagement = () => {
//     const [employees, setEmployees] = useState([]);
//     const [newEmployee, setNewEmployee] = useState({
//         name: '',
//         email: ''
//     });
//     const [error, setError] = useState({
//         name: '',
//         email: ''
//     });
//     const [loading, setLoading] = useState(true);

//     const employeesListRef = ref(database, 'employeesList/employees');
//     const counterRef = ref(database, 'employeesList/counter');

//     useEffect(() => {
//         const unsubscribe = onValue(employeesListRef, (snapshot) => {
//             if (snapshot.exists()) {
//                 const employeesData = [];
//                 snapshot.forEach((childSnapshot) => {
//                     employeesData.push({
//                         id: childSnapshot.key,
//                         employeeId: childSnapshot.val().employeeId,
//                         name: childSnapshot.val().name,
//                         email: childSnapshot.val().email
//                     });
//                 });
//                 employeesData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
//                 setEmployees(employeesData);
//             } else {
//                 setEmployees([]);
//             }
//             setLoading(false);
//         });

//         return () => unsubscribe();
//     }, []);

//     const getNextCounter = async () => {
//         const counterSnapshot = await get(counterRef);
//         let currentCounter = -1;

//         if (counterSnapshot.exists()) {
//             currentCounter = counterSnapshot.val();
//         }

//         const nextCounter = currentCounter + 1;
//         await set(counterRef, nextCounter);

//         return nextCounter;
//     };

//     const validateEmail = (email) => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     };

//     const handleAddEmployee = async (e) => {
//         e.preventDefault();
//         const newErrors = {
//             name: '',
//             email: ''
//         };

//         if (!newEmployee.name.trim()) {
//             newErrors.name = 'Please enter an employee name';
//         }

//         if (!newEmployee.email.trim()) {
//             newErrors.email = 'Please enter an email address';
//         } else if (!validateEmail(newEmployee.email)) {
//             newErrors.email = 'Please enter a valid email address';
//         }

//         if (newErrors.name || newErrors.email) {
//             setError(newErrors);
//             return;
//         }

//         try {
//             const nextCounter = await getNextCounter();
//             const nextEmployeeId = (nextCounter + 10).toString().padStart(3, '0');

//             const newEmployeeRef = ref(database, `employeesList/employees/${nextCounter}`);
//             await set(newEmployeeRef, {
//                 employeeId: nextEmployeeId,
//                 name: newEmployee.name.trim(),
//                 email: newEmployee.email.trim()
//             });

//             setNewEmployee({ name: '', email: '' });
//             setError({ name: '', email: '' });
//         } catch (err) {
//             setError({
//                 name: 'Failed to add employee',
//                 email: ''
//             });
//             console.error('Error adding employee:', err);
//         }
//     };

    // const handleDeleteEmployee = async (employeeId) => {
    //     if (window.confirm('Are you sure you want to delete this employee?')) {
    //         try {
    //             const employeeRef = ref(database, `employeesList/employees/${employeeId}`);
    //             await remove(employeeRef);
    //         } catch (err) {
    //             setError({
    //                 name: 'Failed to delete employee',
    //                 email: ''
    //             });
    //             console.error('Error deleting employee:', err);
    //         }
    //     }
    // };

    // if (loading) {
    //     return <div className="loading">Loading...</div>;
    // }

//     return (
//         <div className="employee-section">
//             <div className="table-header">
//                 <h2>Employee Management</h2>
//                 <div className="record-count">
//                     {employees.length} {employees.length === 1 ? 'Employee' : 'Employees'}
//                 </div>
//             </div>

//             <div className="employee-content">
//                 <form onSubmit={handleAddEmployee} className="employee-form">
//                     <div className="input-group">
//                         <div className="form-field">
//                             <input
//                                 type="text"
//                                 value={newEmployee.name}
//                                 onChange={(e) => setNewEmployee({
//                                     ...newEmployee,
//                                     name: e.target.value
//                                 })}
//                                 placeholder="Enter employee name"
//                                 className={`employee-input ${error.name ? 'error' : ''}`}
//                             />
//                             {error.name && <span className="error-message">{error.name}</span>}
//                         </div>
//                         <div className="form-field">
//                             <input
//                                 type="email"
//                                 value={newEmployee.email}
//                                 onChange={(e) => setNewEmployee({
//                                     ...newEmployee,
//                                     email: e.target.value
//                                 })}
//                                 placeholder="Enter employee email"
//                                 className={`employee-input ${error.email ? 'error' : ''}`}
//                             />
//                             {error.email && <span className="error-message">{error.email}</span>}
//                         </div>
//                         <button type="submit" className="add-button">
//                             Add Employee
//                         </button>
//                     </div>
//                 </form>

//                 <div className="table-container">
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>ID</th>
//                                 <th>Employee ID</th>
//                                 <th>Employee Name</th>
//                                 <th>Email</th>
//                                 <th className="actions-column">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {employees.map((employee) => (
//                                 <tr key={employee.id}>
//                                     <td>{employee.id}</td>
//                                     <td>{employee.employeeId}</td>
//                                     <td>{employee.name}</td>
//                                     <td>{employee.email}</td>
//                                     <td className="actions-column">
//                                         <button
//                                             onClick={() => handleDeleteEmployee(employee.id)}
//                                             className="action-button delete"
//                                             title="Delete employee"
//                                         >
//                                             <Trash2 size={16} />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             {employees.length === 0 && (
//                                 <tr>
//                                     <td colSpan="5" className="no-data">
//                                         No employees added yet
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EmployeeManagement;

import { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref,  onValue,remove, get, set, update } from 'firebase/database';
import { Trash2, Eye, EyeOff, Edit } from 'lucide-react';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false,
        editPassword: false
    });

    const employeesListRef = ref(database, 'employeesList/employees');
    const counterRef = ref(database, 'employeesList/counter');
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const validatePassword = (password) => {
        // Password validation rules:
        // - At least 8 characters long
        // - Contains at least one uppercase letter
        // - Contains at least one lowercase letter
        // - Contains at least one number
        // - Contains at least one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        return passwordRegex.test(password);
    };
    useEffect(() => {
        const unsubscribe = onValue(employeesListRef, (snapshot) => {
            if (snapshot.exists()) {
                const employeesData = [];
                snapshot.forEach((childSnapshot) => {
                    employeesData.push({
                        id: childSnapshot.key,
                        employeeId: childSnapshot.val().employeeId,
                        name: childSnapshot.val().name,
                        email: childSnapshot.val().email,
                        password: childSnapshot.val().password
                    });
                });
                employeesData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                setEmployees(employeesData);
            } else {
                setEmployees([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Previous methods remain the same...

    // const handleEditEmployee = async (e) => {
    //     e.preventDefault();
    //     const newErrors = {
    //         name: '',
    //         email: '',
    //         password: '',
    //         confirmPassword: ''
    //     };

    //     if (!editingEmployee.name.trim()) {
    //         newErrors.name = 'Please enter an employee name';
    //     }

    //     if (!editingEmployee.email.trim()) {
    //         newErrors.email = 'Please enter an email address';
    //     } else if (!validateEmail(editingEmployee.email)) {
    //         newErrors.email = 'Please enter a valid email address';
    //     }

    //     if (editingEmployee.password) {
    //         if (!validatePassword(editingEmployee.password)) {
    //             newErrors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
    //         }

    //         if (editingEmployee.password !== editingEmployee.confirmPassword) {
    //             newErrors.confirmPassword = 'Passwords do not match';
    //         }
    //     }

    //     if (Object.values(newErrors).some(error => error !== '')) {
    //         setError(newErrors);
    //         return;
    //     }

    //     try {
    //         const employeeRef = ref(database, `employeesList/employees/${editingEmployee.id}`);

    //         // Prepare update data
    //         const updateData = {
    //             name: editingEmployee.name.trim(),
    //             email: editingEmployee.email.trim(),
    //         };

    //         // Only update password if a new password is provided
    //         if (editingEmployee.password) {
    //             updateData.password = editingEmployee.password;
    //         }

    //         await update(employeeRef, updateData);

    //         // Reset editing state
    //         setEditingEmployee(null);
    //         setError({ name: '', email: '', password: '', confirmPassword: '' });
    //     } catch (err) {
    //         setError({
    //             name: 'Failed to update employee',
    //             email: '',
    //             password: '',
    //             confirmPassword: ''
    //         });
    //         console.error('Error updating employee:', err);
    //     }
    // };

    // const startEditEmployee = (employee) => {
    //     setEditingEmployee({
    //         ...employee,
    //         password: '',
    //         confirmPassword: ''
    //     });
    // };
    const handleEditEmployee = async (e) => {
        e.preventDefault();
        const newErrors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        // Validate name
        if (!editingEmployee.name.trim()) {
            newErrors.name = 'Please enter an employee name';
        }

        // Validate email
        if (!editingEmployee.email.trim()) {
            newErrors.email = 'Please enter an email address';
        } else if (!validateEmail(editingEmployee.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate password if provided
        if (editingEmployee.password) {
            if (!validatePassword(editingEmployee.password)) {
                newErrors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
            }

            if (editingEmployee.password !== editingEmployee.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        // Check if there are any errors
        const hasErrors = Object.values(newErrors).some(error => error !== '');
        if (hasErrors) {
            setError(newErrors);
            return;
        }

        try {
            const employeeRef = ref(database, `employeesList/employees/${editingEmployee.id}`);

            // Prepare update data
            const updateData = {
                name: editingEmployee.name.trim(),
                email: editingEmployee.email.trim(),
            };

            // Only update password if a new password is provided
            if (editingEmployee.password) {
                updateData.password = editingEmployee.password;
            }

            // Perform the update
            await update(employeeRef, updateData);

            // Reset states
            setEditingEmployee(null);
            setError({ name: '', email: '', password: '', confirmPassword: '' });

            // Optional: Show a success message
            alert('Employee updated successfully');

        } catch (err) {
            console.error('Error updating employee:', err);
            setError({
                name: 'Failed to update employee',
                email: '',
                password: '',
                confirmPassword: ''
            });
            alert('Failed to update employee. Please try again.');
        }
    };

    const getNextCounter = async () => {
        const counterSnapshot = await get(counterRef);
        let currentCounter = -1;

        if (counterSnapshot.exists()) {
            currentCounter = counterSnapshot.val();
        }

        const nextCounter = currentCounter + 1;
        await set(counterRef, nextCounter);
        
        return nextCounter;
    };
    const startEditEmployee = (employee) => {
        setEditingEmployee({
            ...employee,
            password: '', // Reset password fields
            confirmPassword: ''
        });
        // Reset any previous errors
        setError({ name: '', email: '', password: '', confirmPassword: '' });
    };
    const handleDeleteEmployee = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const employeeRef = ref(database, `employeesList/employees/${employeeId}`);
                await remove(employeeRef);
            } catch (err) {
                setError({
                    name: 'Failed to delete employee',
                    email: ''
                });
                console.error('Error deleting employee:', err);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const newErrors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        if (!newEmployee.name.trim()) {
            newErrors.name = 'Please enter an employee name';
        }

        if (!newEmployee.email.trim()) {
            newErrors.email = 'Please enter an email address';
        } else if (!validateEmail(newEmployee.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!newEmployee.password.trim()) {
            newErrors.password = 'Please enter a password';
        } else if (!validatePassword(newEmployee.password)) {
            newErrors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
        }

        if (!newEmployee.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newEmployee.password !== newEmployee.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.values(newErrors).some(error => error !== '')) {
            setError(newErrors);
            return;
        }

        try {
            const nextCounter = await getNextCounter();
            const nextEmployeeId = (nextCounter + 10).toString().padStart(3, '0');
            
            const newEmployeeRef = ref(database, `employeesList/employees/${nextCounter}`);
            await set(newEmployeeRef, {
                employeeId: nextEmployeeId,
                name: newEmployee.name.trim(),
                email: newEmployee.email.trim(),
                password: newEmployee.password // Note: In a real app, hash this password!
            });
            
            setNewEmployee({ name: '', email: '', password: '', confirmPassword: '' });
            setError({ name: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError({
                name: 'Failed to add employee',
                email: '',
                password: '',
                confirmPassword: ''
            });
            console.error('Error adding employee:', err);
        }
    };

    return (
        <div className="employee-section">
            {/* Previous add employee form remains the same */}
            <div className="table-header">
                <h2>Employee Management</h2>
                <div className="record-count">
                    {employees.length} {employees.length === 1 ? 'Employee' : 'Employees'}
                </div>
            </div>

            <div className="employee-content">
                <form onSubmit={handleAddEmployee} className="employee-form">
                    <div className="input-group">
                        <div className="form-field">
                            <input
                                type="text"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({
                                    ...newEmployee,
                                    name: e.target.value
                                })}
                                placeholder="Enter employee name"
                                className={`employee-input ${error.name ? 'error' : ''}`}
                            />
                            {error.name && <span className="error-message">{error.name}</span>}
                        </div>
                        <div className="form-field">
                            <input
                                type="email"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({
                                    ...newEmployee,
                                    email: e.target.value
                                })}
                                placeholder="Enter employee email"
                                className={`employee-input ${error.email ? 'error' : ''}`}
                            />
                            {error.email && <span className="error-message">{error.email}</span>}
                        </div>
                        <div className="form-field-password-field">
                            <input
                                type={showPassword.password ? "text" : "password"}
                                value={newEmployee.password}
                                onChange={(e) => setNewEmployee({
                                    ...newEmployee,
                                    password: e.target.value
                                })}
                                placeholder="Enter password"
                                className={`employee-input ${error.password ? 'error' : ''}`}
                            />
                            <button
                                type="button"
                                className="employee-toggle-password"
                                onClick={() => setShowPassword(prev => ({
                                    ...prev,
                                    password: !prev.password
                                }))}
                            >
                                {showPassword.password ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {error.password && <span className="error-message">{error.password}</span>}
                        </div>
                        <div className="form-field-password-field">
                            <input
                                type={showPassword.confirmPassword ? "text" : "password"}
                                value={newEmployee.confirmPassword}
                                onChange={(e) => setNewEmployee({
                                    ...newEmployee,
                                    confirmPassword: e.target.value
                                })}
                                placeholder="Confirm password"
                                className={`employee-input ${error.confirmPassword ? 'error' : ''}`}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(prev => ({
                                    ...prev,
                                    confirmPassword: !prev.confirmPassword
                                }))}
                            >
                                {showPassword.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {error.confirmPassword && <span className="error-message">{error.confirmPassword}</span>}
                        </div>
                        <button type="submit" className="add-button">
                            Add Employee
                        </button>
                    </div>
                </form>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Email</th>
                            <th>Password</th>
                            <th className="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                {editingEmployee && editingEmployee.id === employee.id ? (
                                    <td colSpan="6">
                                        <form onSubmit={handleEditEmployee} className="edit-employee-form">
                                            {/* <div className="form-row">
                                                <input
                                                    type="text"
                                                    value={editingEmployee.name}
                                                    onChange={(e) => setEditingEmployee({
                                                        ...editingEmployee,
                                                        name: e.target.value
                                                    })}
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="email"
                                                    value={editingEmployee.email}
                                                    onChange={(e) => setEditingEmployee({
                                                        ...editingEmployee,
                                                        email: e.target.value
                                                    })}
                                                    placeholder="Email"
                                                />
                                            </div> */}
                                            <div className="form-row">
                                                <div className="input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={editingEmployee.name}
                                                        onChange={(e) => setEditingEmployee({
                                                            ...editingEmployee,
                                                            name: e.target.value
                                                        })}
                                                        placeholder="Name"
                                                        className={error.name ? 'error' : ''}
                                                    />
                                                    {error.name && <span className="error-message">{error.name}</span>}
                                                </div>
                                                <div className="input-wrapper">
                                                    <input
                                                        type="email"
                                                        value={editingEmployee.email}
                                                        onChange={(e) => setEditingEmployee({
                                                            ...editingEmployee,
                                                            email: e.target.value
                                                        })}
                                                        placeholder="Email"
                                                        className={error.email ? 'error' : ''}
                                                    />
                                                    {error.email && <span className="error-message">{error.email}</span>}
                                                </div>
                                            </div>
                                            <div className="form-row password-row">
                                                <div className="password-input">
                                                    <input
                                                        type={showPassword.editPassword ? "text" : "password"}
                                                        value={editingEmployee.password}
                                                        onChange={(e) => setEditingEmployee({
                                                            ...editingEmployee,
                                                            password: e.target.value
                                                        })}
                                                        placeholder="New Password (optional)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({
                                                            ...prev,
                                                            editPassword: !prev.editPassword
                                                        }))}
                                                    >
                                                        {showPassword.editPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                <div className="password-input">
                                                    <input
                                                        type={showPassword.editPassword ? "text" : "password"}
                                                        value={editingEmployee.confirmPassword}
                                                        onChange={(e) => setEditingEmployee({
                                                            ...editingEmployee,
                                                            confirmPassword: e.target.value
                                                        })}
                                                        placeholder="Confirm New Password"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-actions">
                                                <button
                                                    type="submit"
                                                    className="save-btn"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancel-btn"
                                                    onClick={() => setEditingEmployee(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </td>
                                ) : (
                                    <>
                                        <td>{employee.id}</td>
                                        <td>{employee.employeeId}</td>
                                        <td>{employee.name}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.password}</td>
                                        <td className="actions-column">
                                            <button
                                                onClick={() => startEditEmployee(employee)}
                                                className="action-button edit"
                                                title="Edit employee"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className="action-button delete"
                                                title="Delete employee"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    No employees added yet
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

export default EmployeeManagement;