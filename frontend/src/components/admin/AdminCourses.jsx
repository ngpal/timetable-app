import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllCourses, addCourse, updateCourse, deleteCourse } from '../../services/courseService';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    semester: '',
    year: '',
    courseType: 'Core',
    electiveCategory: '',
    theoryHours: 0,
    labHours: 0,
    requiresLab: false,
    labComponent: {
      hasLab: false,
      labHours: 0,
      requiresAssistingFaculty: false,
      labType: ''
    },
    department: '',
    description: ''
  });

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested labComponent
    if (name.startsWith('labComponent.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        labComponent: {
          ...prev.labComponent,
          [field]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse._id, formData);
      } else {
        // Add new course
        await addCourse(formData);
      }

      // Refresh the course list
      await fetchCourses();

      // Reset form and close
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      credits: course.credits || 3,
      semester: course.semester || '',
      year: course.year || '',
      courseType: course.courseType || 'Core',
      electiveCategory: course.electiveCategory || '',
      theoryHours: course.theoryHours || 0,
      labHours: course.labHours || 0,
      requiresLab: course.requiresLab || false,
      labComponent: course.labComponent || {
        hasLab: false,
        labHours: 0,
        requiresAssistingFaculty: false,
        labType: ''
      },
      department: course.department || '',
      description: course.description || ''
    });
    setShowForm(true);
    setShowAdvanced(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteCourse(id);
      await fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      credits: 3,
      semester: '',
      year: '',
      courseType: 'Core',
      electiveCategory: '',
      theoryHours: 0,
      labHours: 0,
      requiresLab: false,
      labComponent: {
        hasLab: false,
        labHours: 0,
        requiresAssistingFaculty: false,
        labType: ''
      },
      department: '',
      description: ''
    });
    setEditingCourse(null);
    setError(null);
    setShowAdvanced(false);
  };

  const handleFormToggle = () => {
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Course Management</h1>
        <button className="action-btn" onClick={handleFormToggle}>
          {showForm ? 'Close Form' : 'Add New Course'}
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
          <h3>{editingCourse ? 'Edit Course Details' : 'Add Course Details'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Course Code</label>
              <input 
                type="text" 
                name="courseCode"
                placeholder="e.g. CS101" 
                value={formData.courseCode}
                onChange={handleInputChange}
                disabled={editingCourse !== null} // Disable editing course code
                required 
              />
            </div>
            <div className="form-group">
              <label>Course Name</label>
              <input 
                type="text" 
                name="courseName"
                placeholder="e.g. Data Structures" 
                value={formData.courseName}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Credits</label>
                <select 
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                  <option value="4">4 Credits</option>
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
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Year</label>
                <select 
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Course Type</label>
              <select 
                name="courseType"
                value={formData.courseType}
                onChange={handleInputChange}
                required
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Professional Elective">Professional Elective</option>
                <option value="Open Elective">Open Elective</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>

            {(formData.courseType.includes('Elective')) && (
              <div className="form-group">
                <label>Elective Category</label>
                <input 
                  type="text" 
                  name="electiveCategory"
                  placeholder="e.g., PE-III, OE-I" 
                  value={formData.electiveCategory}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="form-group">
              <label>Department</label>
              <select 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science (CSE)</option>
                <option value="Electronics and Communication">Electronics and Communication (ECE)</option>
                <option value="Electrical and Electronics">Electrical and Electronics (EEE)</option>
                <option value="Mechanical">Mechanical (ME)</option>
                <option value="Civil">Civil (CE)</option>
                <option value="Chemical">Chemical (CHE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Aerospace">Aerospace (AE)</option>
              </select>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Theory Hours / Week</label>
                <input 
                  type="number" 
                  name="theoryHours"
                  min="0" 
                  max="10" 
                  value={formData.theoryHours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Lab Hours / Week</label>
                <input 
                  type="number" 
                  name="labHours"
                  min="0" 
                  max="10" 
                  value={formData.labHours}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Advanced Fields Toggle */}
            <div style={{marginTop: '1rem', marginBottom: '1rem'}}>
              <button
                type="button"
                className="action-btn"
                style={{backgroundColor: '#6b9e4d', width: '100%'}}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼ Hide Advanced Fields' : '▶ Show Advanced Fields'}
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="form-group">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a'
                  }}>
                    <input 
                      type="checkbox"
                      name="requiresLab"
                      checked={formData.requiresLab}
                      onChange={handleInputChange}
                      style={{
                        marginRight: '0.5rem',
                        marginTop: '0',
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span style={{fontWeight: '500'}}>Requires Lab Component</span>
                  </label>
                </div>

                {formData.requiresLab && (
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <h4 style={{marginTop: 0, marginBottom: '1rem', color: '#333'}}>Lab Component Details</h4>
                    
                    <div className="form-group">
                      <label>Lab Type</label>
                      <select 
                        name="labComponent.labType"
                        value={formData.labComponent.labType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Lab Type</option>
                        <option value="Computer Lab">Computer Lab</option>
                        <option value="Hardware Lab">Hardware Lab</option>
                        <option value="Research Lab">Research Lab</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Lab Hours</label>
                      <input 
                        type="number" 
                        name="labComponent.labHours"
                        min="0"
                        max="10"
                        value={formData.labComponent.labHours}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd'
                      }}>
                        <input 
                          type="checkbox"
                          name="labComponent.requiresAssistingFaculty"
                          checked={formData.labComponent.requiresAssistingFaculty}
                          onChange={handleInputChange}
                          style={{
                            marginRight: '0.5rem',
                            marginTop: '0',
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span style={{fontWeight: '500'}}>Requires Assisting Faculty</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description"
                    placeholder="Brief course description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    style={{resize: 'vertical'}}
                  />
                </div>
              </>
            )}

            <div className="form-actions">
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
                {loading ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No courses found. Click "Add New Course" to get started.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Sem/Year</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Theory Hrs</th>
                  <th>Lab Hrs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td><strong>{course.courseCode}</strong></td>
                    <td>{course.courseName}</td>
                    <td>{course.credits || 3}</td>
                    <td>
                      {course.semester && course.year 
                        ? `S${course.semester} / Y${course.year}`
                        : '-'}
                    </td>
                    <td>
                      <span className="status-badge" style={{
                        backgroundColor: course.courseType === 'Core' ? '#3b82f6' :
                                        course.courseType?.includes('Elective') ? '#8b5cf6' :
                                        course.courseType === 'Lab' ? '#10b981' :
                                        '#6b7280',
                        color: 'white'
                      }}>
                        {course.courseType || 'Core'}
                      </span>
                      {course.requiresLab && (
                        <span style={{marginLeft: '0.5rem', fontSize: '1.2rem'}} title="Has Lab Component">
                          🧪
                        </span>
                      )}
                    </td>
                    <td>{course.department}</td>
                    <td>{course.theoryHours}</td>
                    <td>{course.labHours}</td>
                    <td>
                      <button 
                        className="icon-btn edit-btn" 
                        title="Edit"
                        onClick={() => handleEdit(course)}
                        disabled={loading}
                      >
                        <Pencil size={24} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        title="Delete"
                        onClick={() => handleDelete(course._id)}
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

export default AdminCourses;
