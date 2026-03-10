import React, { useState, useEffect } from 'react';
import { getAllFaculty } from '../../services/facultyService';
import { getFacultyTimetable } from '../../services/courseAssignmentService';
import './AmritaTimetable.css';

const slots = [
    { number: 1, start: '08:00', end: '09:00' },
    { number: 2, start: '09:00', end: '10:00' },
    { number: 3, start: '10:00', end: '11:00' },
    { number: 4, start: '11:00', end: '12:00' },
    { number: 5, start: '12:00', end: '13:00' },
    { number: 6, start: '13:00', end: '14:00' },
    { number: 7, start: '14:00', end: '15:00' },
    { number: 8, start: '15:00', end: '16:00' },
    { number: 9, start: '16:00', end: '17:00' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

const AdminFacultyTimetable = () => {
    const [allFaculty, setAllFaculty] = useState([]);
    const [loadingFaculty, setLoadingFaculty] = useState(true);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');

    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all faculty on mount
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoadingFaculty(true);
                const data = await getAllFaculty();
                setAllFaculty(data.filter(f => f.name && f._id));
            } catch {
                setError('Failed to load faculty list.');
            } finally {
                setLoadingFaculty(false);
            }
        };
        fetch();
    }, []);

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

    // Unique departments sorted
    const EXCLUDED_DEPARTMENTS = ['General', 'TEST'];
    const departmentAbbreviations = [...new Set(
        allFaculty
            .map(f => getDepartmentAbbreviation(f.department))
            .filter(d => d && !EXCLUDED_DEPARTMENTS.includes(d))
    )].sort();

    // Faculty filtered by selected dept abbreviation
    const filteredFaculty = selectedDept
        ? allFaculty.filter(f => getDepartmentAbbreviation(f.department) === selectedDept)
        : allFaculty;

    // Reset faculty when dept changes
    const handleDeptChange = (dept) => {
        setSelectedDept(dept);
        setSelectedFacultyId('');
        setTimetableData(null);
        setError(null);
    };

    const loadTimetable = async () => {
        if (!selectedFacultyId) return;
        setError(null);
        setLoading(true);
        setTimetableData(null);
        try {
            const data = await getFacultyTimetable(selectedFacultyId);
            setTimetableData(data);
        } catch {
            setError('Failed to load timetable. Please check the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getSlotData = (day, slotNumber) => {
        if (!timetableData?.slots) return null;
        return timetableData.slots.find(
            s => s.day === day && s.slotNumber === slotNumber && !s.isSpanContinuation
        ) || null;
    };

    const selectedFaculty = allFaculty.find(f => f._id === selectedFacultyId);

    return (
        <div className="amrita-timetable-container">

            {/* Filter Bar — same style as class timetable */}
            <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Department */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Department:</label>
                    {loadingFaculty ? (
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Loading...</span>
                    ) : (
                        <select
                            value={selectedDept}
                            onChange={e => handleDeptChange(e.target.value)}
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minWidth: '120px' }}
                        >
                            <option value="">-- All --</option>
                            {departmentAbbreviations.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Faculty Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Faculty Name:</label>
                    <select
                        value={selectedFacultyId}
                        onChange={e => { setSelectedFacultyId(e.target.value); setTimetableData(null); }}
                        disabled={loadingFaculty}
                        style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minWidth: '200px' }}
                    >
                        <option value="">-- Select Faculty --</option>
                        {filteredFaculty.map(f => (
                            <option key={f._id} value={f._id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {/* Load Button */}
                <button
                    onClick={loadTimetable}
                    disabled={!selectedFacultyId || loading}
                    style={{
                        padding: '0.5rem 1.2rem',
                        backgroundColor: selectedFacultyId ? '#6b9e4d' : '#a0aec0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedFacultyId ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {loading ? 'Loading...' : 'Load Timetable'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '1rem', marginBottom: '1rem',
                    backgroundColor: '#fee', color: '#c00',
                    borderRadius: '8px', border: '1px solid #fcc'
                }}>
                    {error}
                </div>
            )}

            {/* Timetable */}
            {timetableData && (
                <>
                    {/* Header */}
                    <div className="timetable-header">
                        <h2>FACULTY TIME TABLE</h2>
                    </div>

                    {/* Info Banner */}
                    <div className="timetable-config">
                        <div className="config-row">
                            <div className="config-item">
                                <label>Faculty:</label>
                                <span style={{ fontWeight: '600' }}>
                                    {timetableData.facultyName || selectedFaculty?.name || 'N/A'}
                                </span>
                            </div>
                            {selectedFaculty?.department && (
                                <div className="config-item">
                                    <label>Department:</label>
                                    <span>{selectedFaculty.department}</span>
                                </div>
                            )}
                            {selectedFaculty?.designation && (
                                <div className="config-item">
                                    <label>Designation:</label>
                                    <span>{selectedFaculty.designation}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* No slots message */}
                    {timetableData.slots.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '3rem',
                            backgroundColor: '#fff3cd', border: '1px solid #ffc107',
                            borderRadius: '8px', marginTop: '1rem'
                        }}>
                            <h3 style={{ color: '#856404' }}>No Timetable Found</h3>
                            <p style={{ color: '#856404' }}>
                                This faculty has no assigned slots in any active timetable.
                            </p>
                        </div>
                    ) : (
                        <>
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
                            {(() => {
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

                                const theoryList = Object.values(theoryCourses);
                                const labList = Object.values(labCourses);

                                return (
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
                                );
                            })()}
                        </>
                    )}
                </>
            )}

            {/* Placeholder when nothing loaded */}
            {!timetableData && !loading && !error && (
                <div style={{
                    textAlign: 'center', padding: '3rem',
                    backgroundColor: 'white', borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#718096'
                }}>
                    <p style={{ fontSize: '1.1rem' }}>
                        Select a <strong>Department</strong> then a <strong>Faculty Name</strong> and click <strong>Load Timetable</strong>.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminFacultyTimetable;
