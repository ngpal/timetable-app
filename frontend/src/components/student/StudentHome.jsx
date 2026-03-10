import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
    Bell, BookOpen, Clock, CalendarDays, Loader2, RefreshCw,
    GraduationCap, Users, FlaskConical, ArrowRightLeft, 
    CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { timetableService } from '../../services/timetableService';

const API_URL = process.env.VITE_API_URL || '';

// Slot time mapping
const SLOT_TIMES = [
    { start: '08:00 AM', end: '09:00 AM', h: 8 },
    { start: '09:00 AM', end: '10:00 AM', h: 9 },
    { start: '10:00 AM', end: '11:00 AM', h: 10 },
    { start: '11:00 AM', end: '12:00 PM', h: 11 },
    { start: '12:00 PM', end: '01:00 PM', h: 12 },
    { start: '01:00 PM', end: '02:00 PM', h: 13 },
    { start: '02:00 PM', end: '03:00 PM', h: 14 },
    { start: '03:00 PM', end: '04:00 PM', h: 15 },
    { start: '04:00 PM', end: '05:00 PM', h: 16 }
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time-ago formatter
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

// Get slot status relative to current time
const getSlotStatus = (slotNumber) => {
    const now = new Date();
    const currentHour = now.getHours();
    const slotTime = SLOT_TIMES[slotNumber - 1];
    if (!slotTime) return 'upcoming';
    if (currentHour >= slotTime.h + 1) return 'done';
    if (currentHour >= slotTime.h) return 'now';
    return 'upcoming';
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, sublabel, color, onClick }) => (
    <div 
        className="modern-card" 
        onClick={onClick}
        style={{ 
            background: 'var(--surface)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-md)', 
            border: '1px solid var(--border)', 
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ 
            position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', 
            borderRadius: '50%', background: color, opacity: 0.08 
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ 
                padding: '0.5rem', borderRadius: 'var(--radius-md)', 
                background: `${color}18`, display: 'flex' 
            }}>
                <Icon size={20} color={color} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {value}
        </div>
        {sublabel && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {sublabel}
            </div>
        )}
    </div>
);

// Request status badge component
const StatusBadge = ({ status }) => {
    const config = {
        Pending_Faculty: { bg: '#fef3c7', color: '#92400e', label: 'Pending Faculty' },
        Pending_Admin: { bg: '#dbeafe', color: '#1e40af', label: 'Pending Admin' },
        Approved: { bg: '#DCFCE7', color: '#15803D', label: 'Approved' },
        Rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' }
    };
    const s = config[status] || config.Pending_Faculty;
    return (
        <span style={{
            fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
            borderRadius: '999px', backgroundColor: s.bg, color: s.color,
            whiteSpace: 'nowrap'
        }}>
            {s.label}
        </span>
    );
};

const StudentHome = () => {
    const { isCR, userName, lastLoginTime } = useOutletContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [todayClasses, setTodayClasses] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [statsRes, timetableData] = await Promise.all([
                fetch(`${API_URL}/api/student/dashboard-stats`, { credentials: 'include' }).then(r => r.json()),
                timetableService.getStudentPersonalTimetable().catch(() => null)
            ]);

            if (statsRes.success) {
                setDashboardStats(statsRes);
            }

            // Process today's classes from timetable
            if (timetableData?.success && timetableData.timetable) {
                const today = DAYS[new Date().getDay()];
                const slots = timetableData.timetable.timetableSlots
                    .filter(s => s.day === today && !s.isSpanContinuation)
                    .sort((a, b) => a.slotNumber - b.slotNumber);

                const formatted = slots.map(s => {
                    const time = SLOT_TIMES[s.slotNumber - 1] || { start: 'TBD', end: '' };
                    const course = timetableData.timetable.courses.find(c => c.courseCode === s.courseCode);
                    return {
                        slotNumber: s.slotNumber,
                        time: time.start,
                        endTime: time.end,
                        name: course ? course.courseName : s.courseCode,
                        code: s.courseCode,
                        room: s.venue,
                        type: s.sessionType,
                        faculty: s.facultyName,
                        status: getSlotStatus(s.slotNumber)
                    };
                });
                setTodayClasses(formatted);
            }
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = dashboardStats?.timetableStats || {};
    const requestStats = dashboardStats?.requestStats || {};
    const notifications = dashboardStats?.notifications || [];
    const recentRequests = dashboardStats?.recentRequests || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const today = DAYS[new Date().getDay()];
    const currentClass = todayClasses.find(c => c.status === 'now');
    const nextClass = todayClasses.find(c => c.status === 'upcoming');
    const completedClasses = todayClasses.filter(c => c.status === 'done').length;
    const dayProgress = todayClasses.length > 0 
        ? Math.round((completedClasses / todayClasses.length) * 100) 
        : 0;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-fade-in">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {isCR ? 'CR Dashboard' : 'Dashboard Overview'}
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        {lastLoginTime ? `Last Login: ${lastLoginTime}` : `Welcome back, ${userName}`}
                        {stats.sectionInfo && <span style={{ marginLeft: '0.75rem', padding: '0.15rem 0.6rem', background: 'var(--primary-light, #e0e7ff)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>{stats.sectionInfo}</span>}
                    </p>
                </div>

                {/* Notification Bell */}
                <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotifications(!showNotifications)} className="notification-icon-btn">
                        <Bell size={24} color="var(--text-main)" />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <span style={{ fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px' }}>{unreadCount} New</span>
                                )}
                            </div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map(note => (
                                        <div key={note._id} className="notification-item">
                                            <div className="note-text">{note.message}</div>
                                            <div className="note-time">{timeAgo(note.createdAt)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notification-empty">All caught up! No notifications.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <StatCard 
                    icon={GraduationCap} 
                    label="Enrolled Courses" 
                    value={stats.totalCourses || 0} 
                    sublabel={`${stats.sectionInfo || ''}`}
                    color="#6366f1" 
                />
                <StatCard 
                    icon={Clock} 
                    label="Weekly Hours" 
                    value={stats.totalWeeklyHours || 0} 
                    sublabel="Class hours per week"
                    color="#10b981" 
                />
                <StatCard 
                    icon={FlaskConical} 
                    label="Theory / Lab" 
                    value={`${stats.theoryHours || 0} / ${stats.labHours || 0}`} 
                    sublabel="Hours breakdown"
                    color="#f59e0b" 
                />
                <StatCard 
                    icon={Users} 
                    label="Faculty" 
                    value={stats.facultyCount || 0} 
                    sublabel="Teaching your section"
                    color="#ec4899" 
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

                {/* Today's Schedule Card */}
                <div className="modern-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                            <CalendarDays size={20} color="var(--student-theme)" /> Today — {today}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); loadDashboard(); }} 
                                style={{ background: 'var(--student-theme-light)', color: 'var(--student-theme)', border: 'none', padding: '0.4rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}
                                title="Refresh"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <button onClick={() => navigate('/student/timetable')} style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                Full Timetable <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Day progress bar */}
                    {todayClasses.length > 0 && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                                <span>{completedClasses} of {todayClasses.length} classes done</span>
                                <span>{dayProgress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'var(--border)' }}>
                                <div style={{ width: `${dayProgress}%`, height: '100%', borderRadius: '999px', background: 'var(--student-theme)', transition: 'width 1s ease-in-out' }} />
                            </div>
                        </div>
                    )}

                    {/* Current / Next class highlight */}
                    {currentClass && (
                        <div style={{ padding: '0.8rem 1rem', background: 'var(--student-theme)', borderRadius: 'var(--radius-md)', color: 'white', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Happening Now</div>
                                <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.15rem' }}>{currentClass.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.1rem' }}>{currentClass.room || 'TBD'} • {currentClass.time}</div>
                            </div>
                            <BookOpen size={28} opacity={0.6} />
                        </div>
                    )}

                    {!currentClass && nextClass && (
                        <div style={{ padding: '0.8rem 1rem', background: 'linear-gradient(135deg, var(--primary-light, #e0e7ff) 0%, var(--surface) 100%)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Up Next</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem' }}>{nextClass.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{nextClass.room || 'TBD'} • {nextClass.time}</div>
                        </div>
                    )}

                    {/* Class list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '340px', overflowY: 'auto' }}>
                        {todayClasses.length > 0 ? (
                            todayClasses.map((cls, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', gap: '0.85rem', padding: '0.8rem 1rem', 
                                    background: cls.status === 'now' ? 'var(--student-theme-light)' : 'var(--bg)', 
                                    borderRadius: 'var(--radius-md)', 
                                    borderLeft: `4px solid ${cls.status === 'now' ? 'var(--student-theme)' : cls.status === 'done' ? 'var(--border)' : 'var(--primary)'}`,
                                    opacity: cls.status === 'done' ? 0.55 : 1,
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 600, minWidth: '75px', fontSize: '0.85rem' }}>
                                        {cls.time}
                                        {cls.status === 'now' && <div style={{ fontSize: '0.65rem', color: 'var(--student-theme)', fontWeight: 700 }}>NOW</div>}
                                        {cls.status === 'done' && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Done</div>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                            {cls.name}
                                            {cls.type === 'Lab' && <span style={{ fontSize: '0.7rem', color: 'var(--info, #3b82f6)', marginLeft: '0.4rem', fontWeight: 600 }}>LAB</span>}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                            {cls.room || 'TBD'}{cls.faculty ? ` • ${cls.faculty}` : ''}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                                <CalendarDays size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                                <div style={{ fontWeight: 500 }}>No classes today!</div>
                                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Enjoy your day off 🎉</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Request Activity + Notifications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Request Activity Card */}
                    <div 
                        className="modern-card" 
                        style={{ 
                            background: 'var(--surface)', padding: '1.5rem', 
                            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', 
                            border: '1px solid var(--border)',
                            cursor: 'pointer', transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/student/request-history')}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                <ArrowRightLeft size={20} color="var(--warning, #f59e0b)" /> Reschedule Requests
                            </h3>
                            <ChevronRight size={18} color="var(--text-muted)" />
                        </div>

                        {/* Stats summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            {[
                                { label: 'Total', val: requestStats.total || 0, color: 'var(--text-main)' },
                                { label: 'Pending', val: (requestStats.pendingFaculty || 0) + (requestStats.pendingAdmin || 0), color: '#f59e0b' },
                                { label: 'Approved', val: requestStats.approved || 0, color: '#10b981' },
                                { label: 'Rejected', val: requestStats.rejected || 0, color: '#ef4444' }
                            ].map((item, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '0.6rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color }}>{item.val}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent requests */}
                        {recentRequests.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent</div>
                                {recentRequests.slice(0, 3).map(req => (
                                    <div key={req._id} style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.6rem 0.8rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                                        fontSize: '0.85rem'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.courseCode}</span>
                                            <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>•</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {req.currentDay} S{req.currentSlotNumber} → {req.requestedDay} S{req.requestedSlotNumber}
                                            </span>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No reschedule requests yet
                            </div>
                        )}
                    </div>

                    {/* Notifications Card */}
                    <div className="modern-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                            <Bell size={20} color="var(--primary)" /> Recent Notifications
                            {unreadCount > 0 && (
                                <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>{unreadCount}</span>
                            )}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto' }}>
                            {notifications.length > 0 ? (
                                notifications.slice(0, 5).map(note => (
                                    <div key={note._id} style={{ 
                                        display: 'flex', gap: '0.75rem', padding: '0.7rem 0.8rem', 
                                        background: note.isRead ? 'var(--bg)' : 'var(--primary-light, #e0e7ff)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: `3px solid ${note.type === 'Reschedule' ? '#f59e0b' : 'var(--primary)'}`,
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{note.message}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {note.type === 'Reschedule' 
                                                    ? <ArrowRightLeft size={11} /> 
                                                    : <AlertCircle size={11} />
                                                }
                                                {note.type} • {timeAgo(note.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                                    <Bell size={28} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                    <div style={{ fontSize: '0.9rem' }}>No notifications yet</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
