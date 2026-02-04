import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    
    // Get existing users from localStorage or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (existingUsers.find(u => u.email === formData.email)) {
        alert("User with this email already exists!");
        return;
    }

    // Add new user
    const newUser = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
    };

    localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));

    console.log('Register Data Saved:', newUser);
    alert(`Registration Successful for ${formData.role}! Please Login.`);
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="form-card" style={{ maxWidth: '650px', width: '100%' }}>
        <h2 className="form-title">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Registration Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value = "select role" >Select Role</option>
              <option value="student">Student</option>
              <option value="class_rep">Class Representative</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName"  
              onChange={handleChange} 
              required 
            />
          </div>

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

          <div className="form-group">
             <label>Confirm Password</label>
             <input 
              type="password" 
              name="confirmPassword" 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#646cff' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
