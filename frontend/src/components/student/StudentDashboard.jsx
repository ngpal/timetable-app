import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './student.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState('student'); // Default to normal student
    const [userName, setUserName] = useState('Student');

    useEffect(() => {
        const email = localStorage.getItem('lastLoginEmail');
        if (email) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            if (user) {
                setUserRole(user.role);
                setUserName(user.fullName);
            }
        }
    }, []);

    const lastLoginTime = localStorage.getItem('lastLoginTime');

    const handleLogout = () => {
        localStorage.removeItem('lastLoginEmail');
        navigate('/');
    };

    const isCR = userRole === 'class_rep';

    const menuItems = [
        { path: '/student', label: 'Dashboard' },
        { path: '/student/timetable', label: 'Class Timetable' },
        { path: '/student/all-timetables', label: 'All Class Timetables' },
    ];

    return (
        <div className="student-container">
            <aside className="student-sidebar">
                <h2 onClick={() => navigate('/student')} style={{ cursor: 'pointer' }}>Student Portal</h2>
                <div style={{ marginBottom: '1rem', color: '#c6f6d5' }}>
                    {isCR && <span className="cr-badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Class Rep</span>}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isActive = item.path === '/student'
                            ? location.pathname === '/student'
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

            <main className="student-content">
                <Outlet context={{ isCR, userRole, userName, lastLoginTime }} />
            </main>
        </div>
    );
};

export default StudentDashboard;
