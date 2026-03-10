import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, List, Moon, Sun, LogOut, Clock } from 'lucide-react';
import './student.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState('student');
    const [userName, setUserName] = useState('Student');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const lastLoginTime = localStorage.getItem('lastLoginTime');

    const handleLogout = () => {
        localStorage.removeItem('lastLoginEmail');
        navigate('/');
    };

    const isCR = userRole === 'class_rep';

    const menuItems = [
        { path: '/student', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/student/timetable', label: 'Class Timetable', icon: <Calendar size={20} /> },
        { path: '/student/all-timetables', label: 'All Class Timetables', icon: <List size={20} /> },
        { path: '/student/reschedule', label: 'Request Reschedule', icon: <Clock size={20} /> },
        { path: '/student/request-history', label: 'Request History', icon: <List size={20} /> },
    ];

    return (
        <div className="student-container">
            <aside className="student-sidebar">
                <h2 onClick={() => navigate('/student')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)' }}>Edu</span>Portal
                </h2>
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
                                <span style={{ marginRight: '12px', display: 'flex' }}>{item.icon}</span>
                                {item.label}
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

            <main className="student-content">
                <Outlet context={{ isCR, userRole, userName, lastLoginTime }} />
            </main>
        </div>
    );
};

export default StudentDashboard;
