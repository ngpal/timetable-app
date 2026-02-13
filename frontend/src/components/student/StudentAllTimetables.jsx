
import React, { useState } from 'react';

const StudentAllTimetables = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('CSE');
    const [selectedYear, setSelectedYear] = useState('Year 1');
    const [selectedSection, setSelectedSection] = useState('A');

    const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'AIDS'];
    const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
    const sections = ['A', 'B', 'C'];

    const timetableStructure = [
        { type: 'slot', id: 1, time: '8am - 9am' },
        { type: 'slot', id: 2, time: '9am - 10am' },
        { type: 'slot', id: 3, time: '10am - 11am' },
        { type: 'slot', id: 4, time: '11am - 12pm' },
        { type: 'slot', id: 5, time: '12pm - 1pm' },
        { type: 'break', id: 6, label: 'Lunch', time: '1pm - 2pm' },
        { type: 'slot', id: 7, time: '2pm - 3pm' },
        { type: 'slot', id: 8, time: '3pm - 4pm' },
        { type: 'slot', id: 9, time: '4pm - 5pm' },
        { type: 'slot', id: 10, time: '5pm - 6pm' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#2d3748' }}>All Class Timetables</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <label htmlFor="yearSelect" style={{ fontWeight: '600' }}>Year:</label>
                        <select
                            id="yearSelect"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="sectionSelect" style={{ fontWeight: '600' }}>Section:</label>
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
                <h3 style={{ marginBottom: '1rem', color: '#4a5568' }}>Timetable for {selectedDepartment} - {selectedYear} - Section {selectedSection}</h3>
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        tableLayout: 'fixed',
                        fontSize: '0.75rem',
                        backgroundColor: '#fff'
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                rowSpan="2"
                                style={{
                                    backgroundColor: '#a7ebe2',
                                    color: '#000',
                                    border: '1px solid #cbd5e0',
                                    padding: '0.5rem',
                                    width: '8%',
                                    verticalAlign: 'middle'
                                }}
                            >
                                Time/Day
                            </th>

                            {timetableStructure.map((item) => (
                                <th
                                    key={item.id}
                                    style={{
                                        textAlign: 'center',
                                        padding: '0.25rem',
                                        backgroundColor: item.type === 'break' ? '#bee3f8' : '#e2e8f0',
                                        color: '#000',
                                        border: '1px solid #cbd5e0',
                                        fontSize: '0.75rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {item.type === 'break' ? item.label : `Slot ${item.id} `}
                                </th>
                            ))}
                        </tr>

                        <tr>
                            {timetableStructure.map((item) => (
                                <th
                                    key={item.id}
                                    style={{
                                        textAlign: 'center',
                                        padding: '0.25rem',
                                        fontSize: '0.7rem',
                                        backgroundColor: item.type === 'break' ? '#bee3f8' : '#e2e8f0',
                                        color: '#4a5568',
                                        border: '1px solid #cbd5e0',
                                        fontWeight: 'normal'
                                    }}
                                >
                                    {item.time}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {days.map((day) => (
                            <tr key={day}>
                                <td
                                    style={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#a7ebe2',
                                        border: '1px solid #cbd5e0',
                                        padding: '0.5rem',
                                        textAlign: 'center',
                                        color: '#2d3748'
                                    }}
                                >
                                    {day}
                                </td>

                                {timetableStructure.map((item) => {
                                    if (item.type === 'break') {
                                        return (
                                            <td
                                                key={item.id}
                                                style={{
                                                    backgroundColor: '#ebf8ff',
                                                    border: '1px solid #cbd5e0',
                                                    textAlign: 'center',
                                                    verticalAlign: 'middle',
                                                    color: '#2b6cb0',
                                                    fontWeight: 'bold',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                —
                                            </td>
                                        );
                                    }

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
                                            {Math.random() > 0.6 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#2d3748' }}>
                                                        CS{200 + Math.floor(Math.random() * 5)}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#718096' }}>
                                                        Room {101 + Math.floor(Math.random() * 5)}
                                                    </div>
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
        </div>
    );
};

export default StudentAllTimetables;
