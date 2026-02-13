import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './faculty.css';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('Faculty');

    useEffect(() => {
        const email = localStorage.getItem('lastLoginEmail');
        if (email) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            if (user) {
                setUserName(user.fullName);
            }
        }
    }, []);

    const handleLogout = () => {
        navigate('/');
    };

    const menuItems = [
        { path: '/faculty', label: 'Dashboard' },
        { path: '/faculty/timetable', label: ' Timetable' },
        { path: '/faculty/requests', label: 'Rescheduling Requests' },
        { path: '/faculty/leave', label: 'Apply Leave' },
        { path: '/faculty/enquiry', label: 'Free Slot Enquiry' },
        { path: '/faculty/all-timetables', label: 'All Timetables' },
    ];

    return (
        <div className="faculty-container">
            <aside className="faculty-sidebar">
                <h2 onClick={() => navigate('/faculty')} style={{ cursor: 'pointer' }}>Faculty Portal</h2>
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
                <Outlet context={{ userName }} />
            </main>
        </div>
    );
};

export default FacultyDashboard;
