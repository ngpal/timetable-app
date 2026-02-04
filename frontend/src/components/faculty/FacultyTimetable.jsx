import React from 'react';

const FacultyTimetable = () => {
    // Mock Data mimicking the view-only access
    const timeSlots = ['9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div>
            <div className="page-header">
                <h1>My Timetable & Workload</h1>
                <button className="action-btn">Download PDF</button>
            </div>

            <div className="timetable-view">
                <div style={{overflowX: 'auto'}}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Day / Time</th>
                                {timeSlots.map(slot => <th key={slot}>{slot}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td style={{fontWeight: 'bold'}}>{day}</td>
                                    {timeSlots.map((slot, i) => (
                                        <td key={i} style={{textAlign: 'center', backgroundColor: Math.random() > 0.8 ? '#ebf8ff' : 'transparent'}}>
                                            {Math.random() > 0.8 ? (
                                                <div>
                                                    <strong>CS10{Math.floor(Math.random()*3)+1}</strong><br/>
                                                    <small>R-101</small>
                                                </div>
                                            ) : '-'}
                                        </td>
                                    ))}
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
