import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

const StudentHome = () => {
    const { isCR, userName, lastLoginTime } = useOutletContext();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "Class rescheduled: Mathematics to 10:00 AM", time: "2 hrs ago" },
        { id: 2, text: "New assignment uploaded for Physics", time: "4 hrs ago" },
        { id: 3, text: "Library books due tomorrow", time: "1 day ago" }
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
                <div>
                    <h1>{isCR ? `Class Representative Dashboard, ${userName}` : `Welcome, ${userName}`}</h1>
                    {lastLoginTime && (
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>
                            Last Login: {lastLoginTime}
                        </div>
                    )}
                </div>

                <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <button onClick={toggleNotifications} className="notification-icon-btn">
                        <Bell size={24} color="#000000" />
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

            <div className="stats-grid">


                <div className="stat-card" style={{ borderTop: '4px solid #38a169' }}>
                    <h3>Attendance</h3>
                    <div className="stat-value" style={{ color: '#276749' }}>75%</div>
                    <div className="stat-subtitle">Overall Attendance</div>
                </div>

                {isCR && (
                    <div className="stat-card" onClick={() => navigate('/student/reschedule')} style={{ borderTop: '4px solid #d69e2e' }}>
                        <h3>Request Stats</h3>
                        <div className="stat-value" style={{ color: '#d69e2e' }}>3 Total</div>
                        <div className="stat-subtitle">2 Pending | 1 Approved</div>
                    </div>
                )}
            </div>
            {

            }
        </div>
    );
};

export default StudentHome;
