import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllCourses, addCourse, updateCourse, deleteCourse } from '../../services/courseService';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    theoryHours: 0,
    labHours: 0,
    department: ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      theoryHours: course.theoryHours || 0,
      labHours: course.labHours || 0,
      department: course.department || ''
    });
    setShowForm(true);
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
      theoryHours: 0,
      labHours: 0,
      department: ''
    });
    setEditingCourse(null);
    setError(null);
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
            <div className="form-group">
              <label>Department</label>
              <input 
                type="text" 
                name="department"
                placeholder="e.g. Computer Science" 
                value={formData.department}
                onChange={handleInputChange}
                required 
              />
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
                  <th>Department</th>
                  <th>Theory Hours</th>
                  <th>Lab Hours</th>
                  <th>Total Load</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseName}</td>
                    <td>{course.department}</td>
                    <td>{course.theoryHours}</td>
                    <td>{course.labHours}</td>
                    <td>{course.totalLoad || (course.theoryHours + course.labHours)} hrs</td>
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
