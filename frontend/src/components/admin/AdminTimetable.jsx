import React, { useState, useEffect } from 'react';
import { constraintService } from '../../services/constraintService';
import { generateTimetable } from '../../services/generatorService';
import { getAllCourseAssignments, updateCourseAssignment } from '../../services/courseAssignmentService';
import AmritaTimetable from './AmritaTimetable';
import { Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminTimetable = () => {
  const [showConstraints, setShowConstraints] = useState(true);
  const [constraints, setConstraints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Data state
  const [assignments, setAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [generatedResult, setGeneratedResult] = useState(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    academicYear: '2025-2026',
    semester: 'Odd',
    department: 'Computer Science',
    section: 'A' // Added section to config
  });

  // Load initial data
  useEffect(() => {
    loadConstraints();
    fetchAssignments();
  }, [config.academicYear, config.semester, config.department]);

  // Find matching assignment when config or assignments change
  useEffect(() => {
    if (assignments.length > 0) {
      // Map department name to code if needed, or assume dropdown values match DB
      // Dropdown: "Computer Science", DB: "CSE"
      // Simple mapping for now
      const deptMap = {
        'Computer Science': 'CSE',
        'Electronics': 'ECE',
        'Mechanical': 'ME',
        'All Departments': 'ALL'
      };
      
      const deptCode = deptMap[config.department] || config.department;
      
      const match = assignments.find(a => 
        a.academicYear === config.academicYear &&
        a.semester === config.semester &&
        a.department === deptCode &&
        a.section === config.section
      );
      
      setCurrentAssignment(match || null);
      setGeneratedResult(null); // Reset generated result when filtered assignment changes
    }
  }, [config, assignments]);

  const fetchAssignments = async () => {
    try {
      const data = await getAllCourseAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

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
        await loadConstraints();
      }
    } catch (error) {
      console.error('Error saving constraints:', error);
      alert('Failed to save constraints.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetConstraints = async () => {
    if (!window.confirm('Reset constraints to default?')) return;
    try {
      setLoading(true);
      const defaultConstraint = await constraintService.getDefaultConstraint();
      setConstraints({
        ...defaultConstraint,
        academicYear: config.academicYear,
        semester: config.semester,
        department: config.department
      });
    } catch (error) {
      console.error('Error resetting constraints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentAssignment) {
      alert('No course assignment found for these settings. Please create one first.');
      return;
    }
    
    // Auto-save constraints before generating to ensure latest rules are used
    if (!constraints._id) await handleSaveConstraints();
    
    try {
        setGenerating(true);
        setGeneratedResult(null);
        
        // Call Generator API
        const result = await generateTimetable(currentAssignment._id, {
            populationSize: 50,
            maxGenerations: 100, // Can be configurable
            hardConstraints: constraints?.hardConstraints || {} // Pass user-defined hard constraints
        });
        
        console.log("Generation Result:", result);
        
        if (result.success) {
            setGeneratedResult(result.data);
            // Hide constraints panel to focus on result
            setShowConstraints(false);
        } else {
            alert('Generation failed: ' + result.message);
        }
        
    } catch (error) {
        console.error("Generation Error:", error);
        alert('Failed to generate timetable. Check console for details.');
    } finally {
        setGenerating(false);
    }
  };

  const handleSaveTimetable = async () => {
      if (!generatedResult || !currentAssignment) return;
      
      if (!window.confirm(`Save this generated timetable (Fitness: ${generatedResult.fitness})? This will overwrite the existing schedule.`)) {
          return;
      }
      
      try {
          setLoading(true);
          // Update the assignment with the new slots
          await updateCourseAssignment(currentAssignment._id, {
              timetableSlots: generatedResult.timetable.timetableSlots,
              generationStats: {
                  fitness: generatedResult.fitness,
                  generations: generatedResult.generations,
                  hardViolations: generatedResult.timetable.hardViolations?.length || 0,
                  generatedAt: new Date()
              }
          });
          
          alert('Timetable saved successfully!');
          setGeneratedResult(null); // Exit preview mode
          // Refresh page or reload data if needed
          window.location.reload(); 
      } catch (error) {
          console.error('Error saving timetable:', error);
          alert('Failed to save timetable.');
      } finally {
          setLoading(false);
      }
  };

  if (loading && !constraints) {
    return <div style={{textAlign: 'center', padding: '4rem'}}><h2>Loading...</h2></div>;
  }

  return (
    <div>
      <div className="page-header" style={{flexWrap: 'wrap', gap: '1rem', alignItems: 'center'}}>
        <h1 style={{margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)'}}>Timetable Generator</h1>
        
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto'}}>
          <button 
            className="action-btn" 
            style={{backgroundColor: '#805ad5'}}
            onClick={() => setShowConstraints(!showConstraints)}
          >
            {showConstraints ? 'Hide Settings' : 'Settings'}
          </button>
          
          {currentAssignment && !generating && (
              <button 
                className="action-btn" 
                style={{backgroundColor: '#3182ce', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                onClick={handleGenerate}
              >
                <RefreshCw size={18} />
                Generate New
              </button>
          )}

          {generatedResult && (
              <button 
                className="action-btn" 
                style={{backgroundColor: '#48bb78', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                onClick={handleSaveTimetable}
                disabled={loading}
              >
                <Save size={18} />
                Save & Publish
              </button>
          )}
        </div>
      </div>

      {/* Assignment Selector */}
      <div className="form-card" style={{marginBottom: '1.5rem', padding: '1rem'}}>
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end'}}>
            <div style={{flex: 1, minWidth: '150px'}}>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.5rem'}}>Academic Year</label>
                <select 
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
                  value={config.academicYear}
                  onChange={(e) => setConfig({...config, academicYear: e.target.value})}
                >
                  <option>2025-2026</option>
                  <option>2024-2025</option>
                </select>
            </div>
            <div style={{flex: 1, minWidth: '150px'}}>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.5rem'}}>Department</label>
                <select 
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
                  value={config.department}
                  onChange={(e) => setConfig({...config, department: e.target.value})}
                >
                  <option>Computer Science</option>
                  <option>Electronics</option>
                  <option>Mechanical</option>
                </select>
            </div>
            <div style={{flex: 1, minWidth: '100px'}}>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.5rem'}}>Semester</label>
                <select 
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
                  value={config.semester}
                  onChange={(e) => setConfig({...config, semester: e.target.value})}
                >
                  <option>Odd</option>
                  <option>Even</option>
                </select>
            </div>
            <div style={{flex: 0.5, minWidth: '80px'}}>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '0.5rem'}}>Section</label>
                <input 
                  type="text"
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
                  value={config.section}
                  onChange={(e) => setConfig({...config, section: e.target.value})}
                  maxLength="2"
                />
            </div>
          </div>
          
          <div style={{marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #eee', color: currentAssignment ? '#2f855a' : '#c53030'}}>
              {currentAssignment ? (
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <CheckCircle size={16} />
                      Found Course Assignment: {currentAssignment.courses?.length || 0} courses
                  </span>
              ) : (
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <AlertTriangle size={16} />
                      No matching course assignment found
                  </span>
              )}
          </div>
      </div>

      {generating && (
          <div style={{
              textAlign: 'center', 
              padding: '3rem', 
              backgroundColor: '#ebf8ff', 
              borderRadius: '8px', 
              border: '1px solid #bee3f8',
              marginBottom: '2rem'
          }}>
              <h3 style={{color: '#2b6cb0', marginTop: 0}}>🧬 Generating Optimal Timetable...</h3>
              <p>Running Genetic Algorithm (Population: 50, Generations: 100)</p>
              <div className="spinner" style={{margin: '1rem auto'}}></div>
              <p style={{fontSize: '0.9rem', color: '#666'}}>This may take a few seconds.</p>
          </div>
      )}

      {/* Generation Results Banner */}
      {generatedResult && (
          <div style={{
              backgroundColor: generatedResult.fitness > 0 ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${generatedResult.fitness > 0 ? '#48bb78' : '#fc8181'}`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              borderLeft: `5px solid ${generatedResult.fitness > 0 ? '#48bb78' : '#fc8181'}`
          }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                      <h3 style={{margin: 0, color: generatedResult.fitness > 0 ? '#2f855a' : '#c53030'}}>
                          Generation Complete!
                      </h3>
                      <div style={{marginTop: '0.5rem', display: 'flex', gap: '1.5rem'}}>
                          <span><strong>Fitness Score:</strong> {generatedResult.fitness}</span>
                          <span><strong>Generations:</strong> {generatedResult.generations}</span>
                          {generatedResult.timetable?.hardViolations?.length > 0 && (
                              <span style={{color: '#c53030'}}>
                                  <strong>Violations:</strong> {generatedResult.timetable.hardViolations.length}
                              </span>
                          )}
                      </div>
                  </div>
                  <div>
                    {generatedResult.fitness < 0 && (
                        <div style={{fontSize: '0.9rem', color: '#c53030', maxWidth: '300px'}}>
                            ⚠️ The generated timetable has conflicts. You can try generating again or adjust constraints.
                        </div>
                    )}
                  </div>
              </div>
          </div>
      )}

      {/* Constraint Configuration Panel */}
      {showConstraints && constraints && (
        <div className="form-card" style={{maxWidth: '100%', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h3 style={{margin: 0}}>Constraint Settings</h3>
            <button className="action-btn" onClick={handleSaveConstraints}>Save Settings</button>
          </div>
          
          {/* Hard Constraints - Compact View */}
          <div style={{marginBottom: '1.5rem'}}>
            <h4 style={{color: '#c53030', borderBottom: '1px solid #eee', paddingBottom: '0.5rem'}}>Hard Constraints</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
               <label>
                   <span style={{display:'block', fontSize:'0.85rem', fontWeight:'bold'}}>Start Time</span>
                   <input type="time" value={constraints.hardConstraints.dailyStartTime} onChange={(e) => handleConstraintChange('hardConstraints', 'dailyStartTime', e.target.value)} style={{width: '100%', padding: '0.4rem'}} />
               </label>
               <label>
                   <span style={{display:'block', fontSize:'0.85rem', fontWeight:'bold'}}>End Time</span>
                   <input type="time" value={constraints.hardConstraints.dailyEndTime} onChange={(e) => handleConstraintChange('hardConstraints', 'dailyEndTime', e.target.value)} style={{width: '100%', padding: '0.4rem'}} />
               </label>
               <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem'}}>
                   <input type="checkbox" checked={constraints.hardConstraints.noRoomOverlap} onChange={(e) => handleConstraintChange('hardConstraints', 'noRoomOverlap', e.target.checked)} />
                   <span>No Room Overlap</span>
               </label>
            </div>
          </div>
          
          {/* Soft Constraints - Compact View */}
          <div>
            <h4 style={{color: '#c05621', borderBottom: '1px solid #eee', paddingBottom: '0.5rem'}}>Soft Constraints (Preferences)</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                {Object.entries(constraints.softConstraints).slice(0, 3).map(([key, val]) => (
                    <div key={key} style={{display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem'}}>
                        <input type="checkbox" checked={val.enabled} onChange={(e) => handleSoftConstraintChange(key, 'enabled', e.target.checked)} />
                        <span style={{flex: 1}}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <input type="number" value={val.weight} onChange={(e) => handleSoftConstraintChange(key, 'weight', parseInt(e.target.value))} style={{width: '50px', padding: '0.2rem'}} />
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Timetable View */}
      {/* If generated result exists, show PREVIEW. Otherwise show EXISTING (fetched by Amrita component) */}
      {(currentAssignment || generatedResult) && (
          <AmritaTimetable previewData={generatedResult?.timetable || null} />
      )}
      
      {!currentAssignment && !generatedResult && !generating && (
          <div style={{textAlign: 'center', padding: '3rem', color: '#718096', border: '2px dashed #cbd5e0', borderRadius: '8px'}}>
              <h3>Ready to Generate</h3>
              <p>Select a valid department and section above to get started.</p>
          </div>
      )}
      
    </div>
  );
};

export default AdminTimetable;
