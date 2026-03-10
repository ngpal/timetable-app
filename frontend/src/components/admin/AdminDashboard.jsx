import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
    { path: '/admin/faculty-timetable', label: 'Faculty Timetable' },
    { path: '/admin/amrita-timetable', label: 'View Timetable' },
    { path: '/admin/timetable', label: 'Constraints & Settings' },
    { path: '/admin/rescheduling-requests', label: 'Rescheduling Requests' },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Admin Console</h2>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            // Exact path matching to prevent multiple active states
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ef4444',
                    color: '#fff',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
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
