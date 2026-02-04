import React, { useState } from 'react';

const AdminTimetable = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  

  const timeSlots = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
    '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', 
    '03:00 - 04:00', '04:00 - 05:00'
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleGenerate = () => {
    // Call AI / heuristic algorithm here
    alert("Generating conflict-free timetable...");
    setTimeout(() => {
      setIsGenerated(true);
      alert("Timetable generated successfully!");
    }, 1000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Timetable Management</h1>
        <div style={{display: 'flex', gap: '10px'}}>
             <button className="action-btn" style={{backgroundColor: '#e53e3e'}}>Reset</button>
             <button className="action-btn" onClick={handleGenerate}>
              {isGenerated ? 'Regenerate Timetable' : 'Generate Timetable'}
            </button>
        </div>
      </div>

      <div className="form-card" style={{maxWidth: '100%', marginBottom: '2rem'}}>
        <h3>Configuration & Constraints</h3>
        <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
            <div style={{flex: 1}}>
                 <h4>Academic Year</h4>
                 <select style={{width: '100%', padding: '0.5rem'}}>
                     <option>2025-2026 Odd Semester</option>
                     <option>2025-2026 Even Semester</option>
                 </select>
            </div>
             <div style={{flex: 1}}>
                 <h4>Department</h4>
                 <select style={{width: '100%', padding: '0.5rem'}}>
                     <option>Computer Science</option>
                     <option>All Departments</option>
                 </select>
            </div>
            <div style={{flex: 1}}>
                 <h4>Optimization Priority</h4>
                 <select style={{width: '100%', padding: '0.5rem'}}>
                     <option>Balanced Workload</option>
                     <option>Minimize Gaps</option>
                     <option>Room Utilization</option>
                 </select>
            </div>
        </div>
      </div>

      {isGenerated ? (
        <div className="data-table-container" style={{overflowX: 'auto'}}>
          <table className="data-table" style={{minWidth: '1000px'}}>
            <thead>
              <tr>
                <th style={{width: '100px', position: 'sticky', left: 0, backgroundColor: '#f7fafc', zIndex: 10}}>Day / Time</th>
                {timeSlots.map(slot => (
                    <th key={slot}>{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td style={{fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 10}}>{day}</td>
                  {timeSlots.map((slot, index) => (
                      <td key={index} style={{textAlign: 'center', borderLeft: '1px solid #edf2f7'}}>
                          {/* Randomly fill some slots for demo */}
                          {Math.random() > 0.6 ? (
                             <div style={{backgroundColor: '#ebf8ff', padding: '5px', borderRadius: '4px', border: '1px solid #bee3f8'}}>
                                 <div style={{fontWeight: 'bold', color: '#2c5282'}}>CS101</div>
                                 <div style={{fontSize: '0.8rem'}}>Room 101</div>
                                 <div style={{fontSize: '0.75rem', color: '#666'}}>Dr. Smith</div>
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
      ) : (
          <div style={{textAlign: 'center', padding: '4rem', color: '#718096', border: '2px dashed #cbd5e0', borderRadius: '8px'}}>
              <h2>No Timetable Generated</h2>
              <p>Configure the constraints above and click "Generate Timetable" to start.</p>
          </div>
      )}
    </div>
  );
};

export default AdminTimetable;
