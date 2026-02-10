import React from 'react';
import { useNavigate } from 'react-router-dom';

const FacultyHome = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h1>Welcome</h1>
      </div>

      <div className="faculty-dashboard-grid">
        <div className="stat-card" onClick={() => navigate('/faculty/requests')} style={{borderTop: '4px solid #ecc94b'}}>
          <h3>Pending Requests</h3>
          <div className="stat-value" style={{color: '#d69e2e'}}>3</div>
          <div className="stat-subtitle">Rescheduling approvals needed</div>
        </div>

        <div className="stat-card" style={{borderTop: '4px solid #48bb78'}}>
          <h3>Weekly Workload</h3>
          <div className="stat-value" style={{color: '#2f855a'}}>16 Hrs</div>
          <div className="stat-subtitle">4 Theory / 2 Labs</div>
        </div>
      </div>
    </div>  
  );
};

export default FacultyHome;
