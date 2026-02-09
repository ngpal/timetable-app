import React from 'react';

const StudentTimetable = () => {
    // Shared Read-Only View for both Student and CR
    const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return (
        <div>
            <div className="page-header">
                <h1>Class Timetable </h1>
                <button className="action-btn" style={{backgroundColor: '#276749'}}>Download Image</button>
            </div>

            <div className="student-timetable">
                <div style={{overflowX: 'auto'}}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                {timeSlots.map(slot => <th key={slot}>{slot}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td style={{fontWeight: 'bold', background: '#f0fff4'}}>{day}</td>
                                    {timeSlots.map((slot, i) => (
                                        <td key={i} style={{textAlign: 'center', fontSize: '0.9rem'}}>
                                              {/* Mock Data */}
                                              {Math.random() > 0.4 ? (
                                                  <div style={{padding: '5px', borderRadius: '4px', background: '#e6fffa', border: '1px solid #b2f5ea'}}>
                                                      <div style={{fontWeight: 'bold', color: '#234e52'}}>CS{200+i}</div>
                                                      <div style={{fontSize: '0.75rem', color: '#285e61'}}>Room {100+i}</div>
                                                  </div>
                                              ) : (
                                                  <span style={{color: '#cbd5e0'}}>-</span>
                                              )}
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

export default StudentTimetable;
