import React from 'react';

const FacultyTimetable = () => {

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

    return (
        <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <div className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Timetable</h2>
                <button className="action-btn" style={{ backgroundColor: '#276749', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Download PDF</button>
            </div>

            <div className="timetable-view" style={{ width: '100%' }}>
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

export default FacultyTimetable;