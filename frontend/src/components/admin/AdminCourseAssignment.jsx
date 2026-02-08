import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { getAllCourseAssignments, createCourseAssignment, updateCourseAssignment, deleteCourseAssignment } from '../../services/courseAssignmentService';
import { getAllCourses } from '../../services/courseService';
import { getAllFaculty } from '../../services/facultyService';

const AdminCourseAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    academicYear: '2025-2026',
    semester: 'Odd',
    department: '',
    section: '',
    program: 'B.Tech',
    courses: [],
    classAdvisors: []
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAssignments();
    fetchCourses();
    fetchFaculty();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCourseAssignments();
      setAssignments(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await getAllFaculty();
      setFaculty(data);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCourse = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    if (!course) return;

    const newCourse = {
      courseCode: course.courseCode,
      courseName: course.courseName,
      courseType: course.courseType || 'Theory',
      credits: course.credits || 3,
      faculty: [],
      venue: ''
    };

    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
  };

  const handleRemoveCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
  };

  const handleAddFacultyToCourse = (courseIndex, facultyId, role = 'Incharge') => {
    const selectedFaculty = faculty.find(f => f._id === facultyId);
    if (!selectedFaculty) return;

    setFormData(prev => {
      const updatedCourses = [...prev.courses];
      
      // Check if faculty is already assigned to this course
      const alreadyAssigned = updatedCourses[courseIndex].faculty.some(
        fac => (typeof fac.facultyId === 'object' ? fac.facultyId._id : fac.facultyId) === facultyId
      );
      
      if (alreadyAssigned) {
        alert(`${selectedFaculty.name} is already assigned to this course`);
        return prev; // Don't update state
      }
      
      updatedCourses[courseIndex].faculty.push({
        facultyId: facultyId,
        role: role
      });
      return { ...prev, courses: updatedCourses };
    });
  };

  const handleRemoveFacultyFromCourse = (courseIndex, facultyIndex) => {
    setFormData(prev => {
      const updatedCourses = [...prev.courses];
      updatedCourses[courseIndex].faculty = updatedCourses[courseIndex].faculty.filter((_, i) => i !== facultyIndex);
      return { ...prev, courses: updatedCourses };
    });
  };

  const handleAddClassAdvisor = (facultyId) => {
    const selectedFaculty = faculty.find(f => f._id === facultyId);
    if (!selectedFaculty) return;

    // Check if advisor is already added
    const alreadyAdded = formData.classAdvisors.some(
      advisor => (typeof advisor.facultyId === 'object' ? advisor.facultyId._id : advisor.facultyId) === facultyId
    );
    
    if (alreadyAdded) {
      alert(`${selectedFaculty.name} is already a class advisor`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      classAdvisors: [...prev.classAdvisors, {
        facultyId: facultyId,
        name: selectedFaculty.name
      }]
    }));
  };

  const handleRemoveClassAdvisor = (index) => {
    setFormData(prev => ({
      ...prev,
      classAdvisors: prev.classAdvisors.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingAssignment) {
        await updateCourseAssignment(editingAssignment._id, formData);
      } else {
        await createCourseAssignment(formData);
      }

      await fetchAssignments();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    
    // Normalize courses data - extract just the ID if facultyId is populated
    const normalizedCourses = (assignment.courses || []).map(course => ({
      ...course,
      faculty: (course.faculty || []).map(fac => ({
        facultyId: typeof fac.facultyId === 'object' ? fac.facultyId._id : fac.facultyId,
        role: fac.role
      }))
    }));
    
    // Normalize class advisors - extract just the ID if facultyId is populated
    const normalizedAdvisors = (assignment.classAdvisors || []).map(advisor => ({
      facultyId: typeof advisor.facultyId === 'object' ? advisor.facultyId._id : advisor.facultyId,
      name: advisor.name || (typeof advisor.facultyId === 'object' ? advisor.facultyId.name : '')
    }));
    
    setFormData({
      academicYear: assignment.academicYear || '2025-2026',
      semester: assignment.semester || 'Odd',
      department: assignment.department || '',
      section: assignment.section || '',
      program: assignment.program || 'B.Tech',
      courses: normalizedCourses,
      classAdvisors: normalizedAdvisors
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteCourseAssignment(id);
      await fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      academicYear: '2025-2026',
      semester: 'Odd',
      department: '',
      section: '',
      program: 'B.Tech',
      courses: [],
      classAdvisors: []
    });
    setEditingAssignment(null);
    setError(null);
  };

  const handleFormToggle = () => {
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
  };

  const getFacultyName = (facultyId) => {
    // Handle both string IDs and populated objects
    const id = typeof facultyId === 'object' ? facultyId._id : facultyId;
    const f = faculty.find(fac => fac._id === id);
    return f ? f.name : (typeof facultyId === 'object' && facultyId.name ? facultyId.name : 'Unknown');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Course Assignment Management</h1>
        <button className="action-btn" onClick={handleFormToggle}>
          {showForm ? 'Close Form' : '+ Add New Assignment'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00',
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
          <form onSubmit={handleSubmit}>
            {/* Academic Information */}
            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Academic Year</label>
                <select 
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Semester</label>
                <select 
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Odd">Odd Semester</option>
                  <option value="Even">Even Semester</option>
                </select>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Department</label>
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics and Communication (ECE)</option>
                  <option value="EEE">Electrical and Electronics (EEE)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="CE">Civil (CE)</option>
                  <option value="CHE">Chemical (CHE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="AE">Aerospace (AE)</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Section</label>
                <input 
                  type="text" 
                  name="section"
                  placeholder="e.g., A, B, C" 
                  value={formData.section}
                  onChange={handleInputChange}
                  maxLength="2"
                  required 
                />
              </div>
            </div>

            {/* Courses Section */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '1.5rem',
              backgroundColor: '#f7fafc'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h4 style={{margin: 0}}>Courses ({formData.courses.length})</h4>
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCourse(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0'}}
                >
                  <option value="">+ Add Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              {formData.courses.map((course, courseIndex) => (
                <div key={courseIndex} style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <div style={{flex: 1}}>
                      <strong>{course.courseCode}</strong> - {course.courseName}
                      <div style={{fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem'}}>
                        {course.courseType} • {course.credits} Credits
                      </div>
                      
                      {/* Faculty Assignment */}
                      <div style={{marginTop: '0.75rem'}}>
                        <label style={{fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem'}}>
                          Faculty
                        </label>
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem'}}>
                          {course.faculty.map((fac, facIndex) => (
                            <span key={facIndex} style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: fac.role === 'Incharge' ? '#3b82f6' : '#8b5cf6',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {getFacultyName(fac.facultyId)} ({fac.role})
                              <X 
                                size={14} 
                                style={{cursor: 'pointer'}}
                                onClick={() => handleRemoveFacultyFromCourse(courseIndex, facIndex)}
                              />
                            </span>
                          ))}
                        </div>
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              const [facultyId, role] = e.target.value.split('|');
                              handleAddFacultyToCourse(courseIndex, facultyId, role);
                              e.target.value = '';
                            }
                          }}
                          style={{padding: '0.375rem', fontSize: '0.875rem', borderRadius: '4px', border: '1px solid #cbd5e0', width: '100%'}}
                        >
                          <option value="">+ Assign Faculty</option>
                          <optgroup label="Incharge">
                            {faculty.map(fac => (
                              <option key={fac._id} value={`${fac._id}|Incharge`}>
                                {fac.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Assisting">
                            {faculty.map(fac => (
                              <option key={fac._id} value={`${fac._id}|Assisting`}>
                                {fac.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      
                      {/* Venue Field */}
                      <div style={{marginTop: '0.75rem'}}>
                        <label style={{fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>
                          Default Venue (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., ABIII - C204"
                          value={course.venue || ''}
                          onChange={(e) => {
                            setFormData(prev => {
                              const updatedCourses = [...prev.courses];
                              updatedCourses[courseIndex].venue = e.target.value;
                              return { ...prev, courses: updatedCourses };
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.375rem 0.5rem',
                            fontSize: '0.875rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e0'
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(courseIndex)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {formData.courses.length === 0 && (
                <div style={{textAlign: 'center', padding: '2rem', color: '#718096'}}>
                  No courses added yet. Select a course from the dropdown above.
                </div>
              )}
            </div>

            {/* Class Advisors Section */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '1rem',
              backgroundColor: '#f0fdf4'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h4 style={{margin: 0}}>Class Advisors</h4>
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddClassAdvisor(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0'}}
                >
                  <option value="">+ Add Advisor</option>
                  {faculty.map(fac => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name} - {fac.department}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                {formData.classAdvisors.map((advisor, index) => (
                  <span key={index} style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {advisor.name}
                    <X 
                      size={16} 
                      style={{cursor: 'pointer'}}
                      onClick={() => handleRemoveClassAdvisor(index)}
                    />
                  </span>
                ))}
              </div>

              {formData.classAdvisors.length === 0 && (
                <div style={{textAlign: 'center', padding: '1rem', color: '#718096', fontSize: '0.875rem'}}>
                  No class advisors assigned
                </div>
              )}
            </div>

            <div className="form-actions" style={{marginTop: '1.5rem'}}>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleFormToggle}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No course assignments found. Click "Add New Assignment" to get started.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>Department - Section</th>
                  <th>Courses</th>
                  <th>Class Advisors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.academicYear}</td>
                    <td>
                      <span className="status-badge" style={{
                        backgroundColor: assignment.semester === 'Odd' ? '#3b82f6' : '#8b5cf6',
                        color: 'white'
                      }}>
                        {assignment.semester}
                      </span>
                    </td>
                    <td><strong>{assignment.department} - {assignment.section}</strong></td>
                    <td>{assignment.courses?.length || 0} courses</td>
                    <td>
                      {assignment.classAdvisors?.map(advisor => advisor.name).join(', ') || '-'}
                    </td>
                    <td>
                      <button 
                        className="icon-btn edit-btn" 
                        title="Edit"
                        onClick={() => handleEdit(assignment)}
                        disabled={loading}
                      >
                        <Pencil size={24} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        title="Delete"
                        onClick={() => handleDelete(assignment._id)}
                        disabled={loading}
                      >
                        <Trash2 size={24} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCourseAssignment;
