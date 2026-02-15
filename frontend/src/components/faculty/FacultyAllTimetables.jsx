import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    const timetableStructure = [
        { type: 'slot', id: 1, label: 'Slot 1', time: '08:00 - 08:50' },
        { type: 'slot', id: 2, label: 'Slot 2', time: '08:50 - 09:40' },
        { type: 'slot', id: 3, label: 'Slot 3', time: '09:40 - 10:30' },
        { type: 'slot', id: 4, label: 'Slot 4', time: '10:45 - 11:35' },
        { type: 'slot', id: 5, label: 'Slot 5', time: '11:35 - 12:25' },
        { type: 'slot', id: 6, label: 'Slot 6', time: '12:25 - 13:15' },
        { type: 'lunch', id: 'lb', label: 'Lunch Break', time: '13:15 - 14:05' },
        { type: 'slot', id: 7, label: 'Slot 7', time: '14:05 - 14:55' },
        { type: 'slot', id: 8, label: 'Slot 8', time: '14:55 - 15:45' },
        { type: 'slot', id: 9, label: 'Slot 9', time: '15:45 - 16:35' },
        { type: 'slot', id: 10, label: 'Slot 10', time: '16:35 - 17:25' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const generateRandomTimetable = (department) => {
        const deptSubjects = {
            'CSE': ['CS201', 'CS202', 'CS203', 'CS204', 'MA201', 'HS201'],
            'ECE': ['EC201', 'EC202', 'EC203', 'EC204', 'MA201', 'HS201'],
            'MECH': ['ME201', 'ME202', 'ME203', 'ME204', 'MA201', 'HS201'],
            'CIVIL': ['CE201', 'CE202', 'CE203', 'CE204', 'MA201', 'HS201'],
            'AIDS': ['AI201', 'AI202', 'AI203', 'AI204', 'MA201', 'HS201']
        };

        const subjects = deptSubjects[department] || deptSubjects['CSE'];
        const rooms = ['101', '102', '103', '104', '105', '201', '202', '203'];
        const slots = [];

        days.forEach(day => {
            timetableStructure.forEach(item => {
                if (item.type === 'slot') {
                    // 70% chance of having a class
                    if (Math.random() > 0.3) {
                        slots.push({
                            day: day,
                            slotNumber: item.id,
                            courseCode: subjects[Math.floor(Math.random() * subjects.length)],
                            roomNumber: `Room ${rooms[Math.floor(Math.random() * rooms.length)]}`,
                            faculty: 'Staff Name'
                        });
                    }
                }
            });
        });
        return { timetableSlots: slots };
    };

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await axios.get('/api/timetable/find', {
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
                    // Generate random data if response is empty
                    setTimetableData(generateRandomTimetable(selectedDepartment));
                }
            } catch (error) {
                console.error("Error fetching timetable", error);
                // Generate random data on error
                setTimetableData(generateRandomTimetable(selectedDepartment));
            }
        };
        fetchTimetable();
    }, [selectedDepartment, selectedSemester, selectedSection, selectedAcademicYear]);

    const getSlotContent = (day, slotId) => {
        if (!timetableData || !timetableData.timetableSlots) return null;
        return timetableData.timetableSlots.find(slot => slot.day === day && slot.slotNumber === slotId);
    };

    return (
        <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#2d3748' }}>All Class Timetables</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

            <div className="timetable-view" style={{ width: '100%', overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '1rem', color: '#4a5568' }}>Timetable for {selectedDepartment} - Sem {selectedSemester} - Section {selectedSection} ({selectedAcademicYear})</h3>
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        tableLayout: 'fixed',
                        fontSize: '0.75rem',
                        backgroundColor: '#fff',
                        border: '2px solid #2d3748'
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                rowSpan="2"
                                style={{
                                    backgroundColor: '#558b2f',
                                    color: '#fff',
                                    border: '1px solid #1b5e20',
                                    padding: '0.5rem',
                                    width: '100px',
                                    verticalAlign: 'middle'
                                }}
                            >
                                Time/Day
                            </th>

                            {timetableStructure.map((item) => {
                                const isLunch = item.type === 'lunch';
                                if (item.type === 'break') return <th key={item.id} rowSpan="2" style={{ width: '20px', backgroundColor: '#fff', border: '1px solid #cbd5e0', padding: 0 }}></th>;

                                return (
                                    <th
                                        key={item.id}
                                        style={{
                                            textAlign: 'center',
                                            padding: '0.5rem',
                                            backgroundColor: isLunch ? '#558b2f' : '#558b2f',
                                            color: '#fff',
                                            border: '1px solid #1b5e20',
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            width: isLunch ? 'auto' : 'auto'
                                        }}
                                    >
                                        {item.label}
                                    </th>
                                );
                            })}
                        </tr>

                        <tr>
                            {timetableStructure.map((item) => {
                                if (item.type === 'break') return null;
                                return (
                                    <th
                                        key={`time-${item.id}`}
                                        style={{
                                            textAlign: 'center',
                                            padding: '0.25rem',
                                            fontSize: '0.7rem',
                                            backgroundColor: '#558b2f',
                                            color: '#fff',
                                            border: '1px solid #1b5e20',
                                            fontWeight: 'normal'
                                        }}
                                    >
                                        {item.time}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {days.map((day, index) => (
                            <tr key={day}>
                                <td
                                    style={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#fff9c4',
                                        border: '1px solid #fbc02d',
                                        padding: '0.5rem',
                                        textAlign: 'center',
                                        color: '#000'
                                    }}
                                >
                                    {day}
                                </td>

                                {timetableStructure.map((item) => {
                                    if (item.type === 'break') {
                                        return <td key={item.id} style={{ backgroundColor: '#fff', border: '1px solid #bdbdbd' }}></td>;
                                    }

                                    if (item.type === 'lunch') {
                                        if (index === 0) {
                                            return (
                                                <td
                                                    key={item.id}
                                                    rowSpan={days.length}
                                                    style={{
                                                        backgroundColor: '#00acc1',
                                                        border: '1px solid #00838f',
                                                        textAlign: 'center',
                                                        verticalAlign: 'middle',
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        writingMode: 'vertical-lr',
                                                        transform: 'rotate(180deg)'
                                                    }}
                                                >
                                                    {item.label}
                                                </td>
                                            );
                                        } else {
                                            return null;
                                        }
                                    }
                                    const slotData = getSlotContent(day, item.id);

                                    return (
                                        <td
                                            key={item.id}
                                            style={{
                                                textAlign: 'center',
                                                border: '1px solid #cbd5e0',
                                                backgroundColor: '#fff',
                                                padding: '0.25rem',
                                                height: '60px',
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            {slotData ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#2d3748' }}>
                                                        {slotData.courseCode || slotData.subject || 'N/A'}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#718096' }}>
                                                        {slotData.venue || slotData.room || slotData.roomNumber || 'Room N/A'}
                                                    </div>
                                                    {slotData.facultyName && (
                                                        <div style={{ fontSize: '0.65rem', color: '#4a5568', marginTop: '2px' }}>
                                                            {/* Abbreviate or show first name to save space */}
                                                            {slotData.facultyName.split(' ')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e0' }}>-</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default FacultyAllTimetables;
