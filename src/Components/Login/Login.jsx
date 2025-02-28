// import { useState, useEffect } from 'react';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth, database } from '../../firebase';
// import Logo from '../../assets/Trispider-Logo-removebg-preview.png';
// import { useNavigate } from 'react-router-dom';
// import { ref, get } from 'firebase/database';
// import './Login.css';

// const AuthForm = () => {
//   const [loginType, setLoginType] = useState('admin');
//   const [isLogin, setIsLogin] = useState(true);
//   const navigate = useNavigate();
//   const [employeeEmails, setEmployeeEmails] = useState([]);
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     orderId: '',
//     phoneNumber: ''
//   });
  
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch employee emails on component mount
//   useEffect(() => {
//     const fetchEmployeeEmails = async () => {
//       try {
//         const employeesRef = ref(database, 'employeesList/employees');
//         const snapshot = await get(employeesRef);
        
//         if (snapshot.exists()) {
//           const emails = [];
//           snapshot.forEach((childSnapshot) => {
//             if (childSnapshot.val().email) {
//               emails.push({
//                 id: childSnapshot.key,
//                 email: childSnapshot.val().email
//               });
//             }
//           });
//           setEmployeeEmails(emails);
//         }
//       } catch (error) {
//         console.error('Error fetching employee emails:', error);
//       }
//     };

//     fetchEmployeeEmails();
//   }, []);

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

//   const handleEmployeeLogin = async () => {
//     if (!formData.email || !formData.password) {
//       setError('Please enter both email and password');
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       // Get employee data from employeesList structure
//       const employeesRef = ref(database, 'employeesList/employees');
//       const snapshot = await get(employeesRef);
      
//       if (snapshot.exists()) {
//         let employeeData = null;
//         let employeeKey = null;
        
//         snapshot.forEach((childSnapshot) => {
//           const employee = childSnapshot.val();
//           // Check if email and password match exactly
//           if (employee.email === formData.email && employee.password === formData.password) {
//             employeeData = employee;
//             employeeKey = childSnapshot.key;
//           }
//         });

//         if (employeeData) {
//           // Store employee data in session
//           sessionStorage.setItem('currentEmployee', JSON.stringify({
//             ...employeeData,
//             id: employeeKey
//           }));
          
//           alert('Successfully logged in!');
//           setFormData({
//             email: '',
//             password: '',
//             orderId: '',
//             phoneNumber: ''
//           });
//           navigate('/employee-panel');
//         } else {
//           setError('Invalid email or password');
//         }
//       } else {
//         setError('No employee data found');
//       }
//     } catch (err) {
//       console.error('Error during employee login:', err);
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
// };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (loginType === 'user') {
//       await handleUserLogin();
//       return;
//     }

//     if (loginType === 'employee') {
//       await handleEmployeeLogin();
//       return;
//     }

//     try {
//       setIsLoading(true);
//       if (!formData.email || !formData.password) {
//         throw new Error('Please fill in all fields');
//       }

//       const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
//       sessionStorage.setItem('userToken', await userCredential.user.getIdToken());
//       alert('Successfully logged in!');
//       setFormData({
//         email: '',
//         password: '',
//         orderId: '',
//         phoneNumber: ''
//       });
//       navigate('/admin-profile');
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
//         <select
//           name="email"
//           className="auth-input"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Select Employee Email</option>
//           {employeeEmails.map((employee) => (
//             <option key={employee.id} value={employee.email}>
//               {employee.email}
//             </option>
//           ))}
//         </select>
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
//         />
//       </div>
//     </>
//   );

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <div className="auth-header">
//           <img src={Logo} alt="Logo" className="auth-logo" />
//           <h2 className="auth-title">
//             {loginType === 'admin' 
//               ? 'Welcome Back'
//               : loginType === 'employee'
//               ? 'Employee Login'
//               : 'Track Your Order'}
//           </h2>
//           <p className="auth-subtitle">
//             {loginType === 'admin'
//               ? 'Sign in to your account'
//               : loginType === 'employee'
//               ? 'Sign in to your employee account'
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
//                 phoneNumber: ''
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
//                 phoneNumber: ''
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
//                 phoneNumber: ''
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
//                 ? 'Sign In'
//                 : loginType === 'employee'
//                 ? 'Employee Login'
//                 : 'Track Order'
//             )}
//           </button>

