import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './faculty.css';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('Faculty');
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const email = localStorage.getItem('lastLoginEmail');
        if (email) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            if (user) {
                setUserName(user.fullName);
            }
        }

        // Initial fetch
        fetchPendingRequests();

        // Poll every 30 seconds
        const interval = setInterval(fetchPendingRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const res = await fetch('/api/requests/all');
            const data = await res.json();
            if (data.success) {
                const pending = data.requests.filter(r => r.status === 'Pending').length;
                setPendingCount(pending);
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    const menuItems = [
        { path: '/faculty', label: 'Dashboard' },
        { path: '/faculty/timetable', label: ' Timetable' },
        { path: '/faculty/requests', label: 'Rescheduling Requests', badge: pendingCount },
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
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <span>{item.label}</span>
                                {item.badge > 0 && (
                                    <span style={{
                                        backgroundColor: '#e53e3e',
                                        color: 'white',
                                        borderRadius: '999px',
                                        padding: '0.1rem 0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
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
