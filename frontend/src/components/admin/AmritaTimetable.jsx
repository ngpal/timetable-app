import React, { useState, useEffect } from 'react';
import { getCourseAssignment } from '../../services/courseAssignmentService';
import './AmritaTimetable.css';

const AmritaTimetable = () => {
  const [config, setConfig] = useState({
    academicYear: '2025-2026',
    semester: 'Odd',
    department: 'CSE',
    section: 'A'
  });
  
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Slot structure - matches TimetableEditor
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

  useEffect(() => {
    loadTimetable();
  }, [config]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await getCourseAssignment({
        academicYear: config.academicYear,
        semester: config.semester,
        department: config.department,
        section: config.section
      });
      setTimetableData(data);
    } catch (error) {
      console.error('Error loading timetable:', error);
      setTimetableData(null);
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

    if (slot.isSpanContinuation) {
      return (
        <div style={{ fontSize: '0.7rem', color: '#718096', fontStyle: 'italic', textAlign: 'center' }}>
          ↑ Continued
        </div>
      );
    }

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
          {slot.sessionType && slot.sessionType !== 'Theory' && (
            <span style={{ color: '#805ad5', fontWeight: '600', marginLeft: '0.25rem', fontSize: '0.75rem' }}>
              ({slot.sessionType})
            </span>
          )}
        </div>
        {slot.venue && (
          <div style={{ fontSize: '0.7rem', color: '#555' }}>
            {slot.venue}
          </div>
        )}
        {slot.spanSlots > 1 && (
          <div style={{ fontSize: '0.65rem', color: '#e53e3e', fontWeight: '600', marginTop: '2px' }}>
            {slot.spanSlots} slots
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
              <span>
                {timetableData.classAdvisors.map(a => a.facultyId?.name || a.name || 'TBD').join(', ')}
              </span>
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
                  
                  // Check if this is lunch break (slot 5)
                  if (slot.number === 5) {
                    // Lunch break handling
                    if (day === 'Monday') {
                      return (
                        <React.Fragment key={`${day}-${slot.number}`}>
                          <td 
                            rowSpan={days.length} 
                            className="lunch-break-cell"
                          >
                            Lunch Break
                          </td>
                        </React.Fragment>
                      );
                    }
                    return null; // Skip for other days (handled by rowSpan)
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
                    // Find venue from timetable slots for this course (Theory sessions)
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
                          {course.faculty.map(f => f.facultyId?.name || 'TBD').join(', ')}
                        </td>
                        <td>{venue}</td>
                      </tr>
                    );
                  })}
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
                          {course.faculty.map(f => f.facultyId?.name || 'TBD').join(', ')}
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
                      
                      // Find venue from timetable slots for this course (Lab sessions)
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
                          <td>{incharge?.facultyId?.name || 'TBD'}</td>
                          <td>
                            {assisting.map(f => f.facultyId?.name || 'TBD').join(', ') || 'N/A'}
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

      {loading && <div className="loading-overlay">Loading timetable...</div>}
      
      {!loading && !timetableData && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginTop: '2rem'
        }}>
          <h3 style={{ color: '#856404' }}>No Timetable Found</h3>
          <p style={{ color: '#856404' }}>No course assignment exists for this section.</p>
          <p style={{ color: '#856404' }}>Please create a course assignment in the <strong>Course Assignments</strong> page first, then use the <strong>Timetable Editor</strong> to fill in the time slots.</p>
        </div>
      )}
    </div>
  );
};

export default AmritaTimetable;
