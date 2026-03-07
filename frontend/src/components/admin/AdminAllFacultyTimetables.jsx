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

// Single faculty timetable grid
const FacultyGrid = ({ faculty, data }) => {
    const getSlotData = (day, slotNumber) => {
        if (!data?.slots) return null;
        return data.slots.find(
            s => s.day === day && s.slotNumber === slotNumber && !s.isSpanContinuation
        ) || null;
    };

    const hasAnySlot = data?.slots?.length > 0;

    return (
        <div style={{ marginBottom: '3rem', pageBreakInside: 'avoid' }}>
            {/* Faculty header banner */}
            <div className="timetable-header" style={{ borderRadius: '8px 8px 0 0' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                    {faculty.name}
                    {faculty.department ? ` — ${faculty.department}` : ''}
                    {faculty.designation ? ` (${faculty.designation})` : ''}
                </h2>
            </div>

            {!hasAnySlot ? (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#f9f9f9',
                    border: '1px dashed #ccc',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '0.9rem',
                    borderRadius: '0 0 8px 8px'
                }}>
                    No timetable assigned
                </div>
            ) : (
                <>
                    <div className="timetable-grid-wrapper">
                        <table className="timetable-grid">
                            <thead>
                                <tr>
                                    <th rowSpan="2">Time/Day</th>
                                    {slots.map(s => (
                                        <th key={s.number}>Slot {s.number}</th>
                                    ))}
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
                                                        <React.Fragment key={`${day}-${slot.number}`}>
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
                                                            <div style={{ fontWeight: 'bold', fontSize: '0.82rem' }}>
                                                                {slotData.courseCode}
                                                                {slotData.sessionType && slotData.sessionType !== 'Theory' && (
                                                                    <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.2rem', fontSize: '0.72rem' }}>
                                                                        ({slotData.sessionType})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#1a6b3a', fontWeight: '600', marginTop: '2px' }}>
                                                                {slotData.department}-{slotData.section}
                                                            </div>
                                                            {slotData.venue && (
                                                                <div style={{ fontSize: '0.68rem', color: '#555' }}>
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
                </>
            )}
        </div>
    );
};

const AdminAllFacultyTimetables = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [timetables, setTimetables] = useState({}); // { facultyId: { slots } }
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [error, setError] = useState(null);
    const [filterDept, setFilterDept] = useState('All');

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            setError(null);
            try {
                const faculty = await getAllFaculty();
                // Only faculty with a real department (skip generic test accounts)
                const EXCLUDED_DEPARTMENTS = ['General', 'TEST', 'Computer Science'];
                const filtered = faculty.filter(f => f.name && f._id && !EXCLUDED_DEPARTMENTS.includes(f.department));
                setFacultyList(filtered);
                setProgress({ done: 0, total: filtered.length });

                // Load all timetables in parallel batches of 5
                const results = {};
                const batchSize = 5;
                for (let i = 0; i < filtered.length; i += batchSize) {
                    const batch = filtered.slice(i, i + batchSize);
                    await Promise.all(
                        batch.map(async (f) => {
                            try {
                                const data = await getFacultyTimetable(f._id);
                                results[f._id] = data;
                            } catch {
                                results[f._id] = { slots: [] };
                            }
                        })
                    );
                    setProgress({ done: Math.min(i + batchSize, filtered.length), total: filtered.length });
                }
                setTimetables(results);
            } catch (err) {
                setError('Failed to load faculty or timetable data. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    // Build department filter options
    const EXCLUDED_DEPARTMENTS = ['General', 'TEST', 'Computer Science'];
    const departments = ['All', ...new Set(facultyList.map(f => f.department).filter(d => d && !EXCLUDED_DEPARTMENTS.includes(d)))].sort();

    const displayed = filterDept === 'All'
        ? facultyList
        : facultyList.filter(f => f.department === filterDept);

    // Count faculty with at least one slot
    const withSlots = displayed.filter(f => timetables[f._id]?.slots?.length > 0);

    return (
        <div className="amrita-timetable-container">
            {/* Page Header */}
            <div style={{
                backgroundColor: 'white',
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
            }}>
                <div>
                    <h2 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}>All Faculty Timetables</h2>
                    {!loading && (
                        <p style={{ margin: '0.25rem 0 0', color: '#718096', fontSize: '0.9rem' }}>
                            {withSlots.length} of {displayed.length} faculty have assigned slots
                        </p>
                    )}
                </div>

                {/* Department Filter */}
                {!loading && departments.length > 2 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold', color: '#4a5568' }}>Department:</label>
                        <select
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                            style={{
                                padding: '0.45rem 0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '0.95rem'
                            }}
                        >
                            {departments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Loading state */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '1.1rem', color: '#4a5568', marginBottom: '1rem' }}>
                        Loading timetables... ({progress.done} / {progress.total})
                    </div>
                    <div style={{
                        height: '8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            height: '100%',
                            width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : '0%',
                            backgroundColor: '#6b9e4d',
                            transition: 'width 0.3s ease',
                            borderRadius: '4px'
                        }} />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#fee',
                    color: '#c00',
                    borderRadius: '8px',
                    border: '1px solid #fcc',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {/* All timetable grids */}
            {!loading && !error && displayed.map(faculty => (
                <FacultyGrid
                    key={faculty._id}
                    faculty={faculty}
                    data={timetables[faculty._id]}
                />
            ))}
        </div>
    );
};

export default AdminAllFacultyTimetables;
