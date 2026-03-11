import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { exportToICS } from '../../utils/icsExport';
import { exportToPDF } from '../../utils/pdfExport';
import '../admin/AmritaTimetable.css';

const FacultyTimetable = () => {
    const [loading, setLoading] = useState(true);
    const [timetableData, setTimetableData] = useState(null);
    const [facultyDetails, setFacultyDetails] = useState(null);
    const [error, setError] = useState(null);
    const [, setCurrentTime] = useState(new Date());
    const timetableRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchMyTimetable();
    }, []);

    const fetchMyTimetable = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/timetable/my-timetable', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setFacultyDetails({
                    name: data.facultyName,
                    department: data.department,
                    designation: data.designation,
                    email: data.email
                });
                setTimetableData({
                    slots: data.slots || [],
                    courses: data.courses || []
                });
            } else {
                setError(data.message || 'Failed to load timetable');
            }
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Failed to load timetable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentAbbreviation = (dept) => {
        if (!dept) return '';
        const abbrev = {
            'Computer Science and Engineering': 'CSE',
            'Computer Science': 'CSE',
            'Electronics and Communication Engineering': 'ECE',
            'Electronics': 'ECE',
            'Mechanical Engineering': 'MECH',
            'Civil Engineering': 'CIVIL',
            'Electrical and Electronics Engineering': 'EEE',
            'Information Technology': 'IT',
            'Mathematics': 'MATH',
            'Physics': 'PHY',
            'Chemistry': 'CHEM',
            'General': 'GEN'
        };
        return abbrev[dept] || dept;
    };

    const slots = [
        { number: 1, start: '08:00', end: '09:00' },
        { number: 2, start: '09:00', end: '10:00' },
        { number: 3, start: '10:00', end: '11:00' },
        { number: 4, start: '11:00', end: '12:00' },
        { number: 5, start: '12:00', end: '13:00' }, // Lunch
        { number: 6, start: '13:00', end: '14:00' },
        { number: 7, start: '14:00', end: '15:00' },
        { number: 8, start: '15:00', end: '16:00' },
        { number: 9, start: '16:00', end: '17:00' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const getSlotData = (day, slotNumber) => {
        if (!timetableData || !timetableData.slots) return null;
        return timetableData.slots.find(
            s => s.day === day && s.slotNumber === slotNumber && !s.isSpanContinuation
        ) || null;
    };

    const getSlotColor = (sessionType) => {
        const colors = {
            'Theory': '#e0f7fa',
            'Lab': '#00bcd4',
            'Project': '#fff9c4',
            'CIR': '#ffccbc',
            'Elective': '#e1bee7',
            'Occupied': '#f5f5f5',
            'Discussion': '#c8e6c9',
        };
        return colors[sessionType] || '#ffffff';
    };

    // Prepare courses summary split by Theory and Lab
    const getCoursesSummary = () => {
        if (!timetableData || !timetableData.slots) {
            return { theoryList: [], labList: [] };
        }

        const theoryCourses = {};
        const labCourses = {};

        timetableData.slots.forEach(s => {
            if (!s.isSpanContinuation) {
                const key = `${s.courseCode}-${s.department}-${s.section}`;
                const targetMap = s.sessionType === 'Lab' ? labCourses : theoryCourses;

                if (!targetMap[key]) {
                    targetMap[key] = {
                        courseCode: s.courseCode,
                        department: s.department,
                        section: s.section,
                        sessionType: s.sessionType || 'Theory',
                        venue: s.venue,
                        sessions: 0
                    };
                }
                targetMap[key].sessions += 1;
            }
        });

        return {
            theoryList: Object.values(theoryCourses),
            labList: Object.values(labCourses)
        };
    };

    const { theoryList, labList } = getCoursesSummary();

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading your timetable...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)' }}>
                    <AlertCircle size={32} />
                    <div>
                        <h3 style={{ margin: 0 }}>Error Loading Timetable</h3>
                        <p style={{ margin: '0.25rem 0 0 0' }}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!facultyDetails) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertCircle size={32} color="var(--warning)" />
                    <div>
                        <h3 style={{ margin: 0 }}>No Faculty Profile Found</h3>
                        <p style={{ margin: '0.25rem 0 0 0' }}>Please contact admin to set up your faculty profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-fade-in amrita-timetable-container" style={{ width: '100%', paddingBottom: '2rem' }} ref={timetableRef}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>My Timetable</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View your weekly teaching schedule</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => exportToICS(timetableData, `faculty-timetable-${facultyDetails?.name || 'export'}.ics`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <Download size={16} />
                        Export ICS
                    </button>
                    <button
                        onClick={() => exportToPDF(timetableRef.current, `faculty-timetable-${facultyDetails?.name || 'export'}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <FileText size={16} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="timetable-header">
                <h2>FACULTY TIME TABLE</h2>
            </div>

            {/* Config Banner */}
            <div className="timetable-config">
                <div className="config-row">
                    <div className="config-item">
                        <label>Faculty:</label>
                        <span style={{ fontWeight: '600' }}>{facultyDetails.name}</span>
                    </div>
                    <div className="config-item">
                        <label>Department:</label>
                        <span>{getDepartmentAbbreviation(facultyDetails.department)}</span>
                    </div>
                    <div className="config-item">
                        <label>Designation:</label>
                        <span>{facultyDetails.designation}</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="timetable-grid-wrapper">
                <table className="timetable-grid">
                    <thead>
                        <tr>
                            <th rowSpan="2">Time/Day</th>
                            {slots.map(s => <th key={s.number}>Slot {s.number}</th>)}
                        </tr>
                        <tr>
                            {slots.map(s => (
                                <th key={`t-${s.number}`} className="time-header">
                                    {s.start} - {s.end}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map(day => (
                            <tr key={day}>
                                <td className="day-cell">{day}</td>
                                {slots.map(slot => {
                                    if (slot.number === 5) {
                                        if (day === 'Monday') {
                                            return (
                                                <React.Fragment key={`${day}-5`}>
                                                    <td rowSpan={days.length} className="lunch-break-cell">
                                                        Lunch Break
                                                    </td>
                                                </React.Fragment>
                                            );
                                        }
                                        return null;
                                    }
                                    const slotData = getSlotData(day, slot.number);
                                    return (
                                        <td
                                            key={`${day}-${slot.number}`}
                                            className="timetable-cell"
                                            style={{ backgroundColor: getSlotColor(slotData?.sessionType) }}
                                        >
                                            {slotData && (
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                        {slotData.courseCode}
                                                        {slotData.sessionType && slotData.sessionType !== 'Theory' && (
                                                            <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.25rem', fontSize: '0.75rem' }}>
                                                                ({slotData.sessionType})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#1a6b3a', fontWeight: '600', marginTop: '2px' }}>
                                                        {slotData.department}-{slotData.section}
                                                    </div>
                                                    {slotData.venue && (
                                                        <div style={{ fontSize: '0.7rem', color: '#555' }}>
                                                            {slotData.venue}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Split Schedule Summary into Theory and Labs */}
            <div className="course-tables">
                {/* Core/Theory Courses */}
                {theoryList.length > 0 && (
                    <div className="course-table-section">
                        <h3>Theory Classes</h3>
                        <table className="course-info-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Class</th>
                                    <th>Venue</th>
                                    <th>Sessions / Week</th>
                                </tr>
                            </thead>
                            <tbody>
                                {theoryList.map((c, i) => (
                                    <tr key={i}>
                                        <td>{c.courseCode}</td>
                                        <td>{c.department} - {c.section}</td>
                                        <td>{c.venue || 'TBD'}</td>
                                        <td>{c.sessions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Lab Courses */}
                {labList.length > 0 && (
                    <div className="course-table-section">
                        <h3>Component Lab</h3>
                        <table className="course-info-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Class</th>
                                    <th>Venue</th>
                                    <th>Sessions / Week</th>
                                </tr>
                            </thead>
                            <tbody>
                                {labList.map((c, i) => (
                                    <tr key={i}>
                                        <td>{c.courseCode}</td>
                                        <td>{c.department} - {c.section}</td>
                                        <td>{c.venue || 'TBD'}</td>
                                        <td>{c.sessions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyTimetable;