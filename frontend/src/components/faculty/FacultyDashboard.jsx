import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Calendar, ClipboardList, CalendarPlus, Search, List } from 'lucide-react';
import './faculty.css';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('Faculty');
    const [pendingCount, setPendingCount] = useState(0);

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


    const handleLogout = () => {
        navigate('/');
    };

    const menuItems = [
        { path: '/faculty', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/faculty/timetable', label: 'Timetable', icon: <Calendar size={20} /> },
        { path: '/faculty/requests', label: 'Rescheduling Requests', icon: <ClipboardList size={20} />, badge: pendingCount },
        { path: '/faculty/leave', label: 'Apply Leave', icon: <CalendarPlus size={20} /> },
        { path: '/faculty/enquiry', label: 'Free Slot Enquiry', icon: <Search size={20} /> },
        { path: '/faculty/all-timetables', label: 'All Timetables', icon: <List size={20} /> },
    ];

    return (
        <div className="faculty-container">
            <aside className="faculty-sidebar">
                <h2 onClick={() => navigate('/faculty')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)' }}>Edu</span>Portal
                </h2>
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
                                <span style={{ marginRight: '12px', display: 'flex' }}>{item.icon}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.badge > 0 && (
                                    <span style={{
                                        backgroundColor: '#e53e3e',
                                        color: 'white',
                                        borderRadius: '999px',
                                        padding: '0.1rem 0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        marginLeft: 'auto'
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

            <main className="faculty-content">
                <Outlet context={{ userName }} />
            </main>
        </div>
    );
};

export default FacultyDashboard;
