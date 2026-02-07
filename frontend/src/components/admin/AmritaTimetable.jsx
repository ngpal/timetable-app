import React, { useState, useEffect } from 'react';
import { timetableService } from '../../services/timetableService';
import './AmritaTimetable.css';

const AmritaTimetable = () => {
  const [config, setConfig] = useState({
    academicYear: '2025-2026',
    semester: 'Odd',
    department: 'CSE',
    section: 'D'
  });
  
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Amrita slot structure
  const slots = [
    { number: 1, start: '08:00', end: '08:50' },
    { number: 2, start: '08:50', end: '09:40' },
    { number: 3, start: '09:40', end: '10:30' },
    { number: 4, start: '10:45', end: '11:35' },
    { number: 5, start: '11:35', end: '12:25' },
    { number: 6, start: '12:25', end: '13:15' },
    { number: 7, start: '14:05', end: '14:55' },
    { number: 8, start: '14:55', end: '15:45' },
    { number: 9, start: '15:45', end: '16:35' },
    { number: 10, start: '16:35', end: '17:25' },
    { number: 11, start: '17:25', end: '18:15' },
    { number: 12, start: '18:15', end: '19:05' }
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    loadTimetable();
  }, [config]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await timetableService.getTimetable(
        config.academicYear,
        config.semester,
        config.department,
        config.section
      );
      setTimetableData(data);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = async () => {
    if (!window.confirm('Generate sample timetable data? This will create a new timetable for CSE Dept, Section D.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/timetable/sample/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate sample data');
      }
      
      const result = await response.json();
      alert('Sample data generated successfully! Reloading...');
      
      // Update config to match sample data
      setConfig({
        academicYear: '2025-2026',
        semester: 'Odd',
        department: 'CSE',
        section: 'D'
      });
      
      // Reload timetable
      await loadTimetable();
    } catch (error) {
      console.error('Error generating sample data:', error);
      alert('Failed to generate sample data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSlotData = (day, slotNumber) => {
    if (!timetableData?.timetableSlots) return null;
    return timetableData.timetableSlots.find(
      slot => slot.day === day && slot.slotNumber === slotNumber
    );
  };

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

  const renderSlotContent = (slot) => {
    if (!slot) return null;

    if (slot.slotType === 'Occupied') {
      return (
        <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
          (occupied by {slot.occupiedBy})
        </div>
      );
    }

    return (
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
          {slot.courseCode}
        </div>
        {slot.venue && (
          <div style={{ fontSize: '0.7rem', color: '#555' }}>
            {slot.venue}
          </div>
        )}
        {slot.notes && (
          <div style={{ fontSize: '0.7rem', color: '#777', fontStyle: 'italic', marginTop: '2px' }}>
            {slot.notes}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="amrita-timetable-container">
      {/* Control Panel */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{marginRight: '0.5rem', fontWeight: 'bold'}}>Academic Year:</label>
          <input 
            type="text" 
            value={config.academicYear}
            onChange={(e) => setConfig({...config, academicYear: e.target.value})}
            style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>
        <div>
          <label style={{marginRight: '0.5rem', fontWeight: 'bold'}}>Semester:</label>
          <select 
            value={config.semester}
            onChange={(e) => setConfig({...config, semester: e.target.value})}
            style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}}
          >
            <option value="Odd">Odd</option>
            <option value="Even">Even</option>
          </select>
        </div>
        <div>
          <label style={{marginRight: '0.5rem', fontWeight: 'bold'}}>Department:</label>
          <input 
            type="text" 
            value={config.department}
            onChange={(e) => setConfig({...config, department: e.target.value})}
            style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>
        <div>
          <label style={{marginRight: '0.5rem', fontWeight: 'bold'}}>Section:</label>
          <input 
            type="text" 
            value={config.section}
            onChange={(e) => setConfig({...config, section: e.target.value})}
            style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '60px'}}
          />
        </div>
        <button
          onClick={loadTimetable}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b9e4d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Load Timetable
        </button>
        <button
          onClick={generateSampleData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Generate Sample Data
        </button>
      </div>

      {/* Header */}
      <div className="timetable-header">
        <h2>TIME TABLE</h2>
      </div>

      {/* Configuration */}
      <div className="timetable-config">
        <div className="config-row">
          <div className="config-item">
            <label>Dept-CSE</label>
            <span>Semester: {config.semester === 'Odd' ? 'VI' : 'V'}</span>
          </div>
          <div className="config-item">
            <label>Class: B.Tech CSE</label>
            <span>Section: {config.section}</span>
          </div>
          <div className="config-item">
            <label>AB III</label>
          </div>
        </div>
        {timetableData?.classAdvisors && (
          <div className="config-row">
            <div className="config-item">
              <label>Class Advisors:</label>
              <span>{timetableData.classAdvisors.map(a => a.name).join(', ')}</span>
            </div>
            {timetableData.mailId && (
              <div className="config-item">
                <label>Mail ID:</label>
                <span>{timetableData.mailId}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timetable Grid */}
      <div className="timetable-grid-wrapper">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th rowSpan="2">Time/Day</th>
              {slots.map(slot => (
                <th key={slot.number}>
                  Slot {slot.number}
                </th>
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
                  const slotData = getSlotData(day, slot.number);
                  
                  // Check if this is a lunch break slot
                  if (slot.number === 7 && day === 'Monday') {
                    return null; // Will be handled by rowSpan
                  }
                  
                  // Lunch break between slot 6 and 7
                  if (slot.number === 6) {
                    return (
                      <React.Fragment key={`${day}-${slot.number}`}>
                        <td 
                          className="timetable-cell"
                          style={{ backgroundColor: getSlotColor(slotData?.slotType) }}
                        >
                          {renderSlotContent(slotData)}
                        </td>
                        {day === 'Monday' && (
                          <td 
                            rowSpan={days.length} 
                            className="lunch-break-cell"
                          >
                            Lunch Break
                          </td>
                        )}
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <td 
                      key={`${day}-${slot.number}`}
                      className="timetable-cell"
                      style={{ backgroundColor: getSlotColor(slotData?.slotType) }}
                    >
                      {renderSlotContent(slotData)}
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
          {/* Theory Courses */}
          <div className="course-table-section">
            <h3>Theory</h3>
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
                  .filter(c => c.courseType === 'Theory')
                  .map((course, idx) => (
                    <tr key={idx}>
                      <td>{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>
                        {course.faculty.map(f => f.facultyId?.userId || 'TBD').join(', ')}
                      </td>
                      <td>{course.venue}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Professional Electives */}
          {timetableData.courses.some(c => c.courseType === 'Elective') && (
            <div className="course-table-section">
              <h3>Professional Elective (PE III)</h3>
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
                    .filter(c => c.courseType === 'Elective')
                    .map((course, idx) => (
                      <tr key={idx}>
                        <td>{course.courseCode}</td>
                        <td>{course.courseName}</td>
                        <td>
                          {course.faculty.map(f => f.facultyId?.userId || 'TBD').join(', ')}
                        </td>
                        <td>{course.venue}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

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
                      const incharge = course.faculty.find(f => f.role === 'Incharge');
                      const assisting = course.faculty.filter(f => f.role === 'Assisting');
                      
                      return (
                        <tr key={idx}>
                          <td>{course.courseCode}</td>
                          <td>{course.courseName}</td>
                          <td>{incharge?.facultyId?.userId || 'TBD'}</td>
                          <td>
                            {assisting.map(f => f.facultyId?.userId || 'TBD').join(', ')}
                          </td>
                          <td>{course.venue}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {loading && <div className="loading-overlay">Loading timetable...</div>}
    </div>
  );
};

export default AmritaTimetable;
