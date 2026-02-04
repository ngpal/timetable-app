import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container" >
      <header className="home-header" >
        <h1>Automated Timetable Scheduling</h1>
        <h2>& Faculty Workload Optimization System</h2>
      </header>
      
      <main className="home-main">
        <div className="auth-options" style={{ maxWidth: '650px', width: '100%' }}>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn-secondary" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
