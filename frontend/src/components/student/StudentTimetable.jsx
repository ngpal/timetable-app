import React, { useState, useEffect } from 'react';
import { Download, Maximize2, Minimize2, Clock, MapPin, Users, AlertCircle, Loader2 } from 'lucide-react';
import { timetableService } from '../../services/timetableService';
import '../admin/AmritaTimetable.css';

const StudentTimetable = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        fetchTimetable();
        return () => clearInterval(timer);
    }, []);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const data = await timetableService.getStudentPersonalTimetable();
            if (data && data.success) {
                setTimetableData(data.timetable);
            } else {
                setError(data?.message || 'Failed to load timetable');
            }
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Failed to connect to server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Slot structure matches AmritaTimetable
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

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading your personal timetable...</p>
            </div>
        );
    }

    if (error || !timetableData) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)' }}>
                    <AlertCircle size={32} />
                    <div>
                        <h3 style={{ margin: 0 }}>Timetable Not Found</h3>
                        <p style={{ margin: '0.25rem 0 0 0' }}>{error || 'No active timetable found for your section.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { department, semester, program, section, timetableSlots, courses, classAdvisors } = timetableData;

    const getSlotData = (day, slotNumber) => {
        return timetableSlots.find(
            slot => slot.day === day && slot.slotNumber === slotNumber
        );
    };

    const getSlotColor = (slotType) => {
        const colors = {
            'Theory': '#e0f7fa',
            'Lab': '#00bcd4',
            'Project': '#fff9c4',
            'CIR': '#ffccbc',
            'Elective': '#e1bee7',
            'Occupied': '#f5f5f5',
            'Discussion': '#c8e6c9'
        };
        return colors[slotType] || '#ffffff';
    };

    const renderSlotContent = (slot) => {
        if (!slot) return null;

        if (slot.isSpanContinuation) {
            return (
                <div style={{ fontSize: '0.7rem', color: '#718096', fontStyle: 'italic', textAlign: 'center' }}>
                    ↑ Continued
                </div>
            );
        }

        return (
            <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {slot.courseCode}
                    {slot.sessionType && slot.sessionType !== 'Theory' && (
                        <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.25rem', fontSize: '0.75rem' }}>
                            ({slot.sessionType})
                        </span>
                    )}
                </div>
                {slot.venue && (
                    <div style={{ fontSize: '0.7rem', color: '#555' }}>
                        {slot.venue}
                    </div>
                )}
                {slot.spanSlots > 1 && (
                    <div style={{ fontSize: '0.65rem', color: '#e53e3e', fontWeight: '600', marginTop: '2px' }}>
                        {slot.spanSlots} slots
                    </div>
                )}
                {slot.notes && (
                    <div style={{ fontSize: '0.7rem', color: '#777', fontStyle: 'italic', marginTop: '2px' }}>
                        {slot.notes}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-fade-in amrita-timetable-container" style={{ width: '100%', paddingBottom: '2rem' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Class Timetable</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View your weekly academic schedule</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="timetable-header">
                <h2>TIME TABLE</h2>
            </div>

            {/* Configuration */}
            <div className="timetable-config">
                <div className="config-row">
                    <div className="config-item">
                        <label>Dept-{timetableData.department}</label>
                        <span>Semester: {timetableData.semester === 'Odd' ? 'VI' : 'V'}</span>
                    </div>
                    <div className="config-item">
                        <label>Class: {timetableData.program} {timetableData.department}</label>
                        <span>Section: {timetableData.section}</span>
                    </div>
                    <div className="config-item">
                        <label>AB III</label>
                    </div>
                </div>
                {timetableData.classAdvisors && (
                    <div className="config-row">
                        <div className="config-item">
                            <label>Class Advisors:</label>
                            <span>
                                {timetableData.classAdvisors.map(a => a.name).join(', ')}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Timetable Grid */}
            <div className="timetable-grid-wrapper">
                <table className="timetable-grid">
                    <thead>
                        <tr>
                            <th rowSpan="2">Time/Day</th>
                            {slots.map(slot => (
                                <th key={slot.number}>
                                    Slot {slot.number}
                                </th>
                            ))}
                        </tr>
                        <tr>
                            {slots.map(slot => (
                                <th key={`time-${slot.number}`} className="time-header">
                                    {slot.start} - {slot.end}
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
                                                <React.Fragment key={`${day}-${slot.number}`}>
                                                    <td
                                                        rowSpan={days.length}
                                                        className="lunch-break-cell"
                                                    >
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
                                            style={{ backgroundColor: getSlotColor(slotData?.slotType || slotData?.sessionType) }}
                                        >
                                            {renderSlotContent(slotData)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Course Information Tables */}
            {timetableData.courses && (
                <div className="course-tables">
                    {/* Core/Theory Courses */}
                    <div className="course-table-section">
                        <h3>Core Courses</h3>
                        <table className="course-info-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Faculty</th>
                                    <th>Venue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timetableData.courses
                                    .filter(c => c.courseType === 'Core' || c.courseType === 'Theory')
                                    .map((course, idx) => {
                                        const theorySlot = timetableData.timetableSlots?.find(
                                            s => s.courseCode === course.courseCode && (!s.sessionType || s.sessionType === 'Theory')
                                        );
                                        const venue = theorySlot?.venue || course.venue || 'TBD';

                                        return (
                                            <tr key={idx}>
                                                <td>{course.courseCode}</td>
                                                <td>
                                                    {course.courseName}
                                                    {course.sessionType && course.sessionType !== 'Theory' && (
                                                        <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.5rem' }}>
                                                            ({course.sessionType})
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {course.faculty.map(f => f.name || 'TBD').join(', ')}
                                                </td>
                                                <td>{venue}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>

                    {/* Component Labs */}
                    {timetableData.courses.some(c => c.courseType === 'Lab') && (
                        <div className="course-table-section">
                            <h3>Component Lab</h3>
                            <table className="course-info-table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Incharge Lab</th>
                                        <th>Assisting Faculty</th>
                                        <th>Venue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timetableData.courses
                                        .filter(c => c.courseType === 'Lab')
                                        .map((course, idx) => {
                                            const incharge = course.faculty.find(f => f.role === 'Incharge') || course.faculty[0];
                                            const assisting = course.faculty.filter(f => f.role === 'Assisting');

                                            const labSlot = timetableData.timetableSlots?.find(
                                                s => s.courseCode === course.courseCode && s.sessionType === 'Lab'
                                            );
                                            const venue = labSlot?.venue || course.venue || 'TBD';

                                            return (
                                                <tr key={idx}>
                                                    <td>{course.courseCode}</td>
                                                    <td>
                                                        {course.courseName}
                                                        {course.sessionType && course.sessionType !== 'Lab' && (
                                                            <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.5rem' }}>
                                                                ({course.sessionType})
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{incharge?.name || 'TBD'}</td>
                                                    <td>
                                                        {assisting.length > 0 ? assisting.map(f => f.name || 'TBD').join(', ') : 'N/A'}
                                                    </td>
                                                    <td>{venue}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentTimetable;