import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './faculty.css';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    { path: '/faculty', label: 'Dashboard' },
    { path: '/faculty/timetable', label: ' Timetable' },
    { path: '/faculty/requests', label: 'Rescheduling Requests' },
    { path: '/faculty/leave', label: 'Apply Leave' },
  ];

  return (
    <div className="faculty-container">
      <aside className="faculty-sidebar">
        <h2>Faculty Portal</h2>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = item.path === '/faculty' 
              ? location.pathname === '/faculty' 
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="faculty-content">
        <Outlet />
      </main>
    </div>
  );
};

export default FacultyDashboard;
