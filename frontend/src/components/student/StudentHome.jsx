import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Clock, CalendarDays, Loader2, RefreshCw } from 'lucide-react';
import { timetableService } from '../../services/timetableService';

const CircularProgress = ({ percentage, color }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="var(--border)"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                />
            </svg>
            <div style={{ position: 'absolute', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                {percentage}%
            </div>
        </div>
    );
};

const StudentHome = () => {
    const { isCR, userName, lastLoginTime } = useOutletContext();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [progress, setProgress] = useState(0);
    const [todayClasses, setTodayClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const targetAttendance = 78;

    const [notifications, setNotifications] = useState([
        { id: 1, text: "Class rescheduled: Mathematics to 10:00 AM", time: "2 hrs ago" },
        { id: 2, text: "New assignment uploaded for Physics", time: "4 hrs ago" },
        { id: 3, text: "Library books due tomorrow", time: "1 day ago" }
    ]);

    useEffect(() => {
        setTimeout(() => {
            setProgress(targetAttendance);
        }, 300);
        fetchTodayClasses();
    }, []);

    const fetchTodayClasses = async () => {
        try {
            setLoading(true);
            const data = await timetableService.getStudentPersonalTimetable();
            if (data && data.success && data.timetable) {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const today = days[new Date().getDay()];
                
                // Filter slots for today and sort by slot number
                const slots = data.timetable.timetableSlots
                    .filter(s => s.day === today && !s.isSpanContinuation)
                    .sort((a, b) => a.slotNumber - b.slotNumber);
                
                // Map to display format
                const formatted = slots.map(s => {
                    const slotTimes = [
                        { start: '08:00 AM', end: '09:00 AM' },
                        { start: '09:00 AM', end: '10:00 AM' },
                        { start: '10:00 AM', end: '11:00 AM' },
                        { start: '11:00 AM', end: '12:00 PM' },
                        { start: '12:00 PM', end: '01:00 PM' }, // Lunch
                        { start: '01:00 PM', end: '02:00 PM' },
                        { start: '02:00 PM', end: '03:00 PM' },
                        { start: '03:00 PM', end: '04:00 PM' },
                        { start: '04:00 PM', end: '05:00 PM' }
                    ];
                    const time = slotTimes[s.slotNumber - 1] || { start: 'TBD', end: '' };
                    
                    const course = data.timetable.courses.find(c => c.courseCode === s.courseCode);
                    return {
                        time: time.start,
                        name: course ? course.courseName : s.courseCode,
                        room: s.venue,
                        type: s.sessionType
                    };
                });
                setTodayClasses(formatted);
            }
        } catch (err) {
            console.error('Error fetching today\'s classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleNotifications = () => setShowNotifications(!showNotifications);

    const clearNotifications = () => {
        setNotifications([]);
        setShowNotifications(false);
    };

    // Derive dynamic color
    const progressColor = progress >= 75 ? 'var(--student-theme)' : progress >= 60 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div className="dashboard-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {isCR ? `CR Dashboard` : `Dashboard Overview`}
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        {lastLoginTime ? `Last Login: ${lastLoginTime}` : `Welcome back, ${userName}`}
                    </p>
                </div>

                <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <button onClick={toggleNotifications} className="notification-icon-btn">
                        <Bell size={24} color="var(--text-main)" />
                        {notifications.length > 0 && (
                            <span className="notification-badge">{notifications.length}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <span>Notifications</span>
                                <span style={{ fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px' }}>{notifications.length} New</span>
                            </div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map(note => (
                                        <div key={note.id} className="notification-item">
                                            <div className="note-text">{note.text}</div>
                                            <div className="note-time">{note.time}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notification-empty">All caught up!</div>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button onClick={clearNotifications} className="clear-all-btn">
                                    Clear All Notifications
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Attendance Card */}
                <div className="modern-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <CircularProgress percentage={progress} color={progressColor} />
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>Attendance</h3>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>You are maintaining a good attendance rate. Keep it up!</p>
                        <div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.25rem 0.75rem', background: progress >= 75 ? 'var(--student-theme-light)' : 'var(--warning-light)', color: progressColor, borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
                            {progress >= 75 ? 'On Track' : 'Needs Attention'}
                        </div>
                    </div>
                </div>

                {/* Weekly Summary Placeholders */}
                <div className="modern-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarDays size={20} color="var(--primary)" /> Weekly Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Classes Attended</span>
                            <span style={{ fontWeight: 600 }}>14 / 16</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Today's Preview Section */}
                <div className="modern-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="var(--student-theme)" /> Today's Classes
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); fetchTodayClasses(); }} 
                                disabled={loading}
                                style={{ 
                                    background: 'var(--student-theme-light)', 
                                    color: 'var(--student-theme)', 
                                    border: 'none', 
                                    padding: '0.4rem', 
                                    borderRadius: 'var(--radius-md)', 
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    opacity: loading ? 0.6 : 1,
                                    transition: 'var(--transition)'
                                }}
                                title="Refresh today's classes"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button onClick={() => navigate('/student/timetable')} style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View Timetable</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : todayClasses.length > 0 ? (
                            todayClasses.map((cls, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--student-theme)' }}>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 600, minWidth: '80px' }}>{cls.time}</div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>
                                            {cls.name}
                                            {cls.type === 'Lab' && <span style={{ fontSize: '0.7rem', color: 'var(--info)', marginLeft: '0.5rem' }}> (Lab)</span>}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                            <BookOpen size={14} /> {cls.room || 'TBD'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No classes scheduled for today!
                            </div>
                        )}
                    </div>
                </div>

                <div className="modern-card" onClick={() => navigate('/student/reschedule')} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--warning)', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Request Stats</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.5rem' }}>3 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Requests</span></div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>2 Pending</div>
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--student-theme-light)', color: 'var(--student-theme)', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>1 Approved</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
