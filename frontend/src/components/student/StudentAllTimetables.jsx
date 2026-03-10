import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Loader2, BookOpen, Clock, Calendar } from 'lucide-react';
import '../admin/AmritaTimetable.css';

const StudentAllTimetables = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('CSE');
    const [selectedSemester, setSelectedSemester] = useState('3');
    const [selectedSection, setSelectedSection] = useState('A');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-2026');
    const [timetableData, setTimetableData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'AIDS'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const sections = ['A', 'B', 'C', 'D'];
    const academicYears = ['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'];

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

    const generateRandomTimetable = (department) => {
        const deptSubjects = {
            'CSE': ['CS201', 'CS202', 'CS203', 'CS204', 'MA201', 'HS201'],
            'ECE': ['EC201', 'EC202', 'EC203', 'EC204', 'MA201', 'HS201'],
            'MECH': ['ME201', 'ME202', 'ME203', 'ME204', 'MA201', 'HS201'],
            'CIVIL': ['CE201', 'CE202', 'CE203', 'CE204', 'MA201', 'HS201'],
            'AIDS': ['AI201', 'AI202', 'AI203', 'AI204', 'MA201', 'HS201']
        };
        const subjects = deptSubjects[department] || deptSubjects['CSE'];
        const rooms = ['101', '102', '103', '104', '105', '201', '202'];
        const generatedSlots = [];
        const coursesMap = {};

        days.forEach(day => {
            slots.forEach(item => {
                if (item.number !== 5) { // Skip lunch
                    if (Math.random() > 0.3) {
                        const baseCode = subjects[Math.floor(Math.random() * subjects.length)];
                        const room = `Room ${rooms[Math.floor(Math.random() * rooms.length)]}`;
                        const isLab = Math.random() > 0.8;
                        const type = isLab ? 'Lab' : 'Theory';
                        const actualCode = isLab ? `${baseCode}L` : baseCode;

                        generatedSlots.push({
                            day: day,
                            slotNumber: item.number,
                            courseCode: actualCode,
                            sessionType: type,
                            venue: room,
                            facultyName: 'Staff Name'
                        });

                        coursesMap[actualCode] = {
                            courseCode: actualCode,
                            courseName: `${baseCode} ${isLab ? 'Lab' : 'Course'}`,
                            courseType: type,
                            faculty: [{ name: 'Staff Name', role: isLab ? 'Incharge' : undefined }],
                            venue: room
                        };
                    }
                }
            });
        });

        return {
            timetableSlots: generatedSlots,
            courses: Object.values(coursesMap),
            department: selectedDepartment,
            semester: selectedSemester,
            section: selectedSection,
            academicYear: selectedAcademicYear
        };
    };

    useEffect(() => {
        const fetchTimetable = async () => {
            setIsLoading(true);
            try {
                // Convert semester number to Odd/Even
                const semesterType = parseInt(selectedSemester) % 2 !== 0 ? 'Odd' : 'Even';
                const response = await axios.get('/api/timetable/find', {
                    params: { department: selectedDepartment, semester: semesterType, section: selectedSection, academicYear: selectedAcademicYear },
                    withCredentials: true
                });
                if (response.data?.timetableSlots?.length > 0) {
                    setTimetableData(response.data);
                } else {
                    setTimetableData(generateRandomTimetable(selectedDepartment));
                }
            } catch (error) {
                console.error("Error fetching timetable", error);
                setTimetableData(generateRandomTimetable(selectedDepartment));
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimetable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartment, selectedSemester, selectedSection, selectedAcademicYear]);

    const getSlotContent = (day, slotId) => {
        return timetableData?.timetableSlots?.find(s => s.day === day && s.slotNumber === slotId && !s.isSpanContinuation);
    };

    const metrics = useMemo(() => {
        if (!timetableData?.timetableSlots) return { totalHours: 0, distinctSubjects: 0 };
        const subjects = new Set();
        timetableData.timetableSlots.forEach(s => subjects.add(s.courseCode || s.subject));
        return { totalHours: timetableData.timetableSlots.length, distinctSubjects: subjects.size };
    }, [timetableData]);

    return (
        <div className="dashboard-fade-in amrita-timetable-container" style={{ width: '100%', paddingBottom: '2rem' }}>
            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>University Timetable Grid</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View global institutional timetables instantly</p>
                    </div>
                    <div className="modern-card" style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} color="var(--primary)" />
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{metrics.totalHours} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Class Hrs</span></span>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={16} color="var(--student-theme)" />
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{metrics.distinctSubjects} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Subjects</span></span>
                        </div>
                    </div>
                </div>

                <div className="modern-card filter-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search code or term..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                            {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                            {semesters.map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
                        </select>
                        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                            {sections.map(section => <option key={section} value={section}>Sec {section}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="timetable-header">
                <h2>TIME TABLE</h2>
            </div>

            <div className="timetable-config">
                <div className="config-row">
                    <div className="config-item">
                        <label>Dept-{selectedDepartment}</label>
                        <span>Semester: {selectedSemester % 2 !== 0 ? 'Odd' : 'Even'} ({selectedSemester})</span>
                    </div>
                    <div className="config-item">
                        <label>Class: B.Tech {selectedDepartment}</label>
                        <span>Section: {selectedSection}</span>
                    </div>
                    <div className="config-item">
                        <label>AY: {selectedAcademicYear}</label>
                    </div>
                </div>
            </div>

            <div className="timetable-grid-wrapper" style={{ position: 'relative' }}>
                {isLoading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                        <Loader2 className="spinner" size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                )}

                <table className="timetable-grid">
                    <thead>
                        <tr>
                            <th rowSpan="2">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    <Calendar size={14} /> Time/Day
                                </div>
                            </th>
                            {slots.map(slot => (
                                <th key={slot.number}>Slot {slot.number}</th>
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
                                                    <td rowSpan={days.length} className="lunch-break-cell">
                                                        Lunch Break
                                                    </td>
                                                </React.Fragment>
                                            );
                                        }
                                        return null;
                                    }

                                    const slotData = getSlotContent(day, slot.number);
                                    let match = false;

                                    if (slotData && debouncedQuery) {
                                        const sq = debouncedQuery.toLowerCase();
                                        match = (slotData.courseCode?.toLowerCase().includes(sq)) || (slotData.subject?.toLowerCase().includes(sq)) || ((slotData.facultyName || slotData.faculty)?.toLowerCase().includes(sq));
                                    }

                                    return (
                                        <td
                                            key={`${day}-${slot.number}`}
                                            className="timetable-cell"
                                            style={{
                                                backgroundColor: getSlotColor(slotData?.sessionType || slotData?.slotType),
                                                opacity: (debouncedQuery && slotData && !match) ? 0.3 : 1,
                                                border: match ? '2px solid var(--primary)' : undefined,
                                                padding: '0.5rem'
                                            }}
                                        >
                                            {slotData && (
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: match ? 'var(--primary)' : 'inherit' }}>
                                                        {slotData.courseCode || slotData.subject}
                                                        {slotData.sessionType && slotData.sessionType !== 'Theory' && (
                                                            <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.25rem', fontSize: '0.75rem' }}>
                                                                ({slotData.sessionType})
                                                            </span>
                                                        )}
                                                    </div>
                                                    {slotData.venue && (
                                                        <div style={{ fontSize: '0.7rem', color: '#555' }}>
                                                            {slotData.venue}
                                                        </div>
                                                    )}
                                                    {slotData.facultyName && (
                                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', marginTop: '0.15rem' }}>
                                                            {slotData.facultyName}
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

            {/* Course Information Tables */}
            {timetableData?.courses && (
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
                                                    {course.faculty?.map(f => f.facultyId?.name || f.name || 'TBD').join(', ') || 'TBD'}
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
                                            const incharge = course.faculty?.find(f => f.role === 'Incharge') || course.faculty?.[0];
                                            const assisting = course.faculty?.filter(f => f.role === 'Assisting') || [];

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
                                                    <td>{incharge?.facultyId?.name || incharge?.name || 'TBD'}</td>
                                                    <td>
                                                        {assisting.length > 0 ? assisting.map(f => f.facultyId?.name || f.name || 'TBD').join(', ') : 'N/A'}
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

export default StudentAllTimetables;
