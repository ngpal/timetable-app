import React, { useState, useEffect } from 'react';
import { constraintService } from '../../services/constraintService';

const AdminTimetable = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [showConstraints, setShowConstraints] = useState(true);
  const [constraints, setConstraints] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Configuration state
  const [config, setConfig] = useState({
    academicYear: '2025-2026',
    semester: 'Odd',
    department: 'Computer Science'
  });

  const timeSlots = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
    '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', 
    '03:00 - 04:00', '04:00 - 05:00'
  ];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Load constraints on component mount or config change
  useEffect(() => {
    loadConstraints();
  }, [config.academicYear, config.semester, config.department]);

  const loadConstraints = async () => {
    try {
      setLoading(true);
      const activeConstraint = await constraintService.getActiveConstraint(
        config.academicYear,
        config.semester,
        config.department
      );
      
      if (activeConstraint) {
        setConstraints(activeConstraint);
      } else {
        // Load default constraints if no active constraint exists
        const defaultConstraint = await constraintService.getDefaultConstraint();
        setConstraints({
          ...defaultConstraint,
          academicYear: config.academicYear,
          semester: config.semester,
          department: config.department
        });
      }
    } catch (error) {
      console.error('Error loading constraints:', error);
      alert('Failed to load constraints. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleConstraintChange = (section, field, value) => {
    setConstraints(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSoftConstraintChange = (field, subfield, value) => {
    setConstraints(prev => ({
      ...prev,
      softConstraints: {
        ...prev.softConstraints,
        [field]: {
          ...prev.softConstraints[field],
          [subfield]: value
        }
      }
    }));
  };

  const handleSaveConstraints = async () => {
    try {
      setLoading(true);
      if (constraints._id) {
        await constraintService.updateConstraint(constraints._id, constraints);
        alert('Constraints updated successfully!');
      } else {
        await constraintService.createConstraint(constraints);
        alert('Constraints saved successfully!');
        await loadConstraints(); // Reload to get the ID
      }
    } catch (error) {
      console.error('Error saving constraints:', error);
      alert('Failed to save constraints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetConstraints = async () => {
    if (!window.confirm('Are you sure you want to reset constraints to default values? Any unsaved changes will be lost.')) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching default constraints...');
      const defaultConstraint = await constraintService.getDefaultConstraint();
      console.log('Default constraints received:', defaultConstraint);
      
      setConstraints({
        ...defaultConstraint,
        academicYear: config.academicYear,
        semester: config.semester,
        department: config.department
      });
      alert('Constraints reset to default values!');
    } catch (error) {
      console.error('Error resetting constraints:', error);
      alert(`Failed to reset constraints: ${error.message || 'Unknown error'}. Please check the console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!constraints) {
      alert('Please configure constraints first!');
      return;
    }
    
    // Save constraints and navigate to timetable view
    handleSaveConstraints();
    
    // Navigate to Amrita timetable view
    setTimeout(() => {
      window.location.href = '/admin/amrita-timetable';
    }, 500);
  };

  if (loading || !constraints) {
    return (
      <div style={{textAlign: 'center', padding: '4rem'}}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{flexWrap: 'wrap', gap: '1rem'}}>
        <h1 style={{margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)'}}>Constraints & Configuration Settings</h1>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <button 
            className="action-btn" 
            style={{backgroundColor: '#805ad5', fontSize: 'clamp(0.8rem, 2vw, 1rem)', padding: '0.6rem 1rem'}}
            onClick={() => setShowConstraints(!showConstraints)}
          >
            {showConstraints ? 'Hide Constraints' : 'Show Constraints'}
          </button>
          <button 
            className="action-btn" 
            style={{backgroundColor: '#e53e3e', fontSize: 'clamp(0.8rem, 2vw, 1rem)', padding: '0.6rem 1rem'}}
            onClick={handleResetConstraints}
            disabled={loading || !constraints}
          >
            Reset to Default
          </button>
          <button 
            className="action-btn" 
            style={{backgroundColor: '#48bb78', fontSize: 'clamp(0.8rem, 2vw, 1rem)', padding: '0.6rem 1rem', fontWeight: 'bold'}}
            onClick={handleGenerate}
          >
            View Timetable →
          </button>
        </div>
      </div>

      {/* Description */}
      <div style={{
        backgroundColor: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{margin: 0, fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: '#0050b3'}}>
          <strong>📋 Configure Timetable Constraints:</strong> Set up hard and soft constraints for automatic timetable generation. 
          Hard constraints must be satisfied, while soft constraints are preferences with configurable weights. 
          Click <strong>"View Timetable →"</strong> to see the generated timetable based on these settings.
        </p>
      </div>

      {/* Basic Configuration */}
      <div className="form-card" style={{maxWidth: '100%', marginBottom: '2rem'}}>
        <h3 style={{fontSize: 'clamp(1.1rem, 3vw, 1.3rem)'}}>Basic Configuration</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
          <div>
            <h4 style={{fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', marginBottom: '0.5rem'}}>Academic Year</h4>
            <select 
              style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
              value={config.academicYear}
              onChange={(e) => setConfig({...config, academicYear: e.target.value})}
            >
              <option>2025-2026</option>
              <option>2024-2025</option>
              <option>2026-2027</option>
            </select>
          </div>
          <div>
            <h4 style={{fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', marginBottom: '0.5rem'}}>Semester</h4>
            <select 
              style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
              value={config.semester}
              onChange={(e) => setConfig({...config, semester: e.target.value})}
            >
              <option>Odd</option>
              <option>Even</option>
            </select>
          </div>
          <div>
            <h4 style={{fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', marginBottom: '0.5rem'}}>Department</h4>
            <select 
              style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
              value={config.department}
              onChange={(e) => setConfig({...config, department: e.target.value})}
            >
              <option>Computer Science</option>
              <option>Electronics</option>
              <option>Mechanical</option>
              <option>All Departments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Constraint Configuration Panel */}
      {showConstraints && (
        <div className="form-card" style={{maxWidth: '100%', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
            <h3 style={{fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', margin: 0}}>Constraint Configuration</h3>
            <button 
              className="action-btn" 
              onClick={handleSaveConstraints}
              style={{fontSize: 'clamp(0.85rem, 2vw, 1rem)', padding: '0.6rem 1.2rem'}}
            >
              Save Constraints
            </button>
          </div>

          {/* Hard Constraints */}
          <div style={{marginBottom: '2rem', padding: 'clamp(0.8rem, 2vw, 1rem)', backgroundColor: '#fff5f5', borderRadius: '8px', border: '2px solid #fc8181'}}>
            <h4 style={{color: '#c53030', marginBottom: '1rem', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)'}}>🔴 Hard Constraints (Must Satisfy)</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem'}}>
              
              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Daily Start Time
                </label>
                <input 
                  type="time" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.dailyStartTime}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'dailyStartTime', e.target.value)}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Daily End Time
                </label>
                <input 
                  type="time" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.dailyEndTime}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'dailyEndTime', e.target.value)}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Slot Duration (minutes)
                </label>
                <input 
                  type="number" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.slotDuration}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'slotDuration', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Max Consecutive Hours/Faculty
                </label>
                <input 
                  type="number" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.maxConsecutiveHoursPerFaculty}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'maxConsecutiveHoursPerFaculty', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Max Hours/Day/Faculty
                </label>
                <input 
                  type="number" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.maxHoursPerDayPerFaculty}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'maxHoursPerDayPerFaculty', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Max Hours/Week/Faculty
                </label>
                <input 
                  type="number" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.maxHoursPerWeekPerFaculty}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'maxHoursPerWeekPerFaculty', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Min Gap Between Same Course (days)
                </label>
                <input 
                  type="number" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.minGapBetweenSameCourse}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'minGapBetweenSameCourse', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  Max Consecutive Slots/Course
                </label>
                <input 
                  type="number" 
                  style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                  value={constraints.hardConstraints.maxConsecutiveSlotsPerCourse}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'maxConsecutiveSlotsPerCourse', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Lunch Break */}
            <div style={{marginTop: '1rem', padding: 'clamp(0.6rem, 1.5vw, 0.8rem)', backgroundColor: 'white', borderRadius: '6px'}}>
              <h5 style={{marginBottom: '0.5rem', fontSize: 'clamp(0.9rem, 2.2vw, 1rem)'}}>Lunch Break</h5>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                    Start Time
                  </label>
                  <input 
                    type="time" 
                    style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                    value={constraints.hardConstraints.lunchBreak.startTime}
                    onChange={(e) => setConstraints(prev => ({
                      ...prev,
                      hardConstraints: {
                        ...prev.hardConstraints,
                        lunchBreak: {
                          ...prev.hardConstraints.lunchBreak,
                          startTime: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
                <div>
                  <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.3rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                    End Time
                  </label>
                  <input 
                    type="time" 
                    style={{width: '100%', padding: '0.6rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                    value={constraints.hardConstraints.lunchBreak.endTime}
                    onChange={(e) => setConstraints(prev => ({
                      ...prev,
                      hardConstraints: {
                        ...prev.hardConstraints,
                        lunchBreak: {
                          ...prev.hardConstraints.lunchBreak,
                          endTime: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Boolean Constraints */}
            <div style={{marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                <input 
                  type="checkbox" 
                  checked={constraints.hardConstraints.noRoomOverlap}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'noRoomOverlap', e.target.checked)}
                />
                <span>No Room Overlap</span>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                <input 
                  type="checkbox" 
                  checked={constraints.hardConstraints.labCoursesRequireLab}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'labCoursesRequireLab', e.target.checked)}
                />
                <span>Lab Courses Require Lab Rooms</span>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                <input 
                  type="checkbox" 
                  checked={constraints.hardConstraints.noStudentConflict}
                  onChange={(e) => handleConstraintChange('hardConstraints', 'noStudentConflict', e.target.checked)}
                />
                <span>No Student Conflicts</span>
              </label>
            </div>
          </div>

          {/* Soft Constraints */}
          <div style={{padding: 'clamp(0.8rem, 2vw, 1rem)', backgroundColor: '#fffaf0', borderRadius: '8px', border: '2px solid #f6ad55'}}>
            <h4 style={{color: '#c05621', marginBottom: '1rem', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)'}}>🟡 Soft Constraints (Preferences)</h4>
            <p style={{fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#666', marginBottom: '1rem'}}>
              These are preferences that the algorithm will try to satisfy. Higher weight = higher priority.
            </p>

            <div style={{display: 'grid', gap: '1rem'}}>
              {/* Minimize Gaps */}
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: 'clamp(0.6rem, 1.5vw, 0.8rem)', backgroundColor: 'white', borderRadius: '6px', flexWrap: 'wrap'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  <input 
                    type="checkbox" 
                    checked={constraints.softConstraints.minimizeGapsInSchedule.enabled}
                    onChange={(e) => handleSoftConstraintChange('minimizeGapsInSchedule', 'enabled', e.target.checked)}
                  />
                  <span style={{fontWeight: 'bold'}}>Minimize Gaps in Schedule</span>
                </label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'}}>
                  <label>Weight:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    style={{width: '60px', padding: '0.4rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)'}}
                    value={constraints.softConstraints.minimizeGapsInSchedule.weight}
                    onChange={(e) => handleSoftConstraintChange('minimizeGapsInSchedule', 'weight', parseInt(e.target.value))}
                    disabled={!constraints.softConstraints.minimizeGapsInSchedule.enabled}
                  />
                </div>
              </div>

              {/* Balanced Workload */}
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'white', borderRadius: '6px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1}}>
                  <input 
                    type="checkbox" 
                    checked={constraints.softConstraints.balancedDailyWorkload.enabled}
                    onChange={(e) => handleSoftConstraintChange('balancedDailyWorkload', 'enabled', e.target.checked)}
                  />
                  <span style={{fontWeight: 'bold'}}>Balanced Daily Workload</span>
                </label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <label>Weight:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    style={{width: '60px', padding: '0.3rem'}}
                    value={constraints.softConstraints.balancedDailyWorkload.weight}
                    onChange={(e) => handleSoftConstraintChange('balancedDailyWorkload', 'weight', parseInt(e.target.value))}
                    disabled={!constraints.softConstraints.balancedDailyWorkload.enabled}
                  />
                </div>
              </div>

              {/* Maximize Room Utilization */}
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'white', borderRadius: '6px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1}}>
                  <input 
                    type="checkbox" 
                    checked={constraints.softConstraints.maximizeRoomUtilization.enabled}
                    onChange={(e) => handleSoftConstraintChange('maximizeRoomUtilization', 'enabled', e.target.checked)}
                  />
                  <span style={{fontWeight: 'bold'}}>Maximize Room Utilization</span>
                </label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <label>Weight:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    style={{width: '60px', padding: '0.3rem'}}
                    value={constraints.softConstraints.maximizeRoomUtilization.weight}
                    onChange={(e) => handleSoftConstraintChange('maximizeRoomUtilization', 'weight', parseInt(e.target.value))}
                    disabled={!constraints.softConstraints.maximizeRoomUtilization.enabled}
                  />
                </div>
              </div>

              {/* Avoid First/Last Slots */}
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'white', borderRadius: '6px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1}}>
                  <input 
                    type="checkbox" 
                    checked={constraints.softConstraints.avoidFirstLastSlots.enabled}
                    onChange={(e) => handleSoftConstraintChange('avoidFirstLastSlots', 'enabled', e.target.checked)}
                  />
                  <span style={{fontWeight: 'bold'}}>Avoid First/Last Slots</span>
                </label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <label>Weight:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    style={{width: '60px', padding: '0.3rem'}}
                    value={constraints.softConstraints.avoidFirstLastSlots.weight}
                    onChange={(e) => handleSoftConstraintChange('avoidFirstLastSlots', 'weight', parseInt(e.target.value))}
                    disabled={!constraints.softConstraints.avoidFirstLastSlots.enabled}
                  />
                </div>
              </div>

              {/* Spread Courses Across Week */}
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'white', borderRadius: '6px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1}}>
                  <input 
                    type="checkbox" 
                    checked={constraints.softConstraints.spreadCoursesAcrossWeek.enabled}
                    onChange={(e) => handleSoftConstraintChange('spreadCoursesAcrossWeek', 'enabled', e.target.checked)}
                  />
                  <span style={{fontWeight: 'bold'}}>Spread Courses Across Week</span>
                </label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <label>Weight:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    style={{width: '60px', padding: '0.3rem'}}
                    value={constraints.softConstraints.spreadCoursesAcrossWeek.weight}
                    onChange={(e) => handleSoftConstraintChange('spreadCoursesAcrossWeek', 'weight', parseInt(e.target.value))}
                    disabled={!constraints.softConstraints.spreadCoursesAcrossWeek.enabled}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Display */}
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
