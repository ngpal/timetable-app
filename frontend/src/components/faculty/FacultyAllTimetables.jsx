import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../admin/AmritaTimetable.css';

const FacultyAllTimetables = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('CSE');
    const [selectedSemester, setSelectedSemester] = useState('3');
    const [selectedSection, setSelectedSection] = useState('A');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
    const [timetableData, setTimetableData] = useState(null);

    const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'AIDS'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const sections = ['A', 'B', 'C'];
    const academicYears = ['2024-2025', '2023-2024'];

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
                if (item.number !== 5) {
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
            try {
                const response = await axios.get('/api/course-assignments/find', {
                    params: {
                        department: selectedDepartment,
                        semester: selectedSemester,
                        section: selectedSection,
                        academicYear: selectedAcademicYear
                    },
                    withCredentials: true
                });

                if (response.data && response.data.timetableSlots && response.data.timetableSlots.length > 0) {
                    setTimetableData(response.data);
                } else {
                    setTimetableData(generateRandomTimetable(selectedDepartment));
                }
            } catch (error) {
                console.error("Error fetching timetable", error);
                setTimetableData(generateRandomTimetable(selectedDepartment));
            }
        };
        fetchTimetable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartment, selectedSemester, selectedSection, selectedAcademicYear]);

    const getSlotContent = (day, slotId) => {
        if (!timetableData || !timetableData.timetableSlots) return null;
        return timetableData.timetableSlots.find(slot => slot.day === day && slot.slotNumber === slotId && !slot.isSpanContinuation);
    };

    return (
        <div className="dashboard-fade-in amrita-timetable-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>All Class Timetables</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View and filter all department schedules</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="academicYearSelect" style={{ fontWeight: '600' }}>Year:</label>
                        <select
                            id="academicYearSelect"
                            value={selectedAcademicYear}
                            onChange={(e) => setSelectedAcademicYear(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                        >
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="deptSelect" style={{ fontWeight: '600' }}>Dept:</label>
                        <select
                            id="deptSelect"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="semSelect" style={{ fontWeight: '600' }}>Sem:</label>
                        <select
                            id="semSelect"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                        >
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="sectionSelect" style={{ fontWeight: '600' }}>Sec:</label>
                        <select
                            id="sectionSelect"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                        >
                            {sections.map(section => (
                                <option key={section} value={section}>{section}</option>
                            ))}
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

            <div className="timetable-grid-wrapper" style={{ width: '100%', position: 'relative' }}>
                <table className="timetable-grid">
                    <thead>
                        <tr>
                            <th rowSpan="2">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    Time/Day
                                </div>
                            </th>
                            {slots.map((item) => (
                                <th key={item.number}>Slot {item.number}</th>
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
                        {days.map((day, dayIdx) => (
                            <tr key={day}>
                                <td className="day-cell">{day}</td>

                                {slots.map((item) => {
                                    if (item.number === 5) {
                                        if (dayIdx === 0) return <td key={item.number} rowSpan={days.length} className="lunch-break-cell">Lunch Break</td>;
                                        return null;
                                    }

                                    const slotData = getSlotContent(day, item.number);

                                    return (
                                        <td key={item.number} className="timetable-cell" style={{ backgroundColor: getSlotColor(slotData?.sessionType || slotData?.slotType), padding: '0.5rem' }}>
                                            {slotData ? (
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                        {slotData.courseCode || slotData.subject || 'N/A'}
                                                        {slotData.sessionType && slotData.sessionType !== 'Theory' && (
                                                            <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.25rem', fontSize: '0.75rem' }}>
                                                                ({slotData.sessionType})
                                                            </span>
                                                        )}
                                                    </div>
                                                    {slotData.venue && (
                                                        <div style={{ fontSize: '0.7rem', color: '#555' }}>
                                                            {slotData.venue || slotData.roomNumber}
                                                        </div>
                                                    )}
                                                    {slotData.facultyName && (
                                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', marginTop: '0.15rem' }}>
                                                            {slotData.facultyName.split(' ')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'transparent' }}>-</span></div>
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
                                                    {course.faculty?.map(f => f.name || 'TBD').join(', ') || 'N/A'}
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

export default FacultyAllTimetables;
