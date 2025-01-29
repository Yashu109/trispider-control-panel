import { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, set, onValue, remove, get } from 'firebase/database';
import { Trash2 } from 'lucide-react';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: ''
    });
    const [error, setError] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);

    const employeesListRef = ref(database, 'employeesList/employees');
    const counterRef = ref(database, 'employeesList/counter');

    useEffect(() => {
        const unsubscribe = onValue(employeesListRef, (snapshot) => {
            if (snapshot.exists()) {
                const employeesData = [];
                snapshot.forEach((childSnapshot) => {
                    employeesData.push({
                        id: childSnapshot.key,
                        employeeId: childSnapshot.val().employeeId,
                        name: childSnapshot.val().name,
                        email: childSnapshot.val().email
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

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const newErrors = {
            name: '',
            email: ''
        };

        if (!newEmployee.name.trim()) {
            newErrors.name = 'Please enter an employee name';
        }

        if (!newEmployee.email.trim()) {
            newErrors.email = 'Please enter an email address';
        } else if (!validateEmail(newEmployee.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (newErrors.name || newErrors.email) {
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
                email: newEmployee.email.trim()
            });
            
            setNewEmployee({ name: '', email: '' });
            setError({ name: '', email: '' });
        } catch (err) {
            setError({
                name: 'Failed to add employee',
                email: ''
            });
            console.error('Error adding employee:', err);
        }
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

    return (
        <div className="employee-section">
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
                                <th className="actions-column">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>{employee.id}</td>
                                    <td>{employee.employeeId}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td className="actions-column">
                                        <button
                                            onClick={() => handleDeleteEmployee(employee.id)}
                                            className="action-button delete"
                                            title="Delete employee"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-data">
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