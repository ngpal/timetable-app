import React from 'react';

const StudentTimetable = () => {

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
        <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Class Timetable</h2>
                <button className="action-btn" style={{ backgroundColor: '#276749', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Download Image</button>
            </div>

            <div className="timetable-view" style={{ width: '100%' }}>
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
                                    width: '8%', // Slightly smaller width for the Day column
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
                                        backgroundColor: item.type === 'break' ? '#bee3f8' : '#e2e8f0', // Light blue for break
                                        color: '#000',
                                        border: '1px solid #cbd5e0',
                                        fontSize: '0.75rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {item.type === 'break' ? item.label : `Slot ${item.id}`}
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
                                                height: '60px', // Fixed height to ensure uniformity
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

export default StudentTimetable;