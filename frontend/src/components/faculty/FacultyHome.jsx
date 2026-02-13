import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Bell } from 'lucide-react';

const FacultyHome = () => {
  const navigate = useNavigate();
  const { userName } = useOutletContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Leave request approved by HOD", time: "1 hr ago" },
    { id: 2, text: "New timetable schedule available", time: "3 hrs ago" },
    { id: 3, text: "Dept meeting at 2:00 PM tomorrow", time: "1 day ago" }
  ]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {userName}</h1>

        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button onClick={toggleNotifications} className="notification-icon-btn">
            <Bell size={24} color="#2d3748" />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">Notifications</div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(note => (
                    <div key={note.id} className="notification-item">
                      <div className="note-text">{note.text}</div>
                      <div className="note-time">{note.time}</div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">No new notifications</div>
                )}
              </div>
              {notifications.length > 0 && (
                <button onClick={clearNotifications} className="clear-all-btn">
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="faculty-dashboard-grid">
        <div className="stat-card" onClick={() => navigate('/faculty/requests')} style={{ borderTop: '4px solid #ecc94b' }}>
          <h3>Pending Requests</h3>
          <div className="stat-value" style={{ color: '#d69e2e' }}>3</div>
          <div className="stat-subtitle">Rescheduling approvals needed</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/faculty/timetable')} style={{ borderTop: '4px solid #48bb78', cursor: 'pointer' }}>
          <h3>Weekly Workload</h3>
          <div className="stat-value" style={{ color: '#2f855a' }}>16 Hrs</div>
          <div className="stat-subtitle">4 Theory / 2 Labs</div>
        </div>
      </div>
    </div>
  );
};

export default FacultyHome;
