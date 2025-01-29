// import { useState } from 'react';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth, database } from '../../firebase';
// import Logo from '../../assets/Trispider-Logo-removebg-preview.png';
// import { useNavigate } from 'react-router-dom';
// import { ref, get, set } from 'firebase/database';
// import './Login.css'

// const AuthForm = () => {
//   const [loginType, setLoginType] = useState('admin');
//   const [isLogin, setIsLogin] = useState(true);
//   const navigate = useNavigate();
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     orderId: '',
//     phoneNumber: '',
//     name: '',
//     department: '',
//     employeeId: ''
//   });
  
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({
//       ...prevState,
//       [name]: value
//     }));
//     setError('');
//   };

//   const handleUserLogin = async () => {
//     if (!formData.orderId || !formData.phoneNumber) {
//       setError('Please enter both Order ID and Phone Number');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const orderRef = ref(database, `projects/${formData.orderId}`);
//       const snapshot = await get(orderRef);
      
//       if (snapshot.exists()) {
//         const orderData = snapshot.val();
//         if (orderData.phoneNumber === formData.phoneNumber) {
//           sessionStorage.setItem('currentOrder', JSON.stringify(orderData));
//           sessionStorage.setItem('orderId', formData.orderId);
//           navigate('/user-dashboard');
//         } else {
//           setError('Invalid phone number for this order');
//         }
//       } else {
//         setError('Order ID not found');
//       }
//     } catch (err) {
//       console.error('Error fetching order:', err);
//       setError('Error validating order details');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEmployeeSignup = async () => {
//     try {
//       setIsLoading(true);
//       setError('');
      
//       // Validate required fields
//       if (!formData.email || !formData.password || !formData.name) {
//         setError('Please fill in all required fields');
//         return;
//       }
  
//       // First create the authentication account
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         formData.email,
//         formData.password
//       );
  
//       // Then create the employee record
//       try {
//         const employeeRef = ref(database, `employees/${userCredential.user.uid}`);
//         await set(employeeRef, {
//           email: formData.email,
//           name: formData.name,
//           uid: userCredential.user.uid,
//           createdAt: new Date().toISOString(),
//           role: 'employee'
//         });
  
//         alert('Employee account created successfully!');
//         setIsLogin(true);
//         setFormData({
//           email: '',
//           password: '',
//           name: '',
//           orderId: ''
//         });
//       } catch (dbError) {
//         // If database write fails, delete the authentication account
//         await userCredential.user.delete();
//         throw new Error('Failed to create employee profile. Please try again.', dbError);
//       }
//     } catch (err) {
//       console.error('Error during employee signup:', err);
//       setError(err.message || 'Error creating employee account');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEmployeeLogin = async () => {
//     if (!formData.email || !formData.password) {
//       setError('Please enter both email and password');
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       // Sign in with Firebase Auth
//       const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
//       // Get employee data from database using the UID
//       const employeeRef = ref(database, `employees/${userCredential.user.uid}`);
//       const snapshot = await get(employeeRef);
      
//       if (snapshot.exists()) {
//         const employeeData = snapshot.val();
//         // Store both in session storage
//         sessionStorage.setItem('currentEmployee', JSON.stringify(employeeData));
//         sessionStorage.setItem('userToken', await userCredential.user.getIdToken());
        
//         alert('Successfully logged in!');
//         setFormData({
//           email: '',
//           password: '',
//           orderId: '',
//           phoneNumber: '',
//           name: '',
//           department: '',
//           employeeId: ''
//         });
//         navigate('/employee-panel');
//       } else {
//         setError('Employee not found');
//         await auth.signOut();
//       }
//     } catch (err) {
//       console.error('Error during employee login:', err);
//       setError('Invalid credentials');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (loginType === 'user') {
//       await handleUserLogin();
//       return;
//     }

//     if (loginType === 'employee') {
//       if (isLogin) {
//         await handleEmployeeLogin();
//       } else {
//         await handleEmployeeSignup();
//       }
//       return;
//     }

//     try {
//       setIsLoading(true);
//       if (!formData.email || !formData.password) {
//         throw new Error('Please fill in all fields');
//       }

//       if (formData.password.length < 6) {
//         throw new Error('Password should be at least 6 characters long');
//       }

//       if (isLogin) {
//         await signInWithEmailAndPassword(auth, formData.email, formData.password);
//         alert('Successfully logged in!');
//         setFormData({
//           email: '',
//           password: '',
//           orderId: '',
//           phoneNumber: '',
//           name: '',
//           department: '',
//           employeeId: ''
//         });
//         // navigate('/admin-panel');
//         navigate('/admin-profile');

//       } else {
//         await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
//         alert('Account created successfully!');
//         setFormData({
//           email: '',
//           password: '',
//           orderId: '',
//           phoneNumber: '',
//           name: '',
//           department: '',
//           employeeId: ''
//         });
//         setIsLogin(true);
//       }
//     } catch (err) {
//       console.error('Auth error:', err);
//       setError(err.message || 'An error occurred. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderAdminForm = () => (
//     <>
//       <div className="input-group">
//         <span className="input-icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//             <polyline points="22,6 12,13 2,6"/>
//           </svg>
//         </span>
//         <input
//           type="email"
//           name="email"
//           className="auth-input"
//           placeholder="Email address"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//       </div>

//       <div className="input-group">
//         <span className="input-icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
//             <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
//           </svg>
//         </span>
//         <input
//           type="password"
//           name="password"
//           className="auth-input"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//           minLength="6"
//         />
//       </div>
//     </>
//   );

//   const renderUserForm = () => (
//     <>
//       <div className="input-group">
//         <span className="input-icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
//             <circle cx="12" cy="7" r="4"/>
//           </svg>
//         </span>
//         <input
//           type="text"
//           name="orderId"
//           className="auth-input"
//           placeholder="Order ID"
//           value={formData.orderId}
//           onChange={handleChange}
//           required
//         />
//       </div>

//       <div className="input-group">
//         <span className="input-icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
//           </svg>
//         </span>
//         <input
//           type="tel"
//           name="phoneNumber"
//           className="auth-input"
//           placeholder="Phone Number"
//           value={formData.phoneNumber}
//           onChange={handleChange}
//           required
//         />
//       </div>
//     </>
//   );

//   const renderEmployeeForm = () => (
//     <>
//       <div className="input-group">
//         <span className="input-icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//             <polyline points="22,6 12,13 2,6"/>
//           </svg>
//         </span>
//         <input
//           type="email"
//           name="email"
//           className="auth-input"
//           placeholder="Employee Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//       </div>

//       <div className="input-group">
//         <span className="input-icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
//             <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
//           </svg>
//         </span>
//         <input
//           type="password"
//           name="password"
//           className="auth-input"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//           minLength="6"
//         />
//       </div>

//       {!isLogin && (
//         <div className="input-group">
//           <span className="input-icon">
//             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
//               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
//               <circle cx="12" cy="7" r="4"/>
//             </svg>
//           </span>
//           <input
//             type="text"
//             name="name"
//             className="auth-input"
//             placeholder="Full Name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//         </div>
//       )}
//     </>
//   );

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <div className="auth-header">
//           <img src={Logo} alt="Logo" className="auth-logo" />
//           <h2 className="auth-title">
//             {loginType === 'admin' 
//               ? (isLogin ? 'Welcome Back' : 'Create Account')
//               : loginType === 'employee'
//               ? (isLogin ? 'Employee Login' : 'Employee Registration')
//               : 'Track Your Order'}
//           </h2>
//           <p className="auth-subtitle">
//             {loginType === 'admin'
//               ? (isLogin ? 'Sign in to your account' : 'Sign up for a new account')
//               : loginType === 'employee'
//               ? (isLogin ? 'Sign in to your employee account' : 'Create your employee account')
//               : 'Enter your order details to login'}
//           </p>
//         </div>

//         <div className="auth-toggle-buttons">
//           <button
//             className={`toggle-type-button ${loginType === 'admin' ? 'active' : ''}`}
//             onClick={() => {
//               setLoginType('admin');
//               setError('');
//               setFormData({
//                 email: '',
//                 password: '',
//                 orderId: '',
//                 phoneNumber: '',
//                 name: '',
//                 department: '',
//                 employeeId: ''
//               });
//             }}
//           >
//             Admin Login
//           </button>
//           <button
//             className={`toggle-type-button ${loginType === 'employee' ? 'active' : ''}`}
//             onClick={() => {
//               setLoginType('employee');
//               setError('');
//               setFormData({
//                 email: '',
//                 password: '',
//                 orderId: '',
//                 phoneNumber: '',
//                 name: '',
//                 department: '',
//                 employeeId: ''
//               });
//             }}
//           >
//             Employee
//           </button>
//           <button
//             className={`toggle-type-button ${loginType === 'user' ? 'active' : ''}`}
//             onClick={() => {
//               setLoginType('user');
//               setError('');
//               setFormData({
//                 email: '',
//                 password: '',
//                 orderId: '',
//                 phoneNumber: '',
//                 name: '',
//                 department: '',
//                 employeeId: ''
//               });
//             }}
//           >
//             User Login
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="auth-form">
//           {loginType === 'admin' && renderAdminForm()}
//           {loginType === 'user' && renderUserForm()}
//           {loginType === 'employee' && renderEmployeeForm()}

//           {error && (
//             <p className="error-message">{error}</p>
//           )}

//           <button
//             type="submit"
//             className="auth-button"
//             disabled={isLoading}
//           >
//             {isLoading ? 'Processing...' : (
//               loginType === 'admin' 
//                 ? (isLogin ? 'Sign In' : 'Sign Up')
//                 : loginType === 'employee'
//                 ? (isLogin ? 'Employee Login' : 'Create Employee Account')
//                 : 'Track Order'
//             )}
//           </button>

//           {(loginType === 'admin' || loginType === 'employee') && (
//             <button
//               type="button"
//               className="toggle-button"
//               onClick={() => {
//                 setIsLogin(!isLogin);
//                 setError('');
//                 setFormData({
//                   email: '',
//                   password: '',
//                   orderId: '',
//                   phoneNumber: '',
//                   name: '',
//                   department: '',
//                   employeeId: ''
//                 });
//               }}
//             >
//               {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
//             </button>
//           )}

//           {/* {loginType === 'admin' && isLogin && (
//             <p className="auth-footer">
//               Forgot your password?
//             </p>
//           )} */}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../../firebase';
import Logo from '../../assets/Trispider-Logo-removebg-preview.png';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import './Login.css';

const AuthForm = () => {
  const [loginType, setLoginType] = useState('admin');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [employeeEmails, setEmployeeEmails] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    orderId: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch employee emails on component mount
  useEffect(() => {
    const fetchEmployeeEmails = async () => {
      try {
        const employeesRef = ref(database, 'employeesList/employees');
        const snapshot = await get(employeesRef);
        
        if (snapshot.exists()) {
          const emails = [];
          snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().email) {
              emails.push({
                id: childSnapshot.key,
                email: childSnapshot.val().email
              });
            }
          });
          setEmployeeEmails(emails);
        }
      } catch (error) {
        console.error('Error fetching employee emails:', error);
      }
    };

    fetchEmployeeEmails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleUserLogin = async () => {
    if (!formData.orderId || !formData.phoneNumber) {
      setError('Please enter both Order ID and Phone Number');
      return;
    }

    try {
      setIsLoading(true);
      const orderRef = ref(database, `projects/${formData.orderId}`);
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        if (orderData.phoneNumber === formData.phoneNumber) {
          sessionStorage.setItem('currentOrder', JSON.stringify(orderData));
          sessionStorage.setItem('orderId', formData.orderId);
          navigate('/user-dashboard');
        } else {
          setError('Invalid phone number for this order');
        }
      } else {
        setError('Order ID not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Error validating order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Get employee data from database using the selected email
      const employeeRef = ref(database, 'employeesList/employees');
      const snapshot = await get(employeeRef);
      
      if (snapshot.exists()) {
        let employeeData = null;
        let employeeId = null;
        
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().email === formData.email) {
            employeeData = childSnapshot.val();
            employeeId = childSnapshot.key;
          }
        });

        if (employeeData) {
          // Store both in session storage
          sessionStorage.setItem('currentEmployee', JSON.stringify({
            ...employeeData,
            id: employeeId
          }));
          sessionStorage.setItem('userToken', await userCredential.user.getIdToken());
          
          alert('Successfully logged in!');
          setFormData({
            email: '',
            password: '',
            orderId: '',
            phoneNumber: ''
          });
          navigate('/employee-panel');
        } else {
          setError('Employee not found');
          await auth.signOut();
        }
      }
    } catch (err) {
      console.error('Error during employee login:', err);
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (loginType === 'user') {
      await handleUserLogin();
      return;
    }

    if (loginType === 'employee') {
      await handleEmployeeLogin();
      return;
    }

    try {
      setIsLoading(true);
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      sessionStorage.setItem('userToken', await userCredential.user.getIdToken());
      alert('Successfully logged in!');
      setFormData({
        email: '',
        password: '',
        orderId: '',
        phoneNumber: ''
      });
      navigate('/admin-profile');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAdminForm = () => (
    <>
      <div className="input-group">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </span>
        <input
          type="email"
          name="email"
          className="auth-input"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
        <input
          type="password"
          name="password"
          className="auth-input"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
      </div>
    </>
  );

  const renderUserForm = () => (
    <>
      <div className="input-group">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <input
          type="text"
          name="orderId"
          className="auth-input"
          placeholder="Order ID"
          value={formData.orderId}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
        <input
          type="tel"
          name="phoneNumber"
          className="auth-input"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );

  const renderEmployeeForm = () => (
    <>
      <div className="input-group">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </span>
        <select
          name="email"
          className="auth-input"
          value={formData.email}
          onChange={handleChange}
          required
        >
          <option value="">Select Employee Email</option>
          {employeeEmails.map((employee) => (
            <option key={employee.id} value={employee.email}>
              {employee.email}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <span className="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
        <input
          type="password"
          name="password"
          className="auth-input"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src={Logo} alt="Logo" className="auth-logo" />
          <h2 className="auth-title">
            {loginType === 'admin' 
              ? 'Welcome Back'
              : loginType === 'employee'
              ? 'Employee Login'
              : 'Track Your Order'}
          </h2>
          <p className="auth-subtitle">
            {loginType === 'admin'
              ? 'Sign in to your account'
              : loginType === 'employee'
              ? 'Sign in to your employee account'
              : 'Enter your order details to login'}
          </p>
        </div>

        <div className="auth-toggle-buttons">
          <button
            className={`toggle-type-button ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('admin');
              setError('');
              setFormData({
                email: '',
                password: '',
                orderId: '',
                phoneNumber: ''
              });
            }}
          >
            Admin Login
          </button>
          <button
            className={`toggle-type-button ${loginType === 'employee' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('employee');
              setError('');
              setFormData({
                email: '',
                password: '',
                orderId: '',
                phoneNumber: ''
              });
            }}
          >
            Employee
          </button>
          <button
            className={`toggle-type-button ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('user');
              setError('');
              setFormData({
                email: '',
                password: '',
                orderId: '',
                phoneNumber: ''
              });
            }}
          >
            User Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {loginType === 'admin' && renderAdminForm()}
          {loginType === 'user' && renderUserForm()}
          {loginType === 'employee' && renderEmployeeForm()}

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (
              loginType === 'admin' 
                ? 'Sign In'
                : loginType === 'employee'
                ? 'Employee Login'
                : 'Track Order'
            )}
          </button>

          {loginType === 'admin' && (
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  email: '',
                  password: '',
                  orderId: '',
                  phoneNumber: ''
                });
              }}
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;