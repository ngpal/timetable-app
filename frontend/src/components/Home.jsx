import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { auth, provider } from '../Firebase';
import { signInWithPopup } from 'firebase/auth';


const Home = () => {
  const navigate = useNavigate();
  const handleMicrosoftLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include', // Include cookies for CORS
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.user) {
        // Route based on role (backend returns: Admin, Faculty, Student)
        const role = data.user.role.toLowerCase();
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'faculty') {
          navigate('/faculty');
        } else if (role === 'student') {
          navigate('/student');
        } else {
          console.error('Unknown role:', data.user.role);
          alert('Unknown user role. Please contact administrator.');
        }
      } else {
        console.error('Login failed:', data.message);
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login error: ${error.message}`);
    }
  };

  return (
    <div className="home-container" >
      <header className="home-header" >
        <h1>Automated Timetable Scheduling</h1>
        <h2>& Faculty Workload Optimization System</h2>
      </header>

      <main className="home-main">
        <div className="auth-options" style={{ maxWidth: '650px', width: '100%' }}>
          <button className="btn-primary" onClick={handleMicrosoftLogin}>
            Login with Microsoft
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
