import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard Overview' },
    { path: '/admin/faculty', label: 'Faculty Management' },
    { path: '/admin/courses', label: 'Course Management' },
    { path: '/admin/rooms', label: 'Classroom Management' },
    { path: '/admin/course-assignments', label: 'Course Assignments' },
    { path: '/admin/timetable', label: 'Constraints & Settings' },
    { path: '/admin/amrita-timetable', label: 'View Timetable' },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Admin Console</h2>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            // Precise active state matching
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
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

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