//           {loginType === 'admin' && (
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
//                   phoneNumber: ''
//                 });
//               }}
//             >
//               {/* {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'} */}
//             </button>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, database } from '../../firebase';
import Logo from '../../assets/Trispider-Logo-removebg-preview.png';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import './Login.css';

const AuthForm = () => {
  const [loginType, setLoginType] = useState('admin');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const [employeeEmails, setEmployeeEmails] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    orderId: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
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
      
      // Get employee data from employeesList structure
      const employeesRef = ref(database, 'employeesList/employees');
      const snapshot = await get(employeesRef);
      
      if (snapshot.exists()) {
        let employeeData = null;
        let employeeKey = null;
        
        snapshot.forEach((childSnapshot) => {
          const employee = childSnapshot.val();
          // Check if email and password match exactly
          if (employee.email === formData.email && employee.password === formData.password) {
            employeeData = employee;
            employeeKey = childSnapshot.key;
          }
        });

        if (employeeData) {
          // Store employee data in session
          sessionStorage.setItem('currentEmployee', JSON.stringify({
            ...employeeData,
            id: employeeKey
          }));
          
          alert('Successfully logged in!');
          setFormData({
            email: '',
            password: '',
            orderId: '',
            phoneNumber: ''
          });
          navigate('/employee-panel');
        } else {
          setError('Invalid email or password');
        }
      } else {
        setError('No employee data found');
      }
    } catch (err) {
      console.error('Error during employee login:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, formData.email);
      setSuccess(`Password reset email sent to ${formData.email}. Please check your inbox and spam folder.`);
      setResetEmailSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

  const renderAdminForm = () => {
    if (isForgotPassword) {
      return (
        <div className="forgot-password-container">
          {/* <h3 className="forgot-password-title">Reset Your Password</h3> */}
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
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
          
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          
          <button
            type="button"
            className="auth-button"
            onClick={handleForgotPassword}
            disabled={isLoading || resetEmailSent}
          >
            {isLoading ? 'Sending...' : resetEmailSent ? 'Email Sent' : 'Reset Password'}
          </button>
          
          <button
            type="button"
            className="back-to-login-button"
            onClick={() => {
              setIsForgotPassword(false);
              setResetEmailSent(false);
              setError('');
              setSuccess('');
            }}
          >
            Back to Login
          </button>
        </div>
      );
    }
    
    return (
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
        
        <div className="forgot-password-link">
          <button 
            type="button" 
            className="forgot-password-button"
            onClick={() => {
              setIsForgotPassword(true);
              setError('');
              setSuccess('');
            }}
          >
            Forgot Password?
          </button>
        </div>
      </>
    );
  };

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
              ? (isForgotPassword ? 'Password Reset' : 'Welcome Back')
              : loginType === 'employee'
              ? 'Employee Login'
              : 'Track Your Order'}
          </h2>
          <p className="auth-subtitle">
            {loginType === 'admin'
              ? (isForgotPassword ? 'Reset your password' : 'Sign in to your account')
              : loginType === 'employee'
              ? 'Sign in to your employee account'
              : 'Enter your order details to login'}
          </p>
        </div>

        {!isForgotPassword && (
          <div className="auth-toggle-buttons">
            <button
              className={`toggle-type-button ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setLoginType('admin');
                setError('');
                setSuccess('');
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
                setSuccess('');
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
                setSuccess('');
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
        )}

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="auth-form">
          {loginType === 'admin' && renderAdminForm()}
          {loginType === 'user' && renderUserForm()}
          {loginType === 'employee' && renderEmployeeForm()}

          {error && !isForgotPassword && (
            <p className="error-message">{error}</p>
          )}

          {!isForgotPassword && (
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
          )}

          {loginType === 'admin' && !isForgotPassword && (
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({
                  email: '',
                  password: '',
                  orderId: '',
                  phoneNumber: ''
                });
              }}
            >
              {/* {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'} */}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;