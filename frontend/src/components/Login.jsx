import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Check LocalStorage Users first (Registered Users)
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const matchedUser = existingUsers.find(
        u => u.email === formData.email && u.password === formData.password
    );

    if (matchedUser) {
        localStorage.setItem('lastLoginEmail', matchedUser.email);
        if (matchedUser.role === 'admin') navigate('/admin');
        else if (matchedUser.role === 'faculty') navigate('/faculty');
        else if (matchedUser.role === 'student' || matchedUser.role === 'class_rep') {
             navigate('/student'); 
        }
        return;
    }

    // 2. Demo/Mock Fallback (if not found in localStorage)
    const emailLower = formData.email.toLowerCase();
    
    // Simple demo bypass if they use the correct email keywords but maybe wrong password or haven't registered
    if (emailLower.includes('admin')) {
      alert("Demo Login: Access Granted as Admin");
      localStorage.setItem('lastLoginEmail', formData.email);
      navigate('/admin');
    } else if (emailLower.includes('faculty')) {
      alert("Demo Login: Access Granted as Faculty");
      localStorage.setItem('lastLoginEmail', formData.email);
      navigate('/faculty');
    } else if (emailLower.includes('student')) {
      alert("Demo Login: Access Granted as Student");
      localStorage.setItem('lastLoginEmail', formData.email);
      // Simulate student role for demo
      localStorage.setItem('users', JSON.stringify([...(JSON.parse(localStorage.getItem('users')||'[]')), {email: formData.email, role: 'student'}]));
      navigate('/student');
    } else {
      alert('Invalid Credentials! Please register or use demo accounts (admin@test.com / faculty@test.com)');
    }
  };

  return (
    <div className="home-container">
      <div className="form-card" style={{ maxWidth: '650px', width: '100%' }}>
        <h2 className="form-title">Sign In</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 

              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Login
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#646cff' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
