import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth,database } from '../../firebase';
import Logo from '../../assets/Trispider-Logo-removebg-preview.png';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';

import './Login.css'
const AuthForm = () => {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'user'
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    orderId: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Create a reference to the specific order in the projects folder
      const orderRef = ref(database, `projects/${formData.orderId}`);
      
      // Get the order data
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        
        // Check if phone number matches
        if (orderData.phoneNumber === formData.phoneNumber) {
          // Store order data in session storage for use in dashboard
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
  // Placeholder function - replace with actual validation
  // const validateOrderAndPhone = async () => {
  //   // Add your validation logic here
  //   // This should check against your database
  //   return new Promise((resolve) => {
  //     // Simulate API call
  //     setTimeout(() => {
  //       // Add your actual validation logic here
  //       resolve(true); // or false based on validation
  //     }, 1000);
  //   });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (loginType === 'user') {
      await handleUserLogin();
      setIsLoading(false);
      return;
    }

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password should be at least 6 characters long');
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        alert('Successfully logged in!');
        setFormData({ email: '', password: '', orderId: '', phoneNumber: '' });
        navigate('/admin-panel');
      } else {
        await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        alert('Account created successfully!');
        setFormData({ email: '', password: '', orderId: '', phoneNumber: '' });
        setIsLogin(true);
      }
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
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
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
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

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src={Logo} alt="Logo" className="auth-logo" />
          <h2 className="auth-title">
            {loginType === 'admin' 
              ? (isLogin ? 'Welcome Back' : 'Create Account')
              : 'Track Your Order'}
          </h2>
          <p className="auth-subtitle">
            {loginType === 'admin'
              ? (isLogin ? 'Sign in to your account' : 'Sign up for a new account')
              : 'Enter your order details to login'}
          </p>
        </div>

        <div className="auth-toggle-buttons">
          <button
            className={`toggle-type-button ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('admin');
              setError('');
              setFormData({ email: '', password: '', orderId: '', phoneNumber: '' });
            }}
          >
            Admin Login
          </button>
          <button
            className={`toggle-type-button ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('user');
              setError('');
              setFormData({ email: '', password: '', orderId: '', phoneNumber: '' });
            }}
          >
            User Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {loginType === 'admin' ? renderAdminForm() : renderUserForm()}

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (loginType === 'admin' ? (isLogin ? 'Sign In' : 'Sign Up') : 'Track Order')}
          </button>

          {loginType === 'admin' && (
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', orderId: '', phoneNumber: '' });
              }}
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          )}

          {loginType === 'admin' && isLogin && (
            <p className="auth-footer">
              Forgot your password?
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;