import React from 'react';

const FacultyTimetable = () => {

    // ✅ Updated structure (exactly as you provided)
    const timetableStructure = [
        { type: 'slot', id: 1, time: '8am - 9am' },
        { type: 'slot', id: 2, time: '9am - 10am' },
        { type: 'slot', id: 3, time: '10am - 11am' },
        { type: 'slot', id: 4, time: '11am - 12pm' },
        { type: 'slot', id: 5, time: '12pm - 1pm' },
        { type: 'slot', id: 6, label: 'Lunch Break', time: '1pm - 2pm' },
        { type: 'slot', id: 7, time: '2pm - 3pm' },
        { type: 'slot', id: 8, time: '3pm - 4pm' },
        { type: 'slot', id: 9, time: '4pm - 5pm' },
        { type: 'slot', id: 10, time: '5pm - 6pm' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div>
            <div className="page-header">
                <h1>Timetable</h1>
                <button className="action-btn">Download PDF</button>
            </div>

            <div className="timetable-view">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th
                                    rowSpan="2"
                                    style={{
                                        backgroundColor: '#a7ebe2ff',
                                        color: '#000',
                                        border: '1px solid #000'
                                    }}
                                >
                                    Time/Day
                                </th>

                                {timetableStructure.map((item, index) => (
                                    <th
                                        key={index}
                                        style={{
                                            textAlign: 'center',
                                            padding: '0.25rem', // Reduced padding
                                            backgroundColor: '#e2e8f0',
                                            color: '#000',
                                            border: '1px solid #000',
                                            minWidth: item.label ? '40px' : '80px', // Reduced width
                                            width: item.label ? '40px' : 'auto',
                                            fontSize: '0.8rem' // Reduced font size
                                        }}
                                    >
                                        {item.label ? (
                                            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 'auto' }}>
                                                {item.label}
                                            </div>
                                        ) : (
                                            `Slot ${item.id}`
                                        )}
                                    </th>
                                ))}
                            </tr>

                            <tr>
                                {timetableStructure.map((item, index) => (
                                    <th
                                        key={index}
                                        style={{
                                            textAlign: 'center',
                                            padding: '0.25rem', // Reduced padding
                                            fontSize: '0.7rem', // Reduced font size
                                            backgroundColor: '#e2e8f0',
                                            color: '#000',
                                            border: '1px solid #000',
                                            fontWeight: 'normal'
                                        }}
                                    >
                                        {item.time}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {days.map((day, dayIndex) => (
                                <tr key={day}>
                                    <td
                                        style={{
                                            fontWeight: 'bold',
                                            backgroundColor: '#a7ebe2ff',
                                            border: '1px solid #000',
                                            padding: '0.25rem',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {day}
                                    </td>

                                    {timetableStructure.map((item, index) => {
                                        // Check if this item is a break
                                        if (item.label === 'Lunch Break' || item.label === 'Interval Break') { // Check for both breaks if we want, but user only asked for Lunch vertical? The code only has logic for "Lunch Break".
                                            // Wait, I should probably make Interval Break vertical too if it's not already?
                                            // The previous code only had logic for item.label === 'Lunch Break' spanning.
                                            // Let's stick to modifying the existing logic for now.

                                            if (item.label === 'Lunch Break') {
                                                // Only render the break cell for the first row (Monday), spanning all rows
                                                if (dayIndex === 0) {
                                                    return (
                                                        <td
                                                            key={index}
                                                            rowSpan={days.length}
                                                            className="break-cell"
                                                            style={{
                                                                border: '1px solid #000',
                                                                backgroundColor: '#ebf8ff',
                                                                verticalAlign: 'middle',
                                                                textAlign: 'center',
                                                                padding: 0,
                                                                width: '40px'
                                                            }}
                                                        >
                                                            <div className="break-label" style={{
                                                                writingMode: 'vertical-rl',
                                                                textOrientation: 'mixed',
                                                                transform: 'rotate(180deg)',
                                                                whiteSpace: 'nowrap',
                                                                fontWeight: 'bold',
                                                                color: '#2c5282',
                                                                fontSize: '0.85rem',
                                                                margin: '0 auto',
                                                                height: '100%'
                                                            }}>
                                                                {item.label}
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                return null;
                                            }
                                        }

                                        // Render regular slot cells
                                        return (
                                            <td
                                                key={index}
                                                style={{
                                                    textAlign: 'center',
                                                    border: '1px solid #000',
                                                    backgroundColor: '#fff',
                                                    padding: '0px', // Removed padding
                                                    height: '25px', // Reduced height to minimum
                                                    fontSize: '0.75rem' // Smaller font
                                                }}
                                            >
                                                {Math.random() > 0.8
                                                    ? <div><strong>CS10{Math.floor(Math.random() * 3) + 1}</strong></div>
                                                    : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyTimetable;